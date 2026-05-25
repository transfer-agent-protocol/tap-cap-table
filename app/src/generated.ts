import { createUseReadContract, createUseWriteContract, createUseSimulateContract, createUseWatchContractEvent } from "wagmi/codegen";

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
// React
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link capTableAbi}__
 */
export const useReadCapTable = /*#__PURE__*/ createUseReadContract({ abi: capTableAbi });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"ADMIN_ROLE"`
 */
export const useReadCapTableAdminRole = /*#__PURE__*/ createUseReadContract({ abi: capTableAbi, functionName: "ADMIN_ROLE" });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"DEFAULT_ADMIN_ROLE"`
 */
export const useReadCapTableDefaultAdminRole = /*#__PURE__*/ createUseReadContract({ abi: capTableAbi, functionName: "DEFAULT_ADMIN_ROLE" });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"OPERATOR_ROLE"`
 */
export const useReadCapTableOperatorRole = /*#__PURE__*/ createUseReadContract({ abi: capTableAbi, functionName: "OPERATOR_ROLE" });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"defaultAdmin"`
 */
export const useReadCapTableDefaultAdmin = /*#__PURE__*/ createUseReadContract({ abi: capTableAbi, functionName: "defaultAdmin" });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"defaultAdminDelay"`
 */
export const useReadCapTableDefaultAdminDelay = /*#__PURE__*/ createUseReadContract({ abi: capTableAbi, functionName: "defaultAdminDelay" });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"defaultAdminDelayIncreaseWait"`
 */
