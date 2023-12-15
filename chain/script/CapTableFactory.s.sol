// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";

import "../src/CapTable.sol";
import "../src/CapTableFactory.sol";

/// @dev Test deployment using `forge script script/CapTableFactory.s.sol --fork-url http://localhost:8545 --broadcast`
contract CapTableFactoryDeployLocalScript is Script {
    function setUp() public {}

    function run() external {
        uint256 deployerPrivateKeyFakeAccount = vm.envUint("PRIVATE_KEY_FAKE_ACCOUNT");

        vm.startBroadcast(deployerPrivateKeyFakeAccount); // Start a new transaction

        CapTable capTable = new CapTable();
        console.log("CapTable implementation deployed at:", address(capTable));

        vm.stopBroadcast(); // End the transaction

        // Deploy CapTableFactory with the address of CapTable implementation
        vm.startBroadcast(deployerPrivateKeyFakeAccount); // Start a new transaction

        CapTableFactory capTableFactory = new CapTableFactory(address(capTable));
        console.log("CapTableFactory deployed at:", address(capTableFactory));

        vm.stopBroadcast(); // End the transaction
    }
}
