// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.30;

import { Test } from "forge-std/Test.sol";
import { CapTableFactory } from "../src/CapTableFactory.sol";
import { CapTable } from "../src/CapTable.sol";

contract CapTableFactoryTest is Test {
    CapTableFactory private _capTableFactory;
    CapTable private _capTableImplementation;

    function setUp() public {
        // Deploy empty implementation
        _capTableImplementation = new CapTable();

        _capTableFactory = new CapTableFactory(address(_capTableImplementation));
    }

    function testRevertsInvalidImplementationAddress() public {
        vm.expectRevert("Invalid implementation address");
        _capTableFactory = new CapTableFactory(address(0));
    }

    function testCreateCapTable() public {
        bytes16 issuerId = 0xd3373e0a4dd9430f8a563281f2800e1e;
        string memory issuerName = "Winston, Inc.";
        uint256 issuerInitialSharesAuthorized = 1000000;

        address capTableProxy = _capTableFactory.createCapTable(issuerId, issuerName, issuerInitialSharesAuthorized, address(0));

        // Assert the cap table was created
        CapTable capTable = CapTable(capTableProxy);

        (bytes16 id, string memory name, uint256 shares_issued, uint256 initial_shares_authorized) = capTable.issuer();

        assertEq(id, issuerId);
        assertEq(name, issuerName);
        assertEq(shares_issued, 0);
        assertEq(initial_shares_authorized, issuerInitialSharesAuthorized);

        // Verify by creating a stakeholder
        bytes16 stakeholderId = 0xd3373e0a4dd940000000000000000010;
        string memory stakeholderType = "INDIVIDUAL";
        string memory stakeholderRelationship = "INVESTOR";

        capTable.createStakeholder(stakeholderId, stakeholderType, stakeholderRelationship);

        (bytes16 actualStakeolderId, string memory actualStakeholderType, string memory actualStakeholderRelationship) = capTable.getStakeholderById(
            stakeholderId
        );

        assertEq(actualStakeolderId, stakeholderId);
        assertEq(actualStakeholderType, stakeholderType);
        assertEq(actualStakeholderRelationship, stakeholderRelationship);

        // Testing that only operator/admin can create stakeholder
        vm.prank(address(1));
        vm.expectRevert("Does not have operator role");
        capTable.createStakeholder(0xd3373e0a4dd940000000000000000005, "INDIVIDUAL", "EMPLOYEE");
    }

    function testNonOwnerCanCreateCapTable() public {
        address nonOwner = address(0xBEEF);
        bytes16 issuerId = 0xd3373e0a4dd9430f8a563281f2800aaa;
        string memory issuerName = "NonOwner Corp";
        uint256 shares = 500000;

        vm.prank(nonOwner);
        address capTableProxy = _capTableFactory.createCapTable(issuerId, issuerName, shares, address(0));

        // Assert the cap table was created
        assertTrue(capTableProxy != address(0));
        CapTable capTable = CapTable(capTableProxy);
        (bytes16 id, , , ) = capTable.issuer();
        assertEq(id, issuerId);
    }

    function testNonOwnerIsCapTableAdmin() public {
        address nonOwner = address(0xBEEF);
        bytes16 issuerId = 0xd3373e0a4dd9430f8a563281f2800bbb;

        vm.prank(nonOwner);
        address capTableProxy = _capTableFactory.createCapTable(issuerId, "Admin Test Corp", 500000, address(0));

        CapTable capTable = CapTable(capTableProxy);

        // Verify non-owner has ADMIN_ROLE
        assertTrue(capTable.hasRole(capTable.ADMIN_ROLE(), nonOwner));

        // Verify non-owner can grant OPERATOR_ROLE
        address operator = address(0xCAFE);
        vm.prank(nonOwner);
        capTable.addOperator(operator);
        assertTrue(capTable.hasRole(capTable.OPERATOR_ROLE(), operator));
    }

    function testNonOwnerCanManageTheirCapTable() public {
        address nonOwner = address(0xBEEF);
        bytes16 issuerId = 0xd3373e0a4dd9430f8a563281f2800ccc;

        vm.prank(nonOwner);
        address capTableProxy = _capTableFactory.createCapTable(issuerId, "Managed Corp", 500000, address(0));

        CapTable capTable = CapTable(capTableProxy);

        // Non-owner can create stakeholders (admin function)
        bytes16 stakeholderId = 0xd3373e0a4dd940000000000000000020;
        vm.prank(nonOwner);
        capTable.createStakeholder(stakeholderId, "INDIVIDUAL", "FOUNDER");

        (bytes16 actualId, , ) = capTable.getStakeholderById(stakeholderId);
        assertEq(actualId, stakeholderId);

        // Non-owner can create stock classes (admin function)
        bytes16 stockClassId = 0xd3373e0a4dd940000000000000000030;
        vm.prank(nonOwner);
        capTable.createStockClass(stockClassId, "COMMON", 100, 500000);

        (bytes16 actualClassId, , , , ) = capTable.getStockClassById(stockClassId);
        assertEq(actualClassId, stockClassId);
    }

    function testNonOwnerCannotManageOthersCapTable() public {
        address userA = address(0xBEEF);
        address userB = address(0xDEAD);

        // User A creates a cap table
        vm.prank(userA);
        address capTableProxy = _capTableFactory.createCapTable(
            0xd3373e0a4dd9430f8a563281f2800ddd, "UserA Corp", 500000, address(0)
        );

        CapTable capTable = CapTable(capTableProxy);

        // User B cannot create stakeholders on User A's cap table
        vm.prank(userB);
        vm.expectRevert("Does not have operator role");
        capTable.createStakeholder(0xd3373e0a4dd940000000000000000040, "INDIVIDUAL", "EMPLOYEE");
    }

    function testUpdateImplementationStillOnlyOwner() public {
        address nonOwner = address(0xBEEF);
        CapTable newImpl = new CapTable();

        vm.prank(nonOwner);
        vm.expectRevert(abi.encodeWithSignature("OwnableUnauthorizedAccount(address)", nonOwner));
        _capTableFactory.updateCapTableImplementation(address(newImpl));
    }

    function testMultipleUsersCreateIndependentCapTables() public {
        address userA = address(0xBEEF);
        address userB = address(0xDEAD);

        vm.prank(userA);
        address proxyA = _capTableFactory.createCapTable(
            0xd3373e0a4dd9430f8a563281f2800eee, "Alpha Inc.", 1000000, address(0)
        );

        vm.prank(userB);
        address proxyB = _capTableFactory.createCapTable(
            0xd3373e0a4dd9430f8a563281f2800fff, "Beta Inc.", 2000000, address(0)
        );

        CapTable capTableA = CapTable(proxyA);
        CapTable capTableB = CapTable(proxyB);

        // Each user is admin of their own cap table
        assertTrue(capTableA.hasRole(capTableA.ADMIN_ROLE(), userA));
        assertTrue(capTableB.hasRole(capTableB.ADMIN_ROLE(), userB));

        // Neither is admin of the other's
        assertFalse(capTableA.hasRole(capTableA.ADMIN_ROLE(), userB));
        assertFalse(capTableB.hasRole(capTableB.ADMIN_ROLE(), userA));

        // Factory tracks both
        assertEq(_capTableFactory.getCapTableCount(), 2);
    }

    function testUpdateCapTableImplementation() public {
        // Create cap table prior to upgrade
        bytes16 issuerId0 = 0xd3373e0a4dd9430f8a563281f2800333;
        string memory issuerName0 = "Alpha, Inc.";
        uint256 issuerInitialSharesAuthorized0 = 1000000;

        address capTableProxy0 = _capTableFactory.createCapTable(issuerId0, issuerName0, issuerInitialSharesAuthorized0, address(0));

        // Assert the cap table was created
        CapTable capTable0 = CapTable(capTableProxy0);

        // Deploy new implementation
        CapTable newCapTableImplementation = new CapTable();

        // Update implementation
        _capTableFactory.updateCapTableImplementation(address(newCapTableImplementation));

        // Assert the implementation was updated
        assertEq(address(_capTableFactory.capTableImplementation()), address(newCapTableImplementation));
        assertEq(address(_capTableFactory.capTableBeacon().implementation()), address(newCapTableImplementation));

        // Create a cap table
        bytes16 issuerId = 0xd3373e0a4dd9430f8a563281f2800e1e;
        string memory issuerName = "Winston, Inc.";
        uint256 issuerInitialSharesAuthorized = 1000000;

        address capTableProxy = _capTableFactory.createCapTable(issuerId, issuerName, issuerInitialSharesAuthorized, address(0));

        // Assert the cap table was created
        CapTable capTable = CapTable(capTableProxy);

        (bytes16 id, string memory name, uint256 shares_issued, uint256 initial_shares_authorized) = capTable.issuer();

        assertEq(id, issuerId);
        assertEq(name, issuerName);
        assertEq(shares_issued, 0);
        assertEq(initial_shares_authorized, issuerInitialSharesAuthorized);

        // make sure previous cap table still works
        bytes16 stakeholderId = 0xd3373e0a4dd940000000000000000010;

        capTable0.createStakeholder(stakeholderId, "INDIVIDUAL", "INVESTOR");

        (bytes16 actualStakeolderId, string memory actualStakeholderType, string memory actualStakeholderRelationship) = capTable0.getStakeholderById(
            stakeholderId
        );

        assertEq(actualStakeolderId, stakeholderId);
        assertEq(actualStakeholderType, "INDIVIDUAL");
        assertEq(actualStakeholderRelationship, "INVESTOR");
    }

    // --- Operator role tests ---

    function testOperatorGrantedDuringCreation() public {
        address issuer = address(0xBEEF);
        address operator = address(0xCAFE);

        vm.prank(issuer);
        address proxy = _capTableFactory.createCapTable(
            0xd3373e0a4dd9430f8a563281f2800a01, "Operator Corp", 500000, operator
        );

        CapTable capTable = CapTable(proxy);

        // Issuer is ADMIN
        assertTrue(capTable.hasRole(capTable.ADMIN_ROLE(), issuer));
        // Operator has OPERATOR_ROLE
        assertTrue(capTable.hasRole(capTable.OPERATOR_ROLE(), operator));
        // Operator is NOT admin
        assertFalse(capTable.hasRole(capTable.ADMIN_ROLE(), operator));
    }

    function testOperatorCanPerformOperations() public {
        address issuer = address(0xBEEF);
        address operator = address(0xCAFE);

        vm.prank(issuer);
        address proxy = _capTableFactory.createCapTable(
            0xd3373e0a4dd9430f8a563281f2800a02, "Op Test Corp", 500000, operator
        );

        CapTable capTable = CapTable(proxy);

        // Admin creates a stakeholder first (required for addWalletToStakeholder)
        bytes16 stakeholderId = 0xd3373e0a4dd940000000000000000099;
        vm.prank(issuer);
        capTable.createStakeholder(stakeholderId, "INDIVIDUAL", "EMPLOYEE");

        // Operator can call onlyOperator function (addWalletToStakeholder)
        vm.prank(operator);
        capTable.addWalletToStakeholder(stakeholderId, address(0x1234));

        assertEq(capTable.walletsPerStakeholder(address(0x1234)), stakeholderId);
    }

    function testOperatorCanPerformOperationalActions() public {
        address issuer = address(0xBEEF);
        address operator = address(0xCAFE);

        vm.prank(issuer);
        address proxy = _capTableFactory.createCapTable(
            0xd3373e0a4dd9430f8a563281f2800a03, "Operator Ops Corp", 500000, operator
        );

        CapTable capTable = CapTable(proxy);

        // Operator CAN create stakeholders (onlyOperator)
        vm.prank(operator);
        capTable.createStakeholder(0xd3373e0a4dd940000000000000000088, "INDIVIDUAL", "EMPLOYEE");
        (bytes16 actualId, , ) = capTable.getStakeholderById(0xd3373e0a4dd940000000000000000088);
        assertEq(actualId, bytes16(0xd3373e0a4dd940000000000000000088));

        // Operator CAN create stock classes (onlyOperator)
        vm.prank(operator);
        capTable.createStockClass(0xd3373e0a4dd940000000000000000077, "COMMON", 100, 250000);
        (bytes16 classId, , , , ) = capTable.getStockClassById(0xd3373e0a4dd940000000000000000077);
        assertEq(classId, bytes16(0xd3373e0a4dd940000000000000000077));

        // Operator CANNOT call onlyAdmin functions (role management)
        vm.prank(operator);
        vm.expectRevert("Does not have admin role");
        capTable.addAdmin(address(0xDEAD));

        vm.prank(operator);
        vm.expectRevert("Does not have admin role");
        capTable.removeOperator(operator);
    }

    function testZeroAddressOperatorSkipsGrant() public {
        address issuer = address(0xBEEF);

        vm.prank(issuer);
        address proxy = _capTableFactory.createCapTable(
            0xd3373e0a4dd9430f8a563281f2800a04, "No Operator Corp", 500000, address(0)
        );

        CapTable capTable = CapTable(proxy);

        // Issuer is ADMIN
        assertTrue(capTable.hasRole(capTable.ADMIN_ROLE(), issuer));
        // address(0) should NOT have OPERATOR_ROLE
        assertFalse(capTable.hasRole(capTable.OPERATOR_ROLE(), address(0)));
    }
}
