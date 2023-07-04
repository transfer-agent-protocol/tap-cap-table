pragma solidity >=0.8.2 <0.9.0;

// Prototype light Ethereum smart contract. The desired outcome is only for the cap table essentials to be onchain. The rest of the data and information can be stored completely offchain. For example, we have no need to store PII onchain, a regular DB is more efficient for doing that.

// Prime candidates for storing onchain:
// - Issuer: id, legalName, initialSharesAuthorized
// - Stock Class: id, name, initialSharesAuthorized, votesPerShare, parValue, pricePerShare, seniority

contract Issuer {
    struct IssuerInfo {
        string id;
        string legalName;
        uint256 initialSharesAuthorized;
    }
    mapping(string => IssuerInfo) issuers;

    function addIssuer(string memory _id, string memory _legalName, uint256 _initialSharesAuthorized) public {
        issuers[_id] = IssuerInfo(_id, _legalName, _initialSharesAuthorized);
    }

    function getIssuer(string memory _id) public view returns (string memory, string memory, uint256) {
        return (issuers[_id].id, issuers[_id].legalName, issuers[_id].initialSharesAuthorized);
    }
}

contract StockClass {
    struct StockClassInfo {
        string id;
        string name;
        uint256 initialSharesAuthorized;
        uint256 votesPerShare;
        uint256 parValue;
        uint256 pricePerShare;
        uint256 seniority;
    }
    mapping(string => StockClassInfo) stockClasses;

    function addStockClass(string memory _id, string memory _name, uint256 _initialSharesAuthorized, uint256 _votesPerShare, uint256 _parValue, uint256 _pricePerShare, uint256 _seniority) public {
        stockClasses[_id] = StockClassInfo(_id, _name, _initialSharesAuthorized, _votesPerShare, _parValue, _pricePerShare, _seniority);
    }

    function getStockClass(string memory _id) public view returns (string memory, string memory, uint256, uint256, uint256, uint256, uint256) {
        return (stockClasses[_id].id, stockClasses[_id].name, stockClasses[_id].initialSharesAuthorized, stockClasses[_id].votesPerShare, stockClasses[_id].parValue, stockClasses[_id].pricePerShare, stockClasses[_id].seniority);
    }
}

contract Stakeholder {
    struct StakeholderInfo {
        string id;
        string issuerId;
        string stockClassId;
    }
    mapping(string => StakeholderInfo) stakeholders;

    function addStakeholder(string memory _id, string memory _issuerId, string memory _stockClassId) public {
        stakeholders[_id] = StakeholderInfo(_id, _issuerId, _stockClassId);
    }

    function getStakeholder(string memory _id) public view returns (string memory, string memory, string memory) {
        return (stakeholders[_id].id, stakeholders[_id].issuerId, stakeholders[_id].stockClassId);
    }
}
