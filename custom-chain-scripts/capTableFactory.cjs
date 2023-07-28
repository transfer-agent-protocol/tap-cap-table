const { ethers } = require("ethers");
const { v4: uuid } = require("uuid");
require("dotenv").config();

const CAP_TABLE_ABI = require("../chain/out/CapTableFactory.sol/CapTableFactory.json").abi;
const CONTRACT_ADDRESS = require("../chain/broadcast/CapTable.s.sol/420/run-latest.json").transactions[0].contractAddress;
const WALLET_PRIVATE_KEY = process.env.PRIVATE_KEY_FAKE_ACCOUNT;

const customNetwork = {
    chainId: 31337,
    name: "local",
};

const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545", customNetwork);
const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, CAP_TABLE_ABI, wallet);

async function createCapTable() {
    const issuerId = uuid();
    const legalName = "Def Jam Inc.";
    const initialShares = "1000000";

    try {
        const tx = await contract.createCapTable(issuerId, legalName, initialShares);
        await tx.wait();
    } catch (error) {
        console.log("Error encountered:", error);
    }
}

async function getCapTables() {
    try {
        const capTables = await contract.getTotalCapTables();
        console.log("Cap Tables:", capTables.toString());
    } catch (error) {
        console.log("Error encountered getting total cap tables:", error);
    }
}

async function main() {
    try {
        await createCapTable();
        await getCapTables();
    } catch (err) {
        if (err.reason) {
            console.error("Smart contract reverted with reason:", err.reason);
        } else {
            console.error("Error encountered:", err.message);
        }
    }
}

main().catch(console.error);
