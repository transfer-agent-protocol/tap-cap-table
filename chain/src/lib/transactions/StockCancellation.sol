// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/utils/math/SafeMath.sol";
import { StockCancellation, ActivePositions, ActivePosition, SecIdsStockClass, Issuer, StockClass, StockParamsQuantity, StockTransferTransferParams } from "../Structs.sol";
import "./StockIssuance.sol";
import "../../transactions/StockCancellationTX.sol";
import "../TxHelper.sol";
import "../DeleteContext.sol";

library StockCancellationLib {
    using SafeMath for uint256;

    event StockCancellationCreated(StockCancellation cancellation);

    function cancelStockByTA(
        StockParamsQuantity memory params,
        ActivePositions storage positions,
        SecIdsStockClass storage activeSecs,
        address[] storage transactions,
        Issuer storage issuer,
        StockClass storage stockClass
    ) external {
        ActivePosition memory activePosition = positions.activePositions[params.stakeholderId][params.securityId];

        require(activePosition.quantity >= params.quantity, "Insufficient shares");

        uint256 remainingQuantity = activePosition.quantity - params.quantity;
        bytes16 balance_security_id;

        if (remainingQuantity > 0) {
            // issue balance
            params.nonce++;

            StockTransferTransferParams memory transferParams = StockTransferTransferParams(
                params.stakeholderId,
                bytes16(0),
                params.stockClassId,
                true,
                remainingQuantity,
                activePosition.share_price,
                params.nonce
            );
            StockIssuance memory balanceIssuance = TxHelper.createStockIssuanceStructForTransfer(transferParams, transferParams.stockClassId);

            StockIssuanceLib._updateContext(balanceIssuance, positions, activeSecs, issuer, stockClass);
            StockIssuanceLib._issueStock(balanceIssuance, transactions);

            balance_security_id = balanceIssuance.security_id;
        } else {
            balance_security_id = "";
        }

        params.nonce++;
        StockCancellation memory cancellation = TxHelper.createStockCancellationStruct(
            params.nonce,
            params.quantity,
            params.comments,
            params.securityId,
            params.reasonText,
            balance_security_id
        );
        _cancelStock(cancellation, transactions);

        issuer.shares_issued = issuer.shares_issued.sub(params.quantity);
        stockClass.shares_issued = stockClass.shares_issued.sub(params.quantity);

        DeleteContext.deleteActivePosition(params.stakeholderId, params.securityId, positions);
        DeleteContext.deleteActiveSecurityIdsByStockClass(params.stakeholderId, params.stockClassId, params.securityId, activeSecs);
    }

    function _cancelStock(StockCancellation memory cancellation, address[] storage transactions) internal {
        StockCancellationTx cancellationTx = new StockCancellationTx(cancellation);
        transactions.push(address(cancellationTx));
        emit StockCancellationCreated(cancellation);
    }
}
