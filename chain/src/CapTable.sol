// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "./transactions/StockIssuanceTX.sol";
import "./transactions/StockTransferTX.sol";
import { StockIssuance, StockTransfer } from "./lib/Structs.sol";
import "./lib/TransactionHelper.sol";
import { StockClassType } from "./lib/Enums.sol";

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
        string id;
        string legal_name;
        string initial_shares_authorized; // TODO: verify usefulness of this field
    }

    // TODO: wallets could be tracked here
    struct Stakeholder {
        string id;
        string stakeholder_type; // TODO: verify usefulness ["INDIVIDUAL", "INSTITUTION"]
        string current_relationship; //TODO: verify usefulness: ENUM with values  ["ADVISOR","BOARD_MEMBER","CONSULTANT","EMPLOYEE","EX_ADVISOR" "EX_CONSULTANT","EX_EMPLOYEE","EXECUTIVE","FOUNDER","INVESTOR","NON_US_EMPLOYEE","OFFICER","OTHER"]
    }

    // can be later extended to add things like seniority, conversion_rights, etc.
    struct StockClass {
        string id;
        string class_type; // ["COMMON", "PREFERRED"]
        uint256 price_per_share; // don't think it's needed
        uint256 initial_shares_authorized; // don't think it's needed
    }

    struct ActivePosition {
        string stock_class_id;
        uint256 quantity;
        int share_price;
        uint40 timestamp; 
    }

    Issuer public issuer;
    Stakeholder[] public stakeholders;
    StockClass[] public stockClasses;
    // @dev Transactions will be created on-chain then reflected off-chain.
    address[] public transactions;

    // O(1) search
    // id -> index
    mapping(string => uint256) stakeholderIndex;
    mapping(string => uint256) stockClassIndex;

    // stakeholder_id -> stock_class_id -> security_ids
    mapping(string => mapping(string => string[])) activeSecurityIdsByStockClass;
    // stakeholder_id -> security_id -> ActivePosition
    mapping(string => mapping(string => ActivePosition)) activePositions;

    event IssuerCreated(string indexed id, string indexed _name, string initialSharesAuthorized);
    event StakeholderCreated(string indexed id);
    event StockClassCreated(string indexed id, string indexed classType, uint256 indexed pricePerShare, uint256 initialSharesAuthorized);
    event StockIssuanceCreated(string indexed stakeholderId, string indexed stockClassId, string indexed securityId);
    event StockTransferCreated(string indexed securityId, uint256 quantity);

    constructor(string memory _id, string memory _name, string memory _initialSharesAuthorized) {
        issuer = Issuer(_id, _name, _initialSharesAuthorized);
        emit IssuerCreated(_id, _name, _initialSharesAuthorized);
    }

    function getActivePositionBySecurityId(
        string memory _stakeholder_id,
        string memory _security_id
    ) public view returns (ActivePosition memory activePosition) {
        require(activePositions[_stakeholder_id][_security_id].quantity > 0, "No active position found");
        return activePositions[_stakeholder_id][_security_id];
    }

    function getFirstSecurityIdByStockClass(
        string memory _stakeholder_id,
        string memory _stock_class_id
    ) public view returns (string memory securityId) {
        require(activeSecurityIdsByStockClass[_stakeholder_id][_stock_class_id].length > 0, "No active security ids found");
        string[] memory activeSecurityIDs = activeSecurityIdsByStockClass[_stakeholder_id][_stock_class_id];

        // only getting first earliest active position for the stock class, for now.
        return activeSecurityIDs[0];
    }

    function createStakeholder(string memory _id, string memory _stakeholder_type, string memory _current_relationship) public onlyOwner {
        require(stakeholderIndex[_id] == 0, "Stakeholder already exists");
        stakeholders.push(Stakeholder(_id, _stakeholder_type, _current_relationship));
        stakeholderIndex[_id] = stakeholders.length;
        emit StakeholderCreated(_id);
    }

    function createStockClass(
        string memory _id,
        string memory _class_type,
        uint256 _price_per_share, 
        uint256 _initial_share_authorized
    ) public onlyOwner {
        require(stockClassIndex[_id] == 0, "Stock class already exists");
        stockClasses.push(StockClass(_id, _class_type, _price_per_share, _initial_share_authorized));
        stockClassIndex[_id] = stockClasses.length;
        emit StockClassCreated(_id, _class_type, _price_per_share, _initial_share_authorized);
    }

    // isBuyerVerified is a placeholder for a signature, account or hash that confirms the buyer's identity.
    function transferStockOwnership(
        string memory transferorStakeholderId,
        string memory transfereeStakeholderId,
        string memory stockClassId,
        bool isBuyerVerified,
        uint256 quantity,
        int sharePrice
    ) public onlyOwner {
        // Checks related to entities' existence
        require(stakeholderIndex[transferorStakeholderId] > 0, "No transferor");
        require(stakeholderIndex[transfereeStakeholderId] > 0, "No transferee");
        require(stockClassIndex[stockClassId] > 0, "Invalid stock class");

        // Checks related to transaction validity
        require(isBuyerVerified, "Buyer unverified");
        require(quantity > 0, "Invalid quantity");
        require(sharePrice > 0, "Invalid price");

        string memory transferorSecurityId = getFirstSecurityIdByStockClass(transferorStakeholderId, stockClassId);
        ActivePosition memory transferorActivePosition = getActivePositionBySecurityId(transferorStakeholderId, transferorSecurityId);
        
        // Checks related to transfer feasibility
        require(transferorActivePosition.quantity >= quantity, "Insufficient shares");

        StockIssuance memory transfereeIssuance = TransactionHelper.createStockIssuanceStructForTransfer(
            transfereeStakeholderId,
            quantity,
            sharePrice,
            stockClassId
        );
        _issueStock(transfereeIssuance);

        uint256 remainingSharesForTransferor = transferorActivePosition.quantity - quantity;

        string memory balance_security_id;

        if (remainingSharesForTransferor > 0) {
            StockIssuance memory transferorPostTransferIssuance = TransactionHelper.createStockIssuanceStructForTransfer(
                transferorStakeholderId,
                remainingSharesForTransferor,
                sharePrice,
                stockClassId
            );
            _issueStock(transferorPostTransferIssuance);
            balance_security_id = transferorPostTransferIssuance.security_id;
        } else {
            balance_security_id = "";
        }

        StockTransfer memory transfer = TransactionHelper.createStockTransferStruct(
            quantity,
            transferorSecurityId,
            transfereeIssuance.security_id,
            balance_security_id
        );
        _transferStock(transfer);
        
        _deleteActivePosition(transferorStakeholderId, transferorSecurityId);
        _deleteActiveSecurityIdsByStockClass();
    }


    function _deleteActivePosition(string memory _stakeholder_id, string memory _security_id) internal {
        delete activePositions[_stakeholder_id][_security_id];
    }

    function _deleteActiveSecurityIdsByStockClass() internal {}

    // can extend this to check that it's not issuing more than stock_class initial shares issued
    function issueStockByTA(string memory stakeholderId, uint256 quantity, int sharePrice, string memory stockClassId) external onlyOwner {
        require(stakeholderIndex[stakeholderId] > 0, "No stakeholder");
        require(stockClassIndex[stockClassId] > 0, "Invalid stock class");
        require(quantity > 0, "Invalid quantity");
        require(sharePrice > 0, "Invalid price");

        _issueStock(TransactionHelper.createStockIssuanceStructByTA(stakeholderId, quantity, sharePrice, stockClassId));
    }

    function _issueStock(StockIssuance memory issuance) internal onlyOwner {
        StockIssuanceTX issuanceTX = new StockIssuanceTX(issuance);

        activeSecurityIdsByStockClass[issuance.stakeholder_id][issuance.stock_class_id].push(issuance.security_id);

        activePositions[issuance.stakeholder_id][issuance.security_id] = ActivePosition(
            issuance.stock_class_id,
            issuance.quantity,
            issuance.share_price,
            _safeNow()
        );

        transactions.push(address(issuanceTX));
        emit StockIssuanceCreated(issuance.stakeholder_id, issuance.stock_class_id, issuance.security_id);
    }

    function _safeNow() internal view returns (uint40) {
        return uint40(block.timestamp);
    }

    function _transferStock(StockTransfer memory transfer) internal onlyOwner {
        StockTransferTX transferTX = new StockTransferTX(transfer);
        transactions.push(address(transferTX));
        emit StockTransferCreated(transfer.security_id, transfer.quantity);
    }

    function getStakeholderById(string memory _id) public view returns (string memory, string memory, string memory) {
        if (stakeholderIndex[_id] > 0) {
            Stakeholder memory stakeholder = stakeholders[stakeholderIndex[_id] - 1];
            return (stakeholder.id, stakeholder.stakeholder_type, stakeholder.current_relationship);
        } else {
            return ("", "", "");
        }
    }

    function getStockClassById(string memory _id) public view returns (string memory, string memory, uint256, uint256) {
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
}
