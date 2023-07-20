// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "openzeppelin-contracts/contracts/access/Ownable.sol";

contract CapTable is Ownable {
    struct Issuer {
        string id;
        string legalName;
        string initialSharesAuthorized;
    }

    struct Stakeholders {
        string id;
    }

    struct StockClasses {
        string id;
        string classType;
        uint256 pricePerShare; // OCF standard is JSON
        uint256 parValue; // OCF standard is string
        uint256 initialSharesAuthorized; // OCF standard is string
    }

    Issuer public issuer;
    Stakeholders[] public stakeholders;
    StockClasses[] public stockClasses;

    event IssuerCreated(string id, string legalName, string initialSharesAuthorized);
    event IssuerLegalNameUpdated(string oldLegalName, string newLegalName);

    event StakeholderCreated(string id);
    event StockClassCreated(string id, string classType, uint256 pricePerShare, uint256 parValue, uint256 initialSharesAuthorized);

    constructor(string memory id, string memory legalName, string memory initialSharesAuthorized) {
        issuer = Issuer(id, legalName, initialSharesAuthorized);
        emit IssuerCreated(id, legalName, initialSharesAuthorized);
    }

	function updateLegalName(string memory legalName) public onlyOwner {
        string memory previousLegalName = issuer.legalName;
        issuer.legalName = legalName;
        emit IssuerLegalNameUpdated(previousLegalName, legalName);
    }

    function createStakeholder(string memory id) public onlyOwner {
        stakeholders.push(Stakeholders(id));
        emit StakeholderCreated(id);
    }

    function createStockClass(
        string memory id,
        string memory classType,
        uint256 pricePerShare,
        uint256 parValue,
        uint256 initialSharesAuthorized
    ) public onlyOwner {
        stockClasses.push(StockClasses(id, classType, pricePerShare, parValue, initialSharesAuthorized));
        emit StockClassCreated(id, classType, pricePerShare, parValue, initialSharesAuthorized);
    }

    function getIssuer() public view returns (string memory, string memory, string memory) {
        return (issuer.id, issuer.legalName, issuer.initialSharesAuthorized);
    }

    function getStakeholder(uint256 index) public view returns (string memory) {
        require(index < stakeholders.length, "Index out of bounds");
        return stakeholders[index].id;
    }

    function getStockClass(uint256 index) public view returns (string memory, string memory, uint256, uint256, uint256) {
        require(index < stockClasses.length, "Index out of bounds");
        return (
            stockClasses[index].id,
            stockClasses[index].classType,
            stockClasses[index].pricePerShare,
            stockClasses[index].parValue,
            stockClasses[index].initialSharesAuthorized
        );
    }

    
}
