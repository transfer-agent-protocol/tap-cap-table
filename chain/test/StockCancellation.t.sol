// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/console.sol";

import "./CapTable.t.sol";
import { InitialShares, IssuerInitialShares, StockClassInitialShares, Issuer, StockClass, StockIssuanceParams, ShareNumbersIssued, StockIssuance, StockTransfer, StockParams } from "../src/lib/Structs.sol";

contract StockCancellationTest is CapTableTest {
    function testFullStockCancellation() public {
        (bytes16 stockClassId, bytes16 stakeholderId) = createStockClassAndStakeholder(1000000);

        issueStock(stockClassId, stakeholderId);

        // Cancel stock
        uint256 lastTransactionIndex = capTable.getTransactionsCount() - 1;
        bytes memory lastTransaction = capTable.transactions(lastTransactionIndex);
        StockIssuance memory lastIssuance = abi.decode(lastTransaction, (StockIssuance));
        capTable.cancelStock(
            StockParams({
                stakeholder_id: stakeholderId,
                stock_class_id: stockClassId,
                security_id: lastIssuance.security_id,
                reason_text: "The issued party failed to meet their obligations",
                comments: new string[](0)
            }),
            lastIssuance.params.quantity
        );

        // Assert last transaction is of type cancellation
        lastTransactionIndex = capTable.getTransactionsCount() - 1;
        lastTransaction = capTable.transactions(lastTransactionIndex);
        StockCancellation memory lastCancellation = abi.decode(lastTransaction, (StockCancellation));
        assertEq(lastCancellation.object_type, "TX_STOCK_CANCELLATION");
        assertEq(lastCancellation.quantity, lastIssuance.params.quantity);
    }

    function testPartialStockCancellation() public {
        // Create stock class and stakeholder
        (bytes16 stockClassId, bytes16 stakeholderId) = createStockClassAndStakeholder(1000000);

        issueStock(stockClassId, stakeholderId);

        // Cancel part of the stock
        uint256 lastTransactionIndex = capTable.getTransactionsCount() - 1;
        bytes memory lastTransaction = capTable.transactions(lastTransactionIndex);
        StockIssuance memory lastIssuance = abi.decode(lastTransaction, (StockIssuance));
        uint256 partialCancellationQuantity = 500; // Cancel only part of the stock
        capTable.cancelStock(
            StockParams({
                stakeholder_id: stakeholderId,
                stock_class_id: stockClassId,
                security_id: lastIssuance.security_id,
                reason_text: "Partial cancellation",
                comments: new string[](0)
            }),
            partialCancellationQuantity
        );

        // Assert last transaction is of type issuance with the remaining amount
        uint256 secondLastTransactionIndex = capTable.getTransactionsCount() - 2;
        bytes memory secondLastTransaction = capTable.transactions(secondLastTransactionIndex);
        StockIssuance memory secondLastIssuance = abi.decode(secondLastTransaction, (StockIssuance));
        assertEq(secondLastIssuance.object_type, "TX_STOCK_ISSUANCE");
        assertEq(secondLastIssuance.params.quantity, lastIssuance.params.quantity - partialCancellationQuantity);

        // Assert last transaction is of type cancellation
        lastTransactionIndex = capTable.getTransactionsCount() - 1;
        lastTransaction = capTable.transactions(lastTransactionIndex);
        StockCancellation memory lastCancellation = abi.decode(lastTransaction, (StockCancellation));
        assertEq(lastCancellation.object_type, "TX_STOCK_CANCELLATION");
        assertEq(lastCancellation.quantity, partialCancellationQuantity);
    }
}
