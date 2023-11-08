// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { StockTransferParams, StockIssuance, ActivePosition, ActivePositions, SecIdsStockClass, StockTransfer, Issuer, StockClass } from "../Structs.sol";
import "./StockIssuance.sol";
import "../../transactions/StockTransferTX.sol";
import "../TxHelper.sol";
import "../DeleteContext.sol";

// TODO: use SafeMath
library StockTransferLib {
    using SafeMath for uint256;

    event StockTransferCreated(StockTransfer transfer);

    function transferStock(
        StockTransferParams memory params,
        ActivePositions storage positions,
        SecIdsStockClass storage activeSecs,
        address[] storage transactions,
        Issuer storage issuer,
        StockClass storage stockClass
    ) external {
        // Checks related to transaction validity
        require(params.is_buyer_verified, "Buyer unverified");
        require(params.quantity > 0, "Invalid quantity");
        require(params.share_price > 0, "Invalid price");

        require(
            activeSecs.activeSecurityIdsByStockClass[params.transferor_stakeholder_id][params.stock_class_id].length > 0,
            "No active security ids found"
        );
        bytes16[] memory activeSecurityIDs = activeSecs.activeSecurityIdsByStockClass[params.transferor_stakeholder_id][params.stock_class_id];

        uint256 sum = 0;
        uint256 numSecurityIds = 0;

        for (uint256 index = 0; index < activeSecurityIDs.length; index++) {
            ActivePosition memory activePosition = positions.activePositions[params.transferor_stakeholder_id][activeSecurityIDs[index]];
            sum += activePosition.quantity;

            if (sum >= params.quantity) {
                numSecurityIds += 1;
                break;
            } else {
                numSecurityIds += 1;
            }
        }

        require(params.quantity <= sum, "insufficient shares");

        uint256 remainingQuantity = params.quantity; // This will keep track of the remaining quantity to be transferred

        for (uint256 index = 0; index < numSecurityIds; index++) {
            ActivePosition memory activePosition = positions.activePositions[params.transferor_stakeholder_id][activeSecurityIDs[index]];

            uint256 transferQuantity; // This will be the quantity to transfer in this iteration

            if (activePosition.quantity <= remainingQuantity) {
                transferQuantity = activePosition.quantity;
            } else {
                transferQuantity = remainingQuantity;
            }

            StockTransferParams memory newParams = params;
            newParams.quantity = transferQuantity;

            _transferSingleStock(newParams, activeSecurityIDs[index], positions, activeSecs, transactions, issuer, stockClass);

            remainingQuantity -= transferQuantity; // Reduce the remaining quantity

            // If there's no more quantity left to transfer, break out of the loop
            if (remainingQuantity == 0) {
                break;
            }
        }
    }

    // isBuyerVerified is a placeholder for a signature, account or hash that confirms the buyer's identity.
    function _transferSingleStock(
        StockTransferParams memory params,
        bytes16 securityId,
        ActivePositions storage positions,
        SecIdsStockClass storage activeSecs,
        address[] storage transactions,
        Issuer storage issuer,
        StockClass storage stockClass
    ) internal {
        bytes16 transferorSecurityId = securityId;
        ActivePosition memory transferorActivePosition = positions.activePositions[params.transferor_stakeholder_id][transferorSecurityId];

        require(transferorActivePosition.quantity >= params.quantity, "Insufficient shares");

        params.nonce++;
        StockIssuance memory transfereeIssuance = TxHelper.createStockIssuanceStructForTransfer(params, params.transferee_stakeholder_id);

        StockIssuanceLib._updateContext(transfereeIssuance, positions, activeSecs, issuer, stockClass);
        StockIssuanceLib._issueStock(transfereeIssuance, transactions);

        uint256 balanceForTransferor = transferorActivePosition.quantity - params.quantity;

        bytes16 balance_security_id;

        params.quantity = balanceForTransferor;
        params.share_price = transferorActivePosition.share_price;
        if (balanceForTransferor > 0) {
            params.nonce++;
            StockIssuance memory transferorBalanceIssuance = TxHelper.createStockIssuanceStructForTransfer(params, params.transferor_stakeholder_id);

            StockIssuanceLib._updateContext(transferorBalanceIssuance, positions, activeSecs, issuer, stockClass);
            StockIssuanceLib._issueStock(transferorBalanceIssuance, transactions);

            balance_security_id = transferorBalanceIssuance.security_id;
        } else {
            balance_security_id = "";
        }

        params.nonce++;
        StockTransfer memory transfer = TxHelper.createStockTransferStruct(
            params.nonce,
            params.quantity,
            transferorSecurityId,
            transfereeIssuance.security_id,
            balance_security_id
        );
        _transferStock(transfer, transactions);

        issuer.shares_issued = issuer.shares_issued.sub(transferorActivePosition.quantity);
        stockClass.shares_issued = stockClass.shares_issued.sub(transferorActivePosition.quantity);

        DeleteContext.deleteActivePosition(params.transferor_stakeholder_id, transferorSecurityId, positions);
        DeleteContext.deleteActiveSecurityIdsByStockClass(params.transferor_stakeholder_id, params.stock_class_id, transferorSecurityId, activeSecs);
    }

    function _transferStock(StockTransfer memory transfer, address[] storage transactions) internal {
        StockTransferTx transferTx = new StockTransferTx(transfer);
        transactions.push(address(transferTx));
        emit StockTransferCreated(transfer);
    }
}
