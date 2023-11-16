// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { StockIssuance, ActivePosition, ShareNumbersIssued, ActivePositions, SecIdsStockClass, Issuer, StockClass, StockIssuanceParams, StockParams, StorageParams } from "./Structs.sol";
import "./TxHelperTaek.sol";
import "./DeleteContext.sol";

library StockLibTaek {
    error InsufficientShares(uint256 available, uint256 required);
    error InvalidQuantityOrPrice(uint256 quantity, uint256 price);
    error UnverifiedBuyer();

    function createStockIssuanceByTA(
        uint256 nonce,
        StockIssuanceParams memory issuanceParams,
        mapping(bytes32 => bytes) storage hashToTxEncodedData,
        StorageParams storage storageParams
    ) external {
        _checkInvalidQuantityOrPrice(issuanceParams.quantity, issuanceParams.share_price);

        StockIssuance memory issuance = TxHelperTaek.createStockIssuanceStruct(issuanceParams, nonce);
        _updateContext(issuance, hashToTxEncodedData, storageParams);
    }

    function transferStock(
        StockTransferParams memory params,
        mapping(bytes32 => bytes) storage hashToTxEncodedData,
        StorageParams storage storageParams
    ) external {
        _checkBuyerVerified(params.is_buyer_verified);
        _checkInvalidQuantityOrPrice(params.quantity, params.share_price);

        require(
            storageParams.activeSecs.activeSecurityIdsByStockClass[params.transferor_stakeholder_id][params.stock_class_id].length > 0,
            "No active security ids found"
        );
        bytes16[] storage activeSecurityIDs = storageParams.activeSecs.activeSecurityIdsByStockClass[params.transferor_stakeholder_id][
            params.stock_class_id
        ];

        uint256 sum = 0;
        uint256 numSecurityIds = 0;

        for (uint256 index = 0; index < activeSecurityIDs.length; index++) {
            ActivePosition storage activePosition = storageParams.positions.activePositions[params.transferor_stakeholder_id][
                activeSecurityIDs[index]
            ];
            sum += activePosition.quantity;

            numSecurityIds += 1;
            if (sum >= params.quantity) {
                break;
            }
        }

        _checkInsuffientAmount(sum, params.quantity);

        uint256 remainingQuantity = params.quantity; // This will keep track of the remaining quantity to be transferred

        for (uint256 index = 0; index < numSecurityIds; index++) {
            ActivePosition storage activePosition = storageParams.positions.activePositions[params.transferor_stakeholder_id][
                activeSecurityIDs[index]
            ];

            uint256 transferQuantity = remainingQuantity; // This will be the quantity to transfer in this iteration

            if (activePosition.quantity <= remainingQuantity) {
                transferQuantity = activePosition.quantity;
            }

            params.quantity = transferQuantity;

            _transferSingleStock(params, activeSecurityIDs[index], hashToTxEncodedData, storageParams);

            remainingQuantity -= transferQuantity; // Reduce the remaining quantity

            // If there's no more quantity left to transfer, break out of the loop
            if (remainingQuantity == 0) {
                break;
            }
        }
    }

    function cancelStockByTA(
        StockParamsQuantity memory params,
        mapping(bytes32 => bytes) storage hashToTxEncodedData,
        StorageParams storage storageParams
    ) external {
        ActivePosition memory activePosition = storageParams.positions.activePositions[params.stakeholder_id][params.security_id];

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
            StockIssuance memory balanceIssuance = TxHelperTaek.createStockIssuanceStructForTransfer(
                transferParams,
                transferParams.transferor_stakeholder_id
            );

            _updateContext(balanceIssuance, hashToTxEncodedData, storageParams);

            balance_security_id = balanceIssuance.security_id;
        }

        params.nonce++;
        StockCancellation memory cancellation = TxHelperTaek.createStockCancellationStruct(
            params.nonce,
            params.quantity,
            params.comments,
            params.security_id,
            params.reason_text,
            balance_security_id
        );

        TxHelperTaek.createTx(TxType.STOCK_CANCELLATION, abi.encode(cancellation), storageParams.transactions, hashToTxEncodedData);

        storageParams.issuer.shares_issued = storageParams.issuer.shares_issued - params.quantity;
        storageParams.issuer.shares_issued = storageParams.stockClass.shares_issued - params.quantity;

        DeleteContext.deleteActivePosition(params.stakeholder_id, params.security_id, storageParams.positions);
        DeleteContext.deleteActiveSecurityIdsByStockClass(params.stakeholder_id, params.stock_class_id, params.security_id, storageParams.activeSecs);
    }

    function reissueStockByTA(
        StockParams memory params,
        uint256 nonce,
        bytes16[] memory resulting_security_ids,
        mapping(bytes32 => bytes) storage hashToTxEncodedData,
        StorageParams storage storageParams
    ) external {
        ActivePosition memory activePosition = storageParams.positions.activePositions[params.stakeholder_id][params.security_id];

        nonce++;
        StockReissuance memory reissuance = TxHelperTaek.createStockReissuanceStruct(
            nonce,
            params.comments,
            params.security_id,
            resulting_security_ids,
            params.reason_text
        );

        TxHelperTaek.createTx(TxType.STOCK_REISSUANCE, abi.encode(reissuance), storageParams.transactions, hashToTxEncodedData);

        storageParams.issuer.shares_issued = storageParams.issuer.shares_issued - activePosition.quantity;
        storageParams.stockClass.shares_issued = storageParams.stockClass.shares_issued - activePosition.quantity;

        DeleteContext.deleteActivePosition(params.stakeholder_id, params.security_id, storageParams.positions);
        DeleteContext.deleteActiveSecurityIdsByStockClass(params.stakeholder_id, params.stock_class_id, params.security_id, storageParams.activeSecs);
    }

    function repurchaseStockByTA(
        StockParamsQuantity memory params,
        uint256 price,
        mapping(bytes32 => bytes) storage hashToTxEncodedData,
        StorageParams storage storageParams
    ) external {
        ActivePosition memory activePosition = storageParams.positions.activePositions[params.stakeholder_id][params.security_id];

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
            StockIssuance memory balanceIssuance = TxHelperTaek.createStockIssuanceStructForTransfer(
                transferParams,
                transferParams.transferor_stakeholder_id
            );

            _updateContext(balanceIssuance, hashToTxEncodedData, storageParams);

            balance_security_id = balanceIssuance.security_id;
        }

        params.nonce++;
        StockRepurchase memory repurchase = TxHelperTaek.createStockRepurchaseStruct(params, price);

        TxHelperTaek.createTx(TxType.STOCK_REPURCHASE, abi.encode(repurchase), storageParams.transactions, hashToTxEncodedData);

        storageParams.issuer.shares_issued = storageParams.issuer.shares_issued - params.quantity;
        storageParams.stockClass.shares_issued = storageParams.stockClass.shares_issued - params.quantity;

        DeleteContext.deleteActivePosition(params.stakeholder_id, params.security_id, storageParams.positions);
        DeleteContext.deleteActiveSecurityIdsByStockClass(params.stakeholder_id, params.stock_class_id, params.security_id, storageParams.activeSecs);
    }

    function retractStockIssuanceByTA(
        StockParams memory params,
        uint256 nonce,
        mapping(bytes32 => bytes) storage hashToTxEncodedData,
        StorageParams storage storageParams
    ) external {
        ActivePosition memory activePosition = storageParams.positions.activePositions[params.stakeholder_id][params.security_id];

        //TODO: require active position exists.

        StockRetraction memory retraction = TxHelperTaek.createStockRetractionStruct(nonce, params.comments, params.security_id, params.reason_text);
        TxHelperTaek.createTx(TxType.STOCK_RETRACTION, abi.encode(retraction), storageParams.transactions, hashToTxEncodedData);

        storageParams.issuer.shares_issued = storageParams.issuer.shares_issued - activePosition.quantity;
        storageParams.stockClass.shares_issued = storageParams.stockClass.shares_issued - activePosition.quantity;

        DeleteContext.deleteActivePosition(params.stakeholder_id, params.security_id, storageParams.positions);
        DeleteContext.deleteActiveSecurityIdsByStockClass(params.stakeholder_id, params.stock_class_id, params.security_id, storageParams.activeSecs);
    }

    function acceptStockByTA(
        uint256 nonce,
        bytes16 securityId,
        string[] memory comments,
        bytes32[] storage transactions,
        mapping(bytes32 => bytes) storage hashToTxEncodedData
    ) external {
        StockAcceptance memory acceptance = TxHelperTaek.createStockAcceptanceStruct(nonce, comments, securityId);

        TxHelperTaek.createTx(TxType.STOCK_ACCEPTANCE, abi.encode(acceptance), transactions, hashToTxEncodedData);
    }

    function _updateContext(
        StockIssuance memory issuance,
        mapping(bytes32 => bytes) storage hashToTxEncodedData,
        StorageParams storage storageParams
    ) internal {
        storageParams.activeSecs.activeSecurityIdsByStockClass[issuance.params.stakeholder_id][issuance.params.stock_class_id].push(
            issuance.security_id
        );

        storageParams.positions.activePositions[issuance.params.stakeholder_id][issuance.security_id] = ActivePosition(
            issuance.params.stock_class_id,
            issuance.params.quantity,
            issuance.params.share_price,
            _safeNow() // TODO: only using current datetime doesn't allow us to support backfilling transactions.
        );

        storageParams.issuer.shares_issued = storageParams.issuer.shares_issued + issuance.params.quantity;
        storageParams.stockClass.shares_issued = storageParams.stockClass.shares_issued + issuance.params.quantity;
        TxHelperTaek.createTx(TxType.STOCK_ISSUANCE, abi.encode(issuance), storageParams.transactions, hashToTxEncodedData);
    }

    function _safeNow() internal view returns (uint40) {
        return uint40(block.timestamp);
    }

    // isBuyerVerified is a placeholder for a signature, account or hash that confirms the buyer's identity.
    function _transferSingleStock(
        StockTransferParams memory params,
        bytes16 securityId,
        mapping(bytes32 => bytes) storage hashToTxEncodedData,
        StorageParams storage storageParams
    ) internal {
        bytes16 transferorSecurityId = securityId;
        ActivePosition memory transferorActivePosition = storageParams.positions.activePositions[params.transferor_stakeholder_id][
            transferorSecurityId
        ];

        _checkInsuffientAmount(transferorActivePosition.quantity, params.quantity);

        params.nonce++;
        StockIssuance memory transfereeIssuance = TxHelperTaek.createStockIssuanceStructForTransfer(params, params.transferee_stakeholder_id);

        _updateContext(transfereeIssuance, hashToTxEncodedData, storageParams);

        uint256 balanceForTransferor = transferorActivePosition.quantity - params.quantity;

        bytes16 balance_security_id = "";

        params.quantity = balanceForTransferor;
        params.share_price = transferorActivePosition.share_price;
        if (balanceForTransferor > 0) {
            params.nonce++;
            StockIssuance memory transferorBalanceIssuance = TxHelperTaek.createStockIssuanceStructForTransfer(
                params,
                params.transferor_stakeholder_id
            );

            _updateContext(transferorBalanceIssuance, hashToTxEncodedData, storageParams);

            balance_security_id = transferorBalanceIssuance.security_id;
        }

        params.nonce++;
        StockTransfer memory transfer = TxHelperTaek.createStockTransferStruct(
            params.nonce,
            params.quantity,
            transferorSecurityId,
            transfereeIssuance.security_id,
            balance_security_id
        );

        TxHelperTaek.createTx(TxType.STOCK_TRANSFER, abi.encode(transfer), storageParams.transactions, hashToTxEncodedData);

        storageParams.issuer.shares_issued = storageParams.issuer.shares_issued - transferorActivePosition.quantity;
        storageParams.stockClass.shares_issued = storageParams.stockClass.shares_issued - transferorActivePosition.quantity;

        DeleteContext.deleteActivePosition(params.transferor_stakeholder_id, transferorSecurityId, storageParams.positions);
        DeleteContext.deleteActiveSecurityIdsByStockClass(
            params.transferor_stakeholder_id,
            params.stock_class_id,
            transferorSecurityId,
            storageParams.activeSecs
        );
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
