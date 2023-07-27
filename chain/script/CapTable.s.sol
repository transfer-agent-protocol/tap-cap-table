// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../src/CapTable.sol";

contract CapTableScript is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80;
        vm.startBroadcast(deployerPrivateKey);

        CapTable capTable = new CapTable("1212-1212-1212", "Poetic Justice", "10000000");

        vm.stopBroadcast();
    }
}
