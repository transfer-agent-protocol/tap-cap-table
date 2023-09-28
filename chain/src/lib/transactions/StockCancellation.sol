// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { StockCancellation, ActivePositions, ActivePosition, SecIdsStockClass } from "../Structs.sol";
import "./StockIssuance.sol";
import "../../transactions/StockCancellationTX.sol";
import "../TxHelper.sol";
import "../DeleteContext.sol";

library StockCancellationLib {
    event StockCancellationCreated(StockCancellation cancellation);

    function cancelStockByTA(
        uint256 nonce,
        bytes16 stakeholderId,
        bytes16 stockClassId,
        bytes16 securityId,
        string[] memory comments,
        string memory reasonText,
        uint256 quantity,
        ActivePositions storage positions,
        SecIdsStockClass storage activeSecs,
        address[] storage transactions
    ) external {
        ActivePosition memory activePosition = positions.activePositions[stakeholderId][securityId];

        require(activePosition.quantity >= quantity, "Insufficient shares");

        uint256 remainingQuantity = activePosition.quantity - quantity;
        bytes16 balance_security_id;

        if (remainingQuantity > 0) {
            // issue balance
            nonce++;

            StockIssuance memory balanceIssuance = TxHelper.createStockIssuanceStructForTransfer(
                nonce,
                stakeholderId,
                remainingQuantity,
                activePosition.share_price,
                stockClassId
            );

            StockIssuanceLib._updateContext(balanceIssuance, positions, activeSecs);
            StockIssuanceLib._issueStock(balanceIssuance, transactions);

            balance_security_id = balanceIssuance.security_id;
        } else {
            balance_security_id = "";
        }

        nonce++;
        StockCancellation memory cancellation = TxHelper.createStockCancellationStruct(
            nonce,
            quantity,
            comments,
            securityId,
            reasonText,
            balance_security_id
        );
        _cancelStock(cancellation, transactions);

        DeleteContext.deleteActivePosition(stakeholderId, securityId, positions);
        DeleteContext.deleteActiveSecurityIdsByStockClass(stakeholderId, stockClassId, securityId, activeSecs);
    }

    function _cancelStock(StockCancellation memory cancellation, address[] storage transactions) internal {
        StockCancellationTx cancellationTx = new StockCancellationTx(cancellation);
        transactions.push(address(cancellationTx));
        emit StockCancellationCreated(cancellation);
    }
}
