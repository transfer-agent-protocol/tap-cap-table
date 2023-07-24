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

    // not using test_ keyword
    function testUpdateLegalName() public {
        capTable.updateLegalName("Apple Inc.");
        (, string memory legalName, ) = capTable.getIssuer();
        console.log("Legal name in test function ", legalName);
        assertEq(legalName, "Apple Inc.", "Test Issuer has been updated successfuly");
        assertNotEq(legalName, "Poet Network Inc.", "Test Issuer has not been updated successfuly");

    }

    // using test_ keyword
    function test_UpdateLegalName() public {
        capTable.updateLegalName("Microsoft Inc.");
        (, string memory legalName, ) = capTable.getIssuer();
        console.log("Legal name in test_ function ", legalName);
        assertEq(legalName, "Microsoft Inc.", "Test Issuer has been updated successfuly");
        assertNotEq(legalName, "Poet Network Inc.", "Test Issuer has not been updated successfuly");
    }

    // using test_ keyword
    function updateLegalName() public {
        capTable.updateLegalName("Ceranium Inc.");
        (, string memory legalName, ) = capTable.getIssuer();
        console.log("Legal name in test_ function ", legalName);
        assertEq(legalName, "Ceranium Inc.", "Test Issuer has been updated successfuly");
        assertNotEq(legalName, "Poet Network Inc.", "Test Issuer has not been updated successfuly");
    }

    // // using testFail_ keyword
    // function test_UpdateLegalNameToEmptyString() public {
    //     capTable.updateLegalName("");
    //     (, string memory legalName, ) = capTable.getIssuer();

    // }

    //  // using testFail_ keyword
    // function testFail_UpdateLegalNameToEmptyString() public {
    //     capTable.updateLegalName("");
    //     (, string memory legalName, ) = capTable.getIssuer();
    // }

    function testCreateStakeholder() public {
        string memory expectedId = "123-123-123";
        capTable.createStakeholder(expectedId);
        string memory actualId = capTable.getStakeholderById(expectedId);
        assertEq(actualId, expectedId, "Stakeholder ID should match and it doesn't");
        assertNotEq(actualId, "444-444-444", "Stakeholder ID should not match");
    }

    function testCreateStockClass() public {
        string memory expectedId = "123-123-123";
        string memory expectedClassType = "Common";
        uint256 expectedPricePerShare = 100;
        uint256 expectedParValue = 1;
        uint256 expectedInitialSharesAuthorized = 10000000;
        capTable.createStockClass(
            expectedId,
            expectedClassType,
            expectedPricePerShare,
            expectedParValue,
            expectedInitialSharesAuthorized
        );

        (
            string memory actualId,
            string memory actualClassType,
            uint256 actualPricePerShare,
            uint256 actualParValue,
            uint256 actualInitialSharesAuthorized
        ) = capTable.getStockClassById(expectedId);
        
        assertEq(actualId, expectedId, "Stock Class ID should match and it doesn't");
        assertEq(actualClassType, expectedClassType, "Stock Class Type should match and it doesn't");
        assertEq(actualPricePerShare, expectedPricePerShare, "Stock Class Price Per Share should match and it doesn't");
        assertEq(actualParValue, expectedParValue, "Stock Class Par Value should match and it doesn't");
        assertEq(
            actualInitialSharesAuthorized,
            expectedInitialSharesAuthorized,
            "Stock Class Initial Shares Authorized should match and it doesn't"
        );
        assertNotEq(actualId, "444-444-444", "Stock Class ID should not match");
        assertNotEq(actualClassType, "Preferred", "Stock Class Type should not match");
        assertNotEq(actualPricePerShare, 200, "Stock Class Price Per Share should not match");
        assertNotEq(actualParValue, 2, "Stock Class Par Value should not match");
        assertNotEq(actualInitialSharesAuthorized, 20000000, "Stock Class Initial Shares Authorized should not match");
    }
}
