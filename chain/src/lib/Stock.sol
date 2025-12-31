// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.24;

import { StockIssuance, ActivePosition, ActivePositions, SecIdsStockClass, Issuer, StockClass, StockIssuanceParams, StockParams, StockTransferParams, StockCancellation, StockReissuance, StockRepurchase, StockRetraction, StockAcceptance, StockParamsQuantity, StockTransfer } from "./Structs.sol";
import { TxHelper, TxType } from "./TxHelper.sol";
import { DeleteContext } from "./DeleteContext.sol";

library StockLib {
    error InsufficientShares(uint256 available, uint256 required);
    error InvalidQuantityOrPrice(uint256 quantity, uint256 price);
    error UnverifiedBuyer();
    error ActivePositionNotFound(bytes16 stakeholderId, bytes16 securityId);

    function createIssuance(
        uint256 nonce,
        StockIssuanceParams memory issuanceParams,
        ActivePositions storage positions,
        SecIdsStockClass storage activeSecs,
        bytes[] storage transactions,
        Issuer storage issuer,
        StockClass storage stockClass
    ) external {
        _checkInvalidQuantityOrPrice(issuanceParams.quantity, issuanceParams.share_price);

        StockIssuance memory issuance = TxHelper.createStockIssuanceStruct(issuanceParams, nonce);
        _updateContext(issuance, positions, activeSecs, issuer, stockClass, transactions);
    }

    function createTransfer(
        StockTransferParams memory params,
        ActivePositions storage positions,
        SecIdsStockClass storage activeSecs,
        bytes[] storage transactions,
        Issuer storage issuer,
        StockClass storage stockClass
    ) external {
        _checkBuyerVerified(params.is_buyer_verified);
        _checkInvalidQuantityOrPrice(params.quantity, params.share_price);
        require(
            activeSecs.activeSecurityIdsByStockClass[params.transferor_stakeholder_id][params.stock_class_id].length > 0,
            "No active security ids found"
        );
        bytes16[] memory activeSecurityIDs = activeSecs.activeSecurityIdsByStockClass[params.transferor_stakeholder_id][params.stock_class_id];

        uint256 sum = 0;
        uint256 numSecurityIds = 0;

        for (uint256 index = 0; index < activeSecurityIDs.length; index++) {
            ActivePosition storage activePosition = positions.activePositions[params.transferor_stakeholder_id][activeSecurityIDs[index]];
            sum += activePosition.quantity;

            numSecurityIds += 1;
            if (sum >= params.quantity) {
                break;
            }
        }

        _checkInsuffientAmount(sum, params.quantity);

        uint256 remainingQuantity = params.quantity;

        for (uint256 index = 0; index < numSecurityIds; index++) {
            bytes16 active_security_id = activeSecurityIDs[index];

            ActivePosition storage activePosition = positions.activePositions[params.transferor_stakeholder_id][active_security_id];

            uint256 transferQuantity = remainingQuantity;

            if (activePosition.quantity <= remainingQuantity) {
                transferQuantity = activePosition.quantity;
            }

            params.quantity = transferQuantity;

            _transferSingleStock(params, active_security_id, positions, activeSecs, transactions, issuer, stockClass);

            remainingQuantity -= transferQuantity;

            if (remainingQuantity == 0) {
                break;
            }
        }
    }

    function createCancellation(
        StockParamsQuantity memory params,
        ActivePositions storage positions,
        SecIdsStockClass storage activeSecs,
        bytes[] storage transactions,
        Issuer storage issuer,
        StockClass storage stockClass
    ) external {
        ActivePosition memory activePosition = positions.activePositions[params.stakeholder_id][params.security_id];

        _checkActivePositionExists(activePosition, params.stakeholder_id, params.security_id);
        _checkInsuffientAmount(activePosition.quantity, params.quantity);

        uint256 remainingQuantity = activePosition.quantity - params.quantity;
        bytes16 balance_security_id = "";

        if (remainingQuantity > 0) {
            StockTransferParams memory transferParams = StockTransferParams({
                transferor_stakeholder_id: params.stakeholder_id,
                transferee_stakeholder_id: bytes16(0),
                stock_class_id: params.stock_class_id,
                is_buyer_verified: true,
                quantity: remainingQuantity,
                share_price: activePosition.share_price,
                nonce: params.nonce,
                custom_id: ""
            });
            StockIssuance memory balanceIssuance = TxHelper.createStockIssuanceStructForTransfer(
                transferParams,
                transferParams.transferor_stakeholder_id
            );

            _updateContext(balanceIssuance, positions, activeSecs, issuer, stockClass, transactions);

            balance_security_id = balanceIssuance.security_id;
        }

        StockCancellation memory cancellation = TxHelper.createStockCancellationStruct(
            params.nonce,
            params.quantity,
            params.comments,
            params.security_id,
            params.reason_text,
            balance_security_id
        );

        TxHelper.createTx(TxType.STOCK_CANCELLATION, abi.encode(cancellation), transactions);

        _subtractSharesIssued(issuer, stockClass, activePosition.quantity);

        DeleteContext.deleteActivePosition(params.stakeholder_id, params.security_id, positions);
        DeleteContext.deleteActiveSecurityIdsByStockClass(params.stakeholder_id, params.stock_class_id, params.security_id, activeSecs);
    }

    function createReissuance(
        StockParams memory params,
        uint256 nonce,
        bytes16[] memory resulting_security_ids,
        ActivePositions storage positions,
        SecIdsStockClass storage activeSecs,
        bytes[] storage transactions,
        Issuer storage issuer,
        StockClass storage stockClass
    ) external {
        ActivePosition memory activePosition = positions.activePositions[params.stakeholder_id][params.security_id];

        _checkActivePositionExists(activePosition, params.stakeholder_id, params.security_id);

        StockReissuance memory reissuance = TxHelper.createStockReissuanceStruct(
            nonce,
            params.comments,
            params.security_id,
            resulting_security_ids,
            params.reason_text
        );

        TxHelper.createTx(TxType.STOCK_REISSUANCE, abi.encode(reissuance), transactions);

        _subtractSharesIssued(issuer, stockClass, activePosition.quantity);

        DeleteContext.deleteActivePosition(params.stakeholder_id, params.security_id, positions);
        DeleteContext.deleteActiveSecurityIdsByStockClass(params.stakeholder_id, params.stock_class_id, params.security_id, activeSecs);
    }

    function createRepurchase(
        StockParamsQuantity memory params,
        uint256 price,
        ActivePositions storage positions,
        SecIdsStockClass storage activeSecs,
        bytes[] storage transactions,
        Issuer storage issuer,
        StockClass storage stockClass
    ) external {
        ActivePosition memory activePosition = positions.activePositions[params.stakeholder_id][params.security_id];

        _checkActivePositionExists(activePosition, params.stakeholder_id, params.security_id);
        _checkInsuffientAmount(activePosition.quantity, params.quantity);

        uint256 remainingQuantity = activePosition.quantity - params.quantity;
        bytes16 balance_security_id = "";

        if (remainingQuantity > 0) {
            StockTransferParams memory transferParams = StockTransferParams({
                transferor_stakeholder_id: params.stakeholder_id,
                transferee_stakeholder_id: bytes16(0),
                stock_class_id: params.stock_class_id,
                is_buyer_verified: true,
                quantity: remainingQuantity,
                share_price: activePosition.share_price,
                nonce: params.nonce,
                custom_id: ""
            });
            StockIssuance memory balanceIssuance = TxHelper.createStockIssuanceStructForTransfer(
                transferParams,
                transferParams.transferor_stakeholder_id
            );

            _updateContext(balanceIssuance, positions, activeSecs, issuer, stockClass, transactions);

            balance_security_id = balanceIssuance.security_id;
        }

        StockRepurchase memory repurchase = TxHelper.createStockRepurchaseStruct(params, price);

        TxHelper.createTx(TxType.STOCK_REPURCHASE, abi.encode(repurchase), transactions);

        _subtractSharesIssued(issuer, stockClass, activePosition.quantity);

        DeleteContext.deleteActivePosition(params.stakeholder_id, params.security_id, positions);
        DeleteContext.deleteActiveSecurityIdsByStockClass(params.stakeholder_id, params.stock_class_id, params.security_id, activeSecs);
    }

    function createRetraction(
        StockParams memory params,
        uint256 nonce,
        ActivePositions storage positions,
        SecIdsStockClass storage activeSecs,
        bytes[] storage transactions,
        Issuer storage issuer,
        StockClass storage stockClass
    ) external {
        ActivePosition memory activePosition = positions.activePositions[params.stakeholder_id][params.security_id];

        _checkActivePositionExists(activePosition, params.stakeholder_id, params.security_id);

        StockRetraction memory retraction = TxHelper.createStockRetractionStruct(nonce, params.comments, params.security_id, params.reason_text);
        TxHelper.createTx(TxType.STOCK_RETRACTION, abi.encode(retraction), transactions);

        _subtractSharesIssued(issuer, stockClass, activePosition.quantity);

        DeleteContext.deleteActivePosition(params.stakeholder_id, params.security_id, positions);
        DeleteContext.deleteActiveSecurityIdsByStockClass(params.stakeholder_id, params.stock_class_id, params.security_id, activeSecs);
    }

    function createAcceptance(uint256 nonce, bytes16 securityId, string[] memory comments, bytes[] storage transactions) external {
        StockAcceptance memory acceptance = TxHelper.createStockAcceptanceStruct(nonce, comments, securityId);

        TxHelper.createTx(TxType.STOCK_ACCEPTANCE, abi.encode(acceptance), transactions);
    }

    function _updateContext(
        StockIssuance memory issuance,
        ActivePositions storage positions,
        SecIdsStockClass storage activeSecs,
        Issuer storage issuer,
        StockClass storage stockClass,
        bytes[] storage transactions
    ) internal {
        activeSecs.activeSecurityIdsByStockClass[issuance.params.stakeholder_id][issuance.params.stock_class_id].push(issuance.security_id);

        positions.activePositions[issuance.params.stakeholder_id][issuance.security_id] = ActivePosition({
            stock_class_id: issuance.params.stock_class_id,
            quantity: issuance.params.quantity,
            share_price: issuance.params.share_price,
            timestamp: _safeNow() // TODO: only using current datetime doesn't allow us to support backfilling transactions.
        });

        issuer.shares_issued = issuer.shares_issued + issuance.params.quantity;
        stockClass.shares_issued = stockClass.shares_issued + issuance.params.quantity;

        TxHelper.createTx(TxType.STOCK_ISSUANCE, abi.encode(issuance), transactions);
    }

    function _safeNow() internal view returns (uint40) {
        return uint40(block.timestamp);
    }

    function _subtractSharesIssued(Issuer storage issuer, StockClass storage stockClass, uint256 quantity) internal {
        issuer.shares_issued = issuer.shares_issued - quantity;
        stockClass.shares_issued = stockClass.shares_issued - quantity;
    }

    // isBuyerVerified is a placeholder for a signature, account or hash that confirms the buyer's identity. TODO: delete if not necessary
    function _transferSingleStock(
        StockTransferParams memory params,
        bytes16 transferorSecurityId,
        ActivePositions storage positions,
        SecIdsStockClass storage activeSecs,
        bytes[] storage transactions,
        Issuer storage issuer,
        StockClass storage stockClass
    ) internal {
        ActivePosition memory transferorActivePosition = positions.activePositions[params.transferor_stakeholder_id][transferorSecurityId];

        _checkInsuffientAmount(transferorActivePosition.quantity, params.quantity);

        StockIssuance memory transfereeIssuance = TxHelper.createStockIssuanceStructForTransfer(params, params.transferee_stakeholder_id);

        _updateContext(transfereeIssuance, positions, activeSecs, issuer, stockClass, transactions);

        uint256 balanceForTransferor = transferorActivePosition.quantity - params.quantity;

        bytes16 balance_security_id = "";

        StockTransferParams memory newParams = StockTransferParams({
            transferor_stakeholder_id: params.transferor_stakeholder_id,
            transferee_stakeholder_id: params.transferee_stakeholder_id,
            stock_class_id: params.stock_class_id,
            is_buyer_verified: params.is_buyer_verified,
            quantity: params.quantity,
            share_price: params.share_price,
            nonce: params.nonce,
            custom_id: params.custom_id
        });
        newParams.quantity = balanceForTransferor;
        newParams.share_price = transferorActivePosition.share_price;

        if (balanceForTransferor > 0) {
            StockIssuance memory transferorBalanceIssuance = TxHelper.createStockIssuanceStructForTransfer(
                newParams,
                newParams.transferor_stakeholder_id
            );

            _updateContext(transferorBalanceIssuance, positions, activeSecs, issuer, stockClass, transactions);

            balance_security_id = transferorBalanceIssuance.security_id;
        }

        StockTransfer memory transfer = TxHelper.createStockTransferStruct(
            params.nonce,
            params.quantity,
            transferorSecurityId,
            transfereeIssuance.security_id,
            balance_security_id
        );

        TxHelper.createTx(TxType.STOCK_TRANSFER, abi.encode(transfer), transactions);

        _subtractSharesIssued(issuer, stockClass, transferorActivePosition.quantity);

        DeleteContext.deleteActivePosition(params.transferor_stakeholder_id, transferorSecurityId, positions);
        DeleteContext.deleteActiveSecurityIdsByStockClass(params.transferor_stakeholder_id, params.stock_class_id, transferorSecurityId, activeSecs);
    }

    function _checkInvalidQuantityOrPrice(uint256 quantity, uint256 price) internal pure {
        if (quantity <= 0 || price <= 0) {
            revert InvalidQuantityOrPrice(quantity, price);
        }
    }

    function _checkInsuffientAmount(uint256 available, uint256 desired) internal pure {
        if (available < desired) {
            revert InsufficientShares(available, desired);
        }
    }

    function _checkActivePositionExists(ActivePosition memory activePosition, bytes16 stakeholderId, bytes16 securityId) internal pure {
        if (activePosition.quantity == 0) {
            revert ActivePositionNotFound(stakeholderId, securityId);
        }
    }

    function _checkBuyerVerified(bool isBuyerVerified) internal pure {
        if (!isBuyerVerified) {
            revert UnverifiedBuyer();
        }
    }
}
