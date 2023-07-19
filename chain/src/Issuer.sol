// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "openzeppelin-contracts/contracts/access/Ownable.sol";

contract CapTableIssuer is Ownable {
    struct Issuer {
        string id;
        string legalName;
        string initialSharesAuthorized;
    }

    Issuer public issuer;

    event IssuerCreated(string id, string legalName, string initialSharesAuthorized);
    event LegalNameUpdated(string oldLegalName, string newLegalName);

    constructor(string memory id, string memory legalName, string memory initialSharesAuthorized) {
        issuer = Issuer(id, legalName, initialSharesAuthorized);
        emit IssuerCreated(id, legalName, initialSharesAuthorized);
    }

    function getIssuer() public view returns (string memory, string memory, string memory) {
        return (issuer.id, issuer.legalName, issuer.initialSharesAuthorized);
    }

    function updateLegalName(string memory legalName) public onlyOwner {
        string memory oldLegalName = issuer.legalName;
        issuer.legalName = legalName;
        emit LegalNameUpdated(oldLegalName, legalName);
    }
}
