// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { CapTableTest } from "./CapTable.t.sol";

contract IssuerTest is CapTableTest {
    function testIssuerInitialization() public {
        (bytes16 id, string memory legal_name, uint256 shares_issued, uint256 shares_authorized) = capTable.issuer();
        bytes16 expectedId = 0xd3373e0a4dd9430f8a563281f2800e1e;
        assertEq(id, expectedId);
        assertEq(legal_name, "Winston, Inc.");
        assertEq(shares_authorized, issuerInitialSharesAuthorized);
        assertEq(shares_issued, 0);
        assertNotEq(shares_issued, 1);
    }
}
