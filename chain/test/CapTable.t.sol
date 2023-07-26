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

    function testIssuerCreated() public {
        (string memory id, ,) = capTable.getIssuer();

        assertEq(id, "123-123-123", "Error: IDs don't match.");
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

    function testUpdateLegalNameWithOwner () public {
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
        string memory initialStakeholderId = "7777-7777-7777";
        capTable.createStakeholder(initialStakeholderId);

        // get total number of stakeholders, one should have been added
        uint256 totalStakeholdersBefore = capTable.getTotalNumberOfStakeholders();
        console.log("Total stakeholders before wrong owner tries to create one", totalStakeholdersBefore);

        // pass prankster address to ensure only owner can create new stakeholder
        createPranksterAndExpectRevert();
        string memory pranksterStakeholderIdToBeAdded = "9999-9999-9999";
        capTable.createStakeholder(pranksterStakeholderIdToBeAdded);

        // fetch prankster ID which should return empty string
        string memory pranksterId = capTable.getStakeholderById(pranksterStakeholderIdToBeAdded);

        // get total number of stakeholders, none should have been added
        uint256 totalStakeholdersAfter= capTable.getTotalNumberOfStakeholders();
        console.log("Total stakeholders after wrong owner", totalStakeholdersAfter);

        assertNotEq(pranksterStakeholderIdToBeAdded, pranksterId, "Prankster ID was added and it shouldn't have");
        assertEq(totalStakeholdersBefore, totalStakeholdersAfter, "Total number of stakeholders has changed and it shouldn't have");
    }

    function testCreateStakeholderWithOwner() public {
        string memory expectedId = "1234-1234-1234";
        capTable.createStakeholder(expectedId);
        string memory actualId = capTable.getStakeholderById(expectedId);
        assertEq(actualId, expectedId);
        assertNotEq(actualId, "4444-4444-4444");
    }

    function createInitialDummyStockClassData () public pure returns (string memory, string memory, uint256, uint256, uint256) {
        string memory expectedId = "1234-1234-1234";
        string memory expectedClassType = "Common";
        uint256 expectedPricePerShare = 100;
        uint256 expectedParValue = 1;
        uint256 expectedInitialSharesAuthorized = 10000000;

        return (expectedId, expectedClassType, expectedPricePerShare, expectedParValue, expectedInitialSharesAuthorized);
    }


    function testCannotCreateStockClassWithWrongOwner() public {
        (
            string memory expectedId,
            string memory expectedClassType,
            uint256 expectedPricePerShare,
            uint256 expectedParValue,
            uint256 expectedInitialSharesAuthorized
        ) = createInitialDummyStockClassData();

        capTable.createStockClass(
            expectedId,
            expectedClassType,
            expectedPricePerShare,
            expectedParValue,
            expectedInitialSharesAuthorized
        );

        // get total number of stock classes before creating one with wrong owner
        uint256 totalStockClassesBefore = capTable.getTotalNumberOfStockClasses();

        // create a prankster to change owner address and try to create a new stock class
        createPranksterAndExpectRevert();
        string memory pranksterStockClassId = "6666-6666-6666";
        capTable.createStockClass(
            pranksterStockClassId,
            "Common",
            100,
            1,
            10
        );

        // get total number of stock classes after creating one with wrong owner
        uint256 totalStockClassesAfter = capTable.getTotalNumberOfStockClasses();

        // fetch prankster stock class to ensure it was not created
        (string memory id, ,,,) = capTable.getStockClassById(pranksterStockClassId);

        assertNotEq(id, pranksterStockClassId, "Prankster stock class was created and it shouldn't have");
        assertEq(totalStockClassesBefore, totalStockClassesAfter, "Total number of stock classes has changed and it shouldn't have");

    }

    function testCannotCreateStockClassWithOwner() public {
         (
            string memory expectedId,
            string memory expectedClassType,
            uint256 expectedPricePerShare,
            uint256 expectedParValue,
            uint256 expectedInitialSharesAuthorized
        ) = createInitialDummyStockClassData();
        
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
        
        assertEq(actualId, expectedId);
        assertEq(actualClassType, expectedClassType);
        assertEq(actualPricePerShare, expectedPricePerShare);
        assertEq(actualParValue, expectedParValue);
        assertEq(
            actualInitialSharesAuthorized,
            expectedInitialSharesAuthorized
        );
        assertNotEq(actualId, "444-444-444", "Stock Class ID should not match");
        assertNotEq(actualClassType, "Preferred", "Stock Class Type should not match");
        assertNotEq(actualPricePerShare, 200, "Stock Class Price Per Share should not match");
        assertNotEq(actualParValue, 2, "Stock Class Par Value should not match");
        assertNotEq(actualInitialSharesAuthorized, 20000000, "Stock Class Initial Shares Authorized should not match");
    }

    function testCreateManyStakeholders() public {
        // Creating 5 stakeholders
        capTable.createStakeholder("1111-1111-1111-1111");
        capTable.createStakeholder("2222-2222-2222-2222");
        capTable.createStakeholder("3333-3333-3333-3333");
        capTable.createStakeholder("4444-4444-4444-4444");
        capTable.createStakeholder("5555-5555-5555-5555");

        // fetch total number
        uint256 totalStakeholders = capTable.getTotalNumberOfStakeholders();

        assertEq(totalStakeholders, 5, "Error: Total number is not 5");
        assertNotEq(totalStakeholders, 4, "Error: Total number is 4");
    }

    function testFakeIdForGettingStakeholder() public {
        string memory realId = "1111-1111-1111-1111";
        capTable.createStakeholder(realId);
        string memory fetchedRealId = capTable.getStakeholderById(realId);

        string memory fakeId = "9999-9999-9999-9999";
        string memory emptyId = capTable.getStakeholderById(fakeId);

        assertEq(realId, fetchedRealId, "Error: Real ID does not match fetched ID");
        assertNotEq(fakeId, emptyId, "Error: Fake ID matches empty ID");
    }


}
