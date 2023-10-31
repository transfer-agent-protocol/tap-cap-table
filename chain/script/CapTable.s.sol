// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";

import "../src/CapTable.sol";
import "openzeppelin-contracts/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract CapTableDeployLocalScript is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKeyFakeAccount = vm.envUint("PRIVATE_KEY_FAKE_ACCOUNT");

        vm.startBroadcast(deployerPrivateKeyFakeAccount);

        CapTable implementation = new CapTable();
        CapTable(
            address(new ERC1967Proxy(
                address(implementation),
                abi.encodeWithSelector(
                    implementation.initialize.selector,
                    0xd3373e0a4dd9430f8a563281f2800e1e,
                    "Winston, Inc.",
                    10000000
                )
            ))
        );

        vm.stopBroadcast();
    }
}

contract CapTableDeployOptimismGoerli is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKeyPoetTest = vm.envUint("PRIVATE_KEY_POET_TEST");

        vm.startBroadcast(deployerPrivateKeyPoetTest);
        
        CapTable implementation = new CapTable();
        CapTable(
            address(new ERC1967Proxy(
                address(implementation),
                abi.encodeWithSelector(
                    implementation.initialize.selector,
                    0xd3373e0a4dd9430f8a563281f2800e1e,
                    "Winston, Inc.",
                    10000000
                )
            ))
        );

        vm.stopBroadcast();
    }
}
