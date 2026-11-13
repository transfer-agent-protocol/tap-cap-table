import { ethers } from "ethers";
import CAP_TABLE from "../../chain/out/CapTable.sol/CapTable.json" with { type: "json" };
import CAP_TABLE_FACTORY from "../../chain/out/CapTableFactory.sol/CapTableFactory.json" with { type: "json" };
import { readfactories } from "../db/operations/read.js";
import { toScaledBigNumber } from "../utils/convertToFixedPointDecimals.js";
import { setupEnv } from "../utils/env.js";
import getTXLibContracts from "../utils/getLibrariesContracts.js";
import getProvider from "./getProvider.js";

setupEnv();

async function deployCapTable(issuerId, issuerName, initial_shares_authorized) {
    const WALLET_PRIVATE_KEY = process.env.PRIVATE_KEY;

    const provider = getProvider();

    const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
    console.log("🗽 | Wallet address: ", wallet.address);

    const factories = await readfactories();
    const factoryAddress = factories[0]?.factory_address;
    console.log({ factories, factoryAddress });

    if (!factoryAddress) {
        throw new Error(`❌ | Factory address not found`);
    }

    const capTableFactory = new ethers.Contract(factoryAddress, CAP_TABLE_FACTORY.abi, wallet);

    // Server is msg.sender → gets ADMIN. No separate operator needed (admin is implicitly operator).
    const tx = await capTableFactory.createCapTable(issuerId, issuerName, toScaledBigNumber(initial_shares_authorized), "0x0000000000000000000000000000000000000000");
    const receipt = await tx.wait();

    // Take the proxy from our own receipt. On a shared factory another mint can land before a
    // capTableProxies(count - 1) read, which would return someone else's cap table.
    const created = (receipt?.logs ?? [])
        .filter((log) => log.address.toLowerCase() === factoryAddress.toLowerCase())
        .map((log) => capTableFactory.interface.parseLog(log))
        .find((event) => event?.name === "CapTableCreated");
    if (!created) {
        throw new Error(`❌ | CapTableCreated not found in the createCapTable receipt ${tx.hash}`);
    }
    const capTableAddress = created.args.capTableProxy;

    const contract = new ethers.Contract(capTableAddress, CAP_TABLE.abi, wallet);

    console.log("✅ | Cap table contract address ", capTableAddress);
    const libraries = getTXLibContracts(capTableAddress, wallet);

    return {
        contract,
        provider,
        address: capTableAddress,
        libraries,
        deployHash: tx.hash,
    };
}

export default deployCapTable;
