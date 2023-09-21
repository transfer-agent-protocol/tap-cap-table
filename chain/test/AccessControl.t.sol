// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "./CapTable.t.sol";

contract RolesTests is CapTableTest {
    address RANDO_ADDR = address(0xf001);
    address OPERATOR_ADDR = address(0xf002);
  
    function testIssuerInitialization() public {
        (bytes16 id, string memory legalName) = capTable.issuer();
        assertEq(id, ISSUER_ID);
        assertEq(legalName, "Winston, Inc.");
    }

    function testOperatorRole() public {
        _attemptOperatorFunc(false, true);

        capTable.addOperator(RANDO_ADDR);
        _attemptOperatorFunc(true, true);

        capTable.removeOperator(RANDO_ADDR);
        _attemptOperatorFunc(false, true);
    }

    function testAdminRole() public {
        _attemptAdminFunc(false);

        capTable.addAdmin(RANDO_ADDR);
        _attemptAdminFunc(true);

        capTable.removeAdmin(RANDO_ADDR);
        _attemptAdminFunc(false);
    }

    function testAdminIsOperatorRole() public {
        _attemptOperatorFunc(true, false);
    }

    function _attemptOperatorFunc(bool shouldBeOperator, bool asRando) internal {
        if (shouldBeOperator) {
            vm.expectRevert("No transferor");
        } else {
            vm.expectRevert("Does not have operator role");
        }
        if (asRando) {
            vm.prank(RANDO_ADDR);
        }
        capTable.transferStock(
            0x0000000000000000000000000000000a, 
            0x0000000000000000000000000000000b,
            0x0000000000000000000000000000000c, false, 0, 0);
    }

    function _attemptAdminFunc(bool shouldBeAdmin) internal {
        if (shouldBeAdmin) {
            vm.expectRevert("Invalid wallet");
        } else {
            vm.expectRevert("Does not have admin role");
        }
        vm.prank(RANDO_ADDR);
        capTable.addWalletToStakeholder(0x0000000000000000000000000000000d, address(0));
    }
}