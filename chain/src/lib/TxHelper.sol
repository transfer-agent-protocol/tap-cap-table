// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.30;

import { StockIssuance, StockIssuanceParams, StockTransfer, StockRepurchase, ShareNumbersIssued, StockAcceptance, StockCancellation, StockReissuance, StockRetraction, IssuerAuthorizedSharesAdjustment, StockClassAuthorizedSharesAdjustment, StockTransferParams, StockParamsQuantity } from "./Structs.sol";

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

        return StockIssuance({
            id: id,
            object_type: "TX_STOCK_ISSUANCE",
            security_id: secId,
            params: params
        });
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

        StockIssuanceParams memory params = StockIssuanceParams({
            stock_class_id: transferParams.stock_class_id,
            stock_plan_id: "",
            share_numbers_issued: share_numbers_issued,
            share_price: transferParams.share_price,
            quantity: transferParams.quantity,
            vesting_terms_id: "",
            cost_basis: 0e10,
            stock_legend_ids: new bytes16[](0),
            issuance_type: "",
            comments: new string[](0),
            custom_id: transferParams.custom_id,
            stakeholder_id: stakeholderId,
            board_approval_date: "",
            stockholder_approval_date: "",
            consideration_text: "",
            security_law_exemptions: new string[](0)
        });
        return StockIssuance({
            id: id,
            object_type: "TX_STOCK_ISSUANCE",
            security_id: securityId,
            params: params
        });
    }

    function createStockIssuanceStruct(
        StockIssuanceParams memory issuanceParams,
        uint256 nonce
    ) internal view returns (StockIssuance memory issuance) {
        bytes16 id = generateDeterministicUniqueID(issuanceParams.stakeholder_id, nonce);
        bytes16 secId = generateDeterministicUniqueID(issuanceParams.stock_class_id, nonce);

        return StockIssuance({
            id: id,
            object_type: "TX_STOCK_ISSUANCE",
            security_id: secId,
            params: issuanceParams
        });
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

        return StockTransfer({
            id: id,
            object_type: "TX_STOCK_TRANSFER",
            quantity: quantity,
            comments: new string[](0),
            security_id: security_id,
            consideration_text: "",
            balance_security_id: balance_security_id,
            resulting_security_ids: resultingSecurityIds
        });
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

        return StockCancellation({
            id: id,
            object_type: "TX_STOCK_CANCELLATION",
            quantity: quantity,
            comments: comments,
            security_id: securityId,
            reason_text: reasonText,
            balance_security_id: balance_security_id
        });
    }

    function createStockRetractionStruct(
        uint256 nonce,
        string[] memory comments,
        bytes16 securityId,
        string memory reasonText
    ) internal view returns (StockRetraction memory retraction) {
        bytes16 id = generateDeterministicUniqueID(securityId, nonce);

        return StockRetraction({
            id: id,
            object_type: "TX_STOCK_RETRACTION",
            comments: comments,
            security_id: securityId,
            reason_text: reasonText
        });
    }

    function createStockRepurchaseStruct(StockParamsQuantity memory params, uint256 price) internal view returns (StockRepurchase memory repurchase) {
        bytes16 id = generateDeterministicUniqueID(params.security_id, params.nonce);

        // Note: using stakeholderId to store balanceSecurityId
        return StockRepurchase({
            id: id,
            object_type: "TX_STOCK_REPURCHASE",
            comments: params.comments,
            security_id: params.security_id,
            consideration_text: params.reason_text,
            balance_security_id: params.stakeholder_id,
            quantity: params.quantity,
            price: price
        });
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

        return IssuerAuthorizedSharesAdjustment({
            id: id,
            object_type: "TX_ISSUER_AUTHORIZED_SHARES_ADJUSTMENT",
            new_shares_authorized: newSharesAuthorized,
            comments: comments,
            board_approval_date: boardApprovalDate,
            stockholder_approval_date: stockholderApprovalDate
        });
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

        return StockClassAuthorizedSharesAdjustment({
            id: id,
            object_type: "TX_STOCK_CLASS_AUTHORIZED_SHARES_ADJUSTMENT",
            new_shares_authorized: newSharesAuthorized,
            comments: comments,
            board_approval_date: boardApprovalDate,
            stockholder_approval_date: stockholderApprovalDate
        });
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

        return StockReissuance({
            id: id,
            object_type: "TX_STOCK_REISSUANCE",
            comments: comments,
            security_id: securityId,
            resulting_security_ids: resultingSecurityIds,
            split_transaction_id: splitTransactionId,
            reason_text: reasonText
        });
    }

    function createStockAcceptanceStruct(
        uint256 nonce,
        string[] memory comments,
        bytes16 securityId
    ) internal view returns (StockAcceptance memory acceptance) {
        bytes16 id = generateDeterministicUniqueID(securityId, nonce);

        return StockAcceptance({
            id: id,
            object_type: "TX_STOCK_ACCEPTANCE",
            security_id: securityId,
            comments: comments
        });
    }
}
