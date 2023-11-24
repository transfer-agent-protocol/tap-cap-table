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

contract StockIssuanceTest is CapTableTest {
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

    function createDummyStockIssuance() private returns (StockIssuance memory) {
        (bytes16 stockClassId, bytes16 stakeholderId) = _createStockClassAndStakeholder(100000);
        StockIssuanceParams memory params = StockIssuanceParams({
            stock_class_id: stockClassId,
            stock_plan_id: 0x00000000000000000000000000000000,
            share_numbers_issued: ShareNumbersIssued(0, 0),
            share_price: 10000000000,
            quantity: 1000,
            vesting_terms_id: 0x00000000000000000000000000000000,
            cost_basis: 5000000000,
            stock_legend_ids: new bytes16[](0),
            issuance_type: "RSA",
            comments: new string[](0),
            custom_id: "R2-D2",
            stakeholder_id: stakeholderId,
            board_approval_date: "2023-01-01",
            stockholder_approval_date: "2023-01-02",
            consideration_text: "For services rendered",
            security_law_exemptions: new string[](0)
        });
        return StockIssuance({
            id: 0x00000000000000000000000000000000,
            object_type: "TX_STOCK_ISSUANCE",
            security_id: 0x00000000000000000000000000000000,
            params: params
        });
    }

    function testIssuingStock() public {
        StockIssuance memory expectedIssuance = createDummyStockIssuance();
        capTable.issueStock(expectedIssuance.params);

        uint256 lastTransactionIndex = capTable.getTransactionsCount() - 1;
        bytes memory lastTransaction = capTable.transactions(lastTransactionIndex);
        StockIssuance memory accutalIssuance = abi.decode(lastTransaction, (StockIssuance));

        // Compare the expected and actual issuance through deterministic encoding
        assertEq(keccak256(abi.encode(accutalIssuance.params)), keccak256(abi.encode(expectedIssuance.params)));
        assertEq(expectedIssuance.object_type, accutalIssuance.object_type);
    }

    function testIssuingExcessiveStockAgainstIssuerAuthorizedShares() public {
        uint256 stockClassIntialSharesAuthorized = issuerInitialSharesAuthorized -  100;
        (bytes16 stockClassId, bytes16 stakeholderId) =
            _createStockClassAndStakeholder(stockClassIntialSharesAuthorized);
        uint256 excessiveQuantity = 10000000000001; // More than the Issuer authorized amount
        StockIssuanceParams memory params = StockIssuanceParams({
            stock_class_id: stockClassId,
            stock_plan_id: 0x00000000000000000000000000000000,
            share_numbers_issued: ShareNumbersIssued(0, 0),
            share_price: 10000000000,
            quantity: excessiveQuantity,
            vesting_terms_id: 0x00000000000000000000000000000000,
            cost_basis: 5000000000,
            stock_legend_ids: new bytes16[](0),
            issuance_type: "RSA",
            comments: new string[](0),
            custom_id: "R2-D2",
            stakeholder_id: stakeholderId,
            board_approval_date: "2023-01-01",
            stockholder_approval_date: "2023-01-02",
            consideration_text: "For services rendered",
            security_law_exemptions: new string[](0)
        });

        vm.expectRevert("Issuer: Insufficient shares authorized");
        capTable.issueStock(params);
    }

    function testIssuingExcessiveStockAgainstAuthorizedShares() public {
        uint256 stockClassAuthorizedShares = 1000;
        (bytes16 stockClassId, bytes16 stakeholderId) = _createStockClassAndStakeholder(stockClassAuthorizedShares);
        uint256 excessiveQuantity = stockClassAuthorizedShares  + 1; // More than the authorized amount
        StockIssuanceParams memory params = StockIssuanceParams({
            stock_class_id: stockClassId,
            stock_plan_id: 0x00000000000000000000000000000000,
            share_numbers_issued: ShareNumbersIssued(0, 0),
            share_price: 10000000000,
            quantity: excessiveQuantity,
            vesting_terms_id: 0x00000000000000000000000000000000,
            cost_basis: 5000000000,
            stock_legend_ids: new bytes16[](0),
            issuance_type: "RSA",
            comments: new string[](0),
            custom_id: "R2-D2",
            stakeholder_id: stakeholderId,
            board_approval_date: "2023-01-01",
            stockholder_approval_date: "2023-01-02",
            consideration_text: "For services rendered",
            security_law_exemptions: new string[](0)
        });

        vm.expectRevert("StockClass: Insufficient shares authorized");
        capTable.issueStock(params);
    }
}
