// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "./CapTable.t.sol";

contract WalletTest is CapTableTest {
    function testAddWalletToStakeholder() public {
        (, bytes16 stakeholderId) = createStockClassAndStakeholder(10000000);

        address wallet = address(0x122);

        capTable.addWalletToStakeholder(stakeholderId, wallet);

        bytes16 actualStakeholderId = capTable.getStakeholderIdByWallet(wallet);

        assertEq(actualStakeholderId, stakeholderId);
    }

    function testRemoveWalletFromStakeholder() public {
        (, bytes16 stakeholderId) = createStockClassAndStakeholder(10000000);

        address wallet = address(0x122);

        capTable.addWalletToStakeholder(stakeholderId, wallet);

        bytes16 actualStakeholderId = capTable.getStakeholderIdByWallet(wallet);

        assertEq(actualStakeholderId, stakeholderId);

        capTable.removeWalletFromStakeholder(stakeholderId, wallet);

        vm.expectRevert("No stakeholder found");

        capTable.getStakeholderIdByWallet(wallet);
    }

    function testInvalidZeroWalletReverts() public {
        (, bytes16 stakeholderId) = createStockClassAndStakeholder(10000000);
        vm.expectRevert(abi.encodeWithSignature("InvalidWallet(address)", address(0)));
        capTable.addWalletToStakeholder(stakeholderId, address(0));
    }

    function testDuplicateWalletReverts() public {
        (, bytes16 stakeholderId) = createStockClassAndStakeholder(10000000);
        address wallet = address(0x122);
        capTable.addWalletToStakeholder(stakeholderId, wallet);
        vm.expectRevert(abi.encodeWithSignature("WalletAlreadyExists(address)", wallet));
        capTable.addWalletToStakeholder(stakeholderId, wallet);
    }
}
