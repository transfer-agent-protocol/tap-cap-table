// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { UpgradeableBeacon } from "openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import { BeaconProxy } from "openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import { Ownable } from "openzeppelin/contracts/access/Ownable.sol";
import { ICapTableFactory } from "./interfaces/ICapTableFactory.sol";
import { ICapTable } from "./interfaces/ICapTable.sol";

contract CapTableFactory is ICapTableFactory, Ownable {
    address public capTableImplementation;
    UpgradeableBeacon public capTableBeacon;
    address[] public capTableProxies;

    constructor(address _capTableImplementation) Ownable(msg.sender) {
        require(_capTableImplementation != address(0), "Invalid implementation address");
        capTableImplementation = _capTableImplementation;
        capTableBeacon = new UpgradeableBeacon(capTableImplementation, address(this));
    }

    function createCapTable(bytes16 id, string memory name, uint256 initial_shares_authorized) external onlyOwner returns (address) {
        require(id != bytes16(0) && initial_shares_authorized != 0, "Invalid issuer params");

        bytes memory initializationData = abi.encodeCall(ICapTable.initialize, (id, name, initial_shares_authorized, msg.sender));
        BeaconProxy capTableProxy = new BeaconProxy(address(capTableBeacon), initializationData);
        capTableProxies.push(address(capTableProxy));
        emit CapTableCreated(address(capTableProxy));
        return address(capTableProxy);
    }

    function updateCapTableImplementation(address newImplementation) external onlyOwner {
        require(newImplementation != address(0), "Invalid implementation address");
        capTableBeacon.upgradeTo(newImplementation);
        capTableImplementation = newImplementation;
    }

    function getCapTableCount() external view returns (uint256) {
        return capTableProxies.length;
    }
}
