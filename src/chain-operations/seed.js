import { convertAndReflectStakeholderOnchain } from "../controllers/stakeholderController.js";
import { convertAndReflectStockClassOnchain } from "../controllers/stockClassController.js";
import { convertAndSeedIssuanceStockOnchain, convertAndSeedTransferStockOnchain } from "../controllers/transactions/seed.js";
import { getAllIssuerDataById } from "../db/operations/read.js";

export const initiateSeeding = async (uuid, contract) => {
    console.log("Intiating Seeding...");
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
