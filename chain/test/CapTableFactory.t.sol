// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "forge-std/console.sol";

import "../src/CapTableFactory.sol";

contract CapTableFactoryTest is Test {
    CapTableFactory public capTableFactory;

    function setUp() public {
        capTableFactory = new CapTableFactory();
    }

    function testCreateCapTable() public {
        CapTable capTable = capTableFactory.createCapTable("5432-5432-5432", "Jonny Nash Inc.", "1000000");

        console.log("cap table address", address(capTable));


    }

}