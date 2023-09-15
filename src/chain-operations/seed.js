import { convertBytes16ToUUID } from "../utils/convertUUID.js";
import { getAllIssuerDataById } from "../db/operations/read.js";
import { convertAndReflectStakeholderOnchain } from "../db/controllers/stakeholderController.js";
import { convertAndReflectStockClassOnchain } from "../db/controllers/stockClassController.js";
import { convertAndSeedTransferStockOnchain } from "../db/controllers/transactions/seed.js";
import StockIssuance from "../db/objects/transactions/issuance/StockIssuance.js";
import {  getAllIssuerDataById } from "../db/operations/read.js";

export const initiateSeeding = async (uuid) => {
    console.log('Intiating Seeding...')
    const { stakeholders, stockClasses, stockIssuances, stockTransfers } = await getAllIssuerDataById(uuid);

    console.log({
        stakeholders,
        stockClasses,
        stockIssuances,
        stockTransfers,
    });

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
    // Extracting the security IDs from stockTransfers
    const resultingSecurityIds = stockTransfers.map(transfer => transfer.resulting_security_ids[0])
    const balanceSecurityIds = stockTransfers.map(transfer => transfer.balance_security_id);

    // Combining and deduplicating the security IDs
    const allRelevantSecurityIds = [...new Set([...resultingSecurityIds, ...balanceSecurityIds])];

    const filteredStockIssuances = stockIssuances.filter(issuance => !allRelevantSecurityIds.includes(issuance.security_id));

    console.log({
        allRelevantSecurityIds: Array.from(allRelevantSecurityIds),
        all: stockIssuances.map(i => i.security_id),
        filter: filteredStockIssuances.map(i => i.security_id),
        other: stockIssuances.map(i => i.security_id).filter(e => allRelevantSecurityIds.includes(e))
    })

    for (const stockIssuance of filteredStockIssuances) {
        stockIssuance.id = stockIssuance._id;
        await convertAndCreateSeedStockOnchain(contract, stockIssuance);
    }

    for (const stockTransfer of stockTransfers) {
        const { _id: transferorStockId,
            stakeholder_id: transferorId,
            security_id: transferorSecId,
            share_price: { amount: sharePrice },
            stock_class_id: stockClassId,
        } = await StockIssuance.findOne({ security_id: stockTransfer.security_id })
        const {
            _id: transfereeStockId,
            stakeholder_id: transfereeId,
            security_id: transfereeSecId
        } = await StockIssuance.findOne({ security_id: stockTransfer.resulting_security_ids[0] })
        const transfer = {
            quantity: stockTransfer.quantity,
            isBuyerVerified: true,
            transferorId,
            transferorStockId,
            transferorSecId,
            transfereeId,
            transfereeStockId,
            transfereeSecId,
            stockClassId,
            sharePrice
        }

        await convertAndSeedTransferStockOnchain(contract, transfer);
    }
}
