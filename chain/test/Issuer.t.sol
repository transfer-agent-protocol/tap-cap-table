// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "./CapTable.t.sol";

contract IssuerTests is CapTableTest {
    function testIssuerInitialization() public {
        (bytes16 id, string memory legal_name) = capTable.issuer();
        bytes16 expectedId = 0xd3373e0a4dd9430f8a563281f2800e1e;
        assertEq(id, expectedId);
        assertEq(legal_name, "Winston, Inc.");
    }
}
