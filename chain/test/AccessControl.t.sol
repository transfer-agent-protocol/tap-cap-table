// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./CapTable.t.sol";

contract RolesTests is CapTableTest {
    address RANDO_ADDR = address(0xf001);
    address OPERATOR_ADDR = address(0xf002);

    function testIssuerInitialization() public {
        (bytes16 id, string memory legalName, , ) = capTable.issuer();
        assertEq(id, issuerId);
        assertEq(legalName, "Winston, Inc.");
    }

    function testOperatorTransfer() public {
        bytes16[] memory stakeholderIds = new bytes16[](2);

        for (uint256 i = 0; i < 2; i++) {
            bytes16 stakeholderId = bytes16(keccak256(abi.encodePacked("STAKEHOLDER", i)));
            string memory stakeholderType = "Individual";
            string memory currentRelationship = "Investor";
            capTable.createStakeholder(stakeholderId, stakeholderType, currentRelationship);
            stakeholderIds[i] = stakeholderId;
        }

        bytes16 stockClassId = bytes16(keccak256(abi.encodePacked("STOCKCLASS")));
        string memory classType = "Common";
        uint256 pricePerShare = 100; // Example value
        uint256 initialSharesAuthorized = 1000; // Example value
        capTable.createStockClass(stockClassId, classType, pricePerShare, initialSharesAuthorized);

        // add operator and change address
        capTable.addOperator(OPERATOR_ADDR);
        vm.prank(OPERATOR_ADDR);

        vm.expectRevert("No active security ids found");

        // will revert because we haven't performed an issuance, but it would have already verified operator
        // role working
        StockTransferParams memory params = StockTransferParams(
            stakeholderIds[0], // transferor
            stakeholderIds[1], // transferee
            stockClassId,
            true,
            100,
            100,
            0,
            ""
        );
        capTable.transferStock(
            params
        );
    }

    function testNotAdminReverting() public {
        vm.prank(RANDO_ADDR);

        vm.expectRevert("Does not have admin role");
        capTable.createStakeholder(bytes16("0101"), "Individual", "Investor");
    }
}
