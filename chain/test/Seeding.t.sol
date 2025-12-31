// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { CapTableTest } from "./CapTable.t.sol";
import { InitialShares, IssuerInitialShares, StockClassInitialShares } from "../src/lib/Structs.sol";

contract SeedingTest is CapTableTest {
    function createInitialDummyStockClassData() private pure returns (bytes16, string memory, uint256, uint256) {
        bytes16 id = 0xd3373e0a4dd9430f8a563281f2454545;
        string memory classType = "Common";
        uint256 pricePerShare = 10000000000; // $1.00 with 10 decimals
        uint256 initialSharesAuthorized = 100000000000000000; // 10,000,000
        return (id, classType, pricePerShare, initialSharesAuthorized);
    }

    function testValidSeedingOfShares() public {
        (bytes16 stockClassId, string memory classType, uint256 pricePerShare, uint256 initialSharesAuthorized) = createInitialDummyStockClassData();
        capTable.createStockClass(stockClassId, classType, pricePerShare, initialSharesAuthorized);

        uint256 expectedIssuerSharesAuthorized = 1000000000000000000; // 100M
        uint256 expectedIssuerSharesIssued = 350000000000000000; // 35M
        uint256 expectedStockClassSharesAuthorized = 1000000000000000000; // 100M
        uint256 expectedStockClassSharesIssued = 350000000000000000; // 35M

        StockClassInitialShares[] memory stockClassInitialShares = new StockClassInitialShares[](1);
        stockClassInitialShares[0] = StockClassInitialShares({
            id: stockClassId,
            shares_authorized: expectedStockClassSharesAuthorized,
            shares_issued: expectedStockClassSharesIssued
        });

        InitialShares memory params = InitialShares({
            issuerInitialShares: IssuerInitialShares({
                shares_authorized: expectedIssuerSharesAuthorized,
                shares_issued: expectedIssuerSharesIssued
            }),
            stockClassesInitialShares: stockClassInitialShares
        });

        capTable.seedSharesAuthorizedAndIssued(params);

        (, , uint256 actualIssuerSharesIssued, uint256 actualIssuerSharesAuthorized) = capTable.issuer();
        (, , , uint256 scSharesIssued, uint256 scSharesAuthorized) = capTable.getStockClassById(stockClassId);

        assertEq(actualIssuerSharesAuthorized, expectedIssuerSharesAuthorized);
        assertEq(actualIssuerSharesIssued, expectedIssuerSharesIssued);
        assertEq(scSharesAuthorized, expectedStockClassSharesAuthorized);
        assertEq(scSharesIssued, expectedStockClassSharesIssued);
    }

    function testSeedingWithInvalidParameters() public {
        // Attempt to seed with zero shares authorized and issued
        InitialShares memory params = InitialShares({
            issuerInitialShares: IssuerInitialShares({ shares_authorized: 0, shares_issued: 0 }),
            stockClassesInitialShares: new StockClassInitialShares[](0)
        });

        vm.expectRevert("Invalid Seeding Shares Params");
        capTable.seedSharesAuthorizedAndIssued(params);
    }

    function testSeedMultipleActivePositionsAndSecurityIds() public {
        bytes16[] memory stakeholderIds = new bytes16[](5);
        bytes16[] memory securityIds = new bytes16[](5);
        bytes16[] memory stockClassIds = new bytes16[](5);
        uint256[] memory quantities = new uint256[](5);
        uint256[] memory sharePrices = new uint256[](5);
        uint40[] memory timestamps = new uint40[](5);

        for (uint256 i = 0; i < 5; i++) {
            // Generate unique identifiers for stock classes and stakeholders
            bytes16 stockClassId = bytes16(keccak256(abi.encodePacked("STOCKCLASS", i)));
            bytes16 stakeholderId = bytes16(keccak256(abi.encodePacked("STAKEHOLDER", i)));
            bytes16 securityId = bytes16(keccak256(abi.encodePacked("SECURITY", i)));

            // Create stock classes and stakeholders
            capTable.createStockClass(stockClassId, "Common", 10000000000, 100000000000000000);
            capTable.createStakeholder(stakeholderId, "INDIVIDUAL", "INVESTOR");

            stakeholderIds[i] = stakeholderId;
            securityIds[i] = securityId; // Dummy security IDs
            stockClassIds[i] = stockClassId;
            quantities[i] = 1000; // Dummy quantities
            sharePrices[i] = 10000000000; // Dummy share prices
            // Safe: block.timestamp fits in uint40 until year ~36,835 (1099511627775 seconds from epoch)
            // forge-lint: disable-next-line(unsafe-typecast)
            timestamps[i] = uint40(block.timestamp + i); // Dummy timestamps
        }

        capTable.seedMultipleActivePositionsAndSecurityIds(stakeholderIds, securityIds, stockClassIds, quantities, sharePrices, timestamps);

        uint256 transactionCount = capTable.getTotalActiveSecuritiesCount();
        assertEq(transactionCount, 5);
    }

    function testSeedingWithMismatchedArrayLengths() public {
        bytes16[] memory stakeholderIds = new bytes16[](1);
        bytes16[] memory securityIds = new bytes16[](2); // Mismatched length
        bytes16[] memory stockClassIds = new bytes16[](1);
        uint256[] memory quantities = new uint256[](1);
        uint256[] memory sharePrices = new uint256[](1);
        uint40[] memory timestamps = new uint40[](1);

        vm.expectRevert("Input arrays must have the same length");
        capTable.seedMultipleActivePositionsAndSecurityIds(stakeholderIds, securityIds, stockClassIds, quantities, sharePrices, timestamps);
    }

    function testSeedingWithNonExistentStakeholdersOrStockClasses() public {
        bytes16[] memory stakeholderIds = new bytes16[](1);
        bytes16[] memory securityIds = new bytes16[](1);
        bytes16[] memory stockClassIds = new bytes16[](1);
        uint256[] memory quantities = new uint256[](1);
        uint256[] memory sharePrices = new uint256[](1);
        uint40[] memory timestamps = new uint40[](1);

        stakeholderIds[0] = 0x12345678901234567890123456789012; // Non-existent stakeholder
        securityIds[0] = 0x12345678901234567890123456789012;
        stockClassIds[0] = 0x12345678901234567890123456789012; // Non-existent stock class
        quantities[0] = 1000;
        sharePrices[0] = 10000000000;
        // Safe: block.timestamp fits in uint40 until year ~36,835 (1099511627775 seconds from epoch)
        // forge-lint: disable-next-line(unsafe-typecast)
        timestamps[0] = uint40(block.timestamp);

        bytes memory expectedError = abi.encodeWithSignature("NoStakeholder(bytes16)", stakeholderIds[0]);
        vm.expectRevert(expectedError);

        capTable.seedMultipleActivePositionsAndSecurityIds(stakeholderIds, securityIds, stockClassIds, quantities, sharePrices, timestamps);
    }
}
