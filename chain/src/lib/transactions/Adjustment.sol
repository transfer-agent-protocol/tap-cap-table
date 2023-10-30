// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Issuer, StockClass} from "../Structs.sol";
import "../TxHelper.sol";

library Adjustment {
    function adjustIssuerAuthorizedShares(
        uint256 newSharesAuthorized,
        string[] memory comments,
        string memory boardApprovalDate,
        string memory stockholderApprovalDate,
        Issuer storage issuer,
        bytes32[] storage transactions
    ) external {
        IssuerAuthorizedSharesAdjustment memory adjustment = TxHelper.adjustIssuerAuthorizedShares(
            newSharesAuthorized, comments, boardApprovalDate, stockholderApprovalDate, issuer.id
        );
        issuer.shares_authorized = newSharesAuthorized + issuer.shares_authorized; // no need to use SafeMath since 0.8.0
        TxHelper.createTx(TxType.ISSUER_AUTHORIZED_SHARES_ADJUSTMENT, abi.encode(adjustment), transactions);
    }

    // do the above for stock class
    function adjustStockClassAuthorizedShares(
        uint256 newSharesAuthorized,
        string[] memory comments,
        string memory boardApprovalDate,
        string memory stockholderApprovalDate,
        StockClass storage stockClass,
        bytes32[] storage transactions
    ) external {
        uint256 newShares = newSharesAuthorized + stockClass.shares_authorized;
        stockClass.shares_authorized = newShares;

        StockClassAuthorizedSharesAdjustment memory adjustment = TxHelper.adjustStockClassAuthorizedShares(
            newSharesAuthorized, comments, boardApprovalDate, stockholderApprovalDate, stockClass.id
        );
        TxHelper.createTx(TxType.STOCK_CLASS_AUTHORIZED_SHARES_ADJUSTMENT, abi.encode(adjustment), transactions);
    }
}
