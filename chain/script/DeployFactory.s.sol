// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.37;

import { Script, console2 } from "forge-std/Script.sol";
import { CapTable } from "../src/CapTable.sol";
import { CapTableFactory } from "../src/CapTableFactory.sol";

/// @dev Library salt is `[profile.deploy] create2_library_salt` (preimage `tap.capTable.libraries.v1`).
///      Forge CREATE2-deploys DeleteContext, Adjustment, and StockLib when this script deploys CapTable.
bytes32 constant IMPLEMENTATION_SALT = keccak256("tap.capTable.implementation.v1");
bytes32 constant FACTORY_SALT = keccak256("tap.capTable.factory.v1");

contract DeployFactory is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address owner = vm.addr(pk);

        vm.startBroadcast(pk);
        address implementation = address(new CapTable{ salt: IMPLEMENTATION_SALT }());
        CapTableFactory factory = new CapTableFactory{ salt: FACTORY_SALT }(implementation, owner);
        vm.stopBroadcast();

        _logDeploy(implementation, address(factory));
        require(factory.owner() == owner, "factory owner is not the broadcaster");
        require(factory.capTableBeacon().owner() == address(factory), "beacon owner is not the factory");
        require(factory.capTableImplementation() == implementation, "factory implementation mismatch");
    }

    function _logDeploy(address implementation, address factory) internal view {
        console2.log("TAP_DEPLOY_IMPLEMENTATION", implementation);
        console2.log("TAP_DEPLOY_FACTORY", factory);
        console2.log("TAP_DEPLOY_BEACON", address(CapTableFactory(factory).capTableBeacon()));
    }
}

/// @notice Deploys the CREATE2 implementation and points an existing factory beacon at it.
///         Does not deploy a new factory. Set FACTORY_ADDRESS to the factory you own.
contract UpgradeCapTableImplementation is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        address owner = vm.addr(pk);
        address factoryAddr = vm.envAddress("FACTORY_ADDRESS");
        CapTableFactory factory = CapTableFactory(factoryAddr);
        require(factory.owner() == owner, "signer is not factory owner");

        vm.startBroadcast(pk);
        address implementation = address(new CapTable{ salt: IMPLEMENTATION_SALT }());
        if (factory.capTableImplementation() != implementation) {
            factory.updateCapTableImplementation(implementation);
        }
        vm.stopBroadcast();

        console2.log("TAP_DEPLOY_IMPLEMENTATION", implementation);
        console2.log("TAP_DEPLOY_FACTORY", factoryAddr);
        console2.log("TAP_DEPLOY_BEACON", address(factory.capTableBeacon()));
        require(factory.capTableImplementation() == implementation, "implementation was not upgraded");
    }
}
