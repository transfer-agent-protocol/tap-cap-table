// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.30;

import { CapTableTest } from "./CapTable.t.sol";

contract StakeholderTest is CapTableTest {
    function testCreateStakeholder() public {
        bytes16 stakeholderId = 0xf47ac10b58cc4372a5670e02b2c3d479;
        capTable.createStakeholder(stakeholderId, "INDIVIDUAL", "ADVISOR");
        (bytes16 actualId, , ) = capTable.getStakeholderById(stakeholderId);
        assertEq(actualId, stakeholderId);
    }

    function testCreateNotAdminReverts() public {
        bytes16 stakeholderId = 0xf47ac10b58cc4372a5670e02b2c3d479;
        createPranksterAndExpectRevert();
        capTable.createStakeholder(stakeholderId, "INDIVIDUAL", "ADVISOR");
    }

    function testCreateDuplicateStakeholderReverts() public {
        bytes16 stakeholderId = 0xf47ac10b58cc4372a5670e02b2c3d479;
        capTable.createStakeholder(stakeholderId, "INDIVIDUAL", "ADVISOR");

        // Since custom error passes ID, need to encode it to bytes
        bytes memory expectedError = abi.encodeWithSignature("StakeholderAlreadyExists(bytes16)", stakeholderId);

        vm.expectRevert(expectedError);
        capTable.createStakeholder(stakeholderId, "INDIVIDUAL", "ADVISOR");
    }

    function testGetTotalNumberOfStakeholders() public {
        bytes16 firstStakeholderId = 0x123456789abcdef0123456789abcdef1;
        bytes16 secondStakeholderId = 0xfedcba9876543210fedcba9876543210;
        capTable.createStakeholder(firstStakeholderId, "INDIVIDUAL", "INVESTOR");
        capTable.createStakeholder(secondStakeholderId, "ENTITY", "BOARD_MEMBER");
        uint256 totalStakeholders = capTable.getTotalNumberOfStakeholders();
        assertEq(totalStakeholders, 2);
    }
}
