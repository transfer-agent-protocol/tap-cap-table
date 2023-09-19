// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "./CapTable.t.sol";

contract RolesTests is CapTableTest {
    address RANDO_ADDR = address(0xf001);
    address OPERATOR_ADDR = address(0xf002);
  
    function testIssuerInitialization() public {
        (bytes16 id, string memory legal_name) = capTable.issuer();
        assertEq(id, ISSUER_USER);
        assertEq(legal_name, "Winston, Inc.");
    }

    function testOperatorRole() public {
        // randos cant tx stock
        vm.startPrank(RANDO_USER);
        vm.expectRevert("Does not have operator role");
        capTable.transferStockOwnership(0xa, 0xb, 0x1, false, 0, 0);

        // now rando is an operator
        capTable.addOperator(RANDO_USER);
        vm.expectRevert("No ~~ transferor"); // TODO -- remove ~~ once ensure this fails
        capTable.transferStockOwnership(0xa, 0xb, 0x1, false, 0, 0);

        capTable.removeOperator(RANDO_USER);
        vm.expectRevert("Does not have operator role");
        capTable.transferStockOwnership(0xa, 0xb, 0x1, false, 0, 0);

        vm.stopPrank(); // TODO: redundant?
    }

    function testAdminRole() public {
        vm.startPrank(RANDO_USER);
        vm.expectRevert("Does not have admin role");
        capTable.addWalletToStakeholder(0x1, address(0));

        capTable.addAdmin(RANDO_USER);
        vm.expectRevert("Invalid wallet");
        capTable.addWalletToStakeholder(0x1, address(0));

        capTable.removeAdmin(RANDO_USER);
        vm.expectRevert("Does not have admin role");
        capTable.addWalletToStakeholder(0x1, address(0));

        vm.stopPrank(); // TODO: redundant?
    }

    function testAdminIsOperatorRole() public {
        vm.startPrank(ISSUER_USER);
        vm.expectRevert("No ~~ transferor"); // TODO -- remove ~~ once ensure this fails
        capTable.transferStockOwnership(0xa, 0xb, 0x1, false, 0, 0);

        vm.stopPrank(); // TODO: redundant?
    }
}
