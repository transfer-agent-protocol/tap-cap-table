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
    StockIssuance,
    StockTransfer,
    StockParams
} from "../src/lib/Structs.sol";

contract StockRetractionTest is CapTableTest {
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

    function testStockRetraction() public {
        // Create stock class and stakeholder
        (bytes16 stockClassId, bytes16 stakeholderId) = _createStockClassAndStakeholder(1000000);

        // Retract stock
        StockParams memory retractionParams = StockParams({
            stakeholder_id: stakeholderId,
            stock_class_id: stockClassId,
            security_id: bytes16(0), // Assuming no specific security ID is needed for this test
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
    }
}
