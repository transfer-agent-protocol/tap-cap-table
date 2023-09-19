// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/CapTable.sol";

contract CapTableTest is Test {
    CapTable public capTable;
    address ISSUER_ADDR = address(0xd33);
    bytes16 ISSUER_USER = 0xd3373e0a4dd9430f8a563281f2800e1e;
    string ISSUER_NAME = "Winston, Inc.";

    function setUp() public {
        bytes16 issuerId = ;
        capTable = new CapTable(ISSUER_USER, ISSUER_NAME);
    }

    function createPranksterAndExpectRevert() public {
        address prankster = address(0);
        vm.prank(prankster);
        vm.expectRevert();
    }
}
