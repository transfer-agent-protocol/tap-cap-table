// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "./transactions/StockIssuance.sol";
import "./transactions/StockTransfer.sol";

import "forge-std/console.sol";

import { StockIssuance, StockTransfer } from "./lib/Structs.sol";

contract CapTable is Ownable {
    // @dev These structs will be created off-chain, then reflected on-chain.
    // Struct variables have underscore naming to match OCF naming.
    /* Objects kept intentionally off-chain unless they become useful
        - Stock Legend Template
        - Stock Plan
        - Vesting Terms
        - Valuations
    */
    // Wallets aren't yet tracked. They could live in the stakeholder struct
    struct Issuer {
        string id; // same ID as offchain DB
        string legal_name;
        string initial_shares_authorized; // TODO: might be useful but not sure how 
    }

    // TODO: stakeholders need a relationship to how much stock they own. What are the missing states - if we're tracking transactions 
    // stakeholder will likely have multiple positions. of Multiple stock classes (or it should be allowed at least)
    // TODO: wallets could be tracked here
    struct Stakeholder {
        // base variables
        string id; // same ID as offchain DB
        string stakeholder_type; // ["INDIVIDUAL", "INSTITUTION"]
        string current_relationship; //OPTIONAL but might be useful for communities: ENUM with values  ["ADVISOR","BOARD_MEMBER","CONSULTANT","EMPLOYEE","EX_ADVISOR" "EX_CONSULTANT","EX_EMPLOYEE","EXECUTIVE","FOUNDER","INVESTOR","NON_US_EMPLOYEE","OFFICER","OTHER"]
    }

    // can be later extended to add things like seniority, conversion_rights, etc.
    struct StockClass {
        string id;
        string class_type; // ["COMMON", "PREFERRED"]
        uint256 price_per_share; // don't think it's needed
        uint256 initial_shares_authorized; // don't think it's needed
    }

    struct ActivePosition {
        string stakeholder_id;
        string stock_class_id;
        string security_id; // can be used to query the stockIssuance to get more info
        uint256 quantity;
        int share_price;
        string date; // TODO: safeNow()
    }

    Issuer public issuer;
    Stakeholder[] public stakeholders;
    StockClass[] public stockClasses;
    // @dev Transactions will be created on-chain then reflected off-chain. They contain the source of truth.
    address[] public transactions;
    
    // @dev These mappings are used to lookup the index of a struct in the array
    // stakeholder_id -> index
    mapping (string => uint256) public stakeholderIndex;
    // stock class_id -> index
    mapping (string id => uint256 index) public stockClassIndex;

    // stakeholder_id -> -> stock_class_id -> security_ids
    mapping(string => mapping(string => string[])) activeStakeholderSecurityIdsByStockClass;
    // stakeholder_id -> security_id -> ActivePosition
    mapping(string => mapping(string => ActivePosition)) activePositions;


    event IssuerCreated(string indexed id, string indexed _name, string initialSharesAuthorized);
    event StakeholderCreated(string indexed id);
    event StockClassCreated(string indexed id, string indexed classType, uint256 indexed pricePerShare, uint256 initialSharesAuthorized);

    constructor(string memory _id, string memory _name, string memory _initialSharesAuthorized) {
        issuer = Issuer(_id, _name, _initialSharesAuthorized);
        emit IssuerCreated(_id, _name, _initialSharesAuthorized);
    }

    // this means that on transfer, we need to know stock class 
    function getActivePositionByStakeholderStockClass(string memory _stakeholder_id, string memory _stock_class_id) public view returns (ActivePosition memory activePosition) {
        // TODO complete requires

        string[] memory securityIdsForStockClass = activeStakeholderSecurityIdsByStockClass[_stakeholder_id][_stock_class_id];
        
        // only getting first security id for now
        string memory securityId = securityIdsForStockClass[0];
        ActivePosition memory position = activePositions[_stakeholder_id][securityId];
        return position;
    
    }

    function createStakeholder(string memory _id, string memory _stakeholder_type, string memory _current_relationship) public onlyOwner returns (string memory)  {
        stakeholders.push(Stakeholder(_id, _stakeholder_type, _current_relationship));
        stakeholderIndex[_id] = stakeholders.length;
        emit StakeholderCreated(_id);
        return _id;
    }

    function createStockClass(
        string memory _id,
        string memory _class_type,
        uint256 _price_per_share,
        uint256 _initial_share_authorized
    ) public onlyOwner {
        stockClasses.push(StockClass(_id, _class_type, _price_per_share, _initial_share_authorized));
        stockClassIndex[_id] = stockClasses.length;
        emit StockClassCreated(_id, _class_type, _price_per_share, _initial_share_authorized);
    }

    // Sample transfer: isBuyerVerified is a placeholder for a signature, account or hash that confirms the buyer's identity. Currently it is a simple boolean
    // transferee should not be onboarded to the cap table on-chain. Ensure that new stakeholder for transferee is created off-chain and reflected on-chain first.
    function transferStockOwnership(string memory transferorStakeholderId, string memory transfereeStakeholderId, string memory stock_class_id, bool isBuyerVerified, uint256 quantity, int sharePrice) public onlyOwner {
        require(isBuyerVerified, "Buyer must be verified");
        require(quantity > 0, "Shares to transfer must be greater than 0");
        require(stakeholderIndex[transferorStakeholderId] > 0, "Seller stakeholder does not exist");

        ActivePosition memory latestTransferorPosition = getActivePositionByStakeholderStockClass(transferorStakeholderId, stock_class_id);
        require(latestTransferorPosition.quantity >= quantity, "Seller does not have enough shares to sell"); //TODO: need to extend another funtion to look for all active positins for the same class

        // first, create new issuance for transferee
        StockIssuance memory transfereeIssuance = _handleStockIssuanceStructForTransfer(transfereeStakeholderId, quantity, sharePrice, stock_class_id);
        issueStock(transfereeIssuance);

    
        uint256 remainingSharesForTransferor = latestTransferorPosition.quantity - quantity;
        string memory balance_security_id;
        // check if transferor has any remaining shares
        if(remainingSharesForTransferor > 0) {
            // if so, create a new issuance for the transferor
            StockIssuance memory transferorPostTransferIssuance = _handleStockIssuanceStructForTransfer(transferorStakeholderId, remainingSharesForTransferor, sharePrice, stock_class_id);
            issueStock(transferorPostTransferIssuance);
            balance_security_id = transferorPostTransferIssuance.security_id;
            // need to delete the old issuance in the ActivePositions
        } else {
            balance_security_id = "";
        }

        // transfer
        StockTransfer memory transfer = _handleStockTransferStruct(quantity, latestTransferorPosition.security_id, transfereeIssuance.security_id, balance_security_id);
        transferStock(transfer);
       
    }

    // function _deleteNoLongerActivePosition(string memory _stakeholder_id, string memory _security_id, string memory _stock_class_id) internal {
    //     delete activePositions[_stakeholder_id][_security_id];


    // }

    function _handleStockIssuanceStructForTransfer(string memory transfereeId, uint256 quantity, int sharePrice, string memory stockClassId) internal view returns (StockIssuance memory issuance) {
        return StockIssuance(
            string(abi.encodePacked(block.timestamp, msg.sender)), // id // TODO: just for testing, need a secure UUID
            "TX_STOCK_ISSUANCE",
            stockClassId,
            "", // stock plan id (optional) TODO: should we include in cap table?
            sharePrice, 
            quantity,
            "", // vesting terms id (optional) TODO: should we include in cap table?
            "", // cost basis (optional) TODO: should we include in cap table?
            new string[](0), // stock_legend_ids (optional) TODO: should we include in cap table?
            "", // issuance type (optional) TODO: should we include in cap table?
            new string[](0), // comments
            string(abi.encodePacked(block.timestamp, msg.sender)), // security_id //TODO: just for testing, need a secure UUID
            transfereeId,
            "", // board approval date (optional) TODO: should we include in cap table?
            "", // stockholder approval date (optional) TODO: should we include in cap table?
            "", // consideration text (optional) TODO: should we include in cap table?
            new string[](0) // security law exemptions (optional) TODO: should we include in cap table?
        );
    }

    /* It's likely we see two types of issuances, one created during transfers (see above) and another created one time by the TA with more relevant data, like for a new employee */

    // function _handleStockIssuanceStructByTA(string memory transfereeId, uint256 quantity, int sharePrice, string memory stockClassId) internal returns (StockIssuance memory issuance) {
    //     return StockIssuance(
    //         string(abi.encodePacked(block.timestamp, msg.sender)), // id // TODO: just for testing, need a secure UUID
    //         "TX_STOCK_ISSUANCE",
    //         stockClassId,
    //         "", // stock plan id (optional) TODO: should we include in cap table?
    //         sharePrice, 
    //         quantity,
    //         "", // vesting terms id (optional) TODO: should we include in cap table?
    //         "", // cost basis (optional) TODO: should we include in cap table?
    //         new string[](0), // stock_legend_ids (optional) TODO: should we include in cap table?
    //         "", // issuance type (optional) TODO: should we include in cap table?
    //         new string[](0), // comments
    //         string(abi.encodePacked(block.timestamp, msg.sender)), // security_id //TODO: just for testing, need a secure UUID
    //         transfereeId,
    //         "", // board approval date (optional) TODO: should we include in cap table?
    //         "", // stockholder approval date (optional) TODO: should we include in cap table?
    //         "", // consideration text (optional) TODO: should we include in cap table?
    //         new string[](0) // security law exemptions (optional) TODO: should we include in cap table?
    //     );
    // }

    // only supporting of transfer from one person to another. Not one to many.
    function _handleStockTransferStruct(uint256 quantity, string memory security_id, string memory resulting_security_id, string memory balance_security_id) internal view returns (StockTransfer memory transfer) {
        string[] memory resultingSecurityIds = new string[](1);
        resultingSecurityIds[0] = resulting_security_id;
        
        return StockTransfer(
            string(abi.encodePacked(block.timestamp, msg.sender)), // id // TODO: just for testing, need a secure UUID
            "TX_STOCK_TRANSFER",
            quantity,
            new string[](0), // comments,
            security_id,
            "", // consideration text (optional) TODO: should we include in cap table?
            balance_security_id,
            resultingSecurityIds
        );
    }

    function issueStock(StockIssuance memory issuance) public onlyOwner {
        // TODO: need lots of checks
        // check that it's part of a stock class and stake holder exists
        StockIssuanceTX issuanceTX = new StockIssuanceTX(issuance);

        // first ,create mapping of stakeholder id to security id array
        // @todo: should be renamed to activeStakeholderSecurityIds
        activeStakeholderSecurityIdsByStockClass[issuance.stakeholder_id][issuance.stock_class_id].push(issuance.security_id);

        // then, update latest positions
        activePositions[issuance.stakeholder_id][issuance.security_id] = ActivePosition(
            issuance.stakeholder_id,
            issuance.stock_class_id,
            issuance.security_id,
            issuance.quantity,
            issuance.share_price,
            "2021-01-01"  // safeNow()
        );

        transactions.push(address(issuanceTX));
        // emit new issuance
    }

    function transferStock(StockTransfer memory transfer) public onlyOwner {
        // TODO: need lots of checks, similar to aboev
        StockTransferTX transferTX = new StockTransferTX(transfer);
        transactions.push(address(transferTX));
        // emit new transfer
    }

    function getStakeholderById(string memory _id) public view returns (string memory, string memory, string memory) {
        if(stakeholderIndex[_id] > 0) {
            Stakeholder memory stakeholder = stakeholders[stakeholderIndex[_id] - 1];
            return (stakeholder.id, stakeholder.stakeholder_type, stakeholder.current_relationship);
        } else {
            return ("", "", "");
        }
    }

    function getStockClassById(string memory _id) public view returns (string memory, string memory, uint256, uint256) {
        if(stockClassIndex[_id] > 0) {
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
