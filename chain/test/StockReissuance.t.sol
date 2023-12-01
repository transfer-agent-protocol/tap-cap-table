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
    StockParams,
    StockReissuance
} from "../src/lib/Structs.sol";

contract StockReissuanceTest is CapTableTest {
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

    function testStockReissuance() public {
        // Create stock class and stakeholder
        (bytes16 stockClassId, bytes16 stakeholderId) = _createStockClassAndStakeholder(1000000);

        uint256 issuanceQuantity = 1000;

        // Issue stock
        StockIssuanceParams memory issuanceParams = StockIssuanceParams({
            stock_class_id: stockClassId,
            stock_plan_id: 0x00000000000000000000000000000000,
            share_numbers_issued: ShareNumbersIssued(0, 0),
            share_price: 10000000000,
            quantity: issuanceQuantity,
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
        capTable.issueStock(issuanceParams);

        // Assert last transaction is of type issuance with the remaining amount
        bytes memory issuanceTx = capTable.transactions(capTable.getTransactionsCount() - 1);
        StockIssuance memory issuance = abi.decode(issuanceTx, (StockIssuance));

        (, , uint256 issuerSharesIssuedBefore, ) = capTable.issuer();
        assertEq(issuerSharesIssuedBefore, issuanceQuantity);

        // Perform reissuance
        bytes16[] memory resulting_security_ids = new bytes16[](1);
        resulting_security_ids[0] = 0x00000000000000000000000000000001; // Dummy value for resulting_security_ids
        capTable.reissueStock(
            StockParams({
                stakeholder_id: stakeholderId,
                stock_class_id: stockClassId,
                security_id: issuance.security_id, // Assuming security_id is the same as stock_class_id for this dummy test
                reason_text: "Reissuance for testing",
                comments: new string[](0)
            }),
            resulting_security_ids
        );

        // Assert last transaction is of type reissuance
        uint256 transactionsCount = capTable.getTransactionsCount();
        bytes memory lastTransaction = capTable.transactions(transactionsCount - 1);
        StockReissuance memory reissuance = abi.decode(lastTransaction, (StockReissuance));
        assertEq(reissuance.object_type, "TX_STOCK_REISSUANCE");

        // Assert that the issuer shares issued is 0 after reissuance
        (, , uint256 issuerSharesIssuedAfter, ) = capTable.issuer();
        assertEq(issuerSharesIssuedAfter, 0);
    }
}
