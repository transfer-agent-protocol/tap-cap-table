/*
 * Fast-forward the event poller index (`last_processed_block`) for one or all issuers.
 *
 * The poller (server/chain-operations/transactionPoller.ts) advances each issuer's
 * `last_processed_block` toward chain head. When an issuer is far behind head (large
 * backlog) or otherwise stuck, the off-chain DB stops reflecting new blocks and the
 * block number appears frozen. This script jumps `last_processed_block` to (near) the
 * current chain head so the poller stops chasing the backlog and only watches new
 * blocks — unblocking feature work.
 *
 * Run from the repo root (talks to the Dockerized Mongo via the .env DATABASE_URL):
 *   pnpm poller:fast-forward                  # all active issuers -> current chain head
 *   pnpm poller:fast-forward --issuer <id>    # only this issuer
 *   pnpm poller:fast-forward --block <n>      # explicit target block (skips RPC head lookup)
 *   pnpm poller:fast-forward --buffer <n>     # target = head - n (default 0; re-scan last n blocks)
 *   pnpm poller:fast-forward --dry-run        # print intended changes, write nothing
 *
 * Reuses the server's env/DB/provider helpers so it honors .env (DATABASE_URL, RPC_URL).
 */
import mongoose from "mongoose";
import getProvider from "../chain-operations/getProvider.js";
import { connectDB } from "../db/config/mongoose.ts";
import { readAllIssuers, readIssuerById } from "../db/operations/read.js";
import { updateIssuerById } from "../db/operations/update.js";
import { isFlagPresent } from "../utils/commandLine.ts";
import { setupEnv } from "../utils/env.js";

setupEnv();

const getArgValue = (flag: string): string | undefined => {
    const idx = process.argv.indexOf(flag);
    if (idx === -1) return undefined;
    return process.argv[idx + 1];
};

const parseNonNegativeInt = (raw: string | undefined, flag: string): number | undefined => {
    if (raw === undefined) return undefined;
    const value = Number.parseInt(raw, 10);
    if (Number.isNaN(value) || value < 0) {
        throw new Error(`Invalid ${flag}: "${raw}" (expected a non-negative integer)`);
    }
    return value;
};

const main = async () => {
    if (isFlagPresent("--help") || isFlagPresent("-h")) {
        console.log(
            [
                "Fast-forward the poller index (last_processed_block).",
                "",
                "  --issuer <id>   only this issuer (default: all issuers with deployed_to)",
                "  --block <n>     explicit target block (default: current chain head)",
                "  --buffer <n>    target = head - n (default 0; ignored with --block)",
                "  --dry-run       print intended changes without writing",
            ].join("\n")
        );
        return;
    }

    const issuerId = getArgValue("--issuer");
    const explicitBlock = parseNonNegativeInt(getArgValue("--block"), "--block");
    const buffer = parseNonNegativeInt(getArgValue("--buffer"), "--buffer") ?? 0;
    const dryRun = isFlagPresent("--dry-run");

    await connectDB();

    // Resolve the target block: explicit --block wins, otherwise current chain head - buffer.
    let targetBlock: number;
    if (explicitBlock !== undefined) {
        targetBlock = explicitBlock;
        console.log(`🎯 | Target block (explicit): ${targetBlock}`);
    } else {
        const head = await getProvider().getBlockNumber();
        targetBlock = Math.max(head - buffer, 0);
        console.log(`🔗 | Chain head ${head}, buffer ${buffer} -> target block ${targetBlock}`);
    }

    // Resolve the target issuers.
    let issuers: any[];
    if (issuerId) {
        const issuer = await readIssuerById(issuerId);
        if (!issuer) {
            throw new Error(`Issuer ${issuerId} not found`);
        }
        issuers = [issuer];
    } else {
        issuers = (await readAllIssuers()).filter((i: any) => i.deployed_to);
    }

    if (issuers.length === 0) {
        console.log("⚠️ | No active issuers (with deployed_to) to fast-forward.");
        return;
    }

    console.log(`${dryRun ? "🔎 [dry-run] " : ""}Fast-forwarding ${issuers.length} issuer(s) to block ${targetBlock}`);
    for (const issuer of issuers) {
        const before = issuer.last_processed_block;
        if (dryRun) {
            console.log(`🔎 | [dry-run] ${issuer._id}: last_processed_block ${before} -> ${targetBlock}`);
            continue;
        }
        await updateIssuerById(issuer._id, { last_processed_block: targetBlock });
        console.log(`✅ | ${issuer._id}: last_processed_block ${before} -> ${targetBlock}`);
    }
};

main()
    .catch((err) => {
        console.error("❌ | Fast-forward failed:", err);
        process.exitCode = 1;
    })
    .finally(async () => {
        await mongoose.disconnect();
    });
