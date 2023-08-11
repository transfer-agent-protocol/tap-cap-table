// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import { StockIssuance, StockTransfer, ShareNumbersIssued } from "./Structs.sol";

library TransactionHelper {
    function generateDeterministicUniqueID(bytes16 stakeholderId) public view returns (bytes16) {
        bytes16 deterministicValue = bytes16(keccak256(abi.encodePacked(stakeholderId, block.timestamp, block.prevrandao)));
        return deterministicValue;
    }

    /* It's likely we see two types of issuances, 
        - one created during transfers (createStockIssuanceStructForTransfer) where less info is needed.
        - one created one time by the TA for an major issuance event (createStockIssuanceStructByTA)  , like a new investor with the company or employee
    */

    function createStockIssuanceStructByTA(
        bytes16 stockClassId,
        bytes16 stockPlanId,
        ShareNumbersIssued memory shareNumbersIssued,
        uint256 sharePrice,
        uint256 quantity,
        bytes16 vestingTermsId,
        uint256 costBasis,
        bytes16[] memory stockLegendIds,
        string memory issuanceType,
        string[] memory comments,
        string memory customId,
        bytes16 stakeholderId,
        string memory boardApprovalDate,
        string memory stockholderApprovalDate,
        string memory considerationText,
        string[] memory securityLawExemptions
    ) internal view returns (StockIssuance memory issuance) {
        bytes16 id = generateDeterministicUniqueID(stakeholderId);
        bytes16 secId = generateDeterministicUniqueID(stockClassId);

        return
            StockIssuance(
                id,
                "TX_STOCK_ISSUANCE",
                stockClassId,
                stockPlanId,
                shareNumbersIssued,
                sharePrice,
                quantity,
                vestingTermsId,
                costBasis,
                stockLegendIds,
                issuanceType,
                comments,
                secId,
                customId,
                stakeholderId,
                boardApprovalDate,
                stockholderApprovalDate,
                considerationText,
                securityLawExemptions
            );
    }

    function createStockIssuanceStructForTransfer(
        bytes16 stakeholderId,
        uint256 quantity,
        uint256 sharePrice,
        bytes16 stockClassId
    ) internal view returns (StockIssuance memory issuance) {
        ShareNumbersIssued memory share_numbers_issued; // if not instatiated it defaults to 0 for both values

        // Temporary placeholders for UUIDs
        bytes16 id = generateDeterministicUniqueID(stakeholderId);
        bytes16 securityId = generateDeterministicUniqueID(stockClassId);

        return
            StockIssuance(
                id, // ID
                "TX_STOCK_ISSUANCE", // Transaction type
                stockClassId, // Stock class ID
                "", // Stock plan ID (optional)
                share_numbers_issued, // Share numbers issued (optional)
                sharePrice, // Share price
                quantity, // Quantity
                "", // Vesting terms ID (optional)
                0e10, // Cost basis (optional)
                new bytes16[](0), // Stock legend IDs (optional)
                "", // Issuance type (optional)
                new string[](0), // Comments
                securityId, // Security ID
                "", // Custom ID (optional)
                stakeholderId, // Stakeholder ID
                "", // Board approval date (optional)
                "", // Stockholder approval date (optional)
                "", // Consideration text (optional)
                new string[](0) // Security law exemptions (optional)
            );
    }

    function createStockTransferStruct(
        uint256 quantity,
        bytes16 security_id,
        bytes16 resulting_security_id,
        bytes16 balance_security_id
    ) internal view returns (StockTransfer memory transfer) {
        bytes16[] memory resultingSecurityIds = new bytes16[](1);
        resultingSecurityIds[0] = resulting_security_id;

        // bytes16 id = hex"f02b7c91e70947f9a748c2a2908af657";
        bytes16 id = generateDeterministicUniqueID(security_id);

        return
            StockTransfer(
                id, // id // TODO: just for testing, need a secure UUID
                "TX_STOCK_TRANSFER",
                quantity,
                new string[](0), // comments,
                security_id,
                "", // consideration text (optional) //TODO: should we include in cap table?
                balance_security_id,
                resultingSecurityIds
            );
    }
}
