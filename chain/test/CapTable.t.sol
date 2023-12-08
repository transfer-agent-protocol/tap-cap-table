// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/CapTable.sol";
import { StockIssuanceParams } from "../src/lib/Structs.sol";

contract CapTableTest is Test {
    CapTable public capTable;
    uint256 public issuerInitialSharesAuthorized = 1000000;
    bytes16 issuerId = 0xd3373e0a4dd9430f8a563281f2800e1e;

    function setUp() public {
        capTable = new CapTable(issuerId, "Winston, Inc.", issuerInitialSharesAuthorized);
    }

    // HELPERS //

    function createPranksterAndExpectRevert() public {
        address prankster = address(0);
        vm.prank(prankster);
        vm.expectRevert("Does not have admin role");
    }

    function createStockClassAndStakeholder(uint256 stockClassInitialSharesAuthorized) public returns (bytes16, bytes16) {
        bytes16 stakeholderId = 0xd3373e0a4dd940000000000000000005;
        capTable.createStakeholder(stakeholderId, "INDIVIDUAL", "EMPLOYEE");

        bytes16 stockClassId = 0xd3373e0a4dd940000000000000000000;
        capTable.createStockClass(stockClassId, "COMMON", 100, stockClassInitialSharesAuthorized);

        return (stockClassId, stakeholderId);
    }

    function issueStock(bytes16 stockClassId, bytes16 stakeholderId, uint256 quantity) public {
        // Issue stock
        StockIssuanceParams memory issuanceParams = StockIssuanceParams({
            stock_class_id: stockClassId,
            stock_plan_id: 0x00000000000000000000000000000000,
            share_numbers_issued: ShareNumbersIssued(0, 0),
            share_price: 100,
            quantity: quantity,
            vesting_terms_id: 0x00000000000000000000000000000000,
            cost_basis: 50,
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
    }
}
