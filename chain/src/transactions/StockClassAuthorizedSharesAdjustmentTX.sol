// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { StockClassAuthorizedSharesAdjustment } from "../lib/Structs.sol";

contract StockClassAuthorizedSharesAdjustmentTx {
    StockClassAuthorizedSharesAdjustment private stockClassAuthorizedSharesAdjustment;

    constructor(StockClassAuthorizedSharesAdjustment memory _stockClassAuthorizedSharesAdjustment) {
        stockClassAuthorizedSharesAdjustment = _stockClassAuthorizedSharesAdjustment;
    }
}
