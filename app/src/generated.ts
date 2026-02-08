import { createUseReadContract, createUseWriteContract, createUseSimulateContract, createUseWatchContractEvent } from "wagmi/codegen";

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
