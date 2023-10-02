// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CapTable.t.sol";

contract IssuerTests is CapTableTest {
    function testIssuerInitialization() public {
        (bytes16 id, string memory legal_name, uint256 shares_issued, uint256 shares_authorized) = capTable.issuer();
        bytes16 expectedId = 0xd3373e0a4dd9430f8a563281f2800e1e;
        assertEq(id, expectedId);
        assertEq(legal_name, "Winston, Inc.");
    }
}
