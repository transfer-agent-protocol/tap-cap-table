// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { StockRepurchase, ActivePositions, ActivePosition, SecIdsStockClass } from "../Structs.sol";
import "./StockIssuance.sol";
import "../../transactions/StockReissuanceTX.sol";
import "../TxHelper.sol";
import "../DeleteContext.sol";

library StockReissuanceLib {
    event StockReissuanceCreated(StockReissuance reissuance);

    function reissueStockByTA(
        uint256 nonce,
        bytes16 stakeholderId,
        bytes16 stockClassId,
        string[] memory comments,
        bytes16 securityId,
        bytes16[] memory resulting_security_ids,
        bytes16 split_transaction_id,
        string memory reason_text,
        ActivePositions storage positions,
        SecIdsStockClass storage activeSecs,
        address[] storage transactions
    ) external {
        nonce++;
        StockReissuance memory reissuance = TxHelper.createStockReissuanceStruct(
            nonce,
            comments,
            securityId,
            resulting_security_ids,
            split_transaction_id,
            reason_text
        );

        _reissueStock(reissuance, transactions);

        DeleteContext.deleteActivePosition(stakeholderId, securityId, positions);
        DeleteContext.deleteActiveSecurityIdsByStockClass(stakeholderId, stockClassId, securityId, activeSecs);
    }

    function _reissueStock(StockReissuance memory reissuance, address[] storage transactions) internal {
        StockReissuanceTx reissuanceTx = new StockReissuanceTx(reissuance);
        transactions.push(address(reissuanceTx));
        emit StockReissuanceCreated(reissuance);
    }
}
