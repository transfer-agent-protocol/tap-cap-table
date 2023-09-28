// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Issuer, Stakeholder, StockClass, ActivePositions, SecIdsStockClass } from "./lib/Structs.sol";
import "./lib/TxHelper.sol";
import "./transactions/StockIssuanceTX.sol";
import "./transactions/StockTransferTX.sol";
import "./lib/Arrays.sol";
import "./lib/transactions/StockIssuance.sol";
import "./lib/transactions/StockTransfer.sol";
import "./lib/transactions/StockCancellation.sol";

contract CapTableLibs {
    Issuer public issuer;
    Stakeholder[] public stakeholders;
    StockClass[] public stockClasses;
    // @dev Transactions will be created on-chain then reflected off-chain.
    address[] public transactions;

    // used to help generate deterministic UUIDs
    uint256 private nonce;

    // O(1) search
    // id -> index
    mapping(bytes16 => uint256) stakeholderIndex;
    mapping(bytes16 => uint256) stockClassIndex;
    // wallet address => stakeholder_id
    mapping(address => bytes16) walletsPerStakeholder;

    // bit wonky but experimenting -> positions.activePositions
    ActivePositions positions;
    // bit wonky but experimenting -> activeSecs.activeSecurityIdsByStockClass
    SecIdsStockClass activeSecs;

    event IssuerCreated(bytes16 indexed id, string indexed _name);
    event StakeholderCreated(bytes16 indexed id);
    event StockClassCreated(bytes16 indexed id, string indexed classType, uint256 indexed pricePerShare, uint256 initialSharesAuthorized);

    constructor(bytes16 _id, string memory _name) {
        nonce = 0;
        issuer = Issuer(_id, _name);
        emit IssuerCreated(_id, _name);
    }

    function seedMultipleActivePositionsAndSecurityIds(
        bytes16[] memory stakeholderIds,
        bytes16[] memory securityIds,
        bytes16[] memory stockClassIds,
        uint256[] memory quantities,
        uint256[] memory sharePrices,
        uint40[] memory timestamps
    ) external {
        //TODO: check stakeholders and stock classes exist
        require(
            stakeholderIds.length == securityIds.length &&
                securityIds.length == stockClassIds.length &&
                stockClassIds.length == quantities.length &&
                quantities.length == sharePrices.length &&
                sharePrices.length == timestamps.length,
            "Input arrays must have the same length"
        );

        for (uint256 i = 0; i < stakeholderIds.length; i++) {
            // Set activePositions
            positions.activePositions[stakeholderIds[i]][securityIds[i]] = ActivePosition(
                stockClassIds[i],
                quantities[i],
                sharePrices[i],
                timestamps[i]
            );

            // Set activeSecurityIdsByStockClass
            activeSecs.activeSecurityIdsByStockClass[stakeholderIds[i]][stockClassIds[i]].push(securityIds[i]);
        }
    }

    function createStakeholder(bytes16 _id, string memory _stakeholder_type, string memory _current_relationship) public {
        require(stakeholderIndex[_id] == 0, "Stakeholder already exists");
        stakeholders.push(Stakeholder(_id, _stakeholder_type, _current_relationship));
        stakeholderIndex[_id] = stakeholders.length;
        emit StakeholderCreated(_id);
    }

    /// @notice Setter for walletsPerStakeholder mapping
    /// @dev Function is separate from createStakeholder since multiple wallets will be added per stakeholder at different times.
    function addWalletToStakeholder(bytes16 _stakeholder_id, address _wallet) public {
        require(_wallet != address(0), "Invalid wallet");
        require(stakeholderIndex[_stakeholder_id] > 0, "No stakeholder");
        require(walletsPerStakeholder[_wallet] == bytes16(0), "Wallet already exists");

        walletsPerStakeholder[_wallet] = _stakeholder_id;
    }

    /// @notice Removing wallet from walletsPerStakeholder mapping
    function removeWalletFromStakeholder(bytes16 _stakeholder_id, address _wallet) public {
        require(_wallet != address(0), "Invalid wallet");
        require(stakeholderIndex[_stakeholder_id] > 0, "No stakeholder");
        require(walletsPerStakeholder[_wallet] != bytes16(0), "Wallet doesn't exist");

        delete walletsPerStakeholder[_wallet];
    }

    function getStakeholderIdByWallet(address _wallet) public view returns (bytes16 stakeholderId) {
        require(walletsPerStakeholder[_wallet] != bytes16(0), "No stakeholder found");
        return walletsPerStakeholder[_wallet];
    }

    function createStockClass(bytes16 _id, string memory _class_type, uint256 _price_per_share, uint256 _initial_share_authorized) public {
        require(stockClassIndex[_id] == 0, "Stock class already exists");

        stockClasses.push(StockClass(_id, _class_type, _price_per_share, _initial_share_authorized));
        stockClassIndex[_id] = stockClasses.length;
        emit StockClassCreated(_id, _class_type, _price_per_share, _initial_share_authorized);
    }

    function getStakeholderById(bytes16 _id) public view returns (bytes16, string memory, string memory) {
        if (stakeholderIndex[_id] > 0) {
            Stakeholder memory stakeholder = stakeholders[stakeholderIndex[_id] - 1];
            return (stakeholder.id, stakeholder.stakeholder_type, stakeholder.current_relationship);
        } else {
            return ("", "", "");
        }
    }

    function getStockClassById(bytes16 _id) public view returns (bytes16, string memory, uint256, uint256) {
        if (stockClassIndex[_id] > 0) {
            StockClass memory stockClass = stockClasses[stockClassIndex[_id] - 1];
            return (stockClass.id, stockClass.class_type, stockClass.price_per_share, stockClass.initial_shares_authorized);
        } else {
            return ("", "", 0, 0);
        }
    }

    function getTotalNumberOfStakeholders() public view returns (uint256) {
        return stakeholders.length;
    }

    function getTotalNumberOfStockClasses() public view returns (uint256) {
        return stockClasses.length;
    }

    // can extend this to check that it's not issuing more than stock_class initial shares issued
    // TODO: small syntax but change this to issueStock
    function issueStockByTA(
        bytes16 stockClassId,
        bytes16 stockPlanId,
        ShareNumbersIssued memory shareNumbersIssued,
        uint256 sharePrice,
        uint256 quantity,
        bytes16 vestingTermsId,
        uint256 costBasis,
        bytes16[] memory stockLegendIds,
        string memory issuanceType,
        string[] memory comments,
        string memory customId,
        bytes16 stakeholderId,
        string memory boardApprovalDate,
        string memory stockholderApprovalDate,
        string memory considerationText,
        string[] memory securityLawExemptions
    ) external {
        require(stakeholderIndex[stakeholderId] > 0, "No stakeholder");
        require(stockClassIndex[stockClassId] > 0, "Invalid stock class");

        nonce++;

        StockIssuanceLib.createStockIssuanceByTA(
            nonce,
            stockClassId,
            stockPlanId,
            shareNumbersIssued,
            sharePrice,
            quantity,
            vestingTermsId,
            costBasis,
            stockLegendIds,
            issuanceType,
            comments,
            customId,
            stakeholderId,
            boardApprovalDate,
            stockholderApprovalDate,
            considerationText,
            securityLawExemptions,
            positions,
            activeSecs,
            transactions
        );
    }

    function cancelStock(
        bytes16 stakeholderId, // not OCF, but required to fetch activePositions
        bytes16 stockClassId, //  not OCF, but required to fetch activePositions
        bytes16 securityId,
        string[] memory comments,
        string memory reasonText,
        uint256 quantity
    ) external {
        require(stakeholderIndex[stakeholderId] > 0, "No stakeholder");
        require(stockClassIndex[stockClassId] > 0, "Invalid stock class");

        // need a require for activePositions
        StockCancellationLib.cancelStockByTA(
            nonce,
            stakeholderId,
            stockClassId,
            securityId,
            comments,
            reasonText,
            quantity,
            positions,
            activeSecs,
            transactions
        );
    }

    function transferStock(
        bytes16 transferorStakeholderId,
        bytes16 transfereeStakeholderId,
        bytes16 stockClassId, // TODO: verify that we would have fong would have the stock class
        bool isBuyerVerified,
        uint256 quantity,
        uint256 share_price
    ) external {
        require(stakeholderIndex[transferorStakeholderId] > 0, "No transferor");
        require(stakeholderIndex[transfereeStakeholderId] > 0, "No transferee");
        require(stockClassIndex[stockClassId] > 0, "Invalid stock class");

        nonce++;
        StockTransferLib.transferStock(
            transferorStakeholderId,
            transfereeStakeholderId,
            stockClassId,
            isBuyerVerified,
            quantity,
            share_price,
            nonce,
            positions,
            activeSecs,
            transactions
        );
    }
}
