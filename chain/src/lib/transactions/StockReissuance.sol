// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/utils/math/SafeMath.sol";
import { StockRepurchase, ActivePositions, ActivePosition, SecIdsStockClass, Issuer, StockClass, StockParams } from "../Structs.sol";
import "./StockIssuance.sol";
import "../../transactions/StockReissuanceTX.sol";
import "../TxHelper.sol";
import "../DeleteContext.sol";

// In the MVP, reissuances are meant to fix issuance mistakes.
// It's a manual process of 1. Creating a new issuance and 2. Passing the new issuance security ID as a resulting security ID
library StockReissuanceLib {
    using SafeMath for uint256;

    event StockReissuanceCreated(StockReissuance reissuance);

    function reissueStockByTA(
        StockParams memory params,
        uint256 nonce,
        bytes16[] memory resulting_security_ids,
        ActivePositions storage positions,
        SecIdsStockClass storage activeSecs,
        address[] storage transactions,
        Issuer storage issuer,
        StockClass storage stockClass
    ) external {
        ActivePosition memory activePosition = positions.activePositions[params.stakeholder_id][params.security_id];

        nonce++;
        StockReissuance memory reissuance = TxHelper.createStockReissuanceStruct(
            nonce,
            params.comments,
            params.security_id,
            resulting_security_ids,
            params.reason_text
        );

        _reissueStock(reissuance, transactions);

        issuer.shares_issued = issuer.shares_issued.sub(activePosition.quantity);
        stockClass.shares_issued = stockClass.shares_issued.sub(activePosition.quantity);

        DeleteContext.deleteActivePosition(params.stakeholder_id, params.security_id, positions);
        DeleteContext.deleteActiveSecurityIdsByStockClass(params.stakeholder_id, params.stock_class_id, params.security_id, activeSecs);
    }

    function _reissueStock(StockReissuance memory reissuance, address[] storage transactions) internal {
        StockReissuanceTx reissuanceTx = new StockReissuanceTx(reissuance);
        transactions.push(address(reissuanceTx));
        emit StockReissuanceCreated(reissuance);
    }
}
