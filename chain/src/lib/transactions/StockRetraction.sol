// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { StockRetraction, ActivePositions, ActivePosition, SecIdsStockClass } from "../Structs.sol";
import "./StockIssuance.sol";
import "../../transactions/StockRetractionTX.sol";
import "../TxHelper.sol";
import "../DeleteContext.sol";

library StockRetractionLib {
    event StockRetractionCreated(StockRetraction retraction);

    function retractStockIssuanceByTA(
        uint256 nonce,
        bytes16 stakeholderId,
        bytes16 stockClassId,
        bytes16 securityId,
        string[] memory comments,
        string memory reasonText,
        ActivePositions storage positions,
        SecIdsStockClass storage activeSecs,
        address[] storage transactions
    ) external {
        ActivePosition memory activePosition = positions.activePositions[stakeholderId][securityId];

        //TODO: require active position exists.

        nonce++;
        StockRetraction memory retraction = TxHelper.createStockRetractionStruct(nonce, comments, securityId, reasonText);
        _retractStock(retraction, transactions);

        DeleteContext.deleteActivePosition(stakeholderId, securityId, positions);
        DeleteContext.deleteActiveSecurityIdsByStockClass(stakeholderId, stockClassId, securityId, activeSecs);
    }

    function _retractStock(StockRetraction memory retraction, address[] storage transactions) internal {
        StockRetractionTx retractionTx = new StockRetractionTx(retraction);
        transactions.push(address(retractionTx));
        emit StockRetractionCreated(retraction);
    }
}
