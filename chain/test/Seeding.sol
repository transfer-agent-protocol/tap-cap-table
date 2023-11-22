// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CapTable.t.sol";
import { InitialShares, IssuerInitialShares, StockClassInitialShares, Issuer, StockClass } from "../src/lib/Structs.sol";

contract StockClassTests is CapTableTest {
    function createInitialDummyStockClassData() public pure returns (bytes16, string memory, uint256, uint256) {
        bytes16 id = 0xd3373e0a4dd9430f8a563281f2454545;
        string memory classType = "Common";
        uint256 pricePerShare = 10000000000; // $1.00 with 10 decimals
        uint256 initialSharesAuthorized = 100000000000000000; // 10,000,000
        return (id, classType, pricePerShare, initialSharesAuthorized);
    }

    function testSeedingAuthorizedAndIssuedShares() public {
        (
            bytes16 stockClassId,
            string memory classType,
            uint256 initialPricePerShare,
            uint256 initialInitialSharesAuthorized
        ) = createInitialDummyStockClassData();
        capTable.createStockClass(stockClassId, classType, initialPricePerShare, initialInitialSharesAuthorized);
        // stock class
        uint256 expectedStockClassSharesAuthorized = 1000000000000000000; // 100M
        uint256 expectedStockClassSharesIssued = 350000000000000000; // 35M

        // issuer
        uint256 expectedIssuerSharesAuthorized = 1000000000000000000; // 100M
        uint256 expectedIssuerSharesIssued = 350000000000000000; // 35M

        StockClassInitialShares[] memory expectedStockClassInitialShares = new StockClassInitialShares[](1);
        expectedStockClassInitialShares[0] = StockClassInitialShares(
            stockClassId,
            expectedStockClassSharesAuthorized,
            expectedStockClassSharesIssued
        );

        InitialShares memory params = InitialShares(
            IssuerInitialShares(expectedIssuerSharesAuthorized, expectedIssuerSharesIssued),
            expectedStockClassInitialShares
        );

        capTable.seedSharesAuthorizedAndIssued(params);

        (, , uint256 actualIssuerSharesAuthorized, uint256 actualIssuerSharesIssued) = capTable.issuer();

        (, , , uint256 scSharesAuthorized, uint256 scSharesIssued) = capTable.getStockClassById(stockClassId);

        assertEq(actualIssuerSharesAuthorized, expectedIssuerSharesAuthorized);
        assertEq(actualIssuerSharesIssued, expectedIssuerSharesIssued);
        assertEq(scSharesAuthorized, expectedStockClassSharesAuthorized);
        assertEq(scSharesIssued, expectedStockClassSharesIssued);
    }
}
