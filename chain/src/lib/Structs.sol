// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

struct Issuer {
    bytes16 id;
    string legal_name;
    uint256 shares_issued;
    uint256 shares_authorized;
}

// can be later extended to add things like seniority, conversion_rights, etc.
struct StockClass {
    bytes16 id;
    string class_type; // ["COMMON", "PREFERRED"]
    uint256 price_per_share; // Per-share price this stock class was issued for
    uint256 shares_issued;
    uint256 shares_authorized;
}

struct Stakeholder {
    bytes16 id;
    string stakeholder_type; // ["INDIVIDUAL", "INSTITUTION"]
    string current_relationship; // ["ADVISOR","BOARD_MEMBER","CONSULTANT","EMPLOYEE","EX_ADVISOR" "EX_CONSULTANT","EX_EMPLOYEE","EXECUTIVE","FOUNDER","INVESTOR","NON_US_EMPLOYEE","OFFICER","OTHER"]
}

struct ActivePosition {
    bytes16 stock_class_id;
    uint256 quantity;
    uint256 share_price;
    uint40 timestamp;
}

struct ShareNumbersIssued {
    uint256 starting_share_number;
    uint256 ending_share_number;
}

struct IssuerInitialShares {
    uint256 shares_authorized;
    uint256 shares_issued;
}

struct StockClassInitialShares {
    bytes16 id;
    uint256 shares_authorized;
    uint256 shares_issued;
}

struct InitialShares {
    IssuerInitialShares issuerInitialShares;
    StockClassInitialShares[] stockClassesInitialShares;
}

struct StockCancellation {
    bytes16 id;
    string object_type;
    uint256 quantity;
    string[] comments; // optional
    bytes16 security_id;
    string reason_text; // optional
    bytes16 balance_security_id; // optional
}

struct StockRetraction {
    bytes16 id;
    string object_type;
    string[] comments; // optional
    bytes16 security_id;
    string reason_text; // optional
}

struct StockReissuance {
    bytes16 id;
    string object_type;
    string[] comments; // optional
    bytes16 security_id;
    bytes16[] resulting_security_ids;
    bytes16 split_transaction_id; // not used in MVP
    string reason_text;
}

struct StockRepurchase {
    bytes16 id;
    string object_type;
    string[] comments; // optional
    bytes16 security_id;
    string consideration_text; // optional,
    bytes16 balance_security_id; // optional
    uint256 quantity;
    uint256 price;
}

struct StockAcceptance {
    bytes16 id;
    string object_type;
    bytes16 security_id;
    string[] comments; // optional
}

struct IssuerAuthorizedSharesAdjustment {
    bytes16 id;
    string object_type;
    uint256 new_shares_authorized;
    string[] comments; // optional
    string board_approval_date; // optional
    string stockholder_approval_date; // optional
}

struct StockClassAuthorizedSharesAdjustment {
    bytes16 id;
    string object_type;
    uint256 new_shares_authorized;
    string[] comments; // optional
    string board_approval_date; // optional
    string stockholder_approval_date; // optional
}

// date fields are going to use block timestamp
struct StockIssuance {
    bytes16 id;
    string object_type;
    bytes16 security_id;
    StockIssuanceParams params;
}

struct StockLegendTemplate {
    bytes16 id;
}

struct StockParamsQuantity {
    uint256 nonce;
    uint256 quantity;
    bytes16 stakeholder_id;
    bytes16 stock_class_id;
    bytes16 security_id;
    string[] comments;
    string reason_text;
}

struct StockParams {
    bytes16 stakeholder_id; // not OCF, but required to fetch activePositions
    bytes16 stock_class_id; //  not OCF, but required to fetch activePositions
    bytes16 security_id;
    string[] comments;
    string reason_text;
}

struct StockTransferParams {
    bytes16 transferor_stakeholder_id;
    bytes16 transferee_stakeholder_id;
    bytes16 stock_class_id;
    bool is_buyer_verified;
    uint256 quantity;
    uint256 share_price;
    uint256 nonce;
    string custom_id;
}

struct StockIssuanceParams {
    bytes16 stock_class_id;
    bytes16 stock_plan_id; // Optional
    ShareNumbersIssued share_numbers_issued; // Optional
    uint256 share_price; // OCF Monetary (USD is all that matters). Amount is Numeric: Fixed-point string representation of a number (up to 10 decimal places supported)
    uint256 quantity; // Numeric: Fixed-point string representation of a number (up to 10 decimal places supported)
    bytes16 vesting_terms_id; // Optional
    uint256 cost_basis; // Optional OCF Monetary (USD is all that matters). Amount is Numeric: Fixed-point string representation of a number (up to 10 decimal places supported)
    bytes16[] stock_legend_ids; // Optional
    string issuance_type; // Optional for special types (["RSA", "FOUNDERS_STOCK"],)
    string[] comments; // Optional
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

struct ActivePositions {
    mapping(bytes16 => mapping(bytes16 => ActivePosition)) activePositions;
}

struct SecIdsStockClass {
    mapping(bytes16 => mapping(bytes16 => bytes16[])) activeSecurityIdsByStockClass;
}
