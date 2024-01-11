import getContractInstance from "../chain-operations/getContractInstances";

const CHAIN = process.env.CHAIN;

interface CachePayload {
    contract: any;
    provider: any;
    libraries: any;
}

// Centralized contract manager/cache
const contractCache: {[key: string]: CachePayload} = {};

const cacheIssuerContract = async (issuer, payload: CachePayload) => {
    contractCache[issuer._id] = payload;
}

export const getIssuerContract = async (issuer) => {
    if (!contractCache[issuer._id]) {
        const { contract, provider, libraries } = await getContractInstance(CHAIN, issuer.deployed_to); 
        await cacheIssuerContract(issuer, { contract, provider, libraries });
    }
    return contractCache[issuer._id];
}

/*
issuerId = {
        activePositions: {...},
        activeSecurityIdsByStockClass: {...},
    };
*/
export const preProcessorCache = {};
