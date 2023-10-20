// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "openzeppelin-contracts/contracts/utils/math/SafeMath.sol";
import {Issuer, StockClass} from "../Structs.sol";
import "../TxHelper.sol";

library Adjustment {
    using SafeMath for uint256;
    // combine both
    // 1. Issuer authorized shares adjustment
    // 2. Stock Class authorized shares adjustment

    event IssuerAuthorizedSharesAdjusted(bytes32 txHash);

    event StockClassAuthorizedSharesAdjusted(bytes32 txHash);

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
        IssuerAuthorizedSharesAdjustment memory adjustment = TxHelper.adjustIssuerAuthorizedShares(
            nonce, newSharesAuthorized, comments, boardApprovalDate, stockholderApprovalDate, issuer.id
        );

        issuer.shares_authorized = newSharesAuthorized.add(issuer.shares_authorized);
        bytes32 txHash = keccak256(abi.encode(adjustment));
        transactions.push(txHash);
        emit IssuerAuthorizedSharesAdjusted(txHash);
    }

    // do the above for stock class
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
        StockClassAuthorizedSharesAdjustment memory adjustment = TxHelper.adjustStockClassAuthorizedShares(
            nonce, newSharesAuthorized, comments, boardApprovalDate, stockholderApprovalDate, stockClass.id
        );

        bytes32 txHash = keccak256(abi.encode(adjustment));
        transactions.push(txHash);
        emit StockClassAuthorizedSharesAdjusted(txHash);
    }
}
