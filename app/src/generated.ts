import { createUseWriteContract } from "wagmi/codegen";

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CapTable
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const capTableAbi = [
    { type: "constructor", inputs: [], stateMutability: "nonpayable" },
    { type: "function", inputs: [], name: "ADMIN_ROLE", outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }], stateMutability: "view" },
    {
        type: "function",
        inputs: [],
        name: "DEFAULT_ADMIN_ROLE",
        outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "OPERATOR_ROLE",
        outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
        stateMutability: "view",
    },
    { type: "function", inputs: [], name: "acceptDefaultAdminTransfer", outputs: [], stateMutability: "nonpayable" },
    {
        type: "function",
        inputs: [
            { name: "stakeholderId", internalType: "bytes16", type: "bytes16" },
            { name: "stockClassId", internalType: "bytes16", type: "bytes16" },
            { name: "securityId", internalType: "bytes16", type: "bytes16" },
            { name: "comments", internalType: "string[]", type: "string[]" },
        ],
        name: "acceptStock",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [{ name: "addr", internalType: "address", type: "address" }],
        name: "addAdmin",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [{ name: "addr", internalType: "address", type: "address" }],
        name: "addOperator",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            { name: "_stakeholder_id", internalType: "bytes16", type: "bytes16" },
            { name: "_wallet", internalType: "address", type: "address" },
        ],
        name: "addWalletToStakeholder",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            { name: "newSharesAuthorized", internalType: "uint256", type: "uint256" },
            { name: "comments", internalType: "string[]", type: "string[]" },
            { name: "boardApprovalDate", internalType: "string", type: "string" },
            { name: "stockholderApprovalDate", internalType: "string", type: "string" },
        ],
        name: "adjustIssuerAuthorizedShares",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            { name: "stockClassId", internalType: "bytes16", type: "bytes16" },
            { name: "newAuthorizedShares", internalType: "uint256", type: "uint256" },
            { name: "comments", internalType: "string[]", type: "string[]" },
            { name: "boardApprovalDate", internalType: "string", type: "string" },
            { name: "stockholderApprovalDate", internalType: "string", type: "string" },
        ],
        name: "adjustStockClassAuthorizedShares",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [{ name: "newAdmin", internalType: "address", type: "address" }],
        name: "beginDefaultAdminTransfer",
        outputs: [],
        stateMutability: "nonpayable",
    },
    { type: "function", inputs: [], name: "cancelDefaultAdminTransfer", outputs: [], stateMutability: "nonpayable" },
    {
        type: "function",
        inputs: [
            {
                name: "params",
                internalType: "struct StockParams",
                type: "tuple",
                components: [
                    { name: "stakeholder_id", internalType: "bytes16", type: "bytes16" },
                    { name: "stock_class_id", internalType: "bytes16", type: "bytes16" },
                    { name: "security_id", internalType: "bytes16", type: "bytes16" },
                    { name: "comments", internalType: "string[]", type: "string[]" },
                    { name: "reason_text", internalType: "string", type: "string" },
                ],
            },
            { name: "quantity", internalType: "uint256", type: "uint256" },
        ],
        name: "cancelStock",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [{ name: "newDelay", internalType: "uint48", type: "uint48" }],
        name: "changeDefaultAdminDelay",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            { name: "_id", internalType: "bytes16", type: "bytes16" },
            { name: "_stakeholder_type", internalType: "string", type: "string" },
            { name: "_current_relationship", internalType: "string", type: "string" },
        ],
        name: "createStakeholder",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            { name: "_id", internalType: "bytes16", type: "bytes16" },
            { name: "_class_type", internalType: "string", type: "string" },
            { name: "_price_per_share", internalType: "uint256", type: "uint256" },
            { name: "_initial_share_authorized", internalType: "uint256", type: "uint256" },
        ],
        name: "createStockClass",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [{ name: "_id", internalType: "bytes16", type: "bytes16" }],
        name: "createStockLegendTemplate",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [],
        name: "defaultAdmin",
        outputs: [{ name: "", internalType: "address", type: "address" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "defaultAdminDelay",
        outputs: [{ name: "", internalType: "uint48", type: "uint48" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "defaultAdminDelayIncreaseWait",
        outputs: [{ name: "", internalType: "uint48", type: "uint48" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [
            { name: "stakeholderId", internalType: "bytes16", type: "bytes16" },
            { name: "securityId", internalType: "bytes16", type: "bytes16" },
        ],
        name: "getActivePosition",
        outputs: [
            { name: "", internalType: "bytes16", type: "bytes16" },
            { name: "", internalType: "uint256", type: "uint256" },
            { name: "", internalType: "uint256", type: "uint256" },
            { name: "", internalType: "uint40", type: "uint40" },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [
            { name: "stakeholderId", internalType: "bytes16", type: "bytes16" },
            { name: "stockClassId", internalType: "bytes16", type: "bytes16" },
        ],
        name: "getAveragePosition",
        outputs: [
            { name: "", internalType: "uint256", type: "uint256" },
            { name: "", internalType: "uint256", type: "uint256" },
            { name: "", internalType: "uint40", type: "uint40" },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [{ name: "role", internalType: "bytes32", type: "bytes32" }],
        name: "getRoleAdmin",
        outputs: [{ name: "", internalType: "bytes32", type: "bytes32" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [{ name: "_id", internalType: "bytes16", type: "bytes16" }],
        name: "getStakeholderById",
        outputs: [
            { name: "", internalType: "bytes16", type: "bytes16" },
            { name: "", internalType: "string", type: "string" },
            { name: "", internalType: "string", type: "string" },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [{ name: "_wallet", internalType: "address", type: "address" }],
        name: "getStakeholderIdByWallet",
        outputs: [{ name: "stakeholderId", internalType: "bytes16", type: "bytes16" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [{ name: "_id", internalType: "bytes16", type: "bytes16" }],
        name: "getStockClassById",
        outputs: [
            { name: "", internalType: "bytes16", type: "bytes16" },
            { name: "", internalType: "string", type: "string" },
            { name: "", internalType: "uint256", type: "uint256" },
            { name: "", internalType: "uint256", type: "uint256" },
            { name: "", internalType: "uint256", type: "uint256" },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "getTotalActiveSecuritiesCount",
        outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "getTotalNumberOfStakeholders",
        outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "getTotalNumberOfStockClasses",
        outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "getTransactionsCount",
        outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [
            { name: "role", internalType: "bytes32", type: "bytes32" },
            { name: "account", internalType: "address", type: "address" },
        ],
        name: "grantRole",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            { name: "role", internalType: "bytes32", type: "bytes32" },
            { name: "account", internalType: "address", type: "address" },
        ],
        name: "hasRole",
        outputs: [{ name: "", internalType: "bool", type: "bool" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [
            { name: "id", internalType: "bytes16", type: "bytes16" },
            { name: "name", internalType: "string", type: "string" },
            { name: "initial_shares_authorized", internalType: "uint256", type: "uint256" },
            { name: "admin", internalType: "address", type: "address" },
            { name: "operator", internalType: "address", type: "address" },
        ],
        name: "initialize",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            {
                name: "params",
                internalType: "struct StockIssuanceParams",
                type: "tuple",
                components: [
                    { name: "stock_class_id", internalType: "bytes16", type: "bytes16" },
                    { name: "stock_plan_id", internalType: "bytes16", type: "bytes16" },
                    {
                        name: "share_numbers_issued",
                        internalType: "struct ShareNumbersIssued",
                        type: "tuple",
                        components: [
                            { name: "starting_share_number", internalType: "uint256", type: "uint256" },
                            { name: "ending_share_number", internalType: "uint256", type: "uint256" },
                        ],
                    },
                    { name: "share_price", internalType: "uint256", type: "uint256" },
                    { name: "quantity", internalType: "uint256", type: "uint256" },
                    { name: "vesting_terms_id", internalType: "bytes16", type: "bytes16" },
                    { name: "cost_basis", internalType: "uint256", type: "uint256" },
                    { name: "stock_legend_ids", internalType: "bytes16[]", type: "bytes16[]" },
                    { name: "issuance_type", internalType: "string", type: "string" },
                    { name: "comments", internalType: "string[]", type: "string[]" },
                    { name: "custom_id", internalType: "string", type: "string" },
                    { name: "stakeholder_id", internalType: "bytes16", type: "bytes16" },
                    { name: "board_approval_date", internalType: "string", type: "string" },
                    { name: "stockholder_approval_date", internalType: "string", type: "string" },
                    { name: "consideration_text", internalType: "string", type: "string" },
                    { name: "security_law_exemptions", internalType: "string[]", type: "string[]" },
                ],
            },
        ],
        name: "issueStock",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [],
        name: "issuer",
        outputs: [
            { name: "id", internalType: "bytes16", type: "bytes16" },
            { name: "legal_name", internalType: "string", type: "string" },
            { name: "shares_issued", internalType: "uint256", type: "uint256" },
            { name: "shares_authorized", internalType: "uint256", type: "uint256" },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [
            { name: "stakeholderIds", internalType: "bytes16[]", type: "bytes16[]" },
            { name: "securityIds", internalType: "bytes16[]", type: "bytes16[]" },
            { name: "stockClassIds", internalType: "bytes16[]", type: "bytes16[]" },
            { name: "quantities", internalType: "uint256[]", type: "uint256[]" },
            { name: "sharePrices", internalType: "uint256[]", type: "uint256[]" },
            { name: "timestamps", internalType: "uint40[]", type: "uint40[]" },
        ],
        name: "mintActivePositions",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            {
                name: "params",
                internalType: "struct InitialShares",
                type: "tuple",
                components: [
                    {
                        name: "issuerInitialShares",
                        internalType: "struct IssuerInitialShares",
                        type: "tuple",
                        components: [
                            { name: "shares_authorized", internalType: "uint256", type: "uint256" },
                            { name: "shares_issued", internalType: "uint256", type: "uint256" },
                        ],
                    },
                    {
                        name: "stockClassesInitialShares",
                        internalType: "struct StockClassInitialShares[]",
                        type: "tuple[]",
                        components: [
                            { name: "id", internalType: "bytes16", type: "bytes16" },
                            { name: "shares_authorized", internalType: "uint256", type: "uint256" },
                            { name: "shares_issued", internalType: "uint256", type: "uint256" },
                        ],
                    },
                ],
            },
        ],
        name: "mintSharesAuthorized",
        outputs: [],
        stateMutability: "nonpayable",
    },
    { type: "function", inputs: [], name: "nonce", outputs: [{ name: "", internalType: "uint256", type: "uint256" }], stateMutability: "view" },
    { type: "function", inputs: [], name: "owner", outputs: [{ name: "", internalType: "address", type: "address" }], stateMutability: "view" },
    {
        type: "function",
        inputs: [],
        name: "pendingDefaultAdmin",
        outputs: [
            { name: "newAdmin", internalType: "address", type: "address" },
            { name: "schedule", internalType: "uint48", type: "uint48" },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "pendingDefaultAdminDelay",
        outputs: [
            { name: "newDelay", internalType: "uint48", type: "uint48" },
            { name: "schedule", internalType: "uint48", type: "uint48" },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [
            {
                name: "params",
                internalType: "struct StockParams",
                type: "tuple",
                components: [
                    { name: "stakeholder_id", internalType: "bytes16", type: "bytes16" },
                    { name: "stock_class_id", internalType: "bytes16", type: "bytes16" },
                    { name: "security_id", internalType: "bytes16", type: "bytes16" },
                    { name: "comments", internalType: "string[]", type: "string[]" },
                    { name: "reason_text", internalType: "string", type: "string" },
                ],
            },
            { name: "resulting_security_ids", internalType: "bytes16[]", type: "bytes16[]" },
        ],
        name: "reissueStock",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [{ name: "addr", internalType: "address", type: "address" }],
        name: "removeAdmin",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [{ name: "addr", internalType: "address", type: "address" }],
        name: "removeOperator",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            { name: "_stakeholder_id", internalType: "bytes16", type: "bytes16" },
            { name: "_wallet", internalType: "address", type: "address" },
        ],
        name: "removeWalletFromStakeholder",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            { name: "role", internalType: "bytes32", type: "bytes32" },
            { name: "account", internalType: "address", type: "address" },
        ],
        name: "renounceRole",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            {
                name: "params",
                internalType: "struct StockParams",
                type: "tuple",
                components: [
                    { name: "stakeholder_id", internalType: "bytes16", type: "bytes16" },
                    { name: "stock_class_id", internalType: "bytes16", type: "bytes16" },
                    { name: "security_id", internalType: "bytes16", type: "bytes16" },
                    { name: "comments", internalType: "string[]", type: "string[]" },
                    { name: "reason_text", internalType: "string", type: "string" },
                ],
            },
            { name: "quantity", internalType: "uint256", type: "uint256" },
            { name: "price", internalType: "uint256", type: "uint256" },
        ],
        name: "repurchaseStock",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            {
                name: "params",
                internalType: "struct StockParams",
                type: "tuple",
                components: [
                    { name: "stakeholder_id", internalType: "bytes16", type: "bytes16" },
                    { name: "stock_class_id", internalType: "bytes16", type: "bytes16" },
                    { name: "security_id", internalType: "bytes16", type: "bytes16" },
                    { name: "comments", internalType: "string[]", type: "string[]" },
                    { name: "reason_text", internalType: "string", type: "string" },
                ],
            },
        ],
        name: "retractStockIssuance",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [
            { name: "role", internalType: "bytes32", type: "bytes32" },
            { name: "account", internalType: "address", type: "address" },
        ],
        name: "revokeRole",
        outputs: [],
        stateMutability: "nonpayable",
    },
    { type: "function", inputs: [], name: "rollbackDefaultAdminDelay", outputs: [], stateMutability: "nonpayable" },
    {
        type: "function",
        inputs: [{ name: "", internalType: "bytes16", type: "bytes16" }],
        name: "stakeholderIndex",
        outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
        name: "stakeholders",
        outputs: [
            { name: "id", internalType: "bytes16", type: "bytes16" },
            { name: "stakeholder_type", internalType: "string", type: "string" },
            { name: "current_relationship", internalType: "string", type: "string" },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [{ name: "", internalType: "bytes16", type: "bytes16" }],
        name: "stockClassIndex",
        outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
        name: "stockClasses",
        outputs: [
            { name: "id", internalType: "bytes16", type: "bytes16" },
            { name: "class_type", internalType: "string", type: "string" },
            { name: "price_per_share", internalType: "uint256", type: "uint256" },
            { name: "shares_issued", internalType: "uint256", type: "uint256" },
            { name: "shares_authorized", internalType: "uint256", type: "uint256" },
        ],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
        name: "stockLegendTemplates",
        outputs: [{ name: "id", internalType: "bytes16", type: "bytes16" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [{ name: "interfaceId", internalType: "bytes4", type: "bytes4" }],
        name: "supportsInterface",
        outputs: [{ name: "", internalType: "bool", type: "bool" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
        name: "transactions",
        outputs: [{ name: "", internalType: "bytes", type: "bytes" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [
            {
                name: "params",
                internalType: "struct StockTransferParams",
                type: "tuple",
                components: [
                    { name: "transferor_stakeholder_id", internalType: "bytes16", type: "bytes16" },
                    { name: "transferee_stakeholder_id", internalType: "bytes16", type: "bytes16" },
                    { name: "stock_class_id", internalType: "bytes16", type: "bytes16" },
                    { name: "is_buyer_verified", internalType: "bool", type: "bool" },
                    { name: "quantity", internalType: "uint256", type: "uint256" },
                    { name: "share_price", internalType: "uint256", type: "uint256" },
                    { name: "nonce", internalType: "uint256", type: "uint256" },
                    { name: "custom_id", internalType: "string", type: "string" },
                ],
            },
        ],
        name: "transferStock",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [{ name: "", internalType: "address", type: "address" }],
        name: "walletsPerStakeholder",
        outputs: [{ name: "", internalType: "bytes16", type: "bytes16" }],
        stateMutability: "view",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            { name: "stakeholderId", internalType: "bytes16", type: "bytes16", indexed: true },
            { name: "securityId", internalType: "bytes16", type: "bytes16", indexed: true },
            { name: "stockClassId", internalType: "bytes16", type: "bytes16", indexed: true },
            { name: "quantity", internalType: "uint256", type: "uint256", indexed: false },
        ],
        name: "ActivePositionMinted",
    },
    { type: "event", anonymous: false, inputs: [], name: "DefaultAdminDelayChangeCanceled" },
    {
        type: "event",
        anonymous: false,
        inputs: [
            { name: "newDelay", internalType: "uint48", type: "uint48", indexed: false },
            { name: "effectSchedule", internalType: "uint48", type: "uint48", indexed: false },
        ],
        name: "DefaultAdminDelayChangeScheduled",
    },
    { type: "event", anonymous: false, inputs: [], name: "DefaultAdminTransferCanceled" },
    {
        type: "event",
        anonymous: false,
        inputs: [
            { name: "newAdmin", internalType: "address", type: "address", indexed: true },
            { name: "acceptSchedule", internalType: "uint48", type: "uint48", indexed: false },
        ],
        name: "DefaultAdminTransferScheduled",
    },
    { type: "event", anonymous: false, inputs: [{ name: "version", internalType: "uint64", type: "uint64", indexed: false }], name: "Initialized" },
    {
        type: "event",
        anonymous: false,
        inputs: [
            { name: "id", internalType: "bytes16", type: "bytes16", indexed: true },
            { name: "_name", internalType: "string", type: "string", indexed: true },
        ],
        name: "IssuerCreated",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            { name: "role", internalType: "bytes32", type: "bytes32", indexed: true },
            { name: "previousAdminRole", internalType: "bytes32", type: "bytes32", indexed: true },
            { name: "newAdminRole", internalType: "bytes32", type: "bytes32", indexed: true },
        ],
        name: "RoleAdminChanged",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            { name: "role", internalType: "bytes32", type: "bytes32", indexed: true },
            { name: "account", internalType: "address", type: "address", indexed: true },
            { name: "sender", internalType: "address", type: "address", indexed: true },
        ],
        name: "RoleGranted",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            { name: "role", internalType: "bytes32", type: "bytes32", indexed: true },
            { name: "account", internalType: "address", type: "address", indexed: true },
            { name: "sender", internalType: "address", type: "address", indexed: true },
        ],
        name: "RoleRevoked",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            { name: "issuerId", internalType: "bytes16", type: "bytes16", indexed: true },
            { name: "sharesAuthorized", internalType: "uint256", type: "uint256", indexed: false },
            { name: "sharesIssued", internalType: "uint256", type: "uint256", indexed: false },
        ],
        name: "SharesAuthorizedMinted",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [{ name: "id", internalType: "bytes16", type: "bytes16", indexed: true }],
        name: "StakeholderCreated",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            { name: "id", internalType: "bytes16", type: "bytes16", indexed: true },
            { name: "classType", internalType: "string", type: "string", indexed: true },
            { name: "pricePerShare", internalType: "uint256", type: "uint256", indexed: true },
            { name: "initialSharesAuthorized", internalType: "uint256", type: "uint256", indexed: false },
        ],
        name: "StockClassCreated",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [{ name: "id", internalType: "bytes16", type: "bytes16", indexed: true }],
        name: "StockLegendTemplateCreated",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            { name: "stakeholderId", internalType: "bytes16", type: "bytes16", indexed: true },
            { name: "wallet", internalType: "address", type: "address", indexed: true },
        ],
        name: "WalletAdded",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            { name: "stakeholderId", internalType: "bytes16", type: "bytes16", indexed: true },
            { name: "wallet", internalType: "address", type: "address", indexed: true },
        ],
        name: "WalletRemoved",
    },
    { type: "error", inputs: [], name: "AccessControlBadConfirmation" },
    { type: "error", inputs: [{ name: "schedule", internalType: "uint48", type: "uint48" }], name: "AccessControlEnforcedDefaultAdminDelay" },
    { type: "error", inputs: [], name: "AccessControlEnforcedDefaultAdminRules" },
    { type: "error", inputs: [{ name: "defaultAdmin", internalType: "address", type: "address" }], name: "AccessControlInvalidDefaultAdmin" },
    {
        type: "error",
        inputs: [
            { name: "account", internalType: "address", type: "address" },
            { name: "neededRole", internalType: "bytes32", type: "bytes32" },
        ],
        name: "AccessControlUnauthorizedAccount",
    },
    { type: "error", inputs: [], name: "InvalidInitialization" },
    { type: "error", inputs: [{ name: "stock_class_id", internalType: "bytes16", type: "bytes16" }], name: "InvalidStockClass" },
    { type: "error", inputs: [{ name: "wallet", internalType: "address", type: "address" }], name: "InvalidWallet" },
    { type: "error", inputs: [], name: "NoActivePositionFound" },
    { type: "error", inputs: [], name: "NoIssuanceFound" },
    { type: "error", inputs: [{ name: "stakeholder_id", internalType: "bytes16", type: "bytes16" }], name: "NoStakeholder" },
    { type: "error", inputs: [], name: "NotInitializing" },
    {
        type: "error",
        inputs: [
            { name: "bits", internalType: "uint8", type: "uint8" },
            { name: "value", internalType: "uint256", type: "uint256" },
        ],
        name: "SafeCastOverflowedUintDowncast",
    },
    { type: "error", inputs: [{ name: "stakeholder_id", internalType: "bytes16", type: "bytes16" }], name: "StakeholderAlreadyExists" },
    { type: "error", inputs: [{ name: "stock_class_id", internalType: "bytes16", type: "bytes16" }], name: "StockClassAlreadyExists" },
    { type: "error", inputs: [{ name: "wallet", internalType: "address", type: "address" }], name: "WalletAlreadyExists" },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// CapTableFactory
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export const capTableFactoryAbi = [
    { type: "constructor", inputs: [{ name: "_capTableImplementation", internalType: "address", type: "address" }], stateMutability: "nonpayable" },
    {
        type: "function",
        inputs: [],
        name: "capTableBeacon",
        outputs: [{ name: "", internalType: "contract UpgradeableBeacon", type: "address" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [],
        name: "capTableImplementation",
        outputs: [{ name: "", internalType: "address", type: "address" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [{ name: "", internalType: "uint256", type: "uint256" }],
        name: "capTableProxies",
        outputs: [{ name: "", internalType: "address", type: "address" }],
        stateMutability: "view",
    },
    {
        type: "function",
        inputs: [
            { name: "id", internalType: "bytes16", type: "bytes16" },
            { name: "name", internalType: "string", type: "string" },
            { name: "initial_shares_authorized", internalType: "uint256", type: "uint256" },
            { name: "operator", internalType: "address", type: "address" },
        ],
        name: "createCapTable",
        outputs: [{ name: "", internalType: "address", type: "address" }],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [],
        name: "getCapTableCount",
        outputs: [{ name: "", internalType: "uint256", type: "uint256" }],
        stateMutability: "view",
    },
    { type: "function", inputs: [], name: "owner", outputs: [{ name: "", internalType: "address", type: "address" }], stateMutability: "view" },
    { type: "function", inputs: [], name: "renounceOwnership", outputs: [], stateMutability: "nonpayable" },
    {
        type: "function",
        inputs: [{ name: "newOwner", internalType: "address", type: "address" }],
        name: "transferOwnership",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "function",
        inputs: [{ name: "newImplementation", internalType: "address", type: "address" }],
        name: "updateCapTableImplementation",
        outputs: [],
        stateMutability: "nonpayable",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [{ name: "capTableProxy", internalType: "address", type: "address", indexed: true }],
        name: "CapTableCreated",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            { name: "oldImplementation", internalType: "address", type: "address", indexed: true },
            { name: "newImplementation", internalType: "address", type: "address", indexed: true },
        ],
        name: "CapTableImplementationUpdated",
    },
    {
        type: "event",
        anonymous: false,
        inputs: [
            { name: "previousOwner", internalType: "address", type: "address", indexed: true },
            { name: "newOwner", internalType: "address", type: "address", indexed: true },
        ],
        name: "OwnershipTransferred",
    },
    { type: "error", inputs: [{ name: "owner", internalType: "address", type: "address" }], name: "OwnableInvalidOwner" },
    { type: "error", inputs: [{ name: "account", internalType: "address", type: "address" }], name: "OwnableUnauthorizedAccount" },
] as const;

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// React (wallet writes)
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link capTableAbi}__
 */
export const useWriteCapTable = /*#__PURE__*/ createUseWriteContract({ abi: capTableAbi });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"acceptStock"`
 */
export const useWriteCapTableAcceptStock = /*#__PURE__*/ createUseWriteContract({ abi: capTableAbi, functionName: "acceptStock" });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"createStakeholder"`
 */
export const useWriteCapTableCreateStakeholder = /*#__PURE__*/ createUseWriteContract({ abi: capTableAbi, functionName: "createStakeholder" });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"createStockClass"`
 */
export const useWriteCapTableCreateStockClass = /*#__PURE__*/ createUseWriteContract({ abi: capTableAbi, functionName: "createStockClass" });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"issueStock"`
 */
export const useWriteCapTableIssueStock = /*#__PURE__*/ createUseWriteContract({ abi: capTableAbi, functionName: "issueStock" });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"transferStock"`
 */
export const useWriteCapTableTransferStock = /*#__PURE__*/ createUseWriteContract({ abi: capTableAbi, functionName: "transferStock" });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link capTableFactoryAbi}__
 */
export const useWriteCapTableFactory = /*#__PURE__*/ createUseWriteContract({ abi: capTableFactoryAbi });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link capTableFactoryAbi}__ and `functionName` set to `"createCapTable"`
 */
export const useWriteCapTableFactoryCreateCapTable = /*#__PURE__*/ createUseWriteContract({
    abi: capTableFactoryAbi,
    functionName: "createCapTable",
});
