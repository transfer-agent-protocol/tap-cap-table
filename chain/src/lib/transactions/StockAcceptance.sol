// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { StockAcceptance, ActivePositions, ActivePosition, SecIdsStockClass } from "../Structs.sol";
import "../../transactions/StockAcceptanceTX.sol";
import "../TxHelper.sol";
import "../DeleteContext.sol";

library StockAcceptanceLib {
    event StockAcceptanceCreated(StockAcceptance acceptance);

    function acceptStockByTA(uint256 nonce, bytes16 securityId, string[] memory comments, address[] storage transactions) external {
        nonce++;
        StockAcceptance memory acceptance = TxHelper.createStockAcceptanceStruct(nonce, comments, securityId);

        _acceptStock(acceptance, transactions);
    }

    function _acceptStock(StockAcceptance memory acceptance, address[] storage transactions) internal {
        StockAcceptanceTx acceptanceTx = new StockAcceptanceTx(acceptance);
        transactions.push(address(acceptanceTx));
        emit StockAcceptanceCreated(acceptance);
    }
}
