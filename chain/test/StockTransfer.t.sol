// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/console.sol";

import "./CapTable.t.sol";
import { InitialShares, IssuerInitialShares, StockClassInitialShares, Issuer, StockClass, StockIssuanceParams, ShareNumbersIssued, StockIssuance, StockTransfer, StockParams } from "../src/lib/Structs.sol";

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
        StockTransferParams memory params = StockTransferParams(
            transferorStakeholderId,
            transfereeStakeholderId,
            stockClassId,
            true,
            quantityToTransfer,
            price,
            0,
            ""
        );
        capTable.transferStock(params);

        uint256 transactionsCount = capTable.getTransactionsCount();
        bytes memory lastIssuanceTx = capTable.transactions(transactionsCount - 2);
        bytes memory firstTransferTx = capTable.transactions(transactionsCount - 4);
        bytes memory secondTransferTx = capTable.transactions(transactionsCount - 1);

        StockTransfer memory firstTransfer = abi.decode(firstTransferTx, (StockTransfer));
        bytes16 remainingIssuanceSecurityId = abi.decode(lastIssuanceTx, (StockIssuance)).security_id;
        StockTransfer memory secondTransfer = abi.decode(secondTransferTx, (StockTransfer));

        assertEq(firstTransfer.quantity, 3000);
        assertEq(secondTransfer.quantity, 500);
        assertEq(secondTransfer.balance_security_id, remainingIssuanceSecurityId);

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
        StockTransferParams memory params = StockTransferParams(
            transferorStakeholderId,
            transfereeStakeholderId,
            stockClassId,
            true,
            quantityToTransfer,
            price,
            0,
            ""
        );
        capTable.transferStock(params);
    }
}
