// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {StockAcceptance, ActivePositions, ActivePosition, SecIdsStockClass} from "../Structs.sol";
import "../TxHelper.sol";
import "../DeleteContext.sol";

library StockAcceptanceLib {
    event StockAcceptanceCreated(bytes32 txHash);

    function acceptStockByTA(
        uint256 nonce,
        bytes16 securityId,
        string[] memory comments,
        bytes32[] storage transactions
    ) external {
        nonce++;
        StockAcceptance memory acceptance = TxHelper.createStockAcceptanceStruct(nonce, comments, securityId);

        _acceptStock(acceptance, transactions);
    }

    function _acceptStock(StockAcceptance memory acceptance, bytes32[] storage transactions) internal {
        bytes32 txHash = keccak256(abi.encode(acceptance));
        transactions.push(txHash);
        emit StockAcceptanceCreated(txHash);
    }
}
