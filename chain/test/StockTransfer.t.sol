// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.30;

import { CapTableTest } from "./CapTable.t.sol";
import { StockIssuance, StockTransfer, StockTransferParams } from "../src/lib/Structs.sol";

contract StockTransferTest is CapTableTest {
    function createTransferSetup() private returns (bytes16, bytes16, bytes16, uint256) {
        // Create stakeholders
        bytes16 transferorStakeholderId = 0xd3373e0a4dd940000000000000000006;
        bytes16 transfereeStakeholderId = 0xd3373e0a4dd940000000000000000007;
        capTable.createStakeholder(transferorStakeholderId, "INDIVIDUAL", "EMPLOYEE");
        capTable.createStakeholder(transfereeStakeholderId, "INDIVIDUAL", "EMPLOYEE");

        // Create stock class
        bytes16 stockClassId = 0xd3373e0a4dd940000000000000000008;
        capTable.createStockClass(stockClassId, "Common", 100, 1000000);

        uint256 firstIssuanceQty = 3000;
        uint256 secondIssuanceQty = 2000;

        // Issue twice to the same stakeholder
        issueStock(stockClassId, transferorStakeholderId, firstIssuanceQty);
        issueStock(stockClassId, transferorStakeholderId, secondIssuanceQty);

        uint256 totalIssued = firstIssuanceQty + secondIssuanceQty;

        return (transferorStakeholderId, transfereeStakeholderId, stockClassId, totalIssued);
    }

    function testTransferStockAcrossMultiplePositions() public {
        (bytes16 transferorStakeholderId, bytes16 transfereeStakeholderId, bytes16 stockClassId, uint256 totalIssued) = createTransferSetup();

        // Transfer stock
        uint256 quantityToTransfer = 3500;
        uint256 price = 25;
        StockTransferParams memory params = StockTransferParams({
            transferor_stakeholder_id: transferorStakeholderId,
            transferee_stakeholder_id: transfereeStakeholderId,
            stock_class_id: stockClassId,
            is_buyer_verified: true,
            quantity: quantityToTransfer,
            share_price: price,
            nonce: 0,
            custom_id: ""
        });
        capTable.transferStock(params);

        uint256 transactionsCount = capTable.getTransactionsCount();
        bytes memory firstTransfereeIssuanceTx = capTable.transactions(transactionsCount - 5);
        bytes memory lastIssuanceTx = capTable.transactions(transactionsCount - 2);
        bytes memory secondTransfereeIssuanceTx = capTable.transactions(transactionsCount - 3);
        bytes memory firstTransferTx = capTable.transactions(transactionsCount - 4);
        bytes memory secondTransferTx = capTable.transactions(transactionsCount - 1);
        StockIssuance memory firstTransfereeIssuance = abi.decode(firstTransfereeIssuanceTx, (StockIssuance));

        StockTransfer memory firstTransfer = abi.decode(firstTransferTx, (StockTransfer));
        bytes16 remainingIssuanceSecurityId = abi.decode(lastIssuanceTx, (StockIssuance)).security_id;
        StockIssuance memory secondTransfereeIssuance = abi.decode(secondTransfereeIssuanceTx, (StockIssuance));
        StockTransfer memory secondTransfer = abi.decode(secondTransferTx, (StockTransfer));

        assertEq(firstTransfer.quantity, 3000);
        assertEq(secondTransfer.quantity, 500);
        assertEq(secondTransfer.balance_security_id, remainingIssuanceSecurityId);
        assertNotEq(firstTransfereeIssuance.security_id, secondTransfereeIssuance.security_id);
        assertNotEq(firstTransfereeIssuance.security_id, remainingIssuanceSecurityId);
        assertNotEq(secondTransfereeIssuance.security_id, remainingIssuanceSecurityId);

        (, uint256 firstTransfereeQuantity, , ) = capTable.getActivePosition(
            transfereeStakeholderId,
            firstTransfereeIssuance.security_id
        );
        (, uint256 secondTransfereeQuantity, , ) = capTable.getActivePosition(
            transfereeStakeholderId,
            secondTransfereeIssuance.security_id
        );
        (, uint256 transferorBalanceQuantity, , ) = capTable.getActivePosition(transferorStakeholderId, remainingIssuanceSecurityId);
        (, uint256 transfereeTotalQuantity, ) = capTable.getAveragePosition(transfereeStakeholderId, stockClassId);
        (, uint256 transferorTotalQuantity, ) = capTable.getAveragePosition(transferorStakeholderId, stockClassId);

        assertEq(firstTransfereeQuantity, 3000);
        assertEq(secondTransfereeQuantity, 500);
        assertEq(transferorBalanceQuantity, 1500);
        assertEq(transfereeTotalQuantity, quantityToTransfer);
        assertEq(transferorTotalQuantity, totalIssued - quantityToTransfer);

        (, , uint256 shares_issued, ) = capTable.issuer();

        // shares issued should not have changed.
        assertEq(shares_issued, totalIssued);
    }

    function testTransferMoreThanAvailable() public {
        (bytes16 transferorStakeholderId, bytes16 transfereeStakeholderId, bytes16 stockClassId, uint256 totalIssued) = createTransferSetup();

        // Transfer stock
        uint256 quantityToTransfer = 5500;
        uint256 price = 25;

        bytes memory expectedError = abi.encodeWithSignature("InsufficientShares(uint256,uint256)", totalIssued, quantityToTransfer);
        vm.expectRevert(expectedError);
        StockTransferParams memory params = StockTransferParams({
            transferor_stakeholder_id: transferorStakeholderId,
            transferee_stakeholder_id: transfereeStakeholderId,
            stock_class_id: stockClassId,
            is_buyer_verified: true,
            quantity: quantityToTransfer,
            share_price: price,
            nonce: 0,
            custom_id: ""
        });
        capTable.transferStock(params);
    }
}
