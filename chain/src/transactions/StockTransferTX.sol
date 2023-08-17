// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import { StockTransfer } from "../lib/Structs.sol";

contract StockTransferTx {
    StockTransfer private stockTransfer;

    constructor(StockTransfer memory _stockTransfer) {
        stockTransfer = _stockTransfer;
    }
}
