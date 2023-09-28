// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { StockRepurchase } from "../lib/Structs.sol";

// if we want to see the stockIssuance struct, we would need to create a getter function.
contract StockRepurchaseTx {
    StockRepurchase private stockRepurchase;

    constructor(StockRepurchase memory _stockRepurchase) {
        stockRepurchase = _stockRepurchase;
    }
}
