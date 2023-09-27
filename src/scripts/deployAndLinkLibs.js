import { config } from "dotenv";
import { ethers } from "ethers";
import CAP_TABLE_ISSUANCE from "../../chain/out/StockIssuance.sol/StockIssuanceLib.json" assert { type: "json" };
import CAP_TABLE_TRANSFER from "../../chain/out/StockTransfer.sol/StockTransferLib.json" assert { type: "json" };
import { spawn } from "child_process";
config();

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

const contracts = ["StockIssuanceLib", "StockTransferLib"];
const deployAndLinkLibs = async () => {
    const { abi: abiIssuance, bytecode: bytecodeIssuance } = CAP_TABLE_ISSUANCE;
    const { abi: abiTransfer, bytecode: bytecodeTransfer } = CAP_TABLE_TRANSFER;

    const WALLET_PRIVATE_KEY = process.env.PRIVATE_KEY_FAKE_ACCOUNT;
    const customNetwork = { chainId: 31337, name: "local" };
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545", customNetwork);
    const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);

    const issuanceLibFactory = new ethers.ContractFactory(abiIssuance, bytecodeIssuance, wallet);
    const transferLibFactory = new ethers.ContractFactory(abiTransfer, bytecodeTransfer, wallet);
    const issuanceLibContract = await issuanceLibFactory.deploy();
    await sleep(300);
    const transferLibContract = await transferLibFactory.deploy();

    const contractAddresses = [issuanceLibContract.target, transferLibContract.target];
    const librariesArgs = Array(contractAddresses.length)
        .fill(null)
        .map((_, idx) => ["--libraries", `src/transactions/${contracts[idx]}.sol:${contracts[idx]}:${contractAddresses[idx]}`])
        .flat();

    console.log({ librariesArgs });
    const subprocess = spawn("forge", ["build", "--via-ir", ...librariesArgs]);

    subprocess.stdout.on("data", (data) => {
        console.log(`stdout: ${data}`);
    });

    subprocess.stderr.on("data", (data) => {
        console.error(`stderr: ${data}`);
    });

    subprocess.on("close", (code) => {
        console.log(`child process exited with code ${code}`);
    });
};

(async () => await deployAndLinkLibs())();
