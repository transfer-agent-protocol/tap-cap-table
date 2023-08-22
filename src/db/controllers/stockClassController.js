import { convertUUIDToBytes16 } from "../../utils/convertUUID.js";
import { toScaledBigNumber } from "../../utils/convertToFixedPointDecimals.js";
import { createStockClass } from "../operations/create.js";

export const validateAndCreateStockClass = async (data) => {
    // First: validate the manifest against OCF, for the stockclass schema
    // TODO

    // Second: create StockClass in DB
    const stockClass = await createStockClass(data);

    console.log("StockClass created:", stockClass);

    return stockClass;
};

/// @dev: controller handles conversion from OCF type to Onchain types and creates the stock class.
export const convertAndReflectStockClassOnchain = async (contract, stockClass) => {
    // First: convert OCF Types to Onchain Types
    const stockClassIdBytes16 = convertUUIDToBytes16(stockClass._id);
    const scaledSharePrice = toScaledBigNumber(stockClass.price_per_share.amount);
    const scaledShares = toScaledBigNumber(stockClass.initial_shares_authorized);

    console.log("Stock Class ID offchain", stockClass._id);
    console.log("Stock Class ID converted to bytes16", stockClassIdBytes16);

    // Second: create stock class onchain
    const tx = await contract.createStockClass(stockClassIdBytes16, stockClass.class_type, scaledSharePrice, scaledShares);
    await tx.wait();

    console.log("Stock Class created  onchain");
};

//TODO: to decide if we want to also return offchain data.
export const getStockClassById = async (contract, id) => {
    // First: convert OCF Types to Onchain Types
    const stockClassIdBytes16 = convertUUIDToBytes16(id);
    // Second: get stock class onchain
    const stockClassAdded = await contract.getStockClassById(stockClassIdBytes16);
    const stockClassId = stockClassAdded[0];
    const classType = stockClassAdded[1];
    const pricePerShare = stockClassAdded[2];
    const initialSharesAuthorized = stockClassAdded[3];
    console.log("Stock Class:", { stockClassId, classType, pricePerShare, initialSharesAuthorized });

    return { stockClassId, classType, pricePerShare, initialSharesAuthorized };
};

export const getTotalNumberOfStockClasses = async (contract) => {
    const totalStockClasses = await contract.getTotalNumberOfStockClasses();
    console.log("Total number of stock classes:", totalStockClasses.toString());
    return totalStockClasses.toString();
};
