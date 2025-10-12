// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { CapTableTest } from "./CapTable.t.sol";
import { StockIssuance, StockParams, StockReissuance } from "../src/lib/Structs.sol";

contract StockReissuanceTest is CapTableTest {
    function testStockReissuance() public {
        (bytes16 stockClassId, bytes16 stakeholderId) = createStockClassAndStakeholder(1000000);

        uint256 issuanceQuantity = 1000;

        // First issuance to reissue as security_id
        issueStock(stockClassId, stakeholderId, issuanceQuantity);
        // Second issuance as resulting_security_id
        issueStock(stockClassId, stakeholderId, issuanceQuantity);

        // last transaction = resulting_security_id issuance
        bytes memory newIssuance = capTable.transactions(capTable.getTransactionsCount() - 1);
        StockIssuance memory issuanceReissued = abi.decode(newIssuance, (StockIssuance));

        // second to last transaction to reissue = security_id
        bytes memory issuanceToReissue = capTable.transactions(capTable.getTransactionsCount() - 2);
        StockIssuance memory issuanceToDelete = abi.decode(issuanceToReissue, (StockIssuance));

        (, , uint256 issuerSharesIssuedBefore, ) = capTable.issuer();

        uint256 totalSharesIssued = issuanceQuantity * 2;

        // ensure total issued matches.
        assertEq(issuerSharesIssuedBefore, totalSharesIssued);

        // Perform reissuance
        bytes16[] memory resulting_security_ids = new bytes16[](1);
        resulting_security_ids[0] = issuanceReissued.security_id;

        capTable.reissueStock(
            StockParams({
                stakeholder_id: stakeholderId,
                stock_class_id: stockClassId,
                security_id: issuanceToDelete.security_id,
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

        // Assert that the issuer shares issued is 1000 after reissuance, since it was 2000 initially
        (, , uint256 issuerSharesIssuedAfter, ) = capTable.issuer();
        assertEq(issuerSharesIssuedAfter, issuanceQuantity);
    }

    function testStockReissuanceNoResultingSecurityIdReverts() public {
        (bytes16 stockClassId, bytes16 stakeholderId) = createStockClassAndStakeholder(1000000);

        uint256 issuanceQuantity = 1000;

        // First issuance to reissue as security_id
        issueStock(stockClassId, stakeholderId, issuanceQuantity);

        bytes memory newIssuance = capTable.transactions(capTable.getTransactionsCount() - 1);
        StockIssuance memory issuance = abi.decode(newIssuance, (StockIssuance));

        // empty array should fail
        bytes16[] memory resulting_security_ids = new bytes16[](0);

        bytes memory expectedError = abi.encodeWithSignature("NoIssuanceFound()");
        vm.expectRevert(expectedError);

        capTable.reissueStock(
            StockParams({
                stakeholder_id: stakeholderId,
                stock_class_id: stockClassId,
                security_id: issuance.security_id,
                reason_text: "Reissuance for testing",
                comments: new string[](0)
            }),
            resulting_security_ids
        );
    }

    function testStockReissuanceNoSecurityIdReverts() public {
        (bytes16 stockClassId, bytes16 stakeholderId) = createStockClassAndStakeholder(1000000);

        uint256 issuanceQuantity = 1000;

        // First issuance to reissue as security_id
        issueStock(stockClassId, stakeholderId, issuanceQuantity);

        bytes memory newIssuance = capTable.transactions(capTable.getTransactionsCount() - 1);
        StockIssuance memory issuance = abi.decode(newIssuance, (StockIssuance));

        // empty array should fail
        bytes16[] memory resulting_security_ids = new bytes16[](1);
        resulting_security_ids[0] = issuance.security_id;

        bytes16 nonExistingSecId = 0x00000000000000000000000000000000;

        // Expecting the ActivePositionNotFound revert
        bytes memory expectedError = abi.encodeWithSignature("ActivePositionNotFound(bytes16,bytes16)", stakeholderId, nonExistingSecId);
        vm.expectRevert(expectedError);

        capTable.reissueStock(
            StockParams({
                stakeholder_id: stakeholderId,
                stock_class_id: stockClassId,
                security_id: nonExistingSecId,
                reason_text: "Reissuance for testing",
                comments: new string[](0)
            }),
            resulting_security_ids
        );

        capTable.getTransactionsCount();
    }
}
