// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.30;

import { CapTableTest } from "./CapTable.t.sol";
import { InitialShares, IssuerInitialShares, StockClassInitialShares } from "../src/lib/Structs.sol";

contract MintingTest is CapTableTest {
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

        capTable.mintSharesAuthorized(params);

        (, , uint256 actualIssuerSharesIssued, uint256 actualIssuerSharesAuthorized) = capTable.issuer();
        (, , , uint256 scSharesIssued, uint256 scSharesAuthorized) = capTable.getStockClassById(stockClassId);

        assertEq(actualIssuerSharesAuthorized, expectedIssuerSharesAuthorized);
        assertEq(actualIssuerSharesIssued, expectedIssuerSharesIssued);
        assertEq(scSharesAuthorized, expectedStockClassSharesAuthorized);
        assertEq(scSharesIssued, expectedStockClassSharesIssued);
    }
    function testSeedingRejectsReplay() public {
        (bytes16 stockClassId, string memory classType, uint256 pricePerShare, uint256 initialSharesAuthorized) = createInitialDummyStockClassData();
        capTable.createStockClass(stockClassId, classType, pricePerShare, initialSharesAuthorized);

        InitialShares memory params = _initialShares(stockClassId, 1000, 500, 1000, 500);
        capTable.mintSharesAuthorized(params);

        vm.expectRevert("Shares already seeded");
        capTable.mintSharesAuthorized(params);
    }

    function testSeedingRejectsIssuedSharesAboveAuthorized() public {
        (bytes16 stockClassId, string memory classType, uint256 pricePerShare, uint256 initialSharesAuthorized) = createInitialDummyStockClassData();
        capTable.createStockClass(stockClassId, classType, pricePerShare, initialSharesAuthorized);

        InitialShares memory params = _initialShares(stockClassId, 1000, 1001, 1000, 1001);

        vm.expectRevert("Issuer shares issued exceeds authorized");
        capTable.mintSharesAuthorized(params);
    }

    function testSeedingRejectsStockClassAboveIssuerAuthorization() public {
        (bytes16 stockClassId, string memory classType, uint256 pricePerShare, uint256 initialSharesAuthorized) = createInitialDummyStockClassData();
        capTable.createStockClass(stockClassId, classType, pricePerShare, initialSharesAuthorized);

        InitialShares memory params = _initialShares(stockClassId, 1000, 500, 1001, 500);

        vm.expectRevert("Stock class shares authorized exceeds issuer");
        capTable.mintSharesAuthorized(params);
    }

    function testSeedingWithInvalidParameters() public {
        // Attempt to seed with zero shares authorized and issued
        InitialShares memory params = InitialShares({
            issuerInitialShares: IssuerInitialShares({ shares_authorized: 0, shares_issued: 0 }),
            stockClassesInitialShares: new StockClassInitialShares[](0)
        });

        vm.expectRevert("Invalid mint params");
        capTable.mintSharesAuthorized(params);
    }

    function testMintActivePositions() public {
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
        StockClassInitialShares[] memory stockClassInitialShares = new StockClassInitialShares[](5);
        for (uint256 i = 0; i < 5; i++) {
            stockClassInitialShares[i] = StockClassInitialShares({
                id: stockClassIds[i],
                shares_authorized: 100000000000000000,
                shares_issued: quantities[i]
            });
        }

        capTable.mintSharesAuthorized(
            InitialShares({
                issuerInitialShares: IssuerInitialShares({
                    shares_authorized: 100000000000000000,
                    shares_issued: 5000
                }),
                stockClassesInitialShares: stockClassInitialShares
            })
        );

        capTable.mintActivePositions(stakeholderIds, securityIds, stockClassIds, quantities, sharePrices, timestamps);

        uint256 transactionCount = capTable.getTotalActiveSecuritiesCount();
        assertEq(transactionCount, 5);

        vm.expectRevert("Seeded positions already exist");
        capTable.mintActivePositions(stakeholderIds, securityIds, stockClassIds, quantities, sharePrices, timestamps);
    }

    function testMintWithMismatchedArrayLengths() public {
        bytes16[] memory stakeholderIds = new bytes16[](1);
        bytes16[] memory securityIds = new bytes16[](2); // Mismatched length
        bytes16[] memory stockClassIds = new bytes16[](1);
        uint256[] memory quantities = new uint256[](1);
        uint256[] memory sharePrices = new uint256[](1);
        uint40[] memory timestamps = new uint40[](1);

        vm.expectRevert("Input arrays must have the same length");
        capTable.mintActivePositions(stakeholderIds, securityIds, stockClassIds, quantities, sharePrices, timestamps);
    }

    function testMintWithNonExistentStakeholdersOrStockClasses() public {
        bytes16[] memory stakeholderIds = new bytes16[](1);
        bytes16[] memory securityIds = new bytes16[](1);
        bytes16[] memory stockClassIds = new bytes16[](1);
        uint256[] memory quantities = new uint256[](1);
        uint256[] memory sharePrices = new uint256[](1);
        uint40[] memory timestamps = new uint40[](1);

        bytes16 stockClassId = 0xd3373e0a4dd9430f8a563281f2454545;
        capTable.createStockClass(stockClassId, "Common", 10000000000, 1000);
        capTable.mintSharesAuthorized(_initialShares(stockClassId, 1000, 1000, 1000, 1000));

        stakeholderIds[0] = 0x12345678901234567890123456789012; // Non-existent stakeholder
        securityIds[0] = 0x12345678901234567890123456789012;
        stockClassIds[0] = stockClassId;
        quantities[0] = 1000;
        sharePrices[0] = 10000000000;
        // Safe: block.timestamp fits in uint40 until year ~36,835 (1099511627775 seconds from epoch)
        // forge-lint: disable-next-line(unsafe-typecast)
        timestamps[0] = uint40(block.timestamp);

        bytes memory expectedError = abi.encodeWithSignature("NoStakeholder(bytes16)", stakeholderIds[0]);
        vm.expectRevert(expectedError);

        capTable.mintActivePositions(stakeholderIds, securityIds, stockClassIds, quantities, sharePrices, timestamps);
    }

    function testMintActivePositionsRejectsZeroOrDuplicateSecurityIds() public {
        (bytes16 stockClassId, bytes16 stakeholderId) = createStockClassAndStakeholder(1000);
        capTable.mintSharesAuthorized(_initialShares(stockClassId, 1000, 1000, 1000, 1000));

        bytes16[] memory stakeholderIds = new bytes16[](1);
        bytes16[] memory securityIds = new bytes16[](1);
        bytes16[] memory stockClassIds = new bytes16[](1);
        uint256[] memory quantities = new uint256[](1);
        uint256[] memory sharePrices = new uint256[](1);
        uint40[] memory timestamps = new uint40[](1);

        stakeholderIds[0] = stakeholderId;
        stockClassIds[0] = stockClassId;
        quantities[0] = 1000;
        sharePrices[0] = 100;
        timestamps[0] = uint40(block.timestamp);

        vm.expectRevert("Invalid active position");
        capTable.mintActivePositions(stakeholderIds, securityIds, stockClassIds, quantities, sharePrices, timestamps);

        bytes16 securityId = 0xd3373e0a4dd940000000000000000001;
        stakeholderIds = new bytes16[](2);
        securityIds = new bytes16[](2);
        stockClassIds = new bytes16[](2);
        quantities = new uint256[](2);
        sharePrices = new uint256[](2);
        timestamps = new uint40[](2);
        for (uint256 i = 0; i < 2; i++) {
            stakeholderIds[i] = stakeholderId;
            securityIds[i] = securityId;
            stockClassIds[i] = stockClassId;
            quantities[i] = 500;
            sharePrices[i] = 100;
            timestamps[i] = uint40(block.timestamp);
        }

        vm.expectRevert("Duplicate security id");
        capTable.mintActivePositions(stakeholderIds, securityIds, stockClassIds, quantities, sharePrices, timestamps);
    }

    function testMintActivePositionsMustMatchSeededShares() public {
        (bytes16 stockClassId, bytes16 stakeholderId) = createStockClassAndStakeholder(1000);
        capTable.mintSharesAuthorized(_initialShares(stockClassId, 1000, 1000, 1000, 1000));

        bytes16[] memory stakeholderIds = new bytes16[](1);
        bytes16[] memory securityIds = new bytes16[](1);
        bytes16[] memory stockClassIds = new bytes16[](1);
        uint256[] memory quantities = new uint256[](1);
        uint256[] memory sharePrices = new uint256[](1);
        uint40[] memory timestamps = new uint40[](1);

        stakeholderIds[0] = stakeholderId;
        securityIds[0] = 0xd3373e0a4dd940000000000000000001;
        stockClassIds[0] = stockClassId;
        quantities[0] = 999;
        sharePrices[0] = 100;
        timestamps[0] = uint40(block.timestamp);

        vm.expectRevert("Active positions do not match issuer shares issued");
        capTable.mintActivePositions(stakeholderIds, securityIds, stockClassIds, quantities, sharePrices, timestamps);
    }

    function _initialShares(
        bytes16 stockClassId,
        uint256 issuerAuthorized,
        uint256 issuerIssued,
        uint256 stockClassAuthorized,
        uint256 stockClassIssued
    ) private pure returns (InitialShares memory params) {
        StockClassInitialShares[] memory stockClassInitialShares = new StockClassInitialShares[](1);
        stockClassInitialShares[0] = StockClassInitialShares({
            id: stockClassId,
            shares_authorized: stockClassAuthorized,
            shares_issued: stockClassIssued
        });

        return
            InitialShares({
                issuerInitialShares: IssuerInitialShares({
                    shares_authorized: issuerAuthorized,
                    shares_issued: issuerIssued
                }),
                stockClassesInitialShares: stockClassInitialShares
            });
    }
}
