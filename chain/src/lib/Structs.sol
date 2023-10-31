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
    bytes16 security_id;
    StockIssuanceParams params;
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
    bytes16 stockClassId;
    bool isBuyerVerified;
    uint256 quantity;
    uint256 share_price;
    uint256 nonce;
}

struct StockIssuanceParams {
    bytes16 stockClassId;
    bytes16 stockPlanId;
    ShareNumbersIssued shareNumbersIssued;
    uint256 sharePrice;
    uint256 quantity;
    bytes16 vestingTermsId;
    uint256 costBasis;
    bytes16[] stockLegendIds;
    string issuanceType;
    string[] comments;
    string customId;
    bytes16 stakeholderId;
    string boardApprovalDate;
    string stockholderApprovalDate;
    string considerationText;
    string[] securityLawExemptions;
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
