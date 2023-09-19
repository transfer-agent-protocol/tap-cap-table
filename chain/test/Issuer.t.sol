// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CapTable.t.sol";

contract IssuerTests is CapTableTest {
    function testIssuerInitialization() public {
        (bytes16 id, string memory legal_name) = capTable.issuer();
        assertEq(id, ISSUER_USER);
        assertEq(legal_name, "Winston, Inc.");
    }
}
