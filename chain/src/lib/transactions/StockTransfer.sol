// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { StockIssuance, ActivePosition, ActivePositions, SecIdsStockClass, StockTransfer } from "../Structs.sol";
import "./StockIssuance.sol";
import "../../transactions/StockTransferTX.sol";
import "../TxHelper.sol";
import "../DeleteContext.sol";

library StockTransferLib {
    event StockTransferCreated(StockTransfer transfer);

    function transferStock(
        bytes16 transferorStakeholderId,
        bytes16 transfereeStakeholderId,
        bytes16 stockClassId, // TODO: verify that we would have fong would have the stock class
        bool isBuyerVerified,
        uint256 quantity,
        uint256 share_price,
        uint256 nonce,
        ActivePositions storage positions,
        SecIdsStockClass storage activeSecs,
        address[] storage transactions
    ) external {
        // Checks related to transaction validity
        require(isBuyerVerified, "Buyer unverified");
        require(quantity > 0, "Invalid quantity");
        require(share_price > 0, "Invalid price");

        require(activeSecs.activeSecurityIdsByStockClass[transferorStakeholderId][stockClassId].length > 0, "No active security ids found");
        bytes16[] memory activeSecurityIDs = activeSecs.activeSecurityIdsByStockClass[transferorStakeholderId][stockClassId];

        uint256 sum = 0;
        uint256 numSecurityIds = 0;

        for (uint256 index = 0; index < activeSecurityIDs.length; index++) {
            ActivePosition memory activePosition = positions.activePositions[transferorStakeholderId][activeSecurityIDs[index]];
            sum += activePosition.quantity;

            if (sum >= quantity) {
                numSecurityIds += 1;
                break;
            } else {
                numSecurityIds += 1;
            }
        }

        require(quantity <= sum, "insufficient shares");

        uint256 remainingQuantity = quantity; // This will keep track of the remaining quantity to be transferred

        for (uint256 index = 0; index < numSecurityIds; index++) {
            ActivePosition memory activePosition = positions.activePositions[transferorStakeholderId][activeSecurityIDs[index]];

            uint256 transferQuantity; // This will be the quantity to transfer in this iteration

            if (activePosition.quantity <= remainingQuantity) {
                transferQuantity = activePosition.quantity;
            } else {
                transferQuantity = remainingQuantity;
            }

            _transferSingleStock(
                transferorStakeholderId,
                transfereeStakeholderId,
                stockClassId,
                transferQuantity,
                share_price,
                activeSecurityIDs[index],
                nonce,
                positions,
                activeSecs,
                transactions
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
        bytes16 transferorStakeholderId,
        bytes16 transfereeStakeholderId,
        bytes16 stockClassId,
        uint256 quantity,
        uint256 sharePrice,
        bytes16 securityId,
        uint256 nonce,
        ActivePositions storage positions,
        SecIdsStockClass storage activeSecs,
        address[] storage transactions
    ) internal {
        bytes16 transferorSecurityId = securityId;
        ActivePosition memory transferorActivePosition = positions.activePositions[transferorStakeholderId][transferorSecurityId];

        require(transferorActivePosition.quantity >= quantity, "Insufficient shares");

        nonce++; // verify this is correct.
        StockIssuance memory transfereeIssuance = TxHelper.createStockIssuanceStructForTransfer(
            nonce,
            transfereeStakeholderId,
            quantity,
            sharePrice,
            stockClassId
        );

        StockIssuanceLib._updateContext(transfereeIssuance, positions, activeSecs);
        StockIssuanceLib._issueStock(transfereeIssuance, transactions);

        uint256 balanceForTransferor = transferorActivePosition.quantity - quantity;

        bytes16 balance_security_id;

        if (balanceForTransferor > 0) {
            nonce++;
            StockIssuance memory transferorBalanceIssuance = TxHelper.createStockIssuanceStructForTransfer(
                nonce,
                transferorStakeholderId,
                balanceForTransferor,
                transferorActivePosition.share_price,
                stockClassId
            );

            StockIssuanceLib._updateContext(transferorBalanceIssuance, positions, activeSecs);
            StockIssuanceLib._issueStock(transferorBalanceIssuance, transactions);

            balance_security_id = transferorBalanceIssuance.security_id;
        } else {
            balance_security_id = "";
        }

        nonce++;
        StockTransfer memory transfer = TxHelper.createStockTransferStruct(
            nonce,
            quantity,
            transferorSecurityId,
            transfereeIssuance.security_id,
            balance_security_id
        );
        _transferStock(transfer, transactions);

        DeleteContext.deleteActivePosition(transferorStakeholderId, transferorSecurityId, positions);
        DeleteContext.deleteActiveSecurityIdsByStockClass(transferorStakeholderId, stockClassId, transferorSecurityId, activeSecs);
    }

    function _transferStock(StockTransfer memory transfer, address[] storage transactions) internal {
        StockTransferTx transferTx = new StockTransferTx(transfer);
        transactions.push(address(transferTx));
        emit StockTransferCreated(transfer);
    }
}
