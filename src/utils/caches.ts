import { getContractInstance } from "../chain-operations/getContractInstances.js";

interface CachePayload {
    contract: any;
    provider: any;
    libraries: any;
}

// Centralized contract manager/cache
const contractCache: {[key: string]: CachePayload} = {};

export const getIssuerContract = async (issuer): Promise<CachePayload> => {
    if (!contractCache[issuer._id]) {
        const { contract, provider, libraries } = await getContractInstance(issuer.deployed_to); 
        contractCache[issuer._id] = { contract, provider, libraries };
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
