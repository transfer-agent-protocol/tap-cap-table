// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/CapTable.sol";
import "openzeppelin-contracts/contracts/proxy/ERC1967/ERC1967Proxy.sol";

contract CapTableTest is Test {
    CapTable public capTable;

    function setUp() public {
        bytes16 issuerId = 0xd3373e0a4dd9430f8a563281f2800e1e;
        CapTable implementation = new CapTable();
        capTable = CapTable(
            address(
                new ERC1967Proxy(
                address(implementation),
                abi.encodeWithSelector(
                    implementation.initialize.selector,
                    issuerId,
                    "Winston, Inc.",
                    10000000
                )
                )
            )
        );
    }

    function createPranksterAndExpectRevert() public {
        address prankster = address(0);
        vm.prank(prankster);
        vm.expectRevert();
    }
}
