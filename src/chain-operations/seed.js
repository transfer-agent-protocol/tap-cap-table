import { convertAndReflectStakeholderOnchain } from "../controllers/stakeholderController.js";
import { convertAndReflectStockClassOnchain } from "../controllers/stockClassController.js";
import { convertAndSeedIssuanceStockOnchain, convertAndSeedTransferStockOnchain } from "../controllers/transactions/seed.js";
import { getAllIssuerDataById } from "../db/operations/read.js";
import { convertTimeStampToUint40, toScaledBigNumber } from "../utils/convertToFixedPointDecimals.js";
import { convertUUIDToBytes16 } from "../utils/convertUUID.js";
import { extractArrays } from "../utils/flattenPreprocessorCache.js";

import { preProcessorCache } from "../utils/caches.js";

export const verifyIssuerAndSeed = async (contract, id) => {
    const uuid = convertBytes16ToUUID(id);
    const issuer = await readIssuerById(uuid);

    if (!issuer.is_manifest_created) return;

    const arrays = extractArrays(preProcessorCache[issuerId]);
    await seedActivePositionsAndActiveSecurityIds(arrays, contract);

    await initiateSeeding(uuid, contract);
    console.log(`Completed Seeding issuer ${uuid} on chain`);

    console.log("checking pre-processor cache ", JSON.stringify(preProcessorCache[issuerId], null, 2));
};
const initiateSeeding = async (uuid, contract) => {
    console.log("Initiating Seeding...");
    const { stakeholders, stockClasses, stockIssuances, stockTransfers } = await getAllIssuerDataById(uuid);

    for (const stakeholder of stakeholders) {
        stakeholder.id = stakeholder._id;

        if (!stakeholder.current_relationship) {
            stakeholder.current_relationship = "";
        }

        await convertAndReflectStakeholderOnchain(contract, stakeholder);
    }
    for (const stockClass of stockClasses) {
        stockClass.id = stockClass._id;
        await convertAndReflectStockClassOnchain(contract, stockClass);
    }

    for (const stockIssuance of stockIssuances) {
        stockIssuance.id = stockIssuance._id;
        await convertAndSeedIssuanceStockOnchain(contract, stockIssuance);
    }

    for (const stockTransfer of stockTransfers) {
        stockTransfer.id = stockTransfer._id;
        await convertAndSeedTransferStockOnchain(contract, stockTransfer);
    }
};

const seedActivePositionsAndActiveSecurityIds = async (arrays, contract) => {
    const { stakeholders, stockClasses, quantities, securityIds, sharePrices, timestamps } = arrays;

    console.log(" stakeholders ", stakeholders);
    console.log(" stockClasses ", stockClasses);
    console.log(" quantities ", quantities);
    console.log(" securityIds ", securityIds);
    console.log(" sharePrices ", sharePrices);
    console.log(" timestamps ", timestamps);

    // convert them.
    const stakeholderIdsBytes16 = stakeholders.map((stakeholder) => convertUUIDToBytes16(stakeholder));
    const stockClassIdsBytes16 = stockClasses.map((stockClass) => convertUUIDToBytes16(stockClass));
    const quantitiesScaled = quantities.map((quantity) => toScaledBigNumber(quantity));
    const securityIdsBytes16 = securityIds.map((securityId) => convertUUIDToBytes16(securityId));
    const sharePricesScaled = sharePrices.map((sharePrice) => toScaledBigNumber(sharePrice));
    const timestampsScaled = timestamps.map((timestamp) => convertTimeStampToUint40(timestamp));

    const tx = await contract.seedMultipleActivePositionsAndSecurityIds(
        stakeholderIdsBytes16,
        securityIdsBytes16,
        stockClassIdsBytes16,
        quantitiesScaled,
        sharePricesScaled,
        timestampsScaled
    );

    await tx.wait();

    console.log("Seeded Active Positions and Active Security Ids onchain");
};
