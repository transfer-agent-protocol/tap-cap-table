// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import { StockIssuance } from "../lib/Structs.sol";

// if we want to see the stockIssuance struct, we would need to create a getter function.
contract StockIssuanceTx {
    StockIssuance private stockIssuance;

    constructor(StockIssuance memory _stockIssuance) {
        stockIssuance = _stockIssuance;
    }
}
