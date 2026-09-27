// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.37;

import { UpgradeableBeacon } from "openzeppelin/contracts/proxy/beacon/UpgradeableBeacon.sol";
import { BeaconProxy } from "openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";
import { Ownable } from "openzeppelin/contracts/access/Ownable.sol";
import { ICapTableFactory } from "./interfaces/ICapTableFactory.sol";
import { ICapTable } from "./interfaces/ICapTable.sol";

contract CapTableFactory is ICapTableFactory, Ownable {
    /// @dev Fixed so the beacon address does not move if the constructor later creates other contracts.
    bytes32 public constant BEACON_SALT = keccak256("tap.capTable.beacon.v1");

    address public capTableImplementation;
    UpgradeableBeacon public immutable capTableBeacon;
    address[] public capTableProxies;

    /// @dev Owner is an argument because a CREATE2 deploy sets msg.sender to the Arachnid deployer, not the broadcaster.
    constructor(address _capTableImplementation, address initialOwner) Ownable(initialOwner) {
        require(_capTableImplementation != address(0), "Invalid implementation address");
        capTableImplementation = _capTableImplementation;
        capTableBeacon = new UpgradeableBeacon{ salt: BEACON_SALT }(capTableImplementation, address(this));
    }

    function createCapTable(bytes16 id, string memory name, uint256 initial_shares_authorized, address operator) external returns (address) {
        require(id != bytes16(0) && initial_shares_authorized != 0, "Invalid issuer params");

        bytes memory initializationData = abi.encodeCall(ICapTable.initialize, (id, name, initial_shares_authorized, msg.sender, operator));
        BeaconProxy capTableProxy = new BeaconProxy(address(capTableBeacon), initializationData);
        capTableProxies.push(address(capTableProxy));
        emit CapTableCreated(address(capTableProxy));
        return address(capTableProxy);
    }

    /// @inheritdoc ICapTableFactory
    function updateCapTableImplementation(address newImplementation) external onlyOwner {
        require(newImplementation != address(0), "Invalid implementation address");
        address oldImplementation = capTableImplementation;
        capTableImplementation = newImplementation;
        capTableBeacon.upgradeTo(newImplementation);
        emit CapTableImplementationUpdated(oldImplementation, newImplementation);
    }

    function getCapTableCount() external view returns (uint256) {
        return capTableProxies.length;
    }
}
