// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "./transactions/StockIssuanceTX.sol";
import "./transactions/StockTransferTX.sol";
import { StockIssuance, Issuer, Stakeholder, StockClass, ActivePosition, StockTransfer } from "./lib/Structs.sol";
import "./lib/TxHelper.sol";
import "./lib/Arrays.sol";

import "forge-std/console.sol";

contract CapTableSimple is Ownable {
    // @dev Issuer, Stakeholder and StockClass will be created off-chain then reflected on-chain to match IDs. Struct variables have underscore naming to match OCF naming.
    /* Objects kept intentionally off-chain unless they become useful
        - Stock Legend Template
        - Stock Plan
        - Vesting Terms
        - Valuations
    */

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

    // stakeholder_id -> stock_class_id -> security_ids
    mapping(bytes16 => mapping(bytes16 => bytes16[])) activeSecurityIdsByStockClass;
    // stakeholder_id -> security_id -> ActivePosition
    mapping(bytes16 => mapping(bytes16 => ActivePosition)) activePositions;
    // wallet address => stakeholder_id
    mapping(address => bytes16) walletsPerStakeholder;

    event IssuerCreated(bytes16 indexed id, string indexed _name);
    event StakeholderCreated(bytes16 indexed id);
    event StockClassCreated(bytes16 indexed id, string indexed classType, uint256 indexed pricePerShare, uint256 initialSharesAuthorized);
    event StockTransferCreated(StockTransfer transfer);
    event StockIssuanceCreated(StockIssuance issuance);

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
    ) external onlyOwner {
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
            activePositions[stakeholderIds[i]][securityIds[i]] = ActivePosition(stockClassIds[i], quantities[i], sharePrices[i], timestamps[i]);

            // Set activeSecurityIdsByStockClass
            activeSecurityIdsByStockClass[stakeholderIds[i]][stockClassIds[i]].push(securityIds[i]);
        }
    }

    function transferStock(
        bytes16 transferorStakeholderId,
        bytes16 transfereeStakeholderId,
        bytes16 stockClassId,
        bool isBuyerVerified,
        uint256 quantity,
        uint256 share_price
    ) external {
        // Combined checks
        require(
            stakeholderIndex[transferorStakeholderId] > 0 &&
                stakeholderIndex[transfereeStakeholderId] > 0 &&
                stockClassIndex[stockClassId] > 0 &&
                isBuyerVerified &&
                quantity > 0 &&
                share_price > 0,
            "Invalid input parameters"
        );

        bytes16[] memory activeSecurityIDs = activeSecurityIdsByStockClass[transferorStakeholderId][stockClassId];
        require(activeSecurityIDs.length > 0, "No active security ids found");

        uint256 sum = 0;
        uint256 numSecurityIds = 0;

        for (uint256 index = 0; index < activeSecurityIDs.length && sum < quantity; index++) {
            sum += activePositions[transferorStakeholderId][activeSecurityIDs[index]].quantity;
            numSecurityIds++;
        }

        require(quantity <= sum, "Insufficient shares");

        uint256 remainingQuantity = quantity;

        for (uint256 index = 0; index < numSecurityIds && remainingQuantity > 0; index++) {
            ActivePosition memory activePosition = activePositions[transferorStakeholderId][activeSecurityIDs[index]];
            uint256 transferQuantity = (activePosition.quantity <= remainingQuantity) ? activePosition.quantity : remainingQuantity;

            _transferSingleStock(
                transferorStakeholderId,
                transfereeStakeholderId,
                stockClassId,
                transferQuantity,
                share_price,
                activeSecurityIDs[index]
            );

            remainingQuantity -= transferQuantity;
        }
    }

    // can extend this to check that it's not issuing more than stock_class initial shares issued
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
    ) external onlyOwner {
        require(stakeholderIndex[stakeholderId] > 0, "No stakeholder");
        require(stockClassIndex[stockClassId] > 0, "Invalid stock class");
        require(quantity > 0, "Invalid quantity");
        require(sharePrice > 0, "Invalid price");

        nonce++;

        StockIssuance memory issuance = TxHelper.createStockIssuanceStructByTA(
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
            securityLawExemptions
        );

        _issueStock(issuance);
        _updateContext(issuance);
    }

    /// @notice Setter for walletsPerStakeholder mapping
    /// @dev Function is separate from createStakeholder since multiple wallets will be added per stakeholder at different times.
    function addWalletToStakeholder(bytes16 _stakeholder_id, address _wallet) public onlyOwner {
        require(
            _wallet != address(0) && stakeholderIndex[_stakeholder_id] > 0 && walletsPerStakeholder[_wallet] == bytes16(0),
            "Invalid input or stakeholder/wallet already exists"
        );

        walletsPerStakeholder[_wallet] = _stakeholder_id;
    }

    /// @notice Removing wallet from walletsPerStakeholder mapping
    function removeWalletFromStakeholder(bytes16 _stakeholder_id, address _wallet) public onlyOwner {
        require(
            _wallet != address(0) && stakeholderIndex[_stakeholder_id] > 0 && walletsPerStakeholder[_wallet] != bytes16(0),
            "Invalid input or stakeholder/wallet doesn't exist"
        );

        delete walletsPerStakeholder[_wallet];
    }

    function createStakeholder(bytes16 _id, string memory _stakeholder_type, string memory _current_relationship) public onlyOwner {
        require(stakeholderIndex[_id] == 0, "Stakeholder already exists");
        stakeholders.push(Stakeholder(_id, _stakeholder_type, _current_relationship));
        stakeholderIndex[_id] = stakeholders.length;
        emit StakeholderCreated(_id);
    }

    function createStockClass(bytes16 _id, string memory _class_type, uint256 _price_per_share, uint256 _initial_share_authorized) public onlyOwner {
        require(stockClassIndex[_id] == 0, "Stock class already exists");

        stockClasses.push(StockClass(_id, _class_type, _price_per_share, _initial_share_authorized));
        stockClassIndex[_id] = stockClasses.length;
        emit StockClassCreated(_id, _class_type, _price_per_share, _initial_share_authorized);
    }

    function getActivePositionBySecurityId(bytes16 _stakeholder_id, bytes16 _security_id) public view returns (ActivePosition memory activePosition) {
        require(activePositions[_stakeholder_id][_security_id].quantity > 0, "No active position found");
        return activePositions[_stakeholder_id][_security_id];
    }

    function getStakeholderIdByWallet(address _wallet) public view returns (bytes16 stakeholderId) {
        require(walletsPerStakeholder[_wallet] != bytes16(0), "No stakeholder found");
        return walletsPerStakeholder[_wallet];
    }

    function _deleteActivePosition(bytes16 _stakeholder_id, bytes16 _security_id) internal {
        delete activePositions[_stakeholder_id][_security_id];
    }

    // Active Security IDs by Stock Class { "stakeholder_id": { "stock_class_id-1": ["sec-id-1", "sec-id-2"] } }
    function _deleteActiveSecurityIdsByStockClass(bytes16 _stakeholder_id, bytes16 _stock_class_id, bytes16 _security_id) internal {
        bytes16[] storage securities = activeSecurityIdsByStockClass[_stakeholder_id][_stock_class_id];

        uint256 index = Arrays.find(securities, _security_id);
        if (index != type(uint256).max) {
            Arrays.remove(securities, index);
        }
    }

    function _updateContext(StockIssuance memory issuance) internal onlyOwner {
        activeSecurityIdsByStockClass[issuance.stakeholder_id][issuance.stock_class_id].push(issuance.security_id);

        activePositions[issuance.stakeholder_id][issuance.security_id] = ActivePosition(
            issuance.stock_class_id,
            issuance.quantity,
            issuance.share_price,
            _safeNow() // TODO: only using current datetime doesn't allow us to support backfilling transactions.
        );
    }

    function _issueStock(StockIssuance memory issuance) internal onlyOwner {
        StockIssuanceTx issuanceTx = new StockIssuanceTx(issuance);
        transactions.push(address(issuanceTx));
        emit StockIssuanceCreated(issuance);
    }

    function _transferStock(StockTransfer memory transfer) internal onlyOwner {
        StockTransferTx transferTx = new StockTransferTx(transfer);
        transactions.push(address(transferTx));
        emit StockTransferCreated(transfer);
    }

    function _safeNow() internal view returns (uint40) {
        return uint40(block.timestamp);
    }

    function _transferSingleStock(
        bytes16 transferorStakeholderId,
        bytes16 transfereeStakeholderId,
        bytes16 stockClassId,
        uint256 quantity,
        uint256 sharePrice,
        bytes16 securityId
    ) internal onlyOwner {
        ActivePosition memory transferorActivePosition = getActivePositionBySecurityId(transferorStakeholderId, securityId);
        require(transferorActivePosition.quantity >= quantity, "Insufficient shares");

        // Increment nonce for all operations
        nonce += 3;

        // Handle transferee issuance
        StockIssuance memory transfereeIssuance = TxHelper.createStockIssuanceStructForTransfer(
            nonce - 2,
            transfereeStakeholderId,
            quantity,
            sharePrice,
            stockClassId
        );
        _issueStock(transfereeIssuance);
        _updateContext(transfereeIssuance);

        // Handle transferor balance issuance if there's a remaining balance
        bytes16 balance_security_id = "";
        uint256 balanceForTransferor = transferorActivePosition.quantity - quantity;
        if (balanceForTransferor > 0) {
            StockIssuance memory transferorBalanceIssuance = TxHelper.createStockIssuanceStructForTransfer(
                nonce - 1,
                transferorStakeholderId,
                balanceForTransferor,
                transferorActivePosition.share_price,
                stockClassId
            );
            _issueStock(transferorBalanceIssuance);
            _updateContext(transfereeIssuance);
            balance_security_id = transferorBalanceIssuance.security_id;
        }

        // Handle stock transfer
        StockTransfer memory transfer = TxHelper.createStockTransferStruct(
            nonce,
            quantity,
            securityId,
            transfereeIssuance.security_id,
            balance_security_id
        );
        _transferStock(transfer);

        // Delete old active position and security IDs
        _deleteActivePosition(transferorStakeholderId, securityId);
        _deleteActiveSecurityIdsByStockClass(transferorStakeholderId, stockClassId, securityId);
    }
}
