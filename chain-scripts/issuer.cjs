const { ethers } = require("ethers");

// ABI & Contract Address
const COUNTER_ABI = require("../chain/out/Issuer.sol/CapTableIssuer.json").abi;
const CONTRACT_ADDRESS = "0x5fbdb2315678afecb367f032d93f642f64180aa3";

// Replace with your wallet private key (keep this safe and NEVER expose in client-side code)
const WALLET_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

async function main() {
    const customNetwork = {
        chainId: 31337,
        name: "local",
    };

    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545", customNetwork);

    const blockNumber = await provider.getBlockNumber();
    console.log("Current block number:", blockNumber);

    const wallet = new ethers.Wallet(WALLET_PRIVATE_KEY, provider);
    const balance = await provider.getBalance(wallet.address);
    console.log("Ether balance:", ethers.utils.formatEther(balance));

    const contract = new ethers.Contract(CONTRACT_ADDRESS, COUNTER_ABI, wallet);

    console.log("Fetching issuer cap table...");
    try {
        const updateLegalName = await contract.updateLegalName("Poetic Justice");
        await updateLegalName.wait();
        console.log("Legal name updated successfully!");

        const newIssuer = await contract.getIssuer();
        console.log("New issuer with name: ", newIssuer);
    } catch (err) {
        console.error("Error updating legal name", err);
    }
}

main().catch(console.error);
