// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { Issuer, StockClass } from "../Structs.sol";
import "../TxHelperTaek.sol";
import "../../transactions/IssuerAuthorizedSharesAdjustmentTX.sol";
import "../../transactions/StockClassAuthorizedSharesAdjustmentTX.sol";

library AdjustmentTaek {
    function adjustIssuerAuthorizedShares(
        uint256 nonce,
        uint256 newSharesAuthorized,
        string[] memory comments,
        string memory boardApprovalDate,
        string memory stockholderApprovalDate,
        Issuer storage issuer,
        bytes32[] storage transactions
    ) external {
        nonce++;
        IssuerAuthorizedSharesAdjustment memory adjustment = TxHelperTaek.adjustIssuerAuthorizedShares(
            nonce,
            newSharesAuthorized,
            comments,
            boardApprovalDate,
            stockholderApprovalDate,
            issuer.id
        );

        issuer.shares_authorized = newSharesAuthorized + issuer.shares_authorized;

        TxHelperTaek.createTx(TxType.ISSUER_AUTHORIZED_SHARES_ADJUSTMENT, abi.encode(adjustment), transactions);
    }

    function adjustStockClassAuthorizedShares(
        uint256 nonce,
        uint256 newSharesAuthorized,
        string[] memory comments,
        string memory boardApprovalDate,
        string memory stockholderApprovalDate,
        StockClass storage stockClass,
        bytes32[] storage transactions
    ) external {
        uint256 newShares = newSharesAuthorized + stockClass.shares_authorized;
        stockClass.shares_authorized = newShares;

        nonce++;
        StockClassAuthorizedSharesAdjustment memory adjustment = TxHelperTaek.adjustStockClassAuthorizedShares(
            nonce,
            newSharesAuthorized,
            comments,
            boardApprovalDate,
            stockholderApprovalDate,
            stockClass.id
        );

        TxHelperTaek.createTx(TxType.STOCK_CLASS_AUTHORIZED_SHARES_ADJUSTMENT, abi.encode(adjustment), transactions);
    }
}
