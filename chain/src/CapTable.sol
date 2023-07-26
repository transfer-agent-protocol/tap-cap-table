// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "openzeppelin-contracts/contracts/access/Ownable.sol";

contract CapTable is Ownable {
    struct Issuer {
        string id;
        string legalName;
        string initialSharesAuthorized;
    }

    // TODO: stakeholders need a relationship to how much stock they own.
    struct Stakeholder {
        string id;
    }

    struct StockClass {
        string id;
        string classType;
        uint256 pricePerShare; // OCF standard is JSON
        uint256 parValue; // OCF standard is string
        uint256 initialSharesAuthorized; // OCF standard is string
    }

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

    modifier avoidStakeholderDuplicate(string memory _id) {
        require(keccak256(abi.encodePacked(getStakeholderById(_id))) == keccak256(abi.encodePacked("")), "Stakeholder already exists");
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

    function createStakeholder(string memory _id) public onlyOwner avoidStakeholderDuplicate(_id) {
        stakeholders.push(Stakeholder(_id));
        stakeholderIndex[_id] = stakeholders.length;
        emit StakeholderCreated(_id);
    }

    function createStockClass(
        string memory _id,
        string memory _classType,
        uint256 _pricePerShare,
        uint256 _parValue,
        uint256 _initialSharesAuthorized
    ) public onlyOwner {
        (string memory stockClassId, , , , ) = getStockClassById(_id);
        require(keccak256(abi.encodePacked(stockClassId)) == keccak256(abi.encodePacked("")), "Stock class already exists");

        stockClasses.push(StockClass(_id, _classType, _pricePerShare, _parValue, _initialSharesAuthorized));
        stockClassIndex[_id] = stockClasses.length;
        emit StockClassCreated(_id, _classType, _pricePerShare, _parValue, _initialSharesAuthorized);
    }

    function getIssuer() public view returns (string memory, string memory, string memory) {
        return (issuer.id, issuer.legalName, issuer.initialSharesAuthorized);
    }

    function getStakeholderById(string memory _id) public view returns (string memory) {
        if(stakeholderIndex[_id] > 0) {
            return stakeholders[stakeholderIndex[_id] - 1].id;
        } else {
            return "";
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
