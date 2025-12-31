// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { CapTableTest } from "./CapTable.t.sol";
import { StockIssuance, StockParams, StockRepurchase } from "../src/lib/Structs.sol";

contract StockRepurchaseTest is CapTableTest {
    function testPartialStockRepurchase() public {
        // Create stock class and stakeholder
        (bytes16 stockClassId, bytes16 stakeholderId) = createStockClassAndStakeholder(1000000);

        uint256 issuanceQuantity = 1000;
        // Issue stock
        issueStock(stockClassId, stakeholderId, issuanceQuantity);

        // repurchase last issuance
        bytes memory issuanceTx = capTable.transactions(capTable.getTransactionsCount() - 1);
        StockIssuance memory issuance = abi.decode(issuanceTx, (StockIssuance));

        // Repurchase part of the stock
        uint256 partialRepurchaseQuantity = 300;
        uint256 repurchasePrice = 2000;

        capTable.repurchaseStock(
            StockParams({
                stakeholder_id: stakeholderId,
                stock_class_id: stockClassId,
                security_id: issuance.security_id,
                reason_text: "Partial repurchase",
                comments: new string[](0)
            }),
            partialRepurchaseQuantity,
            repurchasePrice
        );

        uint256 transactionsCount = capTable.getTransactionsCount();
        bytes memory remainingIssuanceTx = capTable.transactions(transactionsCount - 2);
        StockIssuance memory remainingIssuance = abi.decode(remainingIssuanceTx, (StockIssuance));

        assertEq(remainingIssuance.params.quantity, issuanceQuantity - partialRepurchaseQuantity);
        // Assert security ID of initial issuance is not the same as remaining balance issuance
        assertNotEq(issuance.security_id, remainingIssuance.security_id);

        // Assert last transaction is of type repurchase
        bytes memory lastTransaction = capTable.transactions(transactionsCount - 1);
        StockRepurchase memory repurchase = abi.decode(lastTransaction, (StockRepurchase));

        // verify that the original issuance and new balance issuance don't collide in security_ids
        assertNotEq(repurchase.security_id, repurchase.balance_security_id);

        assertEq(repurchase.object_type, "TX_STOCK_REPURCHASE");
        assertEq(repurchase.price, repurchasePrice);
        assertEq(repurchase.quantity, partialRepurchaseQuantity);

        // Assert issuer and stock class shares_issued
        (, , uint256 issuerSharesIssued, ) = capTable.issuer();
        assertEq(issuerSharesIssued, issuanceQuantity - partialRepurchaseQuantity);

        (, , , uint256 stockClassSharesIssued, ) = capTable.getStockClassById(stockClassId);
        assertEq(stockClassSharesIssued, issuanceQuantity - partialRepurchaseQuantity);
    }

    function testFullStockRepurchase() public {
        (bytes16 stockClassId, bytes16 stakeholderId) = createStockClassAndStakeholder(1000000);

        uint256 fullRepurchaseQuantity = 1000;

        issueStock(stockClassId, stakeholderId, fullRepurchaseQuantity);

        // Assert last transaction is of type issuance with the remaining amount
        uint256 issuanceTxIdx = capTable.getTransactionsCount() - 1;
        bytes memory issuanceTx = capTable.transactions(issuanceTxIdx);
        StockIssuance memory issuance = abi.decode(issuanceTx, (StockIssuance));

        // Repurchase all of the stock
        uint256 repurchasePrice = 99;

        capTable.repurchaseStock(
            StockParams({
                stakeholder_id: stakeholderId,
                stock_class_id: stockClassId,
                security_id: issuance.security_id,
                reason_text: "Full repurchase",
                comments: new string[](0)
            }),
            fullRepurchaseQuantity,
            repurchasePrice
        );

        uint256 transactionsCount = capTable.getTransactionsCount();
        uint256 remainingIssuaneTxIndex = transactionsCount - 2;
        bytes memory remainingIssuanceTx = capTable.transactions(remainingIssuaneTxIndex);
        StockIssuance memory repurchaseIssuance = abi.decode(remainingIssuanceTx, (StockIssuance));

        assertEq(repurchaseIssuance.params.quantity, fullRepurchaseQuantity);

        uint256 lastTransactionIndex = transactionsCount - 1;
        bytes memory lastTransaction = capTable.transactions(lastTransactionIndex);
        StockRepurchase memory repurchase = abi.decode(lastTransaction, (StockRepurchase));

        assertEq(repurchase.object_type, "TX_STOCK_REPURCHASE");
        assertEq(repurchase.price, repurchasePrice);

        // Assert issuer and stock class shares_issued
        (, , uint256 issuerSharesIssued, ) = capTable.issuer();
        assertEq(issuerSharesIssued, issuance.params.quantity - repurchaseIssuance.params.quantity);
    }
}
