import { convertAndReflectStakeholderOnchain } from "../controllers/stakeholderController.js";
import { convertAndReflectStockClassOnchain } from "../controllers/stockClassController.js";
import { convertAndSeedIssuanceStockOnchain, convertAndSeedTransferStockOnchain } from "../controllers/transactions/seed.js";
import { getAllIssuerDataById } from "../db/operations/read.js";
import { convertTimeStampToUint40, toScaledBigNumber } from "../utils/convertToFixedPointDecimals.js";
import { convertBytes16ToUUID, convertUUIDToBytes16 } from "../utils/convertUUID.js";
import { extractArrays } from "../utils/flattenPreprocessorCache.js";
import { preProcessorCache } from "../utils/caches.js";
import { readIssuerById } from "../db/operations/read.js";
import sleep from "../utils/sleep.js";

export const verifyIssuerAndSeed = async (contract, id) => {
    const uuid = convertBytes16ToUUID(id);
    const issuer = await readIssuerById(uuid);

    if (!issuer.is_manifest_created) return;

    await initiateSeeding(uuid, contract);
    console.log(`✅ | Completed Seeding issuer ${uuid} on chain`);

    const arrays = extractArrays(preProcessorCache[uuid]);
    await seedActivePositionsAndActiveSecurityIds(arrays, contract);

    console.log("⏳ | Checking pre-processor cache ", JSON.stringify(preProcessorCache[uuid], null, 2));
};

export const initiateSeeding = async (uuid, contract) => {
    console.log("⏳ | Initiating Seeding...");
    const { stakeholders, stockClasses, stockIssuances, stockTransfers } = await getAllIssuerDataById(uuid);

    await sleep(300);

    for (const stakeholder of stakeholders) {
        stakeholder.id = stakeholder._id;

        if (!stakeholder.current_relationship) {
            stakeholder.current_relationship = "";
        }

        await convertAndReflectStakeholderOnchain(contract, stakeholder);
    }

    await sleep(300);

    for (const stockClass of stockClasses) {
        stockClass.id = stockClass._id;
        await convertAndReflectStockClassOnchain(contract, stockClass);
    }

    await sleep(300);
};

export const seedActivePositionsAndActiveSecurityIds = async (arrays, contract) => {
    const { stakeholders, stockClasses, quantities, securityIds, sharePrices, timestamps } = arrays;

    console.log("💾 | stakeholders ", stakeholders);
    console.log("💾 | stockClasses ", stockClasses);
    console.log("💾 | quantities ", quantities);
    console.log("💾 | securityIds ", securityIds);
    console.log("💾 | sharePrices ", sharePrices);
    console.log("💾 | timestamps ", timestamps);

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
