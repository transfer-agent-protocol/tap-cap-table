// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CapTable.t.sol";

contract StockClassTests is CapTableTest {
    // function createInitialDummyStockClassData() public pure returns (bytes16, string memory, uint256, uint256) {
    //     bytes16 expectedId = 0xd3373e0a4dd9430f8a563281f2454545;
    //     string memory expectedClassType = "Common";
    //     uint256 expectedPricePerShare = 10000000000; // $1.00 with 10 decimals
    //     uint256 expectedInitialSharesAuthorized = 100000000000000000; // 10,000,000
    //     return (expectedId, expectedClassType, expectedPricePerShare, expectedInitialSharesAuthorized);
    // }
    // function testCreateStockClassWithOwner() public {
    //     (
    //         bytes16 expectedId,
    //         string memory expectedClassType,
    //         uint256 expectedPricePerShare,
    //         uint256 expectedInitialSharesAuthorized
    //     ) = createInitialDummyStockClassData();
    //     capTable.createStockClass(expectedId, expectedClassType, expectedPricePerShare, expectedInitialSharesAuthorized);
    //     (bytes16 actualId, string memory actualClassType, uint256 actualPricePerShare, uint256 actualInitialSharesAuthorized) = capTable
    //         .getStockClassById(expectedId);
    //     assertEq(actualId, expectedId);
    //     assertEq(actualClassType, expectedClassType);
    //     assertEq(actualPricePerShare, expectedPricePerShare);
    //     assertEq(actualInitialSharesAuthorized, expectedInitialSharesAuthorized);
    // }
}
