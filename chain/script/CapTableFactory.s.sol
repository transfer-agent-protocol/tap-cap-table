// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "forge-std/console.sol";

import "../src/CapTableFactory.sol";

contract CapTableFactoryDeployLocalScript is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKeyFakeAccount = vm.envUint("PRIVATE_KEY_FAKE_ACCOUNT");

        vm.startBroadcast(deployerPrivateKeyFakeAccount);

        CapTableFactory capTableFactory = new CapTableFactory();

        vm.stopBroadcast();
    }
}

contract CapTableFactoryDeployOptimismGoerli is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKeyPoetTest = vm.envUint("PRIVATE_KEY_POET_TEST");

        vm.startBroadcast(deployerPrivateKeyPoetTest);

        CapTableFactory capTableFactory = new CapTableFactory();

        vm.stopBroadcast();
    }
}
