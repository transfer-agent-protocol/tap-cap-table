// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CapTable.t.sol";
import {InitialShares, IssuerInitialShares, StockClassInitialShares, Issuer, StockClass} from "../src/lib/Structs.sol";

contract SeedingTests is CapTableTest {
    function _createStockClassAndStakeholder(uint256 stockClassInitialSharesAuthorized)
        private
        returns (bytes16, bytes16)
    {
        bytes16 stakeholderId = 0xd3373e0a4dd940000000000000000005;
        capTable.createStakeholder(stakeholderId, "INDIVIDUAL", "EMOLOYEE");

        bytes16 stockClassId = 0xd3373e0a4dd940000000000000000000;
        capTable.createStockClass(stockClassId, "Common", 100, stockClassInitialSharesAuthorized);

        return (stockClassId, stakeholderId);
    }

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
        expectedStockClassInitialShares[0] =
            StockClassInitialShares(stockClassId, expectedStockClassSharesAuthorized, expectedStockClassSharesIssued);

        InitialShares memory params = InitialShares(
            IssuerInitialShares(expectedIssuerSharesAuthorized, expectedIssuerSharesIssued),
            expectedStockClassInitialShares
        );

        capTable.seedSharesAuthorizedAndIssued(params);

        (,, uint256 actualIssuerSharesIssued, uint256 actualIssuerSharesAuthorized) = capTable.issuer();

        (,,, uint256 scSharesAuthorized, uint256 scSharesIssued) = capTable.getStockClassById(stockClassId);

        assertEq(actualIssuerSharesAuthorized, expectedIssuerSharesAuthorized);
        assertEq(actualIssuerSharesIssued, expectedIssuerSharesIssued);
        assertEq(scSharesAuthorized, expectedStockClassSharesAuthorized);
        assertEq(scSharesIssued, expectedStockClassSharesIssued);
    }

    function testSeedMultipleActivePositionsAndSecurityIds() public {
        bytes16[] memory stakeholderIds = new bytes16[](5);
        bytes16[] memory securityIds = new bytes16[](5);
        bytes16[] memory stockClassIds = new bytes16[](5);
        uint256[] memory quantities = new uint256[](5);
        uint256[] memory sharePrices = new uint256[](5);
        uint40[] memory timestamps = new uint40[](5);

        (
            bytes16 stockClassId,
            string memory classType,
            uint256 initialPricePerShare,
            uint256 initialInitialSharesAuthorized
        ) = createInitialDummyStockClassData();
        capTable.createStockClass(stockClassId, classType, initialPricePerShare, initialInitialSharesAuthorized);
        for (uint256 i = 0; i < 5; i++) {
            // (bytes16 stockClassId, bytes16 stakeholderId) = _createStockClassAndStakeholder(100000);
            stakeholderIds[i] = bytes16(uint128(i + 1));
            securityIds[i] = bytes16(uint128(i + 1)); // Dummy security IDs
            stockClassIds[i] = stockClassId;
            quantities[i] = 1000; // Dummy quantities
            sharePrices[i] = 10000000000; // Dummy share prices
            timestamps[i] = uint40(block.timestamp + i); // Dummy timestamps
        }
        for (uint256 i = 0; i < stakeholderIds.length; i++) {
            capTable.createStakeholder(stakeholderIds[i], "INDIVIDUAL", "INVESTOR");
        }

        capTable.seedMultipleActivePositionsAndSecurityIds(
            stakeholderIds, securityIds, stockClassIds, quantities, sharePrices, timestamps
        );

        uint256 transactionCount = capTable.getTotalActiveSecuritiesCount();
        // get active position count
        assertEq(
            transactionCount,
            5,
            "Transaction count should be 5 after seeding multiple active positions and security IDs"
        );
    }
}
