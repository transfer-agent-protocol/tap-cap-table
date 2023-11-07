// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/utils/math/SafeMath.sol";
import { StockRepurchase, ActivePositions, ActivePosition, SecIdsStockClass, Issuer, StockClass, StockTransferParams, StockParamsQuantity } from "../Structs.sol";
import "./StockIssuance.sol";
import "../../transactions/StockRepurchaseTX.sol";
import "../TxHelper.sol";
import "../DeleteContext.sol";

library StockRepurchaseLib {
    using SafeMath for uint256;

    event StockRepurchaseCreated(StockRepurchase repurchase);

    function repurchaseStockByTA(
        StockParamsQuantity memory params,
        uint256 price,
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

            StockTransferParams memory transferParams = StockTransferParams(
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
        StockRepurchase memory repurchase = TxHelper.createStockRepurchaseStruct(params, price);

        _repurchaseStock(repurchase, transactions);

        issuer.shares_issued = issuer.shares_issued.sub(params.quantity);
        stockClass.shares_issued = stockClass.shares_issued.sub(params.quantity);

        DeleteContext.deleteActivePosition(params.stakeholder_id, params.security_id, positions);
        DeleteContext.deleteActiveSecurityIdsByStockClass(params.stakeholder_id, params.stock_class_id, params.security_id, activeSecs);
    }

    function _repurchaseStock(StockRepurchase memory repurchase, address[] storage transactions) internal {
        StockRepurchaseTx repurchaseTx = new StockRepurchaseTx(repurchase);
        transactions.push(address(repurchaseTx));
        emit StockRepurchaseCreated(repurchase);
    }
}
