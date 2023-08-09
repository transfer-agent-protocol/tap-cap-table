// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

// @dev are unique identifiers in solidity are bytes32?
// date fields are going to use block timestamp
struct StockIssuance {
    string id;
    string object_type;
    string stock_class_id;
    string stock_plan_id; // Optional
    int share_price; // OCF Monetary (USD is all that matters). Amount is  Numeric: Fixed-point string representation of a number (up to 10 decimal places supported)
    uint256 quantity; // Numeric: Fixed-point string representation of a number (up to 10 decimal places supported)
    string vesting_terms_id; // Optional
    string cost_basis; // Optional OCF Monetary (USD is all that matters). Amount is  Numeric: Fixed-point string representation of a number (up to 10 decimal places supported)
    string[] stock_legend_ids; // Optional
    string issuance_type; // Optional for special types (["RSA", "FOUNDERS_STOCK"],)
    string[] comments; // Optional
    string security_id;
    string stakeholder_id;
    string board_approval_date; // Optional
    string stockholder_approval_date; // Optional
    string consideration_text; // Optional
    string[] security_law_exemptions; // Unclear
}

// @dev are unique identifiers in solidity are bytes32?
// date fields are going to use block timestamp
struct StockTransfer {
    string id;
    string object_type;
    uint256 quantity;
    string[] comments; // optional
    string security_id;
    string consideration_text; // optional
    string balance_security_id; // optional
    string[] resulting_security_ids;
}
