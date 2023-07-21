// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../src/CapTable.sol";

contract CapTableTest is Test {
    CapTable public capTable;

    function setUp() public {
        capTable = new CapTable("123-123-123", "Test Issuer", "10000000");
    }

    function testUpdateLegalName() public {
        capTable.updateLegalName("Test Issuer Updated");
        (, string memory legalName, ) = capTable.getIssuer();
        assertEq(legalName, "Test Issuer Updated", "Test Issuer has been updated successfuly");
        assertNotEq(legalName, "Poet Network Inc.", "Test Issuer has not been updated successfuly");

    }

    function testCreateStakeholder() public {
        string memory expectedId = "123-123-123";
        capTable.createStakeholder(expectedId);
        string memory actualId = capTable.getStakeholder(expectedId);
        assertEq(actualId, expectedId, "Stakeholder ID should match and it doesn't");
        assertNotEq(actualId, "444-444-444", "Stakeholder ID should not match");
    }
}