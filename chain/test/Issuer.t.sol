// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "forge-std/Test.sol";
import "../src/Issuer.sol";

contract IssuerTest is Test {
    CapTableIssuer public issuer;

    function setUp() public {
        issuer = new CapTableIssuer("123-123-123", "Test Issuer", "10000000");
    }

    function testUpdateLegalName() public {
        issuer.updateLegalName("Test Issuer Updated");
        (, string memory legalName, ) = issuer.getIssuer();
        assertEq(legalName, "Test Issuer Updated");
    }
}
