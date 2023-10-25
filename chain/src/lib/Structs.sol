// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// My bet is that Issuer and Stock Class need to have a quanity field where the shares are added back for retractions or cancellations
// On issuance, we must verify there are enough shares available to issue for that stock class

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
    bytes16 stock_class_id;
    // bytes16 stock_plan_id; // Optional
    // ShareNumbersIssued share_numbers_issued; // Optional
    uint256 share_price; // OCF Monetary (USD is all that matters). Amount is  Numeric: Fixed-point string representation of a number (up to 10 decimal places supported)
    uint256 quantity; // Numeric: Fixed-point string representation of a number (up to 10 decimal places supported)
    // bytes16 vesting_terms_id; // Optional
    // uint256 cost_basis; // Optional OCF Monetary (USD is all that matters). Amount is  Numeric: Fixed-point string representation of a number (up to 10 decimal places supported)
    // bytes16[] stock_legend_ids; // Optional
    string issuance_type; // Optional for special types (["RSA", "FOUNDERS_STOCK"],)
    // string[] comments; // Optional
    bytes16 security_id;
    // string custom_id; // Optional (eg R2-D2)
    bytes16 stakeholder_id;
    // string board_approval_date; // Optional
    // string stockholder_approval_date; // Optional
    // string consideration_text; // Optional
    // string[] security_law_exemptions; // Unclear
}

/*
 "properties": {
    "object_type": {
      "const": "STOCK_LEGEND_TEMPLATE"
    },
    "name": {
      "description": "Name for the stock legend template",
      "type": "string"
    },
    "text": {
      "description": "The full text of the stock legend",
      "type": "string"
    },
    "id": {},
    "comments": {}
  }, */

struct StockLegendTemplate {
    bytes16 id;
}

struct StockParamsQuantity {
    uint256 nonce;
    uint256 quantity;
    bytes16 stakeholderId;
    bytes16 stockClassId;
    bytes16 securityId;
    string[] comments;
    string reasonText;
}

struct StockParams {
    bytes16 stakeholderId; // not OCF, but required to fetch activePositions
    bytes16 stockClassId; //  not OCF, but required to fetch activePositions
    bytes16 securityId;
    string[] comments;
    string reasonText;
}

struct StockTransferTransferParams {
    bytes16 transferorStakeholderId;
    bytes16 transfereeStakeholderId;
    bytes16 stockClassId; // TODO: verify that we would have fong would have the stock class
    bool isBuyerVerified;
    uint256 quantity;
    uint256 share_price;
    uint256 nonce;
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
