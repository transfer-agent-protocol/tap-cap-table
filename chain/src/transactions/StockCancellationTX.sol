// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { StockCancellation } from "../lib/Structs.sol";

contract StockCancellationTx {
    StockCancellation private stockCancellation;

    constructor(StockCancellation memory _stockCancellation) {
        stockCancellation = _stockCancellation;
    }
}
