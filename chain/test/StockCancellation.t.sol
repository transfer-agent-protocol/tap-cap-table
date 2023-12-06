// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/console.sol";

import "./CapTable.t.sol";
import { InitialShares, IssuerInitialShares, StockClassInitialShares, Issuer, StockClass, StockIssuanceParams, ShareNumbersIssued, StockIssuance, StockTransfer, StockParams } from "../src/lib/Structs.sol";

contract StockCancellationTest is CapTableTest {
    function testFullStockCancellation() public {
        (bytes16 stockClassId, bytes16 stakeholderId) = createStockClassAndStakeholder(1000000);

        issueStock(stockClassId, stakeholderId, 1000);

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

    function testNoActivePositionCancellationRevert() public {
        // Create stock class and stakeholder
        (bytes16 stockClassId, bytes16 stakeholderId) = createStockClassAndStakeholder(1000000);

        issueStock(stockClassId, stakeholderId, 1000);

        uint256 partialCancellationQuantity = 500; // Cancel only part of the stock
        uint256 quantityAvailable = 0;

        // if quantity is 0, there's no ActivePosition that exists.
        bytes memory expectedError = abi.encodeWithSignature(
            "InsufficientSharesOrNoActivePosition(uint256,uint256)",
            quantityAvailable,
            partialCancellationQuantity
        );
        vm.expectRevert(expectedError);

        // cancel a stock with a security_id that doesn't exist, therefore no ActivePosition present.
        capTable.cancelStock(
            StockParams({
                stakeholder_id: stakeholderId,
                stock_class_id: stockClassId,
                security_id: bytes16("0xd3373e0a4dd86"),
                reason_text: "Partial cancellation",
                comments: new string[](0)
            }),
            partialCancellationQuantity
        );
    }

    function testCancelMoreThanAvailableRevert() public {
        // Create stock class and stakeholder
        (bytes16 stockClassId, bytes16 stakeholderId) = createStockClassAndStakeholder(1000000);

        issueStock(stockClassId, stakeholderId, 1000); // issues for 1000 shares.

        uint256 lastTransactionIndex = capTable.getTransactionsCount() - 1;
        bytes memory lastTransaction = capTable.transactions(lastTransactionIndex);
        StockIssuance memory lastIssuance = abi.decode(lastTransaction, (StockIssuance));

        uint256 quantityToCancel = 1200; // Cancel 200 more than available

        // if quantity is 0, there's no ActivePosition that exists.
        bytes memory expectedError = abi.encodeWithSignature("InsufficientSharesOrNoActivePosition(uint256,uint256)", 1000, quantityToCancel);
        vm.expectRevert(expectedError);

        capTable.cancelStock(
            StockParams({
                stakeholder_id: stakeholderId,
                stock_class_id: stockClassId,
                security_id: lastIssuance.security_id,
                reason_text: "Partial cancellation",
                comments: new string[](0)
            }),
            quantityToCancel
        );
    }

    function testPartialStockCancellation() public {
        // Create stock class and stakeholder
        (bytes16 stockClassId, bytes16 stakeholderId) = createStockClassAndStakeholder(1000000);

        issueStock(stockClassId, stakeholderId, 1000);

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