export const useReadCapTableDefaultAdminDelayIncreaseWait = /*#__PURE__*/ createUseReadContract({
    abi: capTableAbi,
    functionName: "defaultAdminDelayIncreaseWait",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"getActivePosition"`
 */
export const useReadCapTableGetActivePosition = /*#__PURE__*/ createUseReadContract({ abi: capTableAbi, functionName: "getActivePosition" });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"getAveragePosition"`
 */
export const useReadCapTableGetAveragePosition = /*#__PURE__*/ createUseReadContract({ abi: capTableAbi, functionName: "getAveragePosition" });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"getRoleAdmin"`
 */
export const useReadCapTableGetRoleAdmin = /*#__PURE__*/ createUseReadContract({ abi: capTableAbi, functionName: "getRoleAdmin" });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"getStakeholderById"`
 */
export const useReadCapTableGetStakeholderById = /*#__PURE__*/ createUseReadContract({ abi: capTableAbi, functionName: "getStakeholderById" });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"getStakeholderIdByWallet"`
 */
export const useReadCapTableGetStakeholderIdByWallet = /*#__PURE__*/ createUseReadContract({
    abi: capTableAbi,
    functionName: "getStakeholderIdByWallet",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"getStockClassById"`
 */
export const useReadCapTableGetStockClassById = /*#__PURE__*/ createUseReadContract({ abi: capTableAbi, functionName: "getStockClassById" });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"getTotalActiveSecuritiesCount"`
 */
export const useReadCapTableGetTotalActiveSecuritiesCount = /*#__PURE__*/ createUseReadContract({
    abi: capTableAbi,
    functionName: "getTotalActiveSecuritiesCount",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"getTotalNumberOfStakeholders"`
 */
export const useReadCapTableGetTotalNumberOfStakeholders = /*#__PURE__*/ createUseReadContract({
    abi: capTableAbi,
    functionName: "getTotalNumberOfStakeholders",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"getTotalNumberOfStockClasses"`
 */
export const useReadCapTableGetTotalNumberOfStockClasses = /*#__PURE__*/ createUseReadContract({
    abi: capTableAbi,
    functionName: "getTotalNumberOfStockClasses",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"getTransactionsCount"`
 */
export const useReadCapTableGetTransactionsCount = /*#__PURE__*/ createUseReadContract({ abi: capTableAbi, functionName: "getTransactionsCount" });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"hasRole"`
 */
export const useReadCapTableHasRole = /*#__PURE__*/ createUseReadContract({ abi: capTableAbi, functionName: "hasRole" });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"issuer"`
 */
export const useReadCapTableIssuer = /*#__PURE__*/ createUseReadContract({ abi: capTableAbi, functionName: "issuer" });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"nonce"`
 */
export const useReadCapTableNonce = /*#__PURE__*/ createUseReadContract({ abi: capTableAbi, functionName: "nonce" });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"owner"`
 */
export const useReadCapTableOwner = /*#__PURE__*/ createUseReadContract({ abi: capTableAbi, functionName: "owner" });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"pendingDefaultAdmin"`
 */
export const useReadCapTablePendingDefaultAdmin = /*#__PURE__*/ createUseReadContract({ abi: capTableAbi, functionName: "pendingDefaultAdmin" });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"pendingDefaultAdminDelay"`
 */
export const useReadCapTablePendingDefaultAdminDelay = /*#__PURE__*/ createUseReadContract({
    abi: capTableAbi,
    functionName: "pendingDefaultAdminDelay",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"stakeholderIndex"`
 */
export const useReadCapTableStakeholderIndex = /*#__PURE__*/ createUseReadContract({ abi: capTableAbi, functionName: "stakeholderIndex" });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"stakeholders"`
 */
export const useReadCapTableStakeholders = /*#__PURE__*/ createUseReadContract({ abi: capTableAbi, functionName: "stakeholders" });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"stockClassIndex"`
 */
export const useReadCapTableStockClassIndex = /*#__PURE__*/ createUseReadContract({ abi: capTableAbi, functionName: "stockClassIndex" });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"stockClasses"`
 */
export const useReadCapTableStockClasses = /*#__PURE__*/ createUseReadContract({ abi: capTableAbi, functionName: "stockClasses" });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"stockLegendTemplates"`
 */
export const useReadCapTableStockLegendTemplates = /*#__PURE__*/ createUseReadContract({ abi: capTableAbi, functionName: "stockLegendTemplates" });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"supportsInterface"`
 */
export const useReadCapTableSupportsInterface = /*#__PURE__*/ createUseReadContract({ abi: capTableAbi, functionName: "supportsInterface" });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"transactions"`
 */
export const useReadCapTableTransactions = /*#__PURE__*/ createUseReadContract({ abi: capTableAbi, functionName: "transactions" });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"walletsPerStakeholder"`
 */
export const useReadCapTableWalletsPerStakeholder = /*#__PURE__*/ createUseReadContract({ abi: capTableAbi, functionName: "walletsPerStakeholder" });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link capTableAbi}__
 */
export const useWriteCapTable = /*#__PURE__*/ createUseWriteContract({ abi: capTableAbi });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"acceptDefaultAdminTransfer"`
 */
export const useWriteCapTableAcceptDefaultAdminTransfer = /*#__PURE__*/ createUseWriteContract({
    abi: capTableAbi,
    functionName: "acceptDefaultAdminTransfer",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"acceptStock"`
 */
export const useWriteCapTableAcceptStock = /*#__PURE__*/ createUseWriteContract({ abi: capTableAbi, functionName: "acceptStock" });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"addAdmin"`
 */
export const useWriteCapTableAddAdmin = /*#__PURE__*/ createUseWriteContract({ abi: capTableAbi, functionName: "addAdmin" });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"addOperator"`
 */
export const useWriteCapTableAddOperator = /*#__PURE__*/ createUseWriteContract({ abi: capTableAbi, functionName: "addOperator" });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"addWalletToStakeholder"`
 */
export const useWriteCapTableAddWalletToStakeholder = /*#__PURE__*/ createUseWriteContract({
    abi: capTableAbi,
    functionName: "addWalletToStakeholder",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"adjustIssuerAuthorizedShares"`
 */
export const useWriteCapTableAdjustIssuerAuthorizedShares = /*#__PURE__*/ createUseWriteContract({
    abi: capTableAbi,
    functionName: "adjustIssuerAuthorizedShares",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"adjustStockClassAuthorizedShares"`
 */
export const useWriteCapTableAdjustStockClassAuthorizedShares = /*#__PURE__*/ createUseWriteContract({
    abi: capTableAbi,
    functionName: "adjustStockClassAuthorizedShares",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"beginDefaultAdminTransfer"`
 */
export const useWriteCapTableBeginDefaultAdminTransfer = /*#__PURE__*/ createUseWriteContract({
    abi: capTableAbi,
    functionName: "beginDefaultAdminTransfer",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"cancelDefaultAdminTransfer"`
 */
export const useWriteCapTableCancelDefaultAdminTransfer = /*#__PURE__*/ createUseWriteContract({
    abi: capTableAbi,
    functionName: "cancelDefaultAdminTransfer",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"cancelStock"`
 */
export const useWriteCapTableCancelStock = /*#__PURE__*/ createUseWriteContract({ abi: capTableAbi, functionName: "cancelStock" });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"changeDefaultAdminDelay"`
 */
export const useWriteCapTableChangeDefaultAdminDelay = /*#__PURE__*/ createUseWriteContract({
    abi: capTableAbi,
    functionName: "changeDefaultAdminDelay",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"createStakeholder"`
 */
export const useWriteCapTableCreateStakeholder = /*#__PURE__*/ createUseWriteContract({ abi: capTableAbi, functionName: "createStakeholder" });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"createStockClass"`
 */
export const useWriteCapTableCreateStockClass = /*#__PURE__*/ createUseWriteContract({ abi: capTableAbi, functionName: "createStockClass" });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"createStockLegendTemplate"`
 */
export const useWriteCapTableCreateStockLegendTemplate = /*#__PURE__*/ createUseWriteContract({
    abi: capTableAbi,
    functionName: "createStockLegendTemplate",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"grantRole"`
 */
export const useWriteCapTableGrantRole = /*#__PURE__*/ createUseWriteContract({ abi: capTableAbi, functionName: "grantRole" });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"initialize"`
 */
export const useWriteCapTableInitialize = /*#__PURE__*/ createUseWriteContract({ abi: capTableAbi, functionName: "initialize" });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"issueStock"`
 */
export const useWriteCapTableIssueStock = /*#__PURE__*/ createUseWriteContract({ abi: capTableAbi, functionName: "issueStock" });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"mintActivePositions"`
 */
export const useWriteCapTableMintActivePositions = /*#__PURE__*/ createUseWriteContract({ abi: capTableAbi, functionName: "mintActivePositions" });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"mintSharesAuthorized"`
 */
export const useWriteCapTableMintSharesAuthorized = /*#__PURE__*/ createUseWriteContract({ abi: capTableAbi, functionName: "mintSharesAuthorized" });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"reissueStock"`
 */
export const useWriteCapTableReissueStock = /*#__PURE__*/ createUseWriteContract({ abi: capTableAbi, functionName: "reissueStock" });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"removeAdmin"`
 */
export const useWriteCapTableRemoveAdmin = /*#__PURE__*/ createUseWriteContract({ abi: capTableAbi, functionName: "removeAdmin" });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"removeOperator"`
 */
export const useWriteCapTableRemoveOperator = /*#__PURE__*/ createUseWriteContract({ abi: capTableAbi, functionName: "removeOperator" });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"removeWalletFromStakeholder"`
 */
export const useWriteCapTableRemoveWalletFromStakeholder = /*#__PURE__*/ createUseWriteContract({
    abi: capTableAbi,
    functionName: "removeWalletFromStakeholder",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useWriteCapTableRenounceRole = /*#__PURE__*/ createUseWriteContract({ abi: capTableAbi, functionName: "renounceRole" });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"repurchaseStock"`
 */
export const useWriteCapTableRepurchaseStock = /*#__PURE__*/ createUseWriteContract({ abi: capTableAbi, functionName: "repurchaseStock" });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"retractStockIssuance"`
 */
export const useWriteCapTableRetractStockIssuance = /*#__PURE__*/ createUseWriteContract({ abi: capTableAbi, functionName: "retractStockIssuance" });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useWriteCapTableRevokeRole = /*#__PURE__*/ createUseWriteContract({ abi: capTableAbi, functionName: "revokeRole" });

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"rollbackDefaultAdminDelay"`
 */
export const useWriteCapTableRollbackDefaultAdminDelay = /*#__PURE__*/ createUseWriteContract({
    abi: capTableAbi,
    functionName: "rollbackDefaultAdminDelay",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"transferStock"`
 */
export const useWriteCapTableTransferStock = /*#__PURE__*/ createUseWriteContract({ abi: capTableAbi, functionName: "transferStock" });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link capTableAbi}__
 */
export const useSimulateCapTable = /*#__PURE__*/ createUseSimulateContract({ abi: capTableAbi });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"acceptDefaultAdminTransfer"`
 */
export const useSimulateCapTableAcceptDefaultAdminTransfer = /*#__PURE__*/ createUseSimulateContract({
    abi: capTableAbi,
    functionName: "acceptDefaultAdminTransfer",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"acceptStock"`
 */
export const useSimulateCapTableAcceptStock = /*#__PURE__*/ createUseSimulateContract({ abi: capTableAbi, functionName: "acceptStock" });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"addAdmin"`
 */
export const useSimulateCapTableAddAdmin = /*#__PURE__*/ createUseSimulateContract({ abi: capTableAbi, functionName: "addAdmin" });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"addOperator"`
 */
export const useSimulateCapTableAddOperator = /*#__PURE__*/ createUseSimulateContract({ abi: capTableAbi, functionName: "addOperator" });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"addWalletToStakeholder"`
 */
export const useSimulateCapTableAddWalletToStakeholder = /*#__PURE__*/ createUseSimulateContract({
    abi: capTableAbi,
    functionName: "addWalletToStakeholder",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"adjustIssuerAuthorizedShares"`
 */
export const useSimulateCapTableAdjustIssuerAuthorizedShares = /*#__PURE__*/ createUseSimulateContract({
    abi: capTableAbi,
    functionName: "adjustIssuerAuthorizedShares",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"adjustStockClassAuthorizedShares"`
 */
export const useSimulateCapTableAdjustStockClassAuthorizedShares = /*#__PURE__*/ createUseSimulateContract({
    abi: capTableAbi,
    functionName: "adjustStockClassAuthorizedShares",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"beginDefaultAdminTransfer"`
 */
export const useSimulateCapTableBeginDefaultAdminTransfer = /*#__PURE__*/ createUseSimulateContract({
    abi: capTableAbi,
    functionName: "beginDefaultAdminTransfer",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"cancelDefaultAdminTransfer"`
 */
export const useSimulateCapTableCancelDefaultAdminTransfer = /*#__PURE__*/ createUseSimulateContract({
    abi: capTableAbi,
    functionName: "cancelDefaultAdminTransfer",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"cancelStock"`
 */
export const useSimulateCapTableCancelStock = /*#__PURE__*/ createUseSimulateContract({ abi: capTableAbi, functionName: "cancelStock" });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"changeDefaultAdminDelay"`
 */
export const useSimulateCapTableChangeDefaultAdminDelay = /*#__PURE__*/ createUseSimulateContract({
    abi: capTableAbi,
    functionName: "changeDefaultAdminDelay",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"createStakeholder"`
 */
export const useSimulateCapTableCreateStakeholder = /*#__PURE__*/ createUseSimulateContract({ abi: capTableAbi, functionName: "createStakeholder" });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"createStockClass"`
 */
export const useSimulateCapTableCreateStockClass = /*#__PURE__*/ createUseSimulateContract({ abi: capTableAbi, functionName: "createStockClass" });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"createStockLegendTemplate"`
 */
export const useSimulateCapTableCreateStockLegendTemplate = /*#__PURE__*/ createUseSimulateContract({
    abi: capTableAbi,
    functionName: "createStockLegendTemplate",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"grantRole"`
 */
export const useSimulateCapTableGrantRole = /*#__PURE__*/ createUseSimulateContract({ abi: capTableAbi, functionName: "grantRole" });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"initialize"`
 */
export const useSimulateCapTableInitialize = /*#__PURE__*/ createUseSimulateContract({ abi: capTableAbi, functionName: "initialize" });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"issueStock"`
 */
export const useSimulateCapTableIssueStock = /*#__PURE__*/ createUseSimulateContract({ abi: capTableAbi, functionName: "issueStock" });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"mintActivePositions"`
 */
export const useSimulateCapTableMintActivePositions = /*#__PURE__*/ createUseSimulateContract({
    abi: capTableAbi,
    functionName: "mintActivePositions",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"mintSharesAuthorized"`
 */
export const useSimulateCapTableMintSharesAuthorized = /*#__PURE__*/ createUseSimulateContract({
    abi: capTableAbi,
    functionName: "mintSharesAuthorized",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"reissueStock"`
 */
export const useSimulateCapTableReissueStock = /*#__PURE__*/ createUseSimulateContract({ abi: capTableAbi, functionName: "reissueStock" });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"removeAdmin"`
 */
export const useSimulateCapTableRemoveAdmin = /*#__PURE__*/ createUseSimulateContract({ abi: capTableAbi, functionName: "removeAdmin" });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"removeOperator"`
 */
export const useSimulateCapTableRemoveOperator = /*#__PURE__*/ createUseSimulateContract({ abi: capTableAbi, functionName: "removeOperator" });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"removeWalletFromStakeholder"`
 */
export const useSimulateCapTableRemoveWalletFromStakeholder = /*#__PURE__*/ createUseSimulateContract({
    abi: capTableAbi,
    functionName: "removeWalletFromStakeholder",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"renounceRole"`
 */
export const useSimulateCapTableRenounceRole = /*#__PURE__*/ createUseSimulateContract({ abi: capTableAbi, functionName: "renounceRole" });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"repurchaseStock"`
 */
export const useSimulateCapTableRepurchaseStock = /*#__PURE__*/ createUseSimulateContract({ abi: capTableAbi, functionName: "repurchaseStock" });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"retractStockIssuance"`
 */
export const useSimulateCapTableRetractStockIssuance = /*#__PURE__*/ createUseSimulateContract({
    abi: capTableAbi,
    functionName: "retractStockIssuance",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"revokeRole"`
 */
export const useSimulateCapTableRevokeRole = /*#__PURE__*/ createUseSimulateContract({ abi: capTableAbi, functionName: "revokeRole" });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"rollbackDefaultAdminDelay"`
 */
export const useSimulateCapTableRollbackDefaultAdminDelay = /*#__PURE__*/ createUseSimulateContract({
    abi: capTableAbi,
    functionName: "rollbackDefaultAdminDelay",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link capTableAbi}__ and `functionName` set to `"transferStock"`
 */
export const useSimulateCapTableTransferStock = /*#__PURE__*/ createUseSimulateContract({ abi: capTableAbi, functionName: "transferStock" });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link capTableAbi}__
 */
export const useWatchCapTableEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: capTableAbi });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link capTableAbi}__ and `eventName` set to `"ActivePositionMinted"`
 */
export const useWatchCapTableActivePositionMintedEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: capTableAbi,
    eventName: "ActivePositionMinted",
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link capTableAbi}__ and `eventName` set to `"DefaultAdminDelayChangeCanceled"`
 */
export const useWatchCapTableDefaultAdminDelayChangeCanceledEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: capTableAbi,
    eventName: "DefaultAdminDelayChangeCanceled",
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link capTableAbi}__ and `eventName` set to `"DefaultAdminDelayChangeScheduled"`
 */
export const useWatchCapTableDefaultAdminDelayChangeScheduledEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: capTableAbi,
    eventName: "DefaultAdminDelayChangeScheduled",
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link capTableAbi}__ and `eventName` set to `"DefaultAdminTransferCanceled"`
 */
export const useWatchCapTableDefaultAdminTransferCanceledEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: capTableAbi,
    eventName: "DefaultAdminTransferCanceled",
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link capTableAbi}__ and `eventName` set to `"DefaultAdminTransferScheduled"`
 */
export const useWatchCapTableDefaultAdminTransferScheduledEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: capTableAbi,
    eventName: "DefaultAdminTransferScheduled",
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link capTableAbi}__ and `eventName` set to `"Initialized"`
 */
export const useWatchCapTableInitializedEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: capTableAbi, eventName: "Initialized" });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link capTableAbi}__ and `eventName` set to `"IssuerCreated"`
 */
export const useWatchCapTableIssuerCreatedEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: capTableAbi, eventName: "IssuerCreated" });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link capTableAbi}__ and `eventName` set to `"RoleAdminChanged"`
 */
export const useWatchCapTableRoleAdminChangedEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: capTableAbi, eventName: "RoleAdminChanged" });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link capTableAbi}__ and `eventName` set to `"RoleGranted"`
 */
export const useWatchCapTableRoleGrantedEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: capTableAbi, eventName: "RoleGranted" });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link capTableAbi}__ and `eventName` set to `"RoleRevoked"`
 */
export const useWatchCapTableRoleRevokedEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: capTableAbi, eventName: "RoleRevoked" });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link capTableAbi}__ and `eventName` set to `"SharesAuthorizedMinted"`
 */
export const useWatchCapTableSharesAuthorizedMintedEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: capTableAbi,
    eventName: "SharesAuthorizedMinted",
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link capTableAbi}__ and `eventName` set to `"StakeholderCreated"`
 */
export const useWatchCapTableStakeholderCreatedEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: capTableAbi,
    eventName: "StakeholderCreated",
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link capTableAbi}__ and `eventName` set to `"StockClassCreated"`
 */
export const useWatchCapTableStockClassCreatedEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: capTableAbi, eventName: "StockClassCreated" });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link capTableAbi}__ and `eventName` set to `"StockLegendTemplateCreated"`
 */
export const useWatchCapTableStockLegendTemplateCreatedEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: capTableAbi,
    eventName: "StockLegendTemplateCreated",
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link capTableAbi}__ and `eventName` set to `"WalletAdded"`
 */
export const useWatchCapTableWalletAddedEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: capTableAbi, eventName: "WalletAdded" });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link capTableAbi}__ and `eventName` set to `"WalletRemoved"`
 */
export const useWatchCapTableWalletRemovedEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: capTableAbi, eventName: "WalletRemoved" });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link capTableFactoryAbi}__
 */
export const useReadCapTableFactory = /*#__PURE__*/ createUseReadContract({ abi: capTableFactoryAbi });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link capTableFactoryAbi}__ and `functionName` set to `"capTableBeacon"`
 */
export const useReadCapTableFactoryCapTableBeacon = /*#__PURE__*/ createUseReadContract({ abi: capTableFactoryAbi, functionName: "capTableBeacon" });

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link capTableFactoryAbi}__ and `functionName` set to `"capTableImplementation"`
 */
export const useReadCapTableFactoryCapTableImplementation = /*#__PURE__*/ createUseReadContract({
    abi: capTableFactoryAbi,
    functionName: "capTableImplementation",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link capTableFactoryAbi}__ and `functionName` set to `"capTableProxies"`
 */
export const useReadCapTableFactoryCapTableProxies = /*#__PURE__*/ createUseReadContract({
    abi: capTableFactoryAbi,
    functionName: "capTableProxies",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link capTableFactoryAbi}__ and `functionName` set to `"getCapTableCount"`
 */
export const useReadCapTableFactoryGetCapTableCount = /*#__PURE__*/ createUseReadContract({
    abi: capTableFactoryAbi,
    functionName: "getCapTableCount",
});

/**
 * Wraps __{@link useReadContract}__ with `abi` set to __{@link capTableFactoryAbi}__ and `functionName` set to `"owner"`
 */
export const useReadCapTableFactoryOwner = /*#__PURE__*/ createUseReadContract({ abi: capTableFactoryAbi, functionName: "owner" });

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

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link capTableFactoryAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useWriteCapTableFactoryRenounceOwnership = /*#__PURE__*/ createUseWriteContract({
    abi: capTableFactoryAbi,
    functionName: "renounceOwnership",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link capTableFactoryAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useWriteCapTableFactoryTransferOwnership = /*#__PURE__*/ createUseWriteContract({
    abi: capTableFactoryAbi,
    functionName: "transferOwnership",
});

/**
 * Wraps __{@link useWriteContract}__ with `abi` set to __{@link capTableFactoryAbi}__ and `functionName` set to `"updateCapTableImplementation"`
 */
export const useWriteCapTableFactoryUpdateCapTableImplementation = /*#__PURE__*/ createUseWriteContract({
    abi: capTableFactoryAbi,
    functionName: "updateCapTableImplementation",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link capTableFactoryAbi}__
 */
export const useSimulateCapTableFactory = /*#__PURE__*/ createUseSimulateContract({ abi: capTableFactoryAbi });

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link capTableFactoryAbi}__ and `functionName` set to `"createCapTable"`
 */
export const useSimulateCapTableFactoryCreateCapTable = /*#__PURE__*/ createUseSimulateContract({
    abi: capTableFactoryAbi,
    functionName: "createCapTable",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link capTableFactoryAbi}__ and `functionName` set to `"renounceOwnership"`
 */
export const useSimulateCapTableFactoryRenounceOwnership = /*#__PURE__*/ createUseSimulateContract({
    abi: capTableFactoryAbi,
    functionName: "renounceOwnership",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link capTableFactoryAbi}__ and `functionName` set to `"transferOwnership"`
 */
export const useSimulateCapTableFactoryTransferOwnership = /*#__PURE__*/ createUseSimulateContract({
    abi: capTableFactoryAbi,
    functionName: "transferOwnership",
});

/**
 * Wraps __{@link useSimulateContract}__ with `abi` set to __{@link capTableFactoryAbi}__ and `functionName` set to `"updateCapTableImplementation"`
 */
export const useSimulateCapTableFactoryUpdateCapTableImplementation = /*#__PURE__*/ createUseSimulateContract({
    abi: capTableFactoryAbi,
    functionName: "updateCapTableImplementation",
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link capTableFactoryAbi}__
 */
export const useWatchCapTableFactoryEvent = /*#__PURE__*/ createUseWatchContractEvent({ abi: capTableFactoryAbi });

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link capTableFactoryAbi}__ and `eventName` set to `"CapTableCreated"`
 */
export const useWatchCapTableFactoryCapTableCreatedEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: capTableFactoryAbi,
    eventName: "CapTableCreated",
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link capTableFactoryAbi}__ and `eventName` set to `"CapTableImplementationUpdated"`
 */
export const useWatchCapTableFactoryCapTableImplementationUpdatedEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: capTableFactoryAbi,
    eventName: "CapTableImplementationUpdated",
});

/**
 * Wraps __{@link useWatchContractEvent}__ with `abi` set to __{@link capTableFactoryAbi}__ and `eventName` set to `"OwnershipTransferred"`
 */
export const useWatchCapTableFactoryOwnershipTransferredEvent = /*#__PURE__*/ createUseWatchContractEvent({
    abi: capTableFactoryAbi,
    eventName: "OwnershipTransferred",
});
