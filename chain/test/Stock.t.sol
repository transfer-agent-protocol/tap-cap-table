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
    StockTransfer
} from "../src/lib/Structs.sol";

contract Stock is CapTableTest {
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
        uint256 stockClassIntialSharesAuthorized = 10000000000000;
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
        (bytes16 stockClassId, bytes16 stakeholderId) = _createStockClassAndStakeholder(1000000);
        uint256 excessiveQuantity = 1000001; // More than the authorized amount
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

    function _createStakeholder(bytes16 stakeholderId, string memory stakeholderType, string memory currentRelationship)
        private
    {
        capTable.createStakeholder(stakeholderId, stakeholderType, currentRelationship);
    }

    function testTransferStock() public {
        // Create stakeholders
        bytes16 transferorStakeholderId = 0xd3373e0a4dd940000000000000000006;
        bytes16 transfereeStakeholderId = 0xd3373e0a4dd940000000000000000007;
        _createStakeholder(transferorStakeholderId, "INDIVIDUAL", "EMPLOYEE");
        _createStakeholder(transfereeStakeholderId, "INDIVIDUAL", "EMPLOYEE");

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

        StockTransfer memory firstTransfer =  abi.decode(capTable.transactions(capTable.getTransactionsCount() - 4), (StockTransfer));
        bytes16 remainingIssuanceSecurityId = abi.decode(capTable.transactions(capTable.getTransactionsCount() - 2), (StockIssuance)).security_id;
        StockTransfer memory secondTransfer =  abi.decode(capTable.transactions(capTable.getTransactionsCount() - 1), (StockTransfer));

        assertEq(firstTransfer.quantity, 1000);
        assertEq(secondTransfer.quantity, 1500);
        assertEq(secondTransfer.balance_security_id, remainingIssuanceSecurityId);
    }
}
