// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "./CapTable.sol"; 

// Note: this contract serves to organize the deployments of CapTable contracts from a single place, it doesn't yet
// restrict that a CapTable contract only be deployed through this factory.
contract CapTableFactory is Ownable {
    mapping(string issuerId => uint256 index) public capTableIndex;
    address[] public capTables; 
    
    event CapTableCreated(address capTableAddress, string issuerId, string issuerLegalName, string initialSharesAuthorized);

    function createCapTable(string memory _issuerId, string memory _issuerLegalName, string memory _initialSharesAuthorized) public onlyOwner {
        CapTable capTable = new CapTable(_issuerId, _issuerLegalName, _initialSharesAuthorized);
        capTables.push(address(capTable));
        capTableIndex[_issuerId] = capTables.length;

        capTable.transferOwnership(msg.sender);

        emit CapTableCreated(address(capTable), _issuerId, _issuerLegalName, _initialSharesAuthorized);
    }

    function getCapTableAddressById(string memory _issuerId) public view returns (address) {
        require(capTableIndex[_issuerId] > 0, "Cap table does not exist");
        return capTables[capTableIndex[_issuerId] - 1];
    }

    function getTotalNumberOfCapTables() public view returns (uint256) {
        return capTables.length;
    }
}
