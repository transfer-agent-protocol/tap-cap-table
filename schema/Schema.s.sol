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

	// The Issuer contract includes a structure called IssuerInfo that describes an issuer with id, legalName, and initialSharesAuthorized fields. There's a mapping from string to IssuerInfo, which allows you to store and retrieve IssuerInfo structures associated with a particular id. The addIssuer function takes three parameters and stores them in the mapping. The getIssuer function takes an id and returns the IssuerInfo structure associated with that id.

    mapping(string => IssuerInfo) issuers;

	// The addIssuer function allows anyone to add an issuer to the contract. The function takes the issuer's id, legalName, and initialSharesAuthorized, and creates a new IssuerInfo with these values, which is then stored in the issuers mapping with the provided id as the key.
    function addIssuer(string memory _id, string memory _legalName, uint256 _initialSharesAuthorized) public {
        issuers[_id] = IssuerInfo(_id, _legalName, _initialSharesAuthorized);
    }

	// The getIssuer function allows anyone to retrieve an issuer from the contract. The function returns the id, legalName, and initialSharesAuthorized of the issuer.
    function getIssuer(string memory _id) public view returns (string memory, string memory, uint256) {
        return (issuers[_id].id, issuers[_id].legalName, issuers[_id].initialSharesAuthorized);
    }
}

// Declaring StockClass contract
contract StockClass {
    // Struct to store information about a particular Stock Class
    struct StockClassInfo {
        string id;
        string name;
        uint256 initialSharesAuthorized;
        uint256 votesPerShare;
        uint256 parValue;
        uint256 pricePerShare;
        uint256 seniority;
    }
    
    // Mapping from StockClass id to StockClassInfo, allowing retrieval of stock class data
    mapping(string => StockClassInfo) stockClasses;

    // Function to add a new stock class
    // _id - the ID of the stock class
    // _name - the name of the stock class
    // _initialSharesAuthorized - the initial number of shares authorized for the stock class
    // _votesPerShare - the number of votes each share in this class is entitled to
    // _parValue - the par value of the stock
    // _pricePerShare - the price per share
    // _seniority - the seniority level of the stock class
    function addStockClass(string memory _id, string memory _name, uint256 _initialSharesAuthorized, uint256 _votesPerShare, uint256 _parValue, uint256 _pricePerShare, uint256 _seniority) public {
        stockClasses[_id] = StockClassInfo(_id, _name, _initialSharesAuthorized, _votesPerShare, _parValue, _pricePerShare, _seniority);
    }

    // Function to get information about a stock class by its id
    function getStockClass(string memory _id) public view returns (string memory, string memory, uint256, uint256, uint256, uint256, uint256) {
        return (stockClasses[_id].id, stockClasses[_id].name, stockClasses[_id].initialSharesAuthorized, stockClasses[_id].votesPerShare, stockClasses[_id].parValue, stockClasses[_id].pricePerShare, stockClasses[_id].seniority);
    }
}

// Declaring Stakeholder contract
contract Stakeholder {
    // Struct to store information about a particular Stakeholder
    struct StakeholderInfo {
        string id;
        string issuerId;
        string stockClassId;
    }
    
    // Mapping from Stakeholder id to StakeholderInfo, allowing retrieval of stakeholder data
    mapping(string => StakeholderInfo) stakeholders;

    // Function to add a new stakeholder
    // _id - the ID of the stakeholder
    // _issuerId - the ID of the issuer associated with the stakeholder
    // _stockClassId - the ID of the stock class the stakeholder is associated with
    function addStakeholder(string memory _id, string memory _issuerId, string memory _stockClassId) public {
        stakeholders[_id] = StakeholderInfo(_id, _issuerId, _stockClassId);
    }

    // Function to get information about a stakeholder by its id
    function getStakeholder(string memory _id) public view returns (string memory, string memory, string memory) {
        return (stakeholders[_id].id, stakeholders[_id].issuerId, stakeholders[_id].stockClassId);
    }
}
