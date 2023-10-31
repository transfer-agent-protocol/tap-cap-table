// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/utils/math/SafeMath.sol";
import { StockRetraction, ActivePositions, ActivePosition, SecIdsStockClass, StockClass, Issuer, StockParams } from "../Structs.sol";
import "./StockIssuance.sol";
import "../../transactions/StockRetractionTX.sol";
import "../TxHelper.sol";
import "../DeleteContext.sol";
import "./StockIssuance.sol";

library StockRetractionLib {
    using SafeMath for uint256;

    event StockRetractionCreated(StockRetraction retraction);

    function retractStockIssuanceByTA(
        StockParams memory params,
        uint256 nonce,
        ActivePositions storage positions,
        SecIdsStockClass storage activeSecs,
        address[] storage transactions,
        Issuer storage issuer,
        StockClass storage stockClass
    ) external {
        ActivePosition memory activePosition = positions.activePositions[params.stakeholderId][params.securityId];

        //TODO: require active position exists.

        nonce++;
        StockRetraction memory retraction = TxHelper.createStockRetractionStruct(nonce, params.comments, params.securityId, params.reasonText);
        _retractStock(retraction, transactions);

        issuer.shares_issued = issuer.shares_issued.sub(activePosition.quantity);
        stockClass.shares_issued = stockClass.shares_issued.sub(activePosition.quantity);

        DeleteContext.deleteActivePosition(params.stakeholderId, params.securityId, positions);
        DeleteContext.deleteActiveSecurityIdsByStockClass(params.stakeholderId, params.stockClassId, params.securityId, activeSecs);
    }

    function _retractStock(StockRetraction memory retraction, address[] storage transactions) internal {
        StockRetractionTx retractionTx = new StockRetractionTx(retraction);
        transactions.push(address(retractionTx));
        emit StockRetractionCreated(retraction);
    }
}
