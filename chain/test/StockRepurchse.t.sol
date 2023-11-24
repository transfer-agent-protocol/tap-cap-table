// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/console.sol";

import "./CapTable.t.sol";
import {
    StockIssuanceParams,
    ShareNumbersIssued,
    StockIssuance,
    StockParams,
    StockRepurchase
} from "../src/lib/Structs.sol";

contract StockRepurchaseTest is CapTableTest {
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

    function testPartialStockRepurchase() public {
        // Create stock class and stakeholder
        (bytes16 stockClassId, bytes16 stakeholderId) = _createStockClassAndStakeholder(1000000);

        uint256 issuanceQuantity = 1000;
        // Issue stock
        StockIssuanceParams memory params = StockIssuanceParams({
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
        capTable.issueStock(params);

        // Assert last transaction is of type issuance with the remaining amount
        bytes memory issuanceTx = capTable.transactions(capTable.getTransactionsCount() - 1);
        StockIssuance memory issuance = abi.decode(issuanceTx, (StockIssuance));

        // Repurchase part of the stock
        uint256 partialRepurchaseQuantity = 500;
        capTable.repurchaseStock(
            StockParams({
                stakeholder_id: stakeholderId,
                stock_class_id: stockClassId,
                security_id: issuance.security_id,
                reason_text: "Partial repurchase",
                comments: new string[](0)
            }),
            partialRepurchaseQuantity,
            50 // Assuming a valid price
        );

        uint256 transactionsCount = capTable.getTransactionsCount();
        bytes memory remainingIssuanceTx = capTable.transactions(transactionsCount - 2);
        StockIssuance memory remainingIssuance = abi.decode(remainingIssuanceTx, (StockIssuance));

        assertEq(remainingIssuance.params.quantity, issuanceQuantity - partialRepurchaseQuantity);

        // Assert last transaction is of type repurchase
        bytes memory lastTransaction = capTable.transactions(transactionsCount - 1);
        StockRepurchase memory repurchase = abi.decode(lastTransaction, (StockRepurchase));
        assertEq(repurchase.object_type, "TX_STOCK_REPURCHASE");
    }

    function testFullStockRepurchase() public {
        (bytes16 stockClassId, bytes16 stakeholderId) = _createStockClassAndStakeholder(1000000);

        uint256 fullRepurchaseQuantity = 1000;
        StockIssuanceParams memory params = StockIssuanceParams({
            stock_class_id: stockClassId,
            stock_plan_id: 0x00000000000000000000000000000000,
            share_numbers_issued: ShareNumbersIssued(0, 0),
            share_price: 10000000000,
            quantity: fullRepurchaseQuantity,
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

        capTable.issueStock(params);
        // Assert last transaction is of type issuance with the remaining amount
        uint256 issuanceTxIdx = capTable.getTransactionsCount() - 1;
        bytes memory issuanceTx = capTable.transactions(issuanceTxIdx);
        StockIssuance memory issuance = abi.decode(issuanceTx, (StockIssuance));
        // Repurchase all of the stock
        uint256 expectedNewPrice = 99;
        capTable.repurchaseStock(
            StockParams({
                stakeholder_id: stakeholderId,
                stock_class_id: stockClassId,
                security_id: issuance.security_id,
                reason_text: "Full repurchase",
                comments: new string[](0)
            }),
            fullRepurchaseQuantity,
            expectedNewPrice
        );

        uint256 transactionsCount = capTable.getTransactionsCount();
        uint256 remainingIssuaneTxIndex = transactionsCount - 2;
        bytes memory remainingIssuanceTx = capTable.transactions(remainingIssuaneTxIndex);
        StockIssuance memory repuchaseIssuance = abi.decode(remainingIssuanceTx, (StockIssuance));

        assertEq(repuchaseIssuance.params.quantity, fullRepurchaseQuantity);

        uint256 lastTransactionIndex = transactionsCount - 1;
        bytes memory lastTransaction = capTable.transactions(lastTransactionIndex);
        StockRepurchase memory repurchase = abi.decode(lastTransaction, (StockRepurchase));

        assertEq(repurchase.object_type, "TX_STOCK_REPURCHASE");
        assertEq(repurchase.price, expectedNewPrice);
    }
}
