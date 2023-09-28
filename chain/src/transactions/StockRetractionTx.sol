// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { StockRetraction } from "../lib/Structs.sol";

contract StockRetractionTx {
    StockRetraction private stockRetraction;

    constructor(StockRetraction memory _stockRetraction) {
        stockRetraction = _stockRetraction;
    }
}
