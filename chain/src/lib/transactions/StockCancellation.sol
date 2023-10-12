// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/utils/math/SafeMath.sol";
import { StockCancellation, ActivePositions, ActivePosition, SecIdsStockClass, Issuer, StockClass } from "../Structs.sol";
import "./StockIssuance.sol";
import "../../transactions/StockCancellationTX.sol";
import "../TxHelper.sol";
import "../DeleteContext.sol";

library StockCancellationLib {
    using SafeMath for uint256;

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
        address[] storage transactions,
        Issuer storage issuer,
        StockClass storage stockClass
    ) external {
        ActivePosition memory activePosition = positions.activePositions[stakeholderId][securityId];

        require(activePosition.quantity >= quantity, "Insufficient shares");

        uint256 remainingQuantity = activePosition.quantity - quantity;
        bytes16 balance_security_id;

        if (remainingQuantity > 0) {
            nonce = nonce.add(1);

            StockIssuance memory balanceIssuance = TxHelper.createStockIssuanceStructForTransfer(
                nonce,
                stakeholderId,
                remainingQuantity,
                activePosition.share_price,
                stockClassId
            );

            StockIssuanceLib._updateContext(balanceIssuance, positions, activeSecs, issuer, stockClass);
            StockIssuanceLib._issueStock(balanceIssuance, transactions);

            balance_security_id = balanceIssuance.security_id;
        } else {
            balance_security_id = "";
        }

        nonce = nonce.add(1);
        StockCancellation memory cancellation = TxHelper.createStockCancellationStruct(
            nonce,
            quantity,
            comments,
            securityId,
            reasonText,
            balance_security_id
        );
        _cancelStock(cancellation, transactions);

        issuer.shares_issued = issuer.shares_issued.sub(quantity);
        stockClass.shares_issued = stockClass.shares_issued.sub(quantity);

        DeleteContext.deleteActivePosition(stakeholderId, securityId, positions);
        DeleteContext.deleteActiveSecurityIdsByStockClass(stakeholderId, stockClassId, securityId, activeSecs);
    }

    function _cancelStock(StockCancellation memory cancellation, address[] storage transactions) internal {
        StockCancellationTx cancellationTx = new StockCancellationTx(cancellation);
        transactions.push(address(cancellationTx));
        emit StockCancellationCreated(cancellation);
    }
}
