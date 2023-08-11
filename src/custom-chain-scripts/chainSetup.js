import { config } from "dotenv";
import { createPublicClient, createWalletClient, http, getContract } from "viem";
import { optimismGoerli, localhost } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";

config();

import CAP_TABLE from "../../chain/out/CapTable.sol/CapTable.json" assert { type: "json" };
const { abi } = CAP_TABLE;

async function localSetup() {
    // if deployed using forge script
    //const CONTRACT_ADDRESS_LOCAL = require("../chain/broadcast/CapTable.s.sol/31337/run-latest.json").transactions[0].contractAddress;
    const CONTRACT_ADDRESS_LOCAL = "0x5fbdb2315678afecb367f032d93f642f64180aa3"; // fill in from capTableFactory

    const WALLET_PRIVATE_KEY = process.env.PRIVATE_KEY_FAKE_ACCOUNT;

    // const { abi, address } = wagmiContractConfig // how do I get this?

    const account = privateKeyToAccount(WALLET_PRIVATE_KEY);

    // const client = createPublicClient({
    //     chain: localhost,
    //     transport: http("http://127.0.0.1:8545"),
    // });

    const walletClient = createWalletClient({
        account,
        chain: localhost,
        transport: http("http://127.0.0.1:8545"),
    });

    const publicClient = createPublicClient({
        chain: localhost,
        transport: http(),
    });

    console.log("here");

    const chainId = await publicClient.getChainId();

    console.log("chain id", chainId);

    const contract = getContract({
        abi,
        address: CONTRACT_ADDRESS_LOCAL,
        //walletClient,
        publicClient,
    });

    console.log("contract ", contract);

    return { contract, publicClient };
}

async function optimismGoerliSetup() {
    // if deployed using forge script
    // const CONTRACT_ADDRESS_OPTIMISM_GOERLI = require("../chain/broadcast/CapTable.s.sol/420/run-latest.json").transactions[0].contractAddress;
    const CONTRACT_ADDRESS_OPTIMISM_GOERLI = "0x027A280A63376308658A571ac2DB5D612bA77912";
    const WALLET_PRIVATE_KEY = process.env.PRIVATE_KEY_POET_TEST;

    // const { abi, address } = wagmiContractConfig // how do I get this?

    const client = createPublicClient({
        chain: optimismGoerli,
        transport: http(), // defaulting to public node viem provides. Can add our alchemy goerli if we want
    });

    const account = privateKeyToAccount(WALLET_PRIVATE_KEY);

    const contract = getContract({
        abi,
        address: CONTRACT_ADDRESS_OPTIMISM_GOERLI,
        account,
        publicClient: client,
    });

    return { contract, client };
}

export { localSetup, optimismGoerliSetup };
