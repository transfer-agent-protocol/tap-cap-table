// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/utils/math/SafeMath.sol";
import { StockRepurchase, ActivePositions, ActivePosition, SecIdsStockClass, Issuer, StockClass, StockTransferTransferParams, StockParamsQuantity } from "../Structs.sol";
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
        StockRepurchase memory repurchase = TxHelper.createStockRepurchaseStruct(params, price);

        _repurchaseStock(repurchase, transactions);

        issuer.shares_issued = issuer.shares_issued.sub(params.quantity);
        stockClass.shares_issued = stockClass.shares_issued.sub(params.quantity);

        DeleteContext.deleteActivePosition(params.stakeholderId, params.securityId, positions);
        DeleteContext.deleteActiveSecurityIdsByStockClass(params.stakeholderId, params.stockClassId, params.securityId, activeSecs);
    }

    function _repurchaseStock(StockRepurchase memory repurchase, address[] storage transactions) internal {
        StockRepurchaseTx repurchaseTx = new StockRepurchaseTx(repurchase);
        transactions.push(address(repurchaseTx));
        emit StockRepurchaseCreated(repurchase);
    }
}
