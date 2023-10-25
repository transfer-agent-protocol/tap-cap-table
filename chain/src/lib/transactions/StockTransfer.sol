// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { StockTransferTransferParams, StockIssuance, ActivePosition, ActivePositions, SecIdsStockClass, StockTransfer, Issuer, StockClass } from "../Structs.sol";
import "./StockIssuance.sol";
import "../../transactions/StockTransferTX.sol";
import "../TxHelper.sol";
import "../DeleteContext.sol";

// TODO: use SafeMath
library StockTransferLib {
    using SafeMath for uint256;

    event StockTransferCreated(StockTransfer transfer);

    function transferStock(
        StockTransferTransferParams memory params,
        // bytes16 transferorStakeholderId,
        // bytes16 transfereeStakeholderId,
        // bytes16 stockClassId, // TODO: verify that we would have fong would have the stock class
        // bool isBuyerVerified,
        // uint256 quantity,
        // uint256 share_price,
        // uint256 nonce,
        ActivePositions storage positions,
        SecIdsStockClass storage activeSecs,
        address[] storage transactions,
        Issuer storage issuer,
        StockClass storage stockClass
    ) external {
        // Checks related to transaction validity
        require(params.isBuyerVerified, "Buyer unverified");
        require(params.quantity > 0, "Invalid quantity");
        require(params.share_price > 0, "Invalid price");

        require(
            activeSecs.activeSecurityIdsByStockClass[params.transferorStakeholderId][params.stockClassId].length > 0,
            "No active security ids found"
        );
        bytes16[] memory activeSecurityIDs = activeSecs.activeSecurityIdsByStockClass[params.transferorStakeholderId][params.stockClassId];

        uint256 sum = 0;
        uint256 numSecurityIds = 0;

        for (uint256 index = 0; index < activeSecurityIDs.length; index++) {
            ActivePosition memory activePosition = positions.activePositions[params.transferorStakeholderId][activeSecurityIDs[index]];
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
            ActivePosition memory activePosition = positions.activePositions[params.transferorStakeholderId][activeSecurityIDs[index]];

            uint256 transferQuantity; // This will be the quantity to transfer in this iteration

            if (activePosition.quantity <= remainingQuantity) {
                transferQuantity = activePosition.quantity;
            } else {
                transferQuantity = remainingQuantity;
            }

            StockTransferTransferParams memory newParams = params;
            newParams.quantity = transferQuantity;

            _transferSingleStock(
                newParams,
                // transferorStakeholderId,
                // transfereeStakeholderId,
                // stockClassId,
                // transferQuantity,
                // share_price,
                activeSecurityIDs[index],
                // nonce,
                positions,
                activeSecs,
                transactions,
                issuer,
                stockClass
            );

            remainingQuantity -= transferQuantity; // Reduce the remaining quantity

            // If there's no more quantity left to transfer, break out of the loop
            if (remainingQuantity == 0) {
                break;
            }
        }
    }

    // isBuyerVerified is a placeholder for a signature, account or hash that confirms the buyer's identity.
    function _transferSingleStock(
        StockTransferTransferParams memory params,
        // bytes16 transferorStakeholderId,
        // bytes16 transfereeStakeholderId,
        // bytes16 stockClassId,
        // uint256 quantity,
        // uint256 sharePrice,
        bytes16 securityId,
        // uint256 nonce,
        ActivePositions storage positions,
        SecIdsStockClass storage activeSecs,
        address[] storage transactions,
        Issuer storage issuer,
        StockClass storage stockClass
    ) internal {
        bytes16 transferorSecurityId = securityId;
        ActivePosition memory transferorActivePosition = positions.activePositions[params.transferorStakeholderId][transferorSecurityId];

        require(transferorActivePosition.quantity >= params.quantity, "Insufficient shares");

        params.nonce++;
        StockIssuance memory transfereeIssuance = TxHelper.createStockIssuanceStructForTransfer(
            // params.nonce,
            // params.transfereeStakeholderId,
            // params.quantity,
            // // sharePrice,
            // params.share_price,
            // params.stockClassId
            params,
            params.stockClassId
        );

        StockIssuanceLib._updateContext(transfereeIssuance, positions, activeSecs, issuer, stockClass);
        StockIssuanceLib._issueStock(transfereeIssuance, transactions);

        uint256 balanceForTransferor = transferorActivePosition.quantity - params.quantity;

        bytes16 balance_security_id;

        params.quantity = balanceForTransferor;
        params.share_price = transferorActivePosition.share_price;
        if (balanceForTransferor > 0) {
            params.nonce++;
            StockIssuance memory transferorBalanceIssuance = TxHelper.createStockIssuanceStructForTransfer(
                // params.nonce,
                // params.transferorStakeholderId,
                // balanceForTransferor,
                // transferorActivePosition.share_price,
                // params.stockClassId
                params,
                securityId
            );

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

        DeleteContext.deleteActivePosition(params.transferorStakeholderId, transferorSecurityId, positions);
        DeleteContext.deleteActiveSecurityIdsByStockClass(params.transferorStakeholderId, params.stockClassId, transferorSecurityId, activeSecs);
    }

    function _transferStock(StockTransfer memory transfer, address[] storage transactions) internal {
        StockTransferTx transferTx = new StockTransferTx(transfer);
        transactions.push(address(transferTx));
        emit StockTransferCreated(transfer);
    }
}
