const { ethers } = require("ethers");

// ABI & Contract Address
const CAP_TABLE_ABI = require("../chain/out/CapTable.sol/CapTable.json").abi;
const CONTRACT_ADDRESS = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";

// Replace with your wallet private key (keep this safe and NEVER expose in client-side code)
const WALLET_PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

// script to deploy the contract
/*
forge create --rpc-url http://127.0.0.1:8545 --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80 src/CapTable.sol:CapTable --constructor-args "1212-1212-1212" "Poet Network" "10000000"
*/

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

    const contract = new ethers.Contract(CONTRACT_ADDRESS, CAP_TABLE_ABI, wallet);

    console.log("Fetching cap table...");
    try {
        const updateLegalName = await contract.updateLegalName("Poetic Justice");
        await updateLegalName.wait();
        console.log("Legal name updated successfully!");

        const newIssuer = await contract.getIssuer();
        console.log("New issuer with name: ", newIssuer);

        const stakeholderId = "111-111-111";
        const newStakeholder = await contract.createStakeholder(stakeholderId);
        await newStakeholder.wait();

        const stakeHolderAdded = await contract.getStakeholder(stakeholderId);
        console.log("Getting new stakeholder ", stakeHolderAdded);

        const newStockClass = await contract.createStockClass("CS-1", "COMMON", 100, 100, 4000000);

        await newStockClass.wait();

        const stockClassAdded = await contract.getStockClass(0);
        console.log("Getting new stock class:");
        console.log("ID:", stockClassAdded[0]);
        console.log("Type:", stockClassAdded[1]);
        console.log("Price Per Share:", ethers.utils.formatUnits(stockClassAdded[2], 6)); // Formatting to 6 decimals for clarity
        console.log("Par Value:", ethers.utils.formatUnits(stockClassAdded[3], 6)); // Formatting to 6 decimals for clarity
        console.log("Initial Shares Authorized:", stockClassAdded[4].toString());
    } catch (err) {
        console.error("Error updating legal name", err);
    }
}

main().catch(console.error);
