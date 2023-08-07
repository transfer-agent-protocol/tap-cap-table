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
    // Wallets aren't yet tracked. They would live in the stakeholder struct
    struct Issuer {
        string id;
        string name;
        string initial_shares_authorized; // TODO: might be useful but not sure how 
    }

    // TODO: stakeholders need a relationship to how much stock they own. What are the missing states - if we're tracking transactions 
    // stakeholder will likely have multiple positions. of Multiple stock classes (or it should be allowed at least)
    // TODO: wallets could be tracked here
    struct Stakeholder {
        // base variables
        string id;
        string stakeholder_type; // ["INDIVIDUAL", "INSTITUTION"]
        string current_relationship; //OPTIONAL but might be useful ENUM with values  ["ADVISOR","BOARD_MEMBER","CONSULTANT","EMPLOYEE","EX_ADVISOR" "EX_CONSULTANT","EX_EMPLOYEE","EXECUTIVE","FOUNDER","INVESTOR","NON_US_EMPLOYEE","OFFICER","OTHER"]
        // string[] securityIds;// Security ID ties a stakeholder to an entire position they own. Confirming with OCF
        uint256 sharesOwned; // latest positions, it might need to be security id
    }

    // can be later extended to add things like seniority, conversion_rights, etc.
    struct StockClass {
        string id;
        string class_type; // ["COMMON", "PREFERRED"]
        uint256 price_per_share; // Per-share price this stock class was issued for, is this needed for trading?
        uint256 initial_shares_authorized; // OCF standard is string
    }

    // @dev Transactions will be created on-chain then reflected off-chain. They contain the source of truth.
    address[] public transactions;

    Issuer public issuer;
    Stakeholder[] public stakeholders;
    StockClass[] public stockClasses;

    // stakeholder id -> index
    mapping (string => uint256) public stakeholderIndex;
    // stock class id -> index
    mapping (string id => uint256 index) public stockClassIndex;
    // TODO: placeholder mapping until more info is uncovered.
    // stakeholder id -> security id -> shares owned
    mapping (string => mapping (string => uint256)) public positions;
    
    // security id -> stakeholder id
    mapping (string => string) private securityIds;

    event IssuerCreated(string indexed id, string indexed _name, string initialSharesAuthorized);
    event StakeholderCreated(string indexed id);
    event StockClassCreated(string indexed id, string indexed classType, uint256 indexed pricePerShare, uint256 initialSharesAuthorized);

    constructor(string memory _id, string memory _name, string memory _initialSharesAuthorized) {
        issuer = Issuer(_id, _name, _initialSharesAuthorized);
        emit IssuerCreated(_id, _name, _initialSharesAuthorized);
    }

    function createStakeholder(string memory _id, string memory _stakeholder_type, string memory _current_relationship, uint256 _sharesOwned) public onlyOwner returns (string memory)  {
        console.log("stakeholder type is %s", _stakeholder_type);
        console.log("current relationship is %s", _current_relationship);
        console.log("shares owned is %s", _sharesOwned);
        stakeholders.push(Stakeholder(_id, _stakeholder_type, _current_relationship, _sharesOwned));
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
    // assuming buyer is not on the cap table yet
    function transferStockOwnership(string memory transferorStakeholderId, bool isBuyerVerified, uint256 quantity, int sharePrice) public onlyOwner {
        require(isBuyerVerified, "Buyer must confirm");
        require(quantity > 0, "Shares to transfer must be greater than 0");
        require(stakeholderIndex[transferorStakeholderId] > 0, "Seller stakeholder does not exist");
        require(stakeholders[stakeholderIndex[transferorStakeholderId] - 1].sharesOwned >= quantity, "Seller does not have enough shares to transfer");

        // Seller activities
        (,,, uint256 sharesOwned) = getStakeholderById(transferorStakeholderId);
        uint256 remainingSharesForSeller = sharesOwned - quantity;
        // update seller's shares
        stakeholders[stakeholderIndex[transferorStakeholderId] - 1].sharesOwned = remainingSharesForSeller;

         // Buyer activities: assuming transferee is not on the cap table yet, need new ID
        string memory transfereeId = createStakeholder("123e4567-e89b-12d3-a456-426614174000", "INDIVIDUAL", "OTHER", quantity);
        address transfereeIssuanceTx = _handleTransfereeStockIssuanceTX(transfereeId, quantity, sharePrice);

        // Seller activities: seller must be on the cap table already
        address transferorPostTransferIssuanceTx = _handleTransferorStockIssuanceTX(transferorStakeholderId, remainingSharesForSeller, sharePrice);
       
        // Transfer activities
        address transferTx = _handleStockTransferTX(quantity);
        
        // logic to calculate latest positions

         transactions.push(address(transfereeIssuanceTx));
         transactions.push(address(transferorPostTransferIssuanceTx));
         transactions.push(address(transferTx));
       
    }


    // TODO: Running experiment where transferor and transferee are in different funtions since the struct is static. Need to make this 
    // so it's only one function after this test
    function _handleTransfereeStockIssuanceTX(string memory transfereeId, uint256 quantity, int sharePrice) internal returns (address) {
        StockIssuanceTX issuance = new StockIssuanceTX(StockIssuance(
            "1234-1234-1234", // would be a new ID
            "TX_STOCK_ISSUANCE",
            "Common A", // this can point to stockclass
            "", // stock plan id
            sharePrice, 
            quantity,
            "", // vesting terms id
            "", // cost basis
            new string[](0), // stock_legend_ids
            "", // issuance type
            new string[](0), // comments
            "sec-id-0000", // security id: would be a new ID
            transfereeId,
            "", // board approval date
            "", // stockholder approval date
            "", // consideration text
            new string[](0) // security law exemptions
        ));

        return address(issuance);
    }

    function _handleTransferorStockIssuanceTX(string memory transferorId, uint256 remainingSharesForTransferor, int sharePrice) internal returns (address) {
        StockIssuanceTX issuance = new StockIssuanceTX(StockIssuance(
            "2345-2345-2345-2345",
            "TX_STOCK_ISSUANCE",
            "Common A",
            "", // stock plan id
            sharePrice,
            remainingSharesForTransferor,
            "", // vesting terms id
            "", // cost basis
            new string[](0), // stock legends ids
            "", // issuance type
            new string[](0), // comments
            "sec-id-9999", // security id: would be a new ID
            transferorId,
            "", // board approval date
            "", // stockholder approval date
            "", // consideration text
            new string[](0) // security law exemptions
        ));

        return address(issuance);
    }

    // experiment ends here.

    function _handleStockTransferTX(uint256 quantity) internal returns (address) {
        string[] memory resultingSecurityIds = new string[](1);
        resultingSecurityIds[0] = "sec-id-0000";

        StockTransferTX transfer = new StockTransferTX(StockTransfer(
            "1234-1234-1234",
            "TX_STOCK_TRANSFER",
            quantity,
            new string[](0), // comments
            "sec-id-1111", // BOBs original security ID.
            "", //consideration text
            "sec-id-9999", // balance security id
            resultingSecurityIds
        ));

        return address(transfer);
    }

    // Experiment of stock issuance passing a struct as parameter
    function stockIssuance(StockIssuance calldata issuance) external onlyOwner {
        // TODO: need lots of checks
        // check that it's part of a stock class and stake holder exists, if not create a new stakeholder?
        StockIssuanceTX issuanceTX = new StockIssuanceTX(issuance);
        ownerships[issuance.stakeholder_id][issuance.stock_class_id] = issuance.quantity;
        securityIds[issuance.security_id] = issuance.stakeholder_id;
        transactions.push(address(issuanceTX));
    }


    function getStakeholderById(string memory _id) public view returns (string memory, string memory, string memory, uint256) {
        if(stakeholderIndex[_id] > 0) {
            Stakeholder memory stakeholder = stakeholders[stakeholderIndex[_id] - 1];
            return (stakeholder.id, stakeholder.stakeholder_type, stakeholder.current_relationship, stakeholder.sharesOwned);
        } else {
            return ("", "", "", 0);
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
