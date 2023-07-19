const { ethers } = require("ethers");
console.log(Object.keys(ethers.providers));

async function main() {
    // console.log("ethers ", ethers);
    const customNetwork = {
        chainId: 31337,
        name: "local",
    };

    const provider = new ethers.providers.JsonRpcProvider("http://127.0.0.1:8545", customNetwork);

    const blockNumber = await provider.getBlockNumber();
    console.log("Current block number:", blockNumber);

    // Replace with your wallet private key (keep this safe and NEVER expose in client-side code)
    const PRIVATE_KEY = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    const balance = await provider.getBalance(wallet.address);
    console.log("Ether balance:", ethers.utils.formatEther(balance));

    // ABI & Contract Address
    const COUNTER_ABI = require("./chain/out/Counter.sol/Counter.json").abi;
    const CONTRACT_ADDRESS = "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512";

    const counterContract = new ethers.Contract(CONTRACT_ADDRESS, COUNTER_ABI, wallet);

    console.log("initializing counter");
    try {
        const setCounter = await counterContract.setNumber(1374);
        await setCounter.wait();
        console.log("Counter set successfully!");

        const increment = await counterContract.increment();
        await increment.wait();
        console.log("Counter incremented successfully!");
    } catch (err) {
        console.error("Error incrementing counter:", err);
    }
}

main().catch(console.error);
