/*
 * Register (or update) the CapTableFactory + implementation addresses in Mongo.
 *
 * The server deploys cap tables through the factory recorded in the Mongo `factories`
 * collection (`deployCapTable` uses `factories[0].factory_address`). These addresses are
 * deployment-specific — they're derived from the operator's deployer wallet + nonce — so
 * they must come from a real `pnpm deploy-factory` run, never a hardcoded constant. A
 * transfer-agent operator deploys ONE factory and manages MANY cap tables under it; the
 * factory owner controls the beacon upgrade for all of them, so operators should own (and
 * register) their own factory rather than reuse someone else's.
 *
 * Usage (from repo root, talks to the Dockerized Mongo via the .env DATABASE_URL):
 *   pnpm factory:register --factory 0x... --implementation 0x...
 *   pnpm factory:register --factory 0x... --dry-run
 *
 * `upsertFactory` keeps a single factory record (one factory, many cap tables), so
 * re-running updates it in place.
 */
import { ethers } from "ethers";
import mongoose from "mongoose";
import getProvider from "../chain-operations/getProvider.js";
import { connectDB } from "../db/config/mongoose.ts";
import { readfactories } from "../db/operations/read.js";
import { upsertFactory } from "../db/operations/update.js";
import { isFlagPresent } from "../utils/commandLine.ts";
import { setupEnv } from "../utils/env.js";

setupEnv();

const getArgValue = (flag: string): string | undefined => {
    const idx = process.argv.indexOf(flag);
    if (idx === -1) return undefined;
    return process.argv[idx + 1];
};

const isAddress = (v: string | undefined): v is string => !!v && /^0x[0-9a-fA-F]{40}$/.test(v);

const main = async () => {
    if (isFlagPresent("--help") || isFlagPresent("-h")) {
        console.log(
            [
                "Register the CapTableFactory + implementation in Mongo (single-record upsert).",
                "",
                "  --factory <addr>         CapTableFactory address (required)",
                "  --implementation <addr>  CapTable implementation (optional; read from the factory onchain if omitted)",
                "  --dry-run                print the intended change, write nothing",
            ].join("\n")
        );
        return;
    }

    const factoryAddress = getArgValue("--factory");
    let implementationAddress = getArgValue("--implementation");
    const dryRun = isFlagPresent("--dry-run");

    if (!isAddress(factoryAddress)) {
        throw new Error(`--factory must be a 0x-prefixed 20-byte address (got: ${factoryAddress ?? "<missing>"})`);
    }
    if (implementationAddress !== undefined && !isAddress(implementationAddress)) {
        throw new Error(`--implementation must be a 0x-prefixed 20-byte address (got: ${implementationAddress})`);
    }

    // The implementation is an upgradeable beacon target, not a fixed constant. If it wasn't
    // passed explicitly, read the factory's CURRENT implementation onchain so the DB reflects
    // the live beacon — never hardcode it (a hardcoded impl goes stale after a beacon upgrade).
    if (!implementationAddress) {
        try {
            const factory = new ethers.Contract(
                factoryAddress,
                ["function capTableImplementation() view returns (address)"],
                getProvider()
            );
            const derived: string = await factory.capTableImplementation();
            if (isAddress(derived) && derived !== ethers.ZeroAddress) {
                implementationAddress = derived;
                console.log(`🔗 | Read implementation from factory onchain: ${implementationAddress}`);
            }
        } catch (err) {
            console.warn(
                "⚠️ | Could not read implementation from factory (continuing; implementation_address is informational):",
                err instanceof Error ? err.message : err
            );
        }
    }

    await connectDB();

    const before = await readfactories();
    console.log(
        "before:",
        before.map((f: any) => ({ factory_address: f.factory_address, implementation_address: f.implementation_address }))
    );

    const payload: { factory_address: string; implementation_address?: string } = { factory_address: factoryAddress };
    if (implementationAddress) payload.implementation_address = implementationAddress;

    if (dryRun) {
        console.log(`🔎 | [dry-run] would upsert ${JSON.stringify(payload)}`);
        return;
    }

    const factory = await upsertFactory(payload);
    console.log(
        `✅ | Registered factory_address=${factory.factory_address} implementation_address=${factory.implementation_address ?? "(unset)"}`
    );
};

main()
    .catch((err) => {
        console.error("❌ | Factory registration failed:", err);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
