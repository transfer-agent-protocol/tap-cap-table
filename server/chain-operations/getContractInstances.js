import { ethers } from "ethers";
import CAP_TABLE from "../../chain/out/CapTable.sol/CapTable.json" with { type: "json" };
import { setupEnv } from "../utils/env.js";
import getTXLibContracts from "../utils/getLibrariesContracts.js";
import getProvider from "./getProvider.js";

setupEnv();

/** True when PRIVATE_KEY is a usable hex key (not empty / UPDATE_ME). */
function isUsablePrivateKey(value) {
    if (!value || typeof value !== "string") return false;
    const v = value.trim();
    if (!v || v === "UPDATE_ME" || v.includes("UPDATE")) return false;
    // ethers accepts with or without 0x; must be 32-byte hex
    const hex = v.startsWith("0x") || v.startsWith("0X") ? v.slice(2) : v;
    return /^[0-9a-fA-F]{64}$/.test(hex);
}

/**
 * CapTable contract handle for poller / reads.
 * Uses a signing wallet only when PRIVATE_KEY is a real hex key.
 * Otherwise attaches a read-only provider so wallet-minted tables still poll
 * without forcing a server key (direct-wallet product path).
 */
export const getContractInstance = (address) => {
    const WALLET_PRIVATE_KEY = process.env.PRIVATE_KEY;
    const provider = getProvider();

    let runner;
    if (isUsablePrivateKey(WALLET_PRIVATE_KEY)) {
        runner = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
    } else {
        // Read-only: poller + reconcilers only need eth_call / getLogs
        runner = provider;
        if (!getContractInstance._warnedMissingKey) {
            console.warn(
                "⚠️  PRIVATE_KEY missing or placeholder — CapTable instances are read-only (poller OK; server-signed txs will fail).",
            );
            getContractInstance._warnedMissingKey = true;
        }
    }

    const contract = new ethers.Contract(address, CAP_TABLE.abi, runner);
    const libraries = getTXLibContracts(contract.target, runner);

    return { contract, provider, libraries };
};
