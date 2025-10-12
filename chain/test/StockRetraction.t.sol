// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { CapTableTest } from "./CapTable.t.sol";
import { StockIssuance, StockRetraction, StockParams } from "../src/lib/Structs.sol";

contract StockRetractionTest is CapTableTest {
    function testStockRetraction() public {
        // Create stock class and stakeholder
        (bytes16 stockClassId, bytes16 stakeholderId) = createStockClassAndStakeholder(1000000);

        uint256 issuanceQuantity = 1000;
        // Issue stock
        issueStock(stockClassId, stakeholderId, issuanceQuantity);

        // repurchase last issuance
        bytes memory issuanceTx = capTable.transactions(capTable.getTransactionsCount() - 1);
        StockIssuance memory issuance = abi.decode(issuanceTx, (StockIssuance));

        // Retract stock
        StockParams memory retractionParams = StockParams({
            stakeholder_id: stakeholderId,
            stock_class_id: stockClassId,
            security_id: issuance.security_id,
            comments: new string[](0),
            reason_text: "Retraction for test"
        });
        capTable.retractStockIssuance(retractionParams);

        // Assert last transaction is of type retraction
        uint256 lastTransactionIndex = capTable.getTransactionsCount() - 1;
        bytes memory lastTransaction = capTable.transactions(lastTransactionIndex);
        StockRetraction memory lastRetraction = abi.decode(lastTransaction, (StockRetraction));

        assertEq(lastRetraction.object_type, "TX_STOCK_RETRACTION");
        assertEq(lastRetraction.reason_text, retractionParams.reason_text);

        // Assert issuer and stock class shares_issued should both be zero
        (, , uint256 issuerSharesIssued, ) = capTable.issuer();
        assertEq(issuerSharesIssued, 0);

        (, , , uint256 stockClassSharesIssued, ) = capTable.getStockClassById(stockClassId);
        assertEq(stockClassSharesIssued, 0);
    }
}
