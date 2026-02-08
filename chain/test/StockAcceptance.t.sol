// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.30;

import { CapTableTest } from "./CapTable.t.sol";
import { StockIssuance, StockAcceptance } from "../src/lib/Structs.sol";

contract StockAcceptanceTest is CapTableTest {
    function testStockAcceptance() public {
        // Create stock class and stakeholder
        (bytes16 stockClassId, bytes16 stakeholderId) = createStockClassAndStakeholder(1000000);

        // using helper found in CapTable.t.sol
        issueStock(stockClassId, stakeholderId, 1000);

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
