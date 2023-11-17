// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { StockIssuance, ActivePosition, ShareNumbersIssued, ActivePositions, SecIdsStockClass, Issuer, StockClass, StockIssuanceParams, StockParams } from "./Structs.sol";
import "./TxHelper.sol";
import "./DeleteContext.sol";

library StockLib {
    error InsufficientShares(uint256 available, uint256 required);
    error InvalidQuantityOrPrice(uint256 quantity, uint256 price);
    error UnverifiedBuyer();

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
        bytes16[] storage activeSecurityIDs = activeSecs.activeSecurityIdsByStockClass[params.transferor_stakeholder_id][params.stock_class_id];

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
            ActivePosition storage activePosition = positions.activePositions[params.transferor_stakeholder_id][activeSecurityIDs[index]];

            uint256 transferQuantity = remainingQuantity;

            if (activePosition.quantity <= remainingQuantity) {
                transferQuantity = activePosition.quantity;
            }

            params.quantity = transferQuantity;

            _transferSingleStock(params, activeSecurityIDs[index], positions, activeSecs, transactions, issuer, stockClass);

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

        _checkInsuffientAmount(activePosition.quantity, params.quantity);

        uint256 remainingQuantity = activePosition.quantity - params.quantity;
        bytes16 balance_security_id = "";

        if (remainingQuantity > 0) {
            params.nonce++;

            StockTransferParams memory transferParams = StockTransferParams(
                params.stakeholder_id,
                bytes16(0),
                params.stock_class_id,
                true,
                remainingQuantity,
                activePosition.share_price,
                params.nonce
            );
            StockIssuance memory balanceIssuance = TxHelper.createStockIssuanceStructForTransfer(
                transferParams,
                transferParams.transferor_stakeholder_id
            );

            _updateContext(balanceIssuance, positions, activeSecs, issuer, stockClass, transactions);

            balance_security_id = balanceIssuance.security_id;
        }

        params.nonce++;
        StockCancellation memory cancellation = TxHelper.createStockCancellationStruct(
            params.nonce,
            params.quantity,
            params.comments,
            params.security_id,
            params.reason_text,
            balance_security_id
        );

        TxHelper.createTx(TxType.STOCK_CANCELLATION, abi.encode(cancellation), transactions);

        issuer.shares_issued = issuer.shares_issued - params.quantity;
        stockClass.shares_issued = stockClass.shares_issued - params.quantity;

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

        nonce++;
        StockReissuance memory reissuance = TxHelper.createStockReissuanceStruct(
            nonce,
            params.comments,
            params.security_id,
            resulting_security_ids,
            params.reason_text
        );

        TxHelper.createTx(TxType.STOCK_REISSUANCE, abi.encode(reissuance), transactions);

        issuer.shares_issued = issuer.shares_issued - activePosition.quantity;
        stockClass.shares_issued = stockClass.shares_issued - activePosition.quantity;

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

        _checkInsuffientAmount(activePosition.quantity, params.quantity);

        uint256 remainingQuantity = activePosition.quantity - params.quantity;
        bytes16 balance_security_id = "";

        if (remainingQuantity > 0) {
            // issue balance
            params.nonce++;

            StockTransferParams memory transferParams = StockTransferParams(
                params.stakeholder_id,
                bytes16(0),
                params.stock_class_id,
                true,
                remainingQuantity,
                activePosition.share_price,
                params.nonce
            );
            StockIssuance memory balanceIssuance = TxHelper.createStockIssuanceStructForTransfer(
                transferParams,
                transferParams.transferor_stakeholder_id
            );

            _updateContext(balanceIssuance, positions, activeSecs, issuer, stockClass, transactions);

            balance_security_id = balanceIssuance.security_id;
        }

        params.nonce++;
        StockRepurchase memory repurchase = TxHelper.createStockRepurchaseStruct(params, price);

        TxHelper.createTx(TxType.STOCK_REPURCHASE, abi.encode(repurchase), transactions);

        issuer.shares_issued = issuer.shares_issued - params.quantity;
        stockClass.shares_issued = stockClass.shares_issued - params.quantity;

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

        //TODO: require active position exists.

        StockRetraction memory retraction = TxHelper.createStockRetractionStruct(nonce, params.comments, params.security_id, params.reason_text);
        TxHelper.createTx(TxType.STOCK_RETRACTION, abi.encode(retraction), transactions);

        issuer.shares_issued = issuer.shares_issued - activePosition.quantity;
        stockClass.shares_issued = stockClass.shares_issued - activePosition.quantity;

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

        positions.activePositions[issuance.params.stakeholder_id][issuance.security_id] = ActivePosition(
            issuance.params.stock_class_id,
            issuance.params.quantity,
            issuance.params.share_price,
            _safeNow() // TODO: only using current datetime doesn't allow us to support backfilling transactions.
        );

        issuer.shares_issued = issuer.shares_issued + issuance.params.quantity;
        stockClass.shares_issued = stockClass.shares_issued + issuance.params.quantity;
        TxHelper.createTx(TxType.STOCK_ISSUANCE, abi.encode(issuance), transactions);
    }

    function _safeNow() internal view returns (uint40) {
        return uint40(block.timestamp);
    }

    // isBuyerVerified is a placeholder for a signature, account or hash that confirms the buyer's identity. TODO: delete if not necessary
    function _transferSingleStock(
        StockTransferParams memory params,
        bytes16 securityId,
        ActivePositions storage positions,
        SecIdsStockClass storage activeSecs,
        bytes[] storage transactions,
        Issuer storage issuer,
        StockClass storage stockClass
    ) internal {
        bytes16 transferorSecurityId = securityId;
        ActivePosition memory transferorActivePosition = positions.activePositions[params.transferor_stakeholder_id][transferorSecurityId];

        _checkInsuffientAmount(transferorActivePosition.quantity, params.quantity);

        params.nonce++;
        StockIssuance memory transfereeIssuance = TxHelper.createStockIssuanceStructForTransfer(params, params.transferee_stakeholder_id);

        _updateContext(transfereeIssuance, positions, activeSecs, issuer, stockClass, transactions);

        uint256 balanceForTransferor = transferorActivePosition.quantity - params.quantity;

        bytes16 balance_security_id = "";

        params.quantity = balanceForTransferor;
        params.share_price = transferorActivePosition.share_price;
        if (balanceForTransferor > 0) {
            params.nonce++;
            StockIssuance memory transferorBalanceIssuance = TxHelper.createStockIssuanceStructForTransfer(params, params.transferor_stakeholder_id);

            _updateContext(transferorBalanceIssuance, positions, activeSecs, issuer, stockClass, transactions);

            balance_security_id = transferorBalanceIssuance.security_id;
        }

        params.nonce++;
        StockTransfer memory transfer = TxHelper.createStockTransferStruct(
            params.nonce,
            params.quantity,
            transferorSecurityId,
            transfereeIssuance.security_id,
            balance_security_id
        );

        TxHelper.createTx(TxType.STOCK_TRANSFER, abi.encode(transfer), transactions);

        issuer.shares_issued = issuer.shares_issued - transferorActivePosition.quantity;
        stockClass.shares_issued = stockClass.shares_issued - transferorActivePosition.quantity;

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

    function _checkBuyerVerified(bool isBuyerVerified) internal pure {
        if (!isBuyerVerified) {
            revert UnverifiedBuyer();
        }
    }
}
