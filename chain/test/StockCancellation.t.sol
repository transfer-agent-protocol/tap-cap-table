// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/console.sol";

import "./CapTable.t.sol";
import { InitialShares, IssuerInitialShares, StockClassInitialShares, Issuer, StockClass, StockIssuanceParams, ShareNumbersIssued, StockIssuance, StockTransfer, StockParams } from "../src/lib/Structs.sol";

contract StockCancellationTest is CapTableTest {
    function testFullStockCancellation() public {
        (bytes16 stockClassId, bytes16 stakeholderId) = createStockClassAndStakeholder(1000000);

        issueStock(stockClassId, stakeholderId, 1000);

        uint256 lastTransactionIndex = capTable.getTransactionsCount() - 1;
        bytes memory lastTransaction = capTable.transactions(lastTransactionIndex);
        StockIssuance memory lastIssuance = abi.decode(lastTransaction, (StockIssuance));

        // Cancel stock
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

        bytes16 nonExistentSecId = bytes16("0xd3373e0a4dd86");

        // Expecting the ActivePositionNotFound revert
        bytes memory expectedError = abi.encodeWithSignature("ActivePositionNotFound(bytes16,bytes16)", stakeholderId, nonExistentSecId);
        vm.expectRevert(expectedError);

        uint256 partialCancellationQuantity = 500;

        // cancel a stock with a security_id that doesn't exist, therefore no ActivePosition present.
        capTable.cancelStock(
            StockParams({
                stakeholder_id: stakeholderId,
                stock_class_id: stockClassId,
                security_id: nonExistentSecId,
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
        bytes memory expectedError = abi.encodeWithSignature("InsufficientShares(uint256,uint256)", 1000, quantityToCancel);
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
        uint256 issuanceTx = capTable.getTransactionsCount() - 1;
        bytes memory issuance = capTable.transactions(issuanceTx);
        StockIssuance memory firstIssuance = abi.decode(issuance, (StockIssuance));
        uint256 partialCancellationQuantity = 500; // Cancel only part of the stock
        capTable.cancelStock(
            StockParams({
                stakeholder_id: stakeholderId,
                stock_class_id: stockClassId,
                security_id: firstIssuance.security_id,
                reason_text: "Partial cancellation",
                comments: new string[](0)
            }),
            partialCancellationQuantity
        );

        // Assert last transaction is of type issuance with the remaining amount
        uint256 secondLastTransactionIndex = capTable.getTransactionsCount() - 2;
        bytes memory secondLastTransaction = capTable.transactions(secondLastTransactionIndex);
        StockIssuance memory secondIssuance = abi.decode(secondLastTransaction, (StockIssuance));
        assertEq(secondIssuance.object_type, "TX_STOCK_ISSUANCE");
        assertEq(secondIssuance.params.quantity, firstIssuance.params.quantity - partialCancellationQuantity);

        // Assert last transaction is of type cancellation
        uint256 lastTransactionIndex = capTable.getTransactionsCount() - 1;
        bytes memory lastTransaction = capTable.transactions(lastTransactionIndex);
        StockCancellation memory cancellation = abi.decode(lastTransaction, (StockCancellation));
        assertEq(cancellation.object_type, "TX_STOCK_CANCELLATION");
        assertEq(cancellation.quantity, partialCancellationQuantity);

        // Assert issuer and stock class shares_issued
        (, , uint256 issuerSharesIssued, ) = capTable.issuer();
        assertEq(issuerSharesIssued, firstIssuance.params.quantity - partialCancellationQuantity);

        (, , , , uint256 stockClassSharesIssued) = capTable.getStockClassById(stockClassId);
        assertEq(stockClassSharesIssued, firstIssuance.params.quantity - partialCancellationQuantity);
    }
}
