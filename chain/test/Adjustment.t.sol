// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { CapTableTest } from "./CapTable.t.sol";

contract AdjustmentTest is CapTableTest {
    function testAdjustIssuerAuthorizedSharesBelowIssuedFails() public {
        // Create stock class and stakeholder
        (bytes16 stockClassId, bytes16 stakeholderId) = createStockClassAndStakeholder(1000000);

        // Issue stock
        uint256 issuanceQuantity = 1000;
        issueStock(stockClassId, stakeholderId, issuanceQuantity);

        // Attempt to adjust issuer authorized shares below the issued amount
        uint256 newSharesAuthorized = 500; // Less than the issued amount
        vm.expectRevert("InsufficientIssuerSharesAuthorized: shares_issued exceeds newSharesAuthorized");
        capTable.adjustIssuerAuthorizedShares(newSharesAuthorized, new string[](0), "2023-01-01", "2023-01-02");
    }

    function testAdjustIssuerAuthorizedShares() public {
        // Adjust issuer authorized shares
        uint256 newIssuerSharesAuthorized = 20000;
        capTable.adjustIssuerAuthorizedShares(newIssuerSharesAuthorized, new string[](0), "2023-01-01", "2023-01-02");

        // Assert that the issuer authorized shares have been updated
        (, , , uint256 sharesAuthorized) = capTable.issuer();
        assertEq(sharesAuthorized, newIssuerSharesAuthorized);
    }

    function testAdjustStockClassAuthorizedShares() public {
        // Create stock class
        bytes16 stockClassId = 0xd3373e0a4dd940000000000000000000;
        uint256 originalSharesAuthorized = 10000;
        capTable.createStockClass(stockClassId, "Common", 100, originalSharesAuthorized);

        // Adjust stock class authorized shares
        uint256 newStockClassSharesAuthorized = 20000;
        capTable.adjustStockClassAuthorizedShares(stockClassId, newStockClassSharesAuthorized, new string[](0), "2023-01-01", "2023-01-02");

        // Assert that the stock class authorized shares have been updated
        (, , , , uint256 sharesAuthorized) = capTable.getStockClassById(stockClassId);
        assertEq(sharesAuthorized, newStockClassSharesAuthorized);
    }

    function testAdjustStockClassAuthorizedSharesAboveIssuerLimitFails() public {
        // Create stock class
        bytes16 stockClassId = 0xd3373e0a4dd940000000000000000000;
        capTable.createStockClass(stockClassId, "Common", 100, 1000000);

        // Attempt to adjust stock class authorized shares above the issuer limit
        uint256 newStockClassSharesAuthorized = issuerInitialSharesAuthorized + 1; // More than the issuer authorized amount
        vm.expectRevert("InsufficientStockClassSharesAuthorized: stock class authorized shares exceeds issuer shares authorized");
        capTable.adjustStockClassAuthorizedShares(stockClassId, newStockClassSharesAuthorized, new string[](0), "2023-01-01", "2023-01-02");
    }
}
