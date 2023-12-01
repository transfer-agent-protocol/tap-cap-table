// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/console.sol";

import "./CapTable.t.sol";
import {
    InitialShares,
    IssuerInitialShares,
    StockClassInitialShares,
    Issuer,
    StockClass,
    StockIssuanceParams,
    ShareNumbersIssued,
    StockParams
} from "../src/lib/Structs.sol";

contract StockAcceptanceTest is CapTableTest {
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

    function testStockAcceptance() public {
        // Create stock class and stakeholder
        (bytes16 stockClassId, bytes16 stakeholderId) = _createStockClassAndStakeholder(1000000);

        // Issue stock
        StockIssuanceParams memory issuanceParams = StockIssuanceParams({
            stock_class_id: stockClassId,
            stock_plan_id: 0x00000000000000000000000000000000,
            share_numbers_issued: ShareNumbersIssued(0, 0),
            share_price: 100,
            quantity: 1000,
            vesting_terms_id: 0x00000000000000000000000000000000,
            cost_basis: 50,
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

        // Accept stock
        uint256 lastTransactionIndex = capTable.getTransactionsCount() - 1;
        bytes memory lastTransaction = capTable.transactions(lastTransactionIndex);
        StockIssuance memory lastIssuance = abi.decode(lastTransaction, (StockIssuance));
        string[] memory comments = new string[](1);
        comments[0] = "Acceptance of stock";
        capTable.acceptStock(stakeholderId, stockClassId, lastIssuance.security_id, comments);

        // Assert last transaction is of type acceptance
        lastTransactionIndex = capTable.getTransactionsCount() - 1;
        lastTransaction = capTable.transactions(lastTransactionIndex);
        StockAcceptance memory lastAcceptance = abi.decode(lastTransaction, (StockAcceptance));
        assertEq(lastAcceptance.object_type, "TX_STOCK_ACCEPTANCE");
        assertEq(lastAcceptance.security_id, lastIssuance.security_id);
        assertEq(lastAcceptance.comments[0], comments[0]);
    }
}
