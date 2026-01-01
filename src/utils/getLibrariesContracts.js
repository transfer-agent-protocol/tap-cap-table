import { ethers } from "ethers";
import TX_HELPER from "../../chain/out/TxHelper.sol/TxHelper.json" with { type: "json" };

const getTXLibContracts = (contractTarget, wallet) => {
    const libraries = {
        txHelper: new ethers.Contract(contractTarget, TX_HELPER.abi, wallet),
    };
    return libraries;
};

export default getTXLibContracts;
