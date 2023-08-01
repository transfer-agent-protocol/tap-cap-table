// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "./transactions/Issuance.sol";
import "./transactions/Transfer.sol";

contract CapTable is Ownable {
    // these are states with minimal info translated from the OCF primary objects.
    struct Issuer {
        string id;
        string legalName;
        string initialSharesAuthorized;
    }

    // TODO: stakeholders need a relationship to how much stock they own. What are the missing states - if we're tracking transactions 
    struct Stakeholder {
        string id;
        uint256 sharesOwned;
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

    event IssuerCreated(string indexed id, string indexed legalName, string indexed initialSharesAuthorized);
    event IssuerLegalNameUpdated(string oldLegalName, string newLegalName);
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

    constructor(string memory _id, string memory _legalName, string memory _initialSharesAuthorized) legalNameNotEmpty(_legalName) {
        issuer = Issuer(_id, _legalName, _initialSharesAuthorized);
        emit IssuerCreated(_id, _legalName, _initialSharesAuthorized);
    }

	function updateLegalName(string memory _legalName) public onlyOwner legalNameNotEmpty(_legalName) {
        string memory previousLegalName = issuer.legalName;
        issuer.legalName = _legalName;
        emit IssuerLegalNameUpdated(previousLegalName, _legalName);
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
    function transferStockOwnership(string memory sellerStakeholderId, bool isBuyerVerified, uint256 quantity, int sharePrice) public onlyOwner {
        require(isBuyerVerified, "Buyer must confirm");
        require(quantity > 0, "Shares to transfer must be greater than 0");
        require(stakeholderIndex[sellerStakeholderId] > 0, "Seller stakeholder does not exist");
        require(stakeholders[stakeholderIndex[sellerStakeholderId] - 1].sharesOwned >= quantity, "Seller does not have enough shares to transfer");

        // Seller activities
        (, uint256 sharesOwned) = getStakeholderById(sellerStakeholderId);
        uint256 remainingSharesForSeller = sharesOwned - quantity;
        // update seller's shares
        stakeholders[stakeholderIndex[sellerStakeholderId] - 1].sharesOwned = remainingSharesForSeller;

         // Buyer activities
        string memory buyerId = createStakeholder("9876-9876-9876", quantity);

        StockIssuanceTX buyerIssuanceTx = new StockIssuanceTX(
            "1234-1234-1234",
            "TX_STOCK_ISSUANCE",
            "Common A",
            sharePrice,
            quantity,
            "sec-id-1234",
            buyerId
        );

        StockIssuanceTX postTransactionSellerIssuanceTx = new StockIssuanceTX(
            "2345-2345-2345-2345",
            "TX_STOCK_ISSUANCE",
            "Common A",
            sharePrice,
            remainingSharesForSeller,
            "sec-id-9999",
            sellerStakeholderId
        );

        string[] memory resultingSecurityIds = new string[](1);
        resultingSecurityIds[0] = "sec-id-1234";
        StockTransferTX transferTx = new StockTransferTX(
            "1234-1234-1234",
            "TX_STOCK_TRANSFER",
            quantity,
            "sec-id-0000",
            "sec-id-9999",
            resultingSecurityIds
        );
        
        transactions.push(address(buyerIssuanceTx));
        transactions.push(address(transferTx));
        transactions.push(address(postTransactionSellerIssuanceTx));
    }


    function getIssuer() public view returns (string memory, string memory, string memory) {
        return (issuer.id, issuer.legalName, issuer.initialSharesAuthorized);
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
