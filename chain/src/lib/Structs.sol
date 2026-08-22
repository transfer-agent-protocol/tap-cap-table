// SPDX-License-Identifier: BUSL-1.1
pragma solidity ^0.8.30;

struct Issuer {
    bytes16 id;
    string legal_name;
    uint256 shares_issued;
    uint256 shares_authorized;
}

struct StockClass {
    bytes16 id;
    string class_type; // OCF string; not validated onchain
    uint256 price_per_share;
    uint256 shares_issued;
    uint256 shares_authorized;
}

struct Stakeholder {
    bytes16 id;
    string stakeholder_type; // OCF string; not validated onchain
    string current_relationship; // OCF string; not validated onchain
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
    string[] comments;
    bytes16 security_id;
    string reason_text;
    bytes16 balance_security_id;
}

struct StockRetraction {
    bytes16 id;
    string object_type;
    string[] comments;
    bytes16 security_id;
    string reason_text;
}

struct StockReissuance {
    bytes16 id;
    string object_type;
    string[] comments;
    bytes16 security_id;
    bytes16[] resulting_security_ids;
    bytes16 split_transaction_id;
    string reason_text;
}

struct StockRepurchase {
    bytes16 id;
    string object_type;
    string[] comments;
    bytes16 security_id;
    string consideration_text;
    bytes16 balance_security_id;
    uint256 quantity;
    uint256 price;
}

struct StockAcceptance {
    bytes16 id;
    string object_type;
    bytes16 security_id;
    string[] comments;
}

struct IssuerAuthorizedSharesAdjustment {
    bytes16 id;
    string object_type;
    uint256 new_shares_authorized;
    string[] comments;
    string board_approval_date;
    string stockholder_approval_date;
}

struct StockClassAuthorizedSharesAdjustment {
    bytes16 id;
    string object_type;
    uint256 new_shares_authorized;
    string[] comments;
    string board_approval_date;
    string stockholder_approval_date;
}

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

/// @dev stakeholder_id and stock_class_id are not OCF fields; they are required to look up the live lot.
struct StockParams {
    bytes16 stakeholder_id;
    bytes16 stock_class_id;
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
    bytes16 stock_plan_id;
    ShareNumbersIssued share_numbers_issued;
    uint256 share_price;
    uint256 quantity;
    bytes16 vesting_terms_id;
    uint256 cost_basis;
    bytes16[] stock_legend_ids;
    string issuance_type;
    string[] comments;
    string custom_id;
    bytes16 stakeholder_id;
    string board_approval_date;
    string stockholder_approval_date;
    string consideration_text;
    string[] security_law_exemptions;
}

struct StockTransfer {
    bytes16 id;
    string object_type;
    uint256 quantity;
    string[] comments;
    bytes16 security_id;
    string consideration_text;
    bytes16 balance_security_id;
    bytes16[] resulting_security_ids;
}

struct ActivePositions {
    mapping(bytes16 => mapping(bytes16 => ActivePosition)) activePositions;
}

struct SecIdsStockClass {
    mapping(bytes16 => mapping(bytes16 => bytes16[])) activeSecurityIdsByStockClass;
}
