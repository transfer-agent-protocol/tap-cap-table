// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "./CapTable.sol"; 

// Note: this contract serves to organize the deployments of CapTable contracts from a single place, it doesn't yet
// restrict that a CapTable contract only be deployed through this factory.
contract CapTableFactory is Ownable {
    CapTable[] public capTables;
    
    event CapTableCreated(address capTableAddress, string issuerId, string issuerLegalName, string initialSharesAuthorized);

    function createCapTable(string memory _issuerId, string memory _issuerLegalName, string memory _initialSharesAuthorized) public onlyOwner returns (CapTable) {
        CapTable capTable = new CapTable(_issuerId, _issuerLegalName, _initialSharesAuthorized);
        capTables.push(capTable);

        emit CapTableCreated(address(capTable), _issuerId, _issuerLegalName, _initialSharesAuthorized);

        return capTable;
    }

    function getCapTable(uint index) public view returns (CapTable) {
        return capTables[index];
    }

    function getCapTables() public view returns (CapTable[] memory) {
        return capTables;
    }
}
