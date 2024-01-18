import { config } from "dotenv";
import { ethers } from "ethers";
config();

const RPC_URL = process.env.RPC_URL;
const CHAIN_ID = process.env.CHAIN_ID;

const LOCAL_RPC = "http://127.0.0.1:8545";

const getProvider = () => {
    let provider;
    if (RPC_URL === LOCAL_RPC) {
        console.log("🔗 | Connecting to local network: ", RPC_URL);
        const customNetwork = {
            chainId: parseInt(CHAIN_ID),
            name: "local",
        };
        provider = new ethers.JsonRpcProvider(RPC_URL, customNetwork);
    } else {
        console.log("🔗 | Connecting to network: ", RPC_URL);
        provider = new ethers.JsonRpcProvider(RPC_URL);
    }
    return provider;
};

export default getProvider;
