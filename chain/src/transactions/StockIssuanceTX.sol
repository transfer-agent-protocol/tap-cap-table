// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import { StockIssuance } from "../lib/Structs.sol";

contract StockIssuanceTX {
    StockIssuance private stockIssuance;

    event StockIssuanceCreated(StockIssuance stock);

    constructor(StockIssuance memory _stockIssuance) {
        stockIssuance = _stockIssuance;
        emit StockIssuanceCreated(_stockIssuance);
    }
}
