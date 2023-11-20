import { ParamType } from "ethers";

export const StockIssuance = {
    type: "tuple",
    baseType: "tuple",
    components: [
        { type: "bytes16", baseType: "bytes16", name: "id" },
        { type: "string", baseType: "string", name: "object_type" },
        { type: "bytes16", baseType: "bytes16", name: "security_id" },
        {
            type: "tuple",
            baseType: "tuple",
            name: "params",
            components: [
                { type: "bytes16", baseType: "bytes16", name: "stock_class_id" },
                { type: "bytes16", baseType: "bytes16", name: "stock_plan_id" },
                {
                    type: "tuple",
                    baseType: "tuple",
                    name: "share_numbers_issued",
                    components: [
                        { type: "uint256", baseType: "uint256", name: "starting_share_number" },
                        { type: "uint256", baseType: "uint256", name: "ending_share_number" },
                    ],
                },
                { type: "uint256", baseType: "uint256", name: "share_price" },
                { type: "uint256", baseType: "uint256", name: "quantity" },
                { type: "bytes16", baseType: "bytes16", name: "vesting_terms_id" },
                { type: "uint256", baseType: "uint256", name: "cost_basis" },
                {
                    type: "bytes16[]",
                    baseType: "array",
                    arrayLength: -1,
                    arrayChildren: { type: "bytes16", baseType: "bytes16" },
                    name: "stock_legend_ids",
                },
                { type: "string", baseType: "string", name: "issuance_type" },
                {
                    type: "string[]",
                    baseType: "array",
                    arrayLength: -1,
                    arrayChildren: { type: "string", baseType: "string" },
                    name: "comments",
                },
                { type: "string", baseType: "string", name: "custom_id" },
                { type: "bytes16", baseType: "bytes16", name: "stakeholder_id" },
                { type: "string", baseType: "string", name: "board_approval_date" },
                { type: "string", baseType: "string", name: "stockholder_approval_date" },
                { type: "string", baseType: "string", name: "consideration_text" },
                {
                    type: "string[]",
                    baseType: "array",
                    arrayLength: -1,
                    arrayChildren: { type: "string", baseType: "string" },
                    name: "security_law_exemptions",
                },
            ],
        },
    ],
};

export const StockTransfer = {
    type: "tuple",
    baseType: "tuple",
    components: [
        { type: "bytes16", baseType: "bytes16", name: "id" },
        { type: "string", baseType: "string", name: "object_type" },
        { type: "uint256", baseType: "uint256", name: "quantity" },
        {
            type: "string[]",
            baseType: "array",
            arrayLength: -1,
            arrayChildren: { type: "string", baseType: "string" },
            name: "comments",
        },
        { type: "bytes16", baseType: "bytes16", name: "security_id" },
        { type: "string", baseType: "string", name: "consideration_text" },
        { type: "bytes16", baseType: "bytes16", name: "balance_security_id" },
        {
            type: "bytes16[]",
            baseType: "array",
            arrayLength: -1,
            arrayChildren: { type: "bytes16", baseType: "bytes16" },
            name: "resulting_security_ids",
        },
    ],
};

export const StockCancellation = {
    type: "tuple",
    baseType: "tuple",
    components: [
        { type: "bytes16", baseType: "bytes16", name: "id" },
        { type: "string", baseType: "string", name: "object_type" },
        { type: "uint256", baseType: "uint256", name: "quantity" },
        {
            type: "string[]",
            baseType: "array",
            arrayLength: -1,
            arrayChildren: { type: "string", baseType: "string" },
            name: "comments",
        },
        { type: "bytes16", baseType: "bytes16", name: "security_id" },
        { type: "string", baseType: "string", name: "reason_text" },
        { type: "bytes16", baseType: "bytes16", name: "balance_security_id" },
    ],
};

export const StockRetraction = {
    type: "tuple",
    baseType: "tuple",
    components: [
        { type: "bytes16", baseType: "bytes16", name: "id" },
        { type: "string", baseType: "string", name: "object_type" },
        {
            type: "string[]",
            baseType: "array",
            arrayLength: -1,
            arrayChildren: { type: "string", baseType: "string" },
            name: "comments",
        },
        { type: "bytes16", baseType: "bytes16", name: "security_id" },
        { type: "string", baseType: "string", name: "reason_text" },
    ],
};

export const StockReissuance = {
    type: "tuple",
    baseType: "tuple",
    components: [
        { type: "bytes16", baseType: "bytes16", name: "id" },
        { type: "string", baseType: "string", name: "object_type" },
        {
            type: "string[]",
            baseType: "array",
            arrayLength: -1,
            arrayChildren: { type: "string", baseType: "string" },
            name: "comments",
        },
        { type: "bytes16", baseType: "bytes16", name: "security_id" },
        {
            type: "bytes16[]",
            baseType: "array",
            arrayLength: -1,
            arrayChildren: { type: "bytes16", baseType: "bytes16" },
            name: "resulting_security_ids",
        },
        { type: "bytes16", baseType: "bytes16", name: "split_transaction_id" },
        { type: "string", baseType: "string", name: "reason_text" },
    ],
};

export const StockRepurchase = {
    type: "tuple",
    baseType: "tuple",
    components: [
        { type: "bytes16", baseType: "bytes16", name: "id" },
        { type: "string", baseType: "string", name: "object_type" },
        {
            type: "string[]",
            baseType: "array",
            arrayLength: -1,
            arrayChildren: { type: "string", baseType: "string" },
            name: "comments",
        },
        { type: "bytes16", baseType: "bytes16", name: "security_id" },
        { type: "string", baseType: "string", name: "consideration_text" },
        { type: "bytes16", baseType: "bytes16", name: "balance_security_id" },
        { type: "uint256", baseType: "uint256", name: "quantity" },
        { type: "uint256", baseType: "uint256", name: "price" },
    ],
};

export const StockAcceptance = {
    type: "tuple",
    baseType: "tuple",
    components: [
        { type: "bytes16", baseType: "bytes16", name: "id" },
        { type: "string", baseType: "string", name: "object_type" },
        { type: "bytes16", baseType: "bytes16", name: "security_id" },
        {
            type: "string[]",
            baseType: "array",
            arrayLength: -1,
            arrayChildren: { type: "string", baseType: "string" },
            name: "comments",
        },
    ],
};

export const IssuerAuthorizedSharesAdjustment = {
    type: "tuple",
    baseType: "tuple",
    components: [
        { type: "bytes16", baseType: "bytes16", name: "id" },
        { type: "string", baseType: "string", name: "object_type" },
        { type: "uint256", baseType: "uint256", name: "new_shares_authorized" },
        {
            type: "string[]",
            baseType: "array",
            arrayLength: -1,
            arrayChildren: { type: "string", baseType: "string" },
            name: "comments",
        },
        { type: "string", baseType: "string", name: "board_approval_date" },
        { type: "string", baseType: "string", name: "stockholder_approval_date" },
    ],
};

export const StockClassAuthorizedSharesAdjustment = {
    type: "tuple",
    baseType: "tuple",
    components: [
        { type: "bytes16", baseType: "bytes16", name: "id" },
        { type: "string", baseType: "string", name: "object_type" },
        { type: "uint256", baseType: "uint256", name: "new_shares_authorized" },
        {
            type: "string[]",
            baseType: "array",
            arrayLength: -1,
            arrayChildren: { type: "string", baseType: "string" },
            name: "comments",
        },
        { type: "string", baseType: "string", name: "board_approval_date" },
        { type: "string", baseType: "string", name: "stockholder_approval_date" },
    ],
};
