// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { StockRepurchase, ActivePositions, ActivePosition, SecIdsStockClass } from "../Structs.sol";
import "./StockIssuance.sol";
import "../../transactions/StockRepurchaseTX.sol";
import "../TxHelper.sol";
import "../DeleteContext.sol";

library StockRepurchaseLib {
    event StockRepurchaseCreated(StockRepurchase repurchase);

    function repurchaseStockByTA(
        uint256 nonce,
        bytes16 stakeholderId,
        bytes16 stockClassId,
        bytes16 securityId,
        string[] memory comments,
        string memory considerationText,
        uint256 quantity,
        uint256 price,
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
        StockRepurchase memory repurchase = TxHelper.createStockRepurchaseStruct(
            nonce,
            comments,
            securityId,
            considerationText,
            balance_security_id,
            quantity,
            price
        );

        _repurchaseStock(repurchase, transactions);

        DeleteContext.deleteActivePosition(stakeholderId, securityId, positions);
        DeleteContext.deleteActiveSecurityIdsByStockClass(stakeholderId, stockClassId, securityId, activeSecs);
    }

    function _repurchaseStock(StockRepurchase memory repurchase, address[] storage transactions) internal {
        StockRepurchaseTx repurchaseTx = new StockRepurchaseTx(repurchase);
        transactions.push(address(repurchaseTx));
        emit StockRepurchaseCreated(repurchase);
        (repurchase);
    }
}
