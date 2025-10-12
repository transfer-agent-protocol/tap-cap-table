// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { CapTableTest } from "./CapTable.t.sol";
import { StockIssuanceParams, ShareNumbersIssued, StockIssuance } from "../src/lib/Structs.sol";

contract StockIssuanceTest is CapTableTest {
    function createDummyStockIssuance(bytes16 stockClassId, bytes16 stakeholderId, uint256 quantity) private pure returns (StockIssuance memory) {
        StockIssuanceParams memory params = StockIssuanceParams({
            stock_class_id: stockClassId,
            stock_plan_id: 0x00000000000000000000000000000000,
            share_numbers_issued: ShareNumbersIssued(0, 0),
            share_price: 10000000000,
            quantity: quantity,
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
        return
            StockIssuance({
                id: 0x00000000000000000000000000000000,
                object_type: "TX_STOCK_ISSUANCE",
                security_id: 0x00000000000000000000000000000000,
                params: params
            });
    }

    function testIssueStock() public {
        (bytes16 stockClassId, bytes16 stakeholderId) = createStockClassAndStakeholder(100000);
        StockIssuance memory expectedIssuance = createDummyStockIssuance(stockClassId, stakeholderId, 1000);

        capTable.issueStock(expectedIssuance.params);

        uint256 lastTransactionIndex = capTable.getTransactionsCount() - 1;
        bytes memory lastTransaction = capTable.transactions(lastTransactionIndex);
        StockIssuance memory actualIssuance = abi.decode(lastTransaction, (StockIssuance));

        (, , uint256 issuerSharesIssued, ) = capTable.issuer();
        (, , , uint256 actualSharesIssuedStockClass, ) = capTable.getStockClassById(stockClassId);

        // Compare the expected and actual issuance through deterministic encoding
        assertEq(keccak256(abi.encode(actualIssuance.params)), keccak256(abi.encode(expectedIssuance.params)));
        assertEq(expectedIssuance.object_type, actualIssuance.object_type);
        // assert shares_issued for issuer and stock class
        assertEq(expectedIssuance.params.quantity, issuerSharesIssued);
        assertEq(expectedIssuance.params.quantity, actualSharesIssuedStockClass);
    }

    function testInvalidQuantityReverts() public {
        (bytes16 stockClassId, bytes16 stakeholderId) = createStockClassAndStakeholder(100000);
        uint256 quantity = 0;
        StockIssuance memory expectedIssuance = createDummyStockIssuance(stockClassId, stakeholderId, quantity);

        bytes memory expectedError = abi.encodeWithSignature(
            "InvalidQuantityOrPrice(uint256,uint256)",
            quantity,
            expectedIssuance.params.share_price
        );
        vm.expectRevert(expectedError);
        capTable.issueStock(expectedIssuance.params);
    }

    function testIssuingExcessiveStockAgainstIssuerAuthorizedShares() public {
        uint256 stockClassIntialSharesAuthorized = issuerInitialSharesAuthorized - 100;
        (bytes16 stockClassId, bytes16 stakeholderId) = createStockClassAndStakeholder(stockClassIntialSharesAuthorized);
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
        (bytes16 stockClassId, bytes16 stakeholderId) = createStockClassAndStakeholder(stockClassAuthorizedShares);
        uint256 excessiveQuantity = stockClassAuthorizedShares + 1; // More than the authorized amount
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
