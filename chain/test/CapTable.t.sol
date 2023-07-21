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
        assertEq(legalName, "Test Issuer Updated");

    }

    function testCreateStakeholder() public {
        string memory id = "123-123-123";
        capTable.createStakeholder(id);
        string memory _id = capTable.getStakeholder(0);
        assertEq(_id, id);

    }
}
