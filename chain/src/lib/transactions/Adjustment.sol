// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { Issuer, StockClass } from "../Structs.sol";
import { TxHelper, TxType, IssuerAuthorizedSharesAdjustment, StockClassAuthorizedSharesAdjustment } from "../TxHelper.sol";

library Adjustment {
    function adjustIssuerAuthorizedShares(
        uint256 nonce,
        uint256 newSharesAuthorized,
        string[] memory comments,
        string memory boardApprovalDate,
        string memory stockholderApprovalDate,
        Issuer storage issuer,
        bytes[] storage transactions
    ) external {
        nonce++;
        IssuerAuthorizedSharesAdjustment memory adjustment = TxHelper.adjustIssuerAuthorizedShares(
            nonce,
            newSharesAuthorized,
            comments,
            boardApprovalDate,
            stockholderApprovalDate,
            issuer.id
        );

        issuer.shares_authorized = newSharesAuthorized;

        TxHelper.createTx(TxType.ISSUER_AUTHORIZED_SHARES_ADJUSTMENT, abi.encode(adjustment), transactions);
    }

    function adjustStockClassAuthorizedShares(
        uint256 nonce,
        uint256 newSharesAuthorized,
        string[] memory comments,
        string memory boardApprovalDate,
        string memory stockholderApprovalDate,
        StockClass storage stockClass,
        bytes[] storage transactions
    ) external {
        nonce++;
        StockClassAuthorizedSharesAdjustment memory adjustment = TxHelper.adjustStockClassAuthorizedShares(
            nonce,
            newSharesAuthorized,
            comments,
            boardApprovalDate,
            stockholderApprovalDate,
            stockClass.id
        );

        stockClass.shares_authorized = newSharesAuthorized;

        TxHelper.createTx(TxType.STOCK_CLASS_AUTHORIZED_SHARES_ADJUSTMENT, abi.encode(adjustment), transactions);
    }
}
