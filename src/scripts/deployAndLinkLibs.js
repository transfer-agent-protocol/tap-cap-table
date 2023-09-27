import { config } from 'dotenv';
import { ethers } from "ethers";
import CAP_TABLE_ISSUANCE from "../../chain/out/CapTableLibs.sol/StockIssuanceLib.json" assert { type: "json" };
import CAP_TABLE_TRANSFER from "../../chain/out/CapTableLibs.sol/StockTransferLib.json" assert { type: "json" };
import { spawn } from 'child_process';


function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
config();


const contracts = ["StockIssuanceLib", "StockTransferLib"]
const deployAndLinkLibs = async () => {

    const { abi: abiIssuance, bytecode: bytecodeIssuance } = CAP_TABLE_ISSUANCE;
    const { abi: abiTransfer, bytecode: bytecodeTransfer } = CAP_TABLE_TRANSFER;

    const WALLET_PRIVATE_KEY = process.env.PRIVATE_KEY_FAKE_ACCOUNT;
    const customNetwork = { chainId: 31337, name: "local" };
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545", customNetwork);
    const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);

    const issuanceLibfactory = new ethers.ContractFactory(abiIssuance, bytecodeIssuance, wallet);
    const transferLibfactory = new ethers.ContractFactory(abiTransfer, bytecodeTransfer, wallet);
    const issuanceLibContract = await issuanceLibfactory.deploy();
    await sleep(300)
    const transferLibContract = await transferLibfactory.deploy();


    const contractAddresses = [issuanceLibContract.target, transferLibContract.target]
    const libariesArgs =
        Array(contractAddresses.length)
            .fill(null)
            .map((_, idx) =>
                ["--libraries", `src/CapTableLib.sol:${contracts[idx]}:${contractAddresses[idx]}`]
            )
            .flat()

    console.log({libariesArgs})
    const subprocess = spawn('forge', ['build', '--via-ir', ...libariesArgs]);

    subprocess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    subprocess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    subprocess.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });

}

(async() => await deployAndLinkLibs())()
