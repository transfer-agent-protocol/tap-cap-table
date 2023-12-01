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

contract StockTransferTest is CapTableTest {
    function testTransferStock() public {
        // Create stakeholders
        bytes16 transferorStakeholderId = 0xd3373e0a4dd940000000000000000006;
        bytes16 transfereeStakeholderId = 0xd3373e0a4dd940000000000000000007;
        capTable.createStakeholder(transferorStakeholderId, "INDIVIDUAL", "EMPLOYEE");
        capTable.createStakeholder(transfereeStakeholderId, "INDIVIDUAL", "EMPLOYEE");

        // Create stock class
        bytes16 stockClassId = 0xd3373e0a4dd940000000000000000008;
        capTable.createStockClass(stockClassId, "Common", 100, 1000000);

        // Create stock issuance
        StockIssuanceParams memory issuanceParams1 = StockIssuanceParams({
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
            stakeholder_id: transferorStakeholderId,
            board_approval_date: "2023-01-01",
            stockholder_approval_date: "2023-01-02",
            consideration_text: "For services rendered",
            security_law_exemptions: new string[](0)
        });
        capTable.issueStock(issuanceParams1);

        StockIssuanceParams memory issuanceParams2 = StockIssuanceParams({
            stock_class_id: stockClassId,
            stock_plan_id: 0x00000000000000000000000000000000,
            share_numbers_issued: ShareNumbersIssued(0, 0),
            share_price: 100,
            quantity: 2000,
            vesting_terms_id: 0x00000000000000000000000000000000,
            cost_basis: 50,
            stock_legend_ids: new bytes16[](0),
            issuance_type: "RSA",
            comments: new string[](0),
            custom_id: "R2-D2",
            stakeholder_id: transferorStakeholderId,
            board_approval_date: "2023-01-01",
            stockholder_approval_date: "2023-01-02",
            consideration_text: "For services rendered",
            security_law_exemptions: new string[](0)
        });
        capTable.issueStock(issuanceParams2);

        // Transfer stock
        uint256 quantityToTransfer = 2500;
        capTable.transferStock(
            transferorStakeholderId,
            transfereeStakeholderId,
            stockClassId,
            true,
            quantityToTransfer,
            issuanceParams1.share_price
        );

        /*
            Transactions Array:
                 1. Delete 1000 position from sh1
                 2. issue 1000 to sh2
                 3. create tx transfer (quantity = 1000)
                 4. delete 2000 position from sh 1
                 5. issue 500 position to sh1
                 6. issue 1500 to position sh1
                 7. create tx transfer (quantity = 1500)
        */
        uint256 transactionsCount = capTable.getTransactionsCount();
        bytes memory lastIssuanceTx = capTable.transactions(transactionsCount - 2);
        bytes memory firstTransferTx = capTable.transactions(transactionsCount - 4);
        bytes memory secondTransferTx = capTable.transactions(transactionsCount - 1);

        StockTransfer memory firstTransfer = abi.decode(firstTransferTx, (StockTransfer));
        bytes16 remainingIssuanceSecurityId = abi.decode(lastIssuanceTx, (StockIssuance)).security_id;
        StockTransfer memory secondTransfer = abi.decode(secondTransferTx, (StockTransfer));

        assertEq(firstTransfer.quantity, 1000);
        assertEq(secondTransfer.quantity, 1500);
        assertEq(secondTransfer.balance_security_id, remainingIssuanceSecurityId);
    }
}
