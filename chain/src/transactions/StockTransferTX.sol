// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import { StockTransfer } from "../lib/Structs.sol";

contract StockTransferTX {
    StockTransfer private stockTransfer;

    event StockTransferCreated(StockTransfer stock);

    constructor(StockTransfer memory _stockTransfer) {
        stockTransfer = _stockTransfer;
        emit StockTransferCreated(_stockTransfer);
    }
}

