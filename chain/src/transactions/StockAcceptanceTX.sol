// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { StockAcceptance } from "../lib/Structs.sol";

contract StockAcceptanceTx {
    StockAcceptance private stockAcceptance;

    constructor(StockAcceptance memory _stockAcceptance) {
        stockAcceptance = _stockAcceptance;
    }
}
