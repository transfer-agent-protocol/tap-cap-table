// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";

import "../src/CapTable.sol";
import "../src/CapTableFactory.sol";

/// @dev Test deployment using `forge script script/CapTableFactory.s.sol --fork-url http://localhost:8545 --broadcast`
contract DeployCapTableFactoryDeployLocalScript is Script {
    uint256 deployerPrivateKey;

    function setUp() public {
        console.log("Upgrading CapTableFactory with CapTable implementation");

        deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    }

    function run() external {
        console.log("Deploying CapTableFactory and CapTable implementation");

        vm.startBroadcast(deployerPrivateKey); // Start a new transaction

        CapTable capTable = new CapTable();
        console.log("CapTable implementation deployed at:", address(capTable));

        vm.stopBroadcast(); // End the transaction

        // Deploy CapTableFactory with the address of CapTable implementation
        vm.startBroadcast(deployerPrivateKey); // Start a new transaction

        CapTableFactory capTableFactory = new CapTableFactory(address(capTable));
        console.log("CapTableFactory deployed at:", address(capTableFactory));

        vm.stopBroadcast(); // End the transaction
    }

    /// @dev Run using `forge tx script/CapTableFactory.s.sol upgradeCapTable [0x...] --fork-url http://localhost:8545 --broadcast`
    function upgradeCapTable(address factory) external {
        vm.startBroadcast(deployerPrivateKey); // Start a new transaction

        CapTable capTable = new CapTable();
        console.log("CapTable implementation deployed at:", address(capTable));

        vm.stopBroadcast(); // End the transaction

        // Upgrade CapTableFactory with the address of CapTable implementation
        vm.startBroadcast(deployerPrivateKey); // Start a new transaction

        CapTableFactory capTableFactory = CapTableFactory(factory);

        capTableFactory.updateCapTableImplementation(address(capTable));
        console.log("CapTableFactory upgraded to:", address(capTable));

        vm.stopBroadcast(); // End the transaction
    }
}
