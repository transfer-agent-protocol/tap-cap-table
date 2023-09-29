// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import { IssuerAuthorizedSharesAdjustment } from "../lib/Structs.sol";

contract IssuerAuthorizedSharesAdjustmentTx {
    IssuerAuthorizedSharesAdjustment private issuerAuthorizedSharesAdjustment;

    constructor(IssuerAuthorizedSharesAdjustment memory _issuerAuthorizedSharesAdjustment) {
        issuerAuthorizedSharesAdjustment = _issuerAuthorizedSharesAdjustment;
    }
}
