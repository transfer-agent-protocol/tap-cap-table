// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "forge-std/console.sol";

import "../src/CapTable.sol";

contract CapTableTest is Test {
    CapTable public capTable;

    function setUp() public {
        capTable = new CapTable("123-123-123", "Test Issuer");
    }

    /* Helpers */
    function convertStringToHash(string memory _str) public pure returns (bytes32) {
        bytes32 hash = keccak256(abi.encodePacked(_str));
        return hash;
    }

    function createPranksterAndExpectRevert() public {
        address prankster = address(0);
        vm.prank(prankster);
        vm.expectRevert();
    }

    function createInitialDummyStockClassData() public pure returns (string memory, string memory, uint256, uint256, uint256) {
        string memory expectedId = "1234-1234-1234";
        string memory expectedClassType = "Common";
        uint256 expectedPricePerShare = 100;
        uint256 expectedParValue = 1;
        uint256 expectedInitialSharesAuthorized = 10000000;

        return (expectedId, expectedClassType, expectedPricePerShare, expectedParValue, expectedInitialSharesAuthorized);
    }

    /* Stakeholder Tests */
    // function testCreateStakeholderWithOwner() public {
    //     bytes16  expectedId = bytes16("0xf47ac10b58cc4372a5670e02b2c3d479");
    //     capTable.createStakeholder(expectedId, "INDIVIDUAL", "ADVISOR");
    //     string memory actualId = capTable.getStakeholderById(expectedId);
    //     assertEq(actualId, expectedId);
    //     assertNotEq(actualId, "4444-4444-4444");
    // }

    // function testCannotCreateStakeholderWithoutOwner() public {
    //     string memory initialStakeholderId = "7777-7777-7777";
    //     capTable.createStakeholder(initialStakeholderId);

    //     // get total number of stakeholders, one should have been added
    //     uint256 totalStakeholdersBefore = capTable.getTotalNumberOfStakeholders();
    //     console.log("Total stakeholders before wrong owner tries to create one", totalStakeholdersBefore);

    //     // pass prankster address to ensure only owner can create new stakeholder
    //     createPranksterAndExpectRevert();
    //     string memory pranksterStakeholderIdToBeAdded = "9999-9999-9999";
    //     capTable.createStakeholder(pranksterStakeholderIdToBeAdded);

    //     // fetch prankster ID which should return empty string
    //     string memory pranksterId = capTable.getStakeholderById(pranksterStakeholderIdToBeAdded);

    //     // get total number of stakeholders, none should have been added
    //     uint256 totalStakeholdersAfter= capTable.getTotalNumberOfStakeholders();
    //     console.log("Total stakeholders after wrong owner", totalStakeholdersAfter);

    //     assertNotEq(pranksterStakeholderIdToBeAdded, pranksterId, "Prankster ID was added and it shouldn't have");
    //     assertEq(totalStakeholdersBefore, totalStakeholdersAfter, "Total number of stakeholders has changed and it shouldn't have");
    // }

    // function testCannotCreateDuplicateStakeholders() public {
    //     string memory stakeholderId = "1111-1111-1111-1111";
    //     capTable.createStakeholder(stakeholderId);

    //     // get total number of stakeholders, one should have been added
    //     uint256 totalStakeholdersBefore = capTable.getTotalNumberOfStakeholders();

    //     // should not add a duplicate stakeholder
    //     vm.expectRevert();
    //     capTable.createStakeholder(stakeholderId);

    //     uint256 totalStakeholdersAfter = capTable.getTotalNumberOfStakeholders();

    //     assertEq(totalStakeholdersBefore, totalStakeholdersAfter, "Total number of stakeholders has changed and it shouldn't have");
    // }

    /* Stock Class Tests */
    //  function testCreateStockClassWithOwner() public {
    //      (
    //         string memory expectedId,
    //         string memory expectedClassType,
    //         uint256 expectedPricePerShare,
    //         uint256 expectedParValue,
    //         uint256 expectedInitialSharesAuthorized
    //     ) = createInitialDummyStockClassData();

    //     capTable.createStockClass(
    //         expectedId,
    //         expectedClassType,
    //         expectedPricePerShare,
    //         expectedParValue,
    //         expectedInitialSharesAuthorized
    //     );

    //     (
    //         string memory actualId,
    //         string memory actualClassType,
    //         uint256 actualPricePerShare,
    //         uint256 actualParValue,
    //         uint256 actualInitialSharesAuthorized
    //     ) = capTable.getStockClassById(expectedId);

    //     assertEq(actualId, expectedId);
    //     assertEq(actualClassType, expectedClassType);
    //     assertEq(actualPricePerShare, expectedPricePerShare);
    //     assertEq(actualParValue, expectedParValue);
    //     assertEq(
    //         actualInitialSharesAuthorized,
    //         expectedInitialSharesAuthorized
    //     );
    //     assertNotEq(actualId, "444-444-444", "Stock Class ID should not match");
    //     assertNotEq(actualClassType, "Preferred", "Stock Class Type should not match");
    //     assertNotEq(actualPricePerShare, 200, "Stock Class Price Per Share should not match");
    //     assertNotEq(actualParValue, 2, "Stock Class Par Value should not match");
    //     assertNotEq(actualInitialSharesAuthorized, 20000000, "Stock Class Initial Shares Authorized should not match");
    // }

    // function testCannotCreateStockClassWithoutOwner() public {
    //     (
    //         string memory expectedId,
    //         string memory expectedClassType,
    //         uint256 expectedPricePerShare,
    //         uint256 expectedParValue,
    //         uint256 expectedInitialSharesAuthorized
    //     ) = createInitialDummyStockClassData();

    //     capTable.createStockClass(
    //         expectedId,
    //         expectedClassType,
    //         expectedPricePerShare,
    //         expectedParValue,
    //         expectedInitialSharesAuthorized
    //     );

    //     // get total number of stock classes before creating one with wrong owner
    //     uint256 totalStockClassesBefore = capTable.getTotalNumberOfStockClasses();

    //     // create a prankster to change owner address and try to create a new stock class
    //     createPranksterAndExpectRevert();
    //     string memory pranksterStockClassId = "6666-6666-6666";
    //     capTable.createStockClass(
    //         pranksterStockClassId,
    //         "Common",
    //         100,
    //         1,
    //         10
    //     );

    //     // get total number of stock classes after creating one with wrong owner
    //     uint256 totalStockClassesAfter = capTable.getTotalNumberOfStockClasses();

    //     // fetch prankster stock class to ensure it was not created
    //     (string memory id, ,,,) = capTable.getStockClassById(pranksterStockClassId);

    //     assertNotEq(id, pranksterStockClassId, "Prankster stock class was created and it shouldn't have");
    //     assertEq(totalStockClassesBefore, totalStockClassesAfter, "Total number of stock classes has changed and it shouldn't have");
    // }

    // function testCannotCreateDuplicateStockClasses() public {
    //     (
    //         string memory expectedId,
    //         string memory expectedClassType,
    //         uint256 expectedPricePerShare,
    //         uint256 expectedParValue,
    //         uint256 expectedInitialSharesAuthorized
    //     ) = createInitialDummyStockClassData();

    //     capTable.createStockClass(
    //         expectedId,
    //         expectedClassType,
    //         expectedPricePerShare,
    //         expectedParValue,
    //         expectedInitialSharesAuthorized
    //     );

    //     // get total number of stock classes before creating one with wrong owner
    //     uint256 totalStockClassesBefore = capTable.getTotalNumberOfStockClasses();

    //     // should not add a duplicate stock class
    //     vm.expectRevert();
    //     capTable.createStockClass(
    //         expectedId,
    //         expectedClassType,
    //         expectedPricePerShare,
    //         expectedParValue,
    //         expectedInitialSharesAuthorized
    //     );

    //     // get total number of stock classes after creating one with wrong owner
    //     uint256 totalStockClassesAfter = capTable.getTotalNumberOfStockClasses();

    //     assertEq(totalStockClassesBefore, totalStockClassesAfter, "Total number of stock classes has changed and it shouldn't have");
    // }
}
