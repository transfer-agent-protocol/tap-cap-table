// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "forge-std/console.sol";

import "../src/CapTable.sol";

contract CapTableTest is Test {
    CapTable public capTable;

    function setUp() public {
        capTable = new CapTable("123-123-123", "Test Issuer", "10000000");
    }

    function convertStringToHash (string memory _str) public pure returns (bytes32) {
        bytes32 hash = keccak256(abi.encodePacked(_str));
        return hash;
    }

    function createPranksterAndExpectRevert() public {
        address prankster = address(0);
        vm.prank(prankster);
        vm.expectRevert();
    } 

    function testCannotUpdateLegalNameWithWrongOwner() public {
        capTable.updateLegalName("Plato Inc.");
        
        // set a new address to test that only owner can change legal name
        createPranksterAndExpectRevert();

        // should not update legal name
        capTable.updateLegalName("Apple Inc.");

        (, string memory legalName, ) = capTable.getIssuer(); 
        assertEq(convertStringToHash(legalName), convertStringToHash("Plato Inc."), "Legal names do not match, and they should");
        assertNotEq(convertStringToHash(legalName), convertStringToHash("Apple Inc."), "Legal names match, and they shouldn't");

        console.log("Legal name is ", legalName);
    }

    function testUpdateLegalName() public {
        capTable.updateLegalName("Apple Inc.");
        (, string memory legalName, ) = capTable.getIssuer();
        console.log("Legal name ", legalName);
        assertEq(convertStringToHash(legalName), convertStringToHash("Apple Inc."), "Legal names do not match, and they should");
    }

    function testCannotUpdateLegalNameToEmptyString() public {
        vm.expectRevert();
        // legal name should not be updated
        capTable.updateLegalName("");

        (, string memory legalName, ) = capTable.getIssuer();
        console.log("legal name is ", legalName);
        assertEq(convertStringToHash(legalName), convertStringToHash("Test Issuer"), "Legal names do not match, and they should");
    }

    function testCannotCreateStakeholderWithWrongOwner() public {
        capTable.createStakeholder("7777-7777-7777");

        uint256 totalStakeholdersBefore = capTable.getTotalNumberOfStakeholders();
        console.log("Total stakeholders before wrong owner tries to create one", totalStakeholdersBefore);

        // pass prankster address to ensure only owner can create new stakeholder
        createPranksterAndExpectRevert();
        capTable.createStakeholder("9999-9999-9999");

        uint256 totalStakeholdersAfter= capTable.getTotalNumberOfStakeholders();
        console.log("Total stakeholders after wrong owner", totalStakeholdersAfter);

        assertEq(totalStakeholdersBefore, totalStakeholdersAfter, "Stakeholder was added and it shouldn't have");
    }

    // function testCreateStakeholder() public {
    //     string memory expectedId = "123-123-123";
    //     capTable.createStakeholder(expectedId);
    //     string memory actualId = capTable.getStakeholderById(expectedId);
    //     assertEq(actualId, expectedId);
    //     assertNotEq(actualId, "444-444-444");
    // }

    // function testCreateStockClass() public {
    //     string memory expectedId = "123-123-123";
    //     string memory expectedClassType = "Common";
    //     uint256 expectedPricePerShare = 100;
    //     uint256 expectedParValue = 1;
    //     uint256 expectedInitialSharesAuthorized = 10000000;
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
}
