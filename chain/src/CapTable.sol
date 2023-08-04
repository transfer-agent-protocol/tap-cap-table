// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "./transactions/StockIssuance.sol";
import "./transactions/StockTransfer.sol";

import { StockIssuance, StockTransfer } from "./lib/Structs.sol";

contract CapTable is Ownable {
    // these are states with minimal info translated from the OCF primary objects.
    struct Issuer {
        string id;
        string initialSharesAuthorized;
    }

    // TODO: stakeholders need a relationship to how much stock they own. What are the missing states - if we're tracking transactions 
    // stakeholder will likely have multiple positions. of Multiple stock classes (or it should be allowed at least)
    struct Stakeholder {
        string id;
        uint256 sharesOwned; // latest positions, it might need to be security
    }

    struct StockClass {
        string id;
        string classType;
        uint256 pricePerShare; // OCF standard is JSON
        uint256 parValue; // OCF standard is string
        uint256 initialSharesAuthorized; // OCF standard is string
    }

    address[] public transactions;

    Issuer public issuer;
    // Map the id of the Stakeholder to its position in the array for O(1) access
    mapping (string id => uint256 index) public stakeholderIndex;
    Stakeholder[] public stakeholders;

    // Map the id of the StockClass to its position in the array for O(1) access
    mapping (string id => uint256 index) public stockClassIndex;
    StockClass[] public stockClasses;

    event IssuerCreated(string indexed id, string indexed initialSharesAuthorized);
    event StakeholderCreated(string indexed id);
    event StockClassCreated(string indexed id, string indexed classType, uint256 indexed pricePerShare, uint256 parValue, uint256 initialSharesAuthorized);

    modifier legalNameNotEmpty (string memory _legalName) {
        require(keccak256(abi.encodePacked(_legalName)) != keccak256(abi.encodePacked("")), "Legal name cannot be empty");
        _;
    }

    // modifier avoidStakeholderDuplicate(string memory _id) {
    //     require(keccak256(abi.encodePacked(getStakeholderById(_id))) == keccak256(abi.encodePacked("")), "Stakeholder already exists");
    //     _;
    // }

    modifier avoidStockClassDuplicate(string memory _id) {
         (string memory stockClassId, , , , ) = getStockClassById(_id);
        require(keccak256(abi.encodePacked(stockClassId)) == keccak256(abi.encodePacked("")), "Stock class already exists");
        _;
    }

    constructor(string memory _id, string memory _initialSharesAuthorized) {
        issuer = Issuer(_id, _initialSharesAuthorized);
        emit IssuerCreated(_id, _initialSharesAuthorized);
    }

    // avoidStakeholderDuplicate(_id)
    function createStakeholder(string memory _id, uint256 sharesOwned) public onlyOwner returns (string memory)  {
        stakeholders.push(Stakeholder(_id, sharesOwned));
        stakeholderIndex[_id] = stakeholders.length;
        emit StakeholderCreated(_id);
        return _id;
    }

    function createStockClass(
        string memory _id,
        string memory _classType,
        uint256 _pricePerShare,
        uint256 _parValue,
        uint256 _initialSharesAuthorized
    ) public onlyOwner avoidStockClassDuplicate(_id) {
        stockClasses.push(StockClass(_id, _classType, _pricePerShare, _parValue, _initialSharesAuthorized));
        stockClassIndex[_id] = stockClasses.length;
        emit StockClassCreated(_id, _classType, _pricePerShare, _parValue, _initialSharesAuthorized);
    }

    // Sample transfer: isBuyerVerified is a placeholder for a signature, account or hash that confirms the buyer's identity. Currently it is a simple boolean
    // assuming buyer is not on the cap table yet
    function transferStockOwnership(string memory transferorStakeholderId, bool isBuyerVerified, uint256 quantity, int sharePrice) public onlyOwner {
        require(isBuyerVerified, "Buyer must confirm");
        require(quantity > 0, "Shares to transfer must be greater than 0");
        require(stakeholderIndex[transferorStakeholderId] > 0, "Seller stakeholder does not exist");
        require(stakeholders[stakeholderIndex[transferorStakeholderId] - 1].sharesOwned >= quantity, "Seller does not have enough shares to transfer");

        // Seller activities
        (, uint256 sharesOwned) = getStakeholderById(transferorStakeholderId);
        uint256 remainingSharesForSeller = sharesOwned - quantity;
        // update seller's shares
        stakeholders[stakeholderIndex[transferorStakeholderId] - 1].sharesOwned = remainingSharesForSeller;

         // Buyer activities: assuming transferee is not on the cap table yet, need new ID
        string memory transfereeId = createStakeholder("9876-9876-9876", quantity);
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
    // so it's only one function after this test.

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


    function getIssuer() public view returns (string memory, string memory) {
        return (issuer.id, issuer.initialSharesAuthorized);
    }

    function getStakeholderById(string memory _id) public view returns (string memory, uint256) {
        if(stakeholderIndex[_id] > 0) {
            Stakeholder memory stakeholder = stakeholders[stakeholderIndex[_id] - 1];
            return (stakeholder.id, stakeholder.sharesOwned);
        } else {
            return ("", 0);
        }
    }

    function getStockClassById(string memory _id) public view returns (string memory, string memory, uint256, uint256, uint256) {
        if(stockClassIndex[_id] > 0) {
            StockClass memory stockClass = stockClasses[stockClassIndex[_id] - 1];
            return (stockClass.id, stockClass.classType, stockClass.pricePerShare, stockClass.parValue, stockClass.initialSharesAuthorized);
        } else {
            return ("", "", 0, 0, 0);
        }
    }

    function getTotalNumberOfStakeholders() public view returns (uint256) {
        return stakeholders.length;
    }

    function getTotalNumberOfStockClasses() public view returns (uint256) {
        return stockClasses.length;
    }
}
