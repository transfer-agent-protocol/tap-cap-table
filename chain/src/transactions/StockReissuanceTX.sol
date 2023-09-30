// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { StockReissuance } from "../lib/Structs.sol";

contract StockReissuanceTx {
    StockReissuance private stockReissuance;

    constructor(StockReissuance memory _stockReissuance) {
        stockReissuance = _stockReissuance;
    }
}
