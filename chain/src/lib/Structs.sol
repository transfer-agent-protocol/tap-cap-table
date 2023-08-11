// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

struct ShareNumbersIssued {
    uint256 starting_share_number;
    uint256 ending_share_number;
}

// date fields are going to use block timestamp
struct StockIssuance {
    bytes16 id;
    string object_type;
    bytes16 stock_class_id;
    bytes16 stock_plan_id; // Optional
    ShareNumbersIssued share_numbers_issued; // Optional
    uint256 share_price; // OCF Monetary (USD is all that matters). Amount is  Numeric: Fixed-point string representation of a number (up to 10 decimal places supported)
    uint256 quantity; // Numeric: Fixed-point string representation of a number (up to 10 decimal places supported)
    bytes16 vesting_terms_id; // Optional
    uint256 cost_basis; // Optional OCF Monetary (USD is all that matters). Amount is  Numeric: Fixed-point string representation of a number (up to 10 decimal places supported)
    bytes16[] stock_legend_ids; // Optional
    string issuance_type; // Optional for special types (["RSA", "FOUNDERS_STOCK"],)
    string[] comments; // Optional
    bytes16 security_id;
    string custom_id; // Optional (eg R2-D2)
    bytes16 stakeholder_id;
    string board_approval_date; // Optional
    string stockholder_approval_date; // Optional
    string consideration_text; // Optional
    string[] security_law_exemptions; // Unclear
}

// date fields are going to use block timestamp
struct StockTransfer {
    bytes16 id;
    string object_type;
    uint256 quantity;
    string[] comments; // optional
    bytes16 security_id;
    string consideration_text; // optional
    bytes16 balance_security_id; // optional
    bytes16[] resulting_security_ids;
}
