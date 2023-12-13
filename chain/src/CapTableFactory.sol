// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { UpgradeableBeacon } from "openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import { BeaconProxy } from "openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import { Ownable } from "openzeppelin/contracts/access/Ownable.sol";
import { ICapTableFactory } from "./interfaces/ICapTableFactory.sol";

contract CapTableFactory is ICapTableFactory, Ownable {
    address public capTableImplementation;
    UpgradeableBeacon public capTableBeacon;
    address[] public capTableProxies;

    constructor(address _capTableImplementation) Ownable() {
        require(_capTableImplementation != address(0), "Invalid implementation address");
        capTableImplementation = _capTableImplementation;
        capTableBeacon = new UpgradeableBeacon(capTableImplementation);
    }

    function createCapTable(bytes memory initializationData) external onlyOwner returns (address) {
        BeaconProxy capTableProxy = new BeaconProxy(address(capTableBeacon), initializationData);
        capTableProxies.push(address(capTableProxy));
        emit CapTableCreated(address(capTableProxy));
        return address(capTableProxy);
    }

    function updateCapTableImplementation(address newImplementation) external onlyOwner {
        // Add access control to restrict who can call this function
        require(newImplementation != address(0), "Invalid implementation address");
        capTableBeacon.upgradeTo(newImplementation);
    }

    function getCapTableCount() external view returns (uint256) {
        return capTableProxies.length;
    }
}
