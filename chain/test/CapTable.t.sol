// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/CapTable.sol";

contract CapTableTest is Test {
    CapTable public capTable;

    function setUp() public {
        bytes16 issuerId = 0xd3373e0a4dd9430f8a563281f2800e1e;
        capTable = new CapTable(issuerId, "Winston, Inc.");
    }

    function createPranksterAndExpectRevert() public {
        address prankster = address(0);
        vm.prank(prankster);
        vm.expectRevert();
    }
}
