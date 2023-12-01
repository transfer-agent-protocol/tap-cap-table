// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CapTable.t.sol";

contract AdjustmentTests is CapTableTest {
    function testAdjustIssuerAuthorizedSharesBelowIssuedFails() public {
        // Create stock class and stakeholder
        (bytes16 stockClassId, bytes16 stakeholderId) = _createStockClassAndStakeholder(1000000);

        // Issue stock
        uint256 issuanceQuantity = 1000;
        StockIssuanceParams memory issuanceParams = StockIssuanceParams({
            stock_class_id: stockClassId,
            stock_plan_id: 0x00000000000000000000000000000000,
            share_numbers_issued: ShareNumbersIssued(0, 0),
            share_price: 10000000000,
            quantity: issuanceQuantity,
            vesting_terms_id: 0x00000000000000000000000000000000,
            cost_basis: 5000000000,
            stock_legend_ids: new bytes16[](0),
            issuance_type: "RSA",
            comments: new string[](0),
            custom_id: "R2-D2",
            stakeholder_id: stakeholderId,
            board_approval_date: "2023-01-01",
            stockholder_approval_date: "2023-01-02",
            consideration_text: "For services rendered",
            security_law_exemptions: new string[](0)
        });
        capTable.issueStock(issuanceParams);
        (,, uint256 shareIssued,) = capTable.issuer();

        // Attempt to adjust issuer authorized shares below the issued amount
        uint256 newSharesAuthorized = 500; // Less than the issued amount
        vm.expectRevert("InsufficientIssuerSharesAuthorized: shares_issued exceeds newSharesAuthorized");
        capTable.adjustIssuerAuthorizedShares(newSharesAuthorized, new string[](0), "2023-01-01", "2023-01-02");
    }

    function testAdjustStockClassAuthorizedShares() public {
        // Create stock class
        bytes16 stockClassId = 0xd3373e0a4dd940000000000000000000;
        capTable.createStockClass(stockClassId, "Common", 100, 1000000);

        // Adjust stock class authorized shares
        uint256 newStockClassSharesAuthorized = 20000;
        capTable.adjustStockClassAuthorizedShares(
            stockClassId, newStockClassSharesAuthorized, new string[](0), "2023-01-01", "2023-01-02"
        );

        // Assert that the stock class authorized shares have been updated
        (,,, uint256 sharesAuthorized,) = capTable.getStockClassById(stockClassId);
        assertEq(sharesAuthorized, newStockClassSharesAuthorized);
    }

    function testAdjustStockClassAuthorizedSharesAboveIssuerLimitFails() public {
        // Create stock class
        bytes16 stockClassId = 0xd3373e0a4dd940000000000000000000;
        capTable.createStockClass(stockClassId, "Common", 100, 1000000);

        // Attempt to adjust stock class authorized shares above the issuer limit
        uint256 newStockClassSharesAuthorized = issuerInitialSharesAuthorized +  1; // More than the issuer authorized amount
        vm.expectRevert("InsufficientStockClassSharesAuthorized: stock class authorized shares exceeds issuer shares authorized");
        capTable.adjustStockClassAuthorizedShares(
            stockClassId, newStockClassSharesAuthorized, new string[](0), "2023-01-01", "2023-01-02"
        );
    }

    function testAdjustIssuerAuthorizedShares() public {
        // Adjust issuer authorized shares
        uint256 newIssuerSharesAuthorized = 20000;
        capTable.adjustIssuerAuthorizedShares(newIssuerSharesAuthorized, new string[](0), "2023-01-01", "2023-01-02");

        // Assert that the issuer authorized shares have been updated
        (,,, uint256 sharesAuthorized) = capTable.issuer();
        assertEq(sharesAuthorized, newIssuerSharesAuthorized);
    }

    // Helper function to create stock class and stakeholder
    function _createStockClassAndStakeholder(uint256 stockClassInitialSharesAuthorized)
        private
        returns (bytes16, bytes16)
    {
        bytes16 stakeholderId = 0xd3373e0a4dd940000000000000000005;
        capTable.createStakeholder(stakeholderId, "INDIVIDUAL", "EMPLOYEE");

        bytes16 stockClassId = 0xd3373e0a4dd940000000000000000000;
        capTable.createStockClass(stockClassId, "Common", 100, stockClassInitialSharesAuthorized);

        return (stockClassId, stakeholderId);
    }
}
