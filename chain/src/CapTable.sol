// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "./transactions/StockIssuanceTx.sol";
import "./transactions/StockTransferTx.sol";
import { StockIssuance, StockTransfer } from "./lib/Structs.sol";
import "./lib/TxHelper.sol";

import "forge-std/console.sol";

contract CapTable is Ownable {
    // @dev Issuer, Stakeholder and StockClass will be created off-chain then reflected on-chain to match IDs. Struct variables have underscore naming to match OCF naming.
    /* Objects kept intentionally off-chain unless they become useful
        - Stock Legend Template
        - Stock Plan
        - Vesting Terms
        - Valuations
    */

    struct Issuer {
        bytes16 id;
        string legal_name;
    }

    struct Stakeholder {
        bytes16 id;
        string stakeholder_type; // ["INDIVIDUAL", "INSTITUTION"]
        string current_relationship; // ["ADVISOR","BOARD_MEMBER","CONSULTANT","EMPLOYEE","EX_ADVISOR" "EX_CONSULTANT","EX_EMPLOYEE","EXECUTIVE","FOUNDER","INVESTOR","NON_US_EMPLOYEE","OFFICER","OTHER"]
    }

    // can be later extended to add things like seniority, conversion_rights, etc.
    struct StockClass {
        bytes16 id;
        string class_type; // ["COMMON", "PREFERRED"]
        uint256 price_per_share; // Per-share price this stock class was issued for
        uint256 initial_shares_authorized;
    }

    struct ActivePosition {
        bytes16 stock_class_id;
        uint256 quantity;
        uint256 share_price;
        uint40 timestamp;
    }

    Issuer public issuer;
    Stakeholder[] public stakeholders;
    StockClass[] public stockClasses;
    // @dev Transactions will be created on-chain then reflected off-chain.
    address[] public transactions;

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
        issuer = Issuer(_id, _name);
        emit IssuerCreated(_id, _name);
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

        _issueStock(
            TxHelper.createStockIssuanceStructByTA(
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
            )
        );
    }

    // isBuyerVerified is a placeholder for a signature, account or hash that confirms the buyer's identity.
    function transferStockOwnership(
        bytes16 transferorStakeholderId,
        bytes16 transfereeStakeholderId,
        bytes16 stockClassId,
        bool isBuyerVerified,
        uint256 quantity,
        uint256 sharePrice
    ) external onlyOwner {
        // Checks related to entities' existence
        require(stakeholderIndex[transferorStakeholderId] > 0, "No transferor");
        require(stakeholderIndex[transfereeStakeholderId] > 0, "No transferee");
        require(stockClassIndex[stockClassId] > 0, "Invalid stock class");

        // Checks related to transaction validity
        require(isBuyerVerified, "Buyer unverified");
        require(quantity > 0, "Invalid quantity");
        require(sharePrice > 0, "Invalid price");

        bytes16 transferorSecurityId = getFirstSecurityIdByStockClass(transferorStakeholderId, stockClassId);
        ActivePosition memory transferorActivePosition = getActivePositionBySecurityId(transferorStakeholderId, transferorSecurityId);

        // Checks related to transfer feasibility
        require(transferorActivePosition.quantity >= quantity, "Insufficient shares");

        StockIssuance memory transfereeIssuance = TxHelper.createStockIssuanceStructForTransfer(
            transfereeStakeholderId,
            quantity,
            sharePrice,
            stockClassId
        );
        _issueStock(transfereeIssuance);

        uint256 remainingSharesForTransferor = transferorActivePosition.quantity - quantity;

        bytes16 balance_security_id;

        if (remainingSharesForTransferor > 0) {
            StockIssuance memory transferorPostTransferIssuance = TxHelper.createStockIssuanceStructForTransfer(
                transferorStakeholderId,
                remainingSharesForTransferor,
                transferorActivePosition.share_price,
                stockClassId
            );
            _issueStock(transferorPostTransferIssuance);
            balance_security_id = transferorPostTransferIssuance.security_id;
        } else {
            balance_security_id = "";
        }

        StockTransfer memory transfer = TxHelper.createStockTransferStruct(
            quantity,
            transferorSecurityId,
            transfereeIssuance.security_id,
            balance_security_id
        );
        _transferStock(transfer);

        _deleteActivePosition(transferorStakeholderId, transferorSecurityId);
        _deleteActiveSecurityIdsByStockClass();
    }

    /// @notice Setter for walletsPerStakeholder mapping
    /// @dev Function is separate from createStakeholder since multiple wallets will be added per stakeholder at different times.
    function addWalletToStakeholder(bytes16 _stakeholder_id, address _wallet) public onlyOwner {
        require(_wallet != address(0), "Invalid wallet");
        require(stakeholderIndex[_stakeholder_id] > 0, "No stakeholder");
        require(walletsPerStakeholder[_wallet] == bytes16(0), "Wallet already exists");

        walletsPerStakeholder[_wallet] = _stakeholder_id;
    }

    /// @notice Removing wallet from walletsPerStakeholder mapping
    function removeWalletToStakeholder(bytes16 _stakeholder_id, address _wallet) public onlyOwner {
        require(_wallet != address(0), "Invalid wallet");
        require(stakeholderIndex[_stakeholder_id] > 0, "No stakeholder");
        require(walletsPerStakeholder[_wallet] == 0, "Wallet already exists");

        walletsPerStakeholder[_wallet] = bytes16(0);
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

    function getFirstSecurityIdByStockClass(bytes16 _stakeholder_id, bytes16 _stock_class_id) public view returns (bytes16 securityId) {
        require(activeSecurityIdsByStockClass[_stakeholder_id][_stock_class_id].length > 0, "No active security ids found");
        bytes16[] memory activeSecurityIDs = activeSecurityIdsByStockClass[_stakeholder_id][_stock_class_id];

        // only getting first earliest active position for the stock class, for now.
        return activeSecurityIDs[0];
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

    function _deleteActivePosition(bytes16 _stakeholder_id, bytes16 _security_id) internal {
        delete activePositions[_stakeholder_id][_security_id];
    }

    function _deleteActiveSecurityIdsByStockClass() internal {}

    function _issueStock(StockIssuance memory issuance) internal onlyOwner {
        StockIssuanceTx issuanceTx = new StockIssuanceTx(issuance);

        activeSecurityIdsByStockClass[issuance.stakeholder_id][issuance.stock_class_id].push(issuance.security_id);

        activePositions[issuance.stakeholder_id][issuance.security_id] = ActivePosition(
            issuance.stock_class_id,
            issuance.quantity,
            issuance.share_price,
            _safeNow()
        );

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
}
