// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { StockIssuance, StockIssuanceParams, ActivePositions, ActivePosition, SecIdsStockClass, Issuer, StockClass, StockTransfer, StockRepurchase, ShareNumbersIssued, StockAcceptance, StockCancellation, StockReissuance, StockRetraction, IssuerAuthorizedSharesAdjustment, StockClassAuthorizedSharesAdjustment, StockTransferParams, StockParamsQuantity, StockIssuanceParams } from "./Structs.sol";

enum TxType {
    INVALID,
    ISSUER_AUTHORIZED_SHARES_ADJUSTMENT,
    STOCK_CLASS_AUTHORIZED_SHARES_ADJUSTMENT,
    STOCK_ACCEPTANCE,
    STOCK_CANCELLATION,
    STOCK_ISSUANCE,
    STOCK_REISSUANCE,
    STOCK_REPURCHASE,
    STOCK_RETRACTION,
    STOCK_TRANSFER
}

struct Tx {
    TxType txType;
    bytes txData;
}

library TxHelper {
    event TxCreated(uint256 index, TxType txType, bytes txData);

    function createTx(TxType txType, bytes memory txData, bytes[] storage transactions) internal {
        transactions.push(txData);
        emit TxCreated(transactions.length, txType, txData);
    }

    function generateDeterministicUniqueID(bytes16 stakeholderId, uint256 nonce) public view returns (bytes16) {
        bytes16 deterministicValue = bytes16(keccak256(abi.encodePacked(stakeholderId, block.timestamp, block.prevrandao, nonce)));
        return deterministicValue;
    }

    function createStockIssuanceStructByTA(uint256 nonce, StockIssuanceParams memory params) internal view returns (StockIssuance memory issuance) {
        bytes16 id = generateDeterministicUniqueID(params.stakeholder_id, nonce);
        bytes16 secId = generateDeterministicUniqueID(params.stock_class_id, nonce);

        return StockIssuance(id, "TX_STOCK_ISSUANCE", secId, params);
    }

    // TODO: do we need to have more information from the previous transferor issuance in this new issuance?
    // I think we can extend this for all other types of balances
    function createStockIssuanceStructForTransfer(
        StockTransferParams memory transferParams,
        bytes16 stakeholderId
    ) internal view returns (StockIssuance memory issuance) {
        ShareNumbersIssued memory share_numbers_issued; // if not instatiated it defaults to 0 for both values

        bytes16 id = generateDeterministicUniqueID(stakeholderId, transferParams.nonce);
        bytes16 securityId = generateDeterministicUniqueID(transferParams.stock_class_id, transferParams.nonce);

        StockIssuanceParams memory params = StockIssuanceParams(
            transferParams.stock_class_id, // Stock class ID
            "", // Stock plan ID (optional)
            share_numbers_issued, // Share numbers issued (optional)
            transferParams.share_price, // Share price
            transferParams.quantity, // Quantity
            "", // Vesting terms ID (optional)
            0e10, // Cost basis (optional)
            new bytes16[](0), // Stock legend IDs (optional)
            "", // Issuance type (optional)
            new string[](0), // Comments
            "", // Custom ID (optional)
            stakeholderId, // Stakeholder ID
            "", // Board approval date (optional)
            "", // Stockholder approval date (optional)
            "", // Consideration text (optional)
            new string[](0) // Security law exemptions (optional)
        );
        return
            StockIssuance(
                id, // ID
                "TX_STOCK_ISSUANCE", // Transaction type
                securityId, // Security ID
                params
            );
    }

    function createStockIssuanceStruct(
        StockIssuanceParams memory issuanceParams,
        uint256 nonce
    ) internal view returns (StockIssuance memory issuance) {
        nonce++;
        bytes16 id = generateDeterministicUniqueID(issuanceParams.stakeholder_id, nonce);
        bytes16 secId = generateDeterministicUniqueID(issuanceParams.stock_class_id, nonce);

        return StockIssuance(id, "TX_STOCK_ISSUANCE", secId, issuanceParams);
    }

    function createStockTransferStruct(
        uint256 nonce,
        uint256 quantity,
        bytes16 security_id,
        bytes16 resulting_security_id,
        bytes16 balance_security_id
    ) internal view returns (StockTransfer memory transfer) {
        bytes16[] memory resultingSecurityIds = new bytes16[](1);
        resultingSecurityIds[0] = resulting_security_id;

        bytes16 id = generateDeterministicUniqueID(security_id, nonce);

        return
            StockTransfer(
                id,
                "TX_STOCK_TRANSFER",
                quantity,
                new string[](0), // comments,
                security_id,
                "", // consideration text (optional) //TODO: should we include in cap table?
                balance_security_id,
                resultingSecurityIds
            );
    }

    function createStockCancellationStruct(
        uint256 nonce,
        uint256 quantity,
        string[] memory comments,
        bytes16 securityId,
        string memory reasonText,
        bytes16 balance_security_id
    ) internal view returns (StockCancellation memory cancellation) {
        bytes16 id = generateDeterministicUniqueID(securityId, nonce);

        return StockCancellation(id, "TX_STOCK_CANCELLATION", quantity, comments, securityId, reasonText, balance_security_id);
    }

    function createStockRetractionStruct(
        uint256 nonce,
        string[] memory comments,
        bytes16 securityId,
        string memory reasonText
    ) internal view returns (StockRetraction memory retraction) {
        nonce++;
        bytes16 id = generateDeterministicUniqueID(securityId, nonce);

        return StockRetraction(id, "TX_STOCK_RETRACTION", comments, securityId, reasonText);
    }

    function createStockRepurchaseStruct(StockParamsQuantity memory params, uint256 price) internal view returns (StockRepurchase memory repurchase) {
        bytes16 id = generateDeterministicUniqueID(params.security_id, params.nonce);

        // Note: using stakeholderId to store balanceSecurityId
        return
            StockRepurchase(
                id,
                "TX_STOCK_REPURCHASE",
                params.comments,
                params.security_id,
                params.reason_text,
                params.stakeholder_id,
                params.quantity,
                price
            );
    }

    function adjustIssuerAuthorizedShares(
        uint256 nonce,
        uint256 newSharesAuthorized,
        string[] memory comments,
        string memory boardApprovalDate,
        string memory stockholderApprovalDate,
        bytes16 issuerId
    ) internal view returns (IssuerAuthorizedSharesAdjustment memory adjustment) {
        bytes16 id = generateDeterministicUniqueID(issuerId, nonce);

        return
            IssuerAuthorizedSharesAdjustment(
                id,
                "TX_ISSUER_AUTHORIZED_SHARES_ADJUSTMENT",
                newSharesAuthorized,
                comments,
                boardApprovalDate,
                stockholderApprovalDate
            );
    }

    function adjustStockClassAuthorizedShares(
        uint256 nonce,
        uint256 newSharesAuthorized,
        string[] memory comments,
        string memory boardApprovalDate,
        string memory stockholderApprovalDate,
        bytes16 stockClassId
    ) internal view returns (StockClassAuthorizedSharesAdjustment memory adjustment) {
        bytes16 id = generateDeterministicUniqueID(stockClassId, nonce);

        return
            StockClassAuthorizedSharesAdjustment(
                id,
                "TX_STOCK_CLASS_AUTHORIZED_SHARES_ADJUSTMENT",
                newSharesAuthorized,
                comments,
                boardApprovalDate,
                stockholderApprovalDate
            );
    }

    function createStockReissuanceStruct(
        uint256 nonce,
        string[] memory comments,
        bytes16 securityId,
        bytes16[] memory resultingSecurityIds,
        string memory reasonText
    ) internal view returns (StockReissuance memory reissuance) {
        bytes16 id = generateDeterministicUniqueID(securityId, nonce);
        bytes16 splitTransactionId = bytes16(0); // Not used in MVP

        return StockReissuance(id, "TX_STOCK_REISSUANCE", comments, securityId, resultingSecurityIds, splitTransactionId, reasonText);
    }

    function createStockAcceptanceStruct(
        uint256 nonce,
        string[] memory comments,
        bytes16 securityId
    ) internal view returns (StockAcceptance memory acceptance) {
        nonce++;
        bytes16 id = generateDeterministicUniqueID(securityId, nonce);

        return StockAcceptance(id, "TX_STOCK_ACCEPTANCE", securityId, comments);
    }
}
