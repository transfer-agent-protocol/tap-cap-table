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
        ActivePosition memory activePosition = positions.activePositions[params.stakeholder_id][params.security_id];

        require(activePosition.quantity >= params.quantity, "Insufficient shares");

        uint256 remainingQuantity = activePosition.quantity - params.quantity;
        bytes16 balance_security_id;

        if (remainingQuantity > 0) {
            // issue balance
            params.nonce++;

            StockTransferTransferParams memory transferParams = StockTransferTransferParams(
                params.stakeholder_id,
                bytes16(0),
                params.stock_class_id,
                true,
                remainingQuantity,
                activePosition.share_price,
                params.nonce
            );
            StockIssuance memory balanceIssuance = TxHelper.createStockIssuanceStructForTransfer(transferParams, transferParams.stock_class_id);

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
            params.security_id,
            params.reason_text,
            balance_security_id
        );
        _cancelStock(cancellation, transactions);

        issuer.shares_issued = issuer.shares_issued.sub(params.quantity);
        stockClass.shares_issued = stockClass.shares_issued.sub(params.quantity);

        DeleteContext.deleteActivePosition(params.stakeholder_id, params.security_id, positions);
        DeleteContext.deleteActiveSecurityIdsByStockClass(params.stakeholder_id, params.stock_class_id, params.security_id, activeSecs);
    }

    function _cancelStock(StockCancellation memory cancellation, address[] storage transactions) internal {
        StockCancellationTx cancellationTx = new StockCancellationTx(cancellation);
        transactions.push(address(cancellationTx));
        emit StockCancellationCreated(cancellation);
    }
}
