// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";

import "../src/CapTable.sol";

contract CapTableDeployLocalScript is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKeyFakeAccount = vm.envUint("PRIVATE_KEY_FAKE_ACCOUNT");

        vm.startBroadcast(deployerPrivateKeyFakeAccount);

        new CapTable(0xd3373e0a4dd9430f8a563281f2800e1e, "Winston Inc.");

        vm.stopBroadcast();
    }
}

contract CapTableDeployOptimismGoerli is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKeyPoetTest = vm.envUint("PRIVATE_KEY_POET_TEST");

        vm.startBroadcast(deployerPrivateKeyPoetTest);

        new CapTable(0xd3373e0a4dd9430f8a563281f2800e1e, "Winston Inc.");

        vm.stopBroadcast();
    }
}
