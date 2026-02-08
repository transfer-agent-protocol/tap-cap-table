// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.30;

import { CapTableTest } from "./CapTable.t.sol";

contract StockClassTest is CapTableTest {
    function createInitialDummyStockClassData() public pure returns (bytes16, string memory, uint256, uint256, uint256) {
        bytes16 expectedId = 0xd3373e0a4dd9430f8a563281f2454545;
        string memory expectedClassType = "Common";
        uint256 expectedPricePerShare = 10000000000; // $1.00 with 10 decimals
        uint256 expectedInitialSharesAuthorized = 100000000000000000; // 10,000,000
        uint256 expectedSharesIssued = 0;
        return (expectedId, expectedClassType, expectedPricePerShare, expectedInitialSharesAuthorized, expectedSharesIssued);
    }

    function testCreateStockClass() public {
        (
            bytes16 expectedId,
            string memory expectedClassType,
            uint256 expectedPricePerShare,
            uint256 expectedInitialSharesAuthorized,
            uint256 expectedSharesIssued
        ) = createInitialDummyStockClassData();
        capTable.createStockClass(expectedId, expectedClassType, expectedPricePerShare, expectedInitialSharesAuthorized);
        (
            bytes16 actualId,
            string memory actualClassType,
            uint256 actualPricePerShare,
            uint256 actualSharesIssued,
            uint256 actualInitialSharesAuthorized
        ) = capTable.getStockClassById(expectedId);
        assertEq(actualId, expectedId);
        assertEq(actualClassType, expectedClassType);
        assertEq(actualPricePerShare, expectedPricePerShare);
        assertEq(actualInitialSharesAuthorized, expectedInitialSharesAuthorized);
        assertEq(actualSharesIssued, expectedSharesIssued);
    }

    function testCreateNotAdminReverts() public {
        createPranksterAndExpectRevert();

        (
            bytes16 expectedId,
            string memory expectedClassType,
            uint256 expectedPricePerShare,
            uint256 expectedInitialSharesAuthorized,

        ) = createInitialDummyStockClassData();
        capTable.createStockClass(expectedId, expectedClassType, expectedPricePerShare, expectedInitialSharesAuthorized);
    }

    function testCreateDuplicateStockClassReverts() public {
        (
            bytes16 expectedId,
            string memory expectedClassType,
            uint256 expectedPricePerShare,
            uint256 expectedInitialSharesAuthorized,

        ) = createInitialDummyStockClassData();
        capTable.createStockClass(expectedId, expectedClassType, expectedPricePerShare, expectedInitialSharesAuthorized);

        bytes memory expectedError = abi.encodeWithSignature("StockClassAlreadyExists(bytes16)", expectedId);
        vm.expectRevert(expectedError);

        capTable.createStockClass(expectedId, expectedClassType, expectedPricePerShare, expectedInitialSharesAuthorized);
    }

    function testGetTotalNumberOfStockClasses() public {
        bytes16[5] memory stockClassIds = [
            bytes16(0x11111111111111111111111111111111),
            bytes16(0x22222222222222222222222222222222),
            bytes16(0x33333333333333333333333333333333),
            bytes16(0x44444444444444444444444444444444),
            bytes16(0x55555555555555555555555555555555)
        ];
        for (uint256 i = 0; i < stockClassIds.length; i++) {
            capTable.createStockClass(stockClassIds[i], "Common", 10000000000, issuerInitialSharesAuthorized - 1);
        }
        uint256 totalStockClasses = capTable.getTotalNumberOfStockClasses();
        assertEq(totalStockClasses, 5);
    }
}
