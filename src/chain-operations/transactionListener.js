import getContractInstance from "./getContractInstances.js";
import { convertBytes16ToUUID } from "../utils/convertUUID.js";
import { toDecimal } from "../utils/convertToFixedPointDecimals.js";
import { updateStakeholderById, updateStockClassById, upsertStockIssuanceBySecId  } from "../db/operations/update.js";
import { readStakeholderById, getAllIssuerDataById } from "../db/operations/read.js";
import { convertAndReflectStakeholderOnchain } from "../db/controllers/stakeholderController.js";
import { convertAndReflectStockClassOnchain } from "../db/controllers/stockClassController.js";
import { convertAndCreateIssuanceStockOnchain } from "../db/controllers/transactions/issuanceController.js";
import { convertAndCreateTransferStockOnchain } from "../db/controllers/transactions/transferController.js";
import StockIssuance from "../db/objects/transactions/issuance/StockIssuance.js";

async function startOnchainListeners(chain) {
    console.log("🌐| Initiating on-chain event listeners...");

    const { contract, provider } = await getContractInstance(chain);

    contract.on("error", (error) => {
        console.error("Error:", error);
    });

    contract.on("IssuerCreated", async (id) => {
        console.log("IssuerCreated Event Emitted!", id);
        const uuid = convertBytes16ToUUID(id);
        const { stakeholders, stockClasses, stockIssuances, stockTransfers } = await getAllIssuerDataById(uuid);
        console.log({
            stakeholders,
            stockClasses,
            stockIssuances,
            stockTransfers,
        });

        for (const stakeholder of stakeholders) {
            stakeholder.id = stakeholder._id;

            // hacky way of setting current_relationship
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
            all:stockIssuances.map(i => i.security_id),
            filter: filteredStockIssuances.map(i => i.security_id),
            other:stockIssuances.map(i => i.security_id).filter(e => allRelevantSecurityIds.includes(e))
        })
        for (const stockIssuance of filteredStockIssuances) {
            stockIssuance.id = stockIssuance._id;

            await convertAndCreateIssuanceStockOnchain(contract, stockIssuance);
        }

        for (const stockTransfer of stockTransfers) {
            const transferrorStockIssuance = await StockIssuance.findOne({security_id: stockTransfer.security_id})
            const transfereeStockIssuance = await StockIssuance.findOne({security_id: stockTransfer.resulting_security_ids[0] })
            const transfer = {
                quantity: stockTransfer.quantity,
                isBuyerVerified: true,
                transferorId: transferrorStockIssuance.stakeholder_id,
                transfereeId: transfereeStockIssuance.stakeholder_id,
                stockClassId: transferrorStockIssuance.stock_class_id,
                sharePrice: transferrorStockIssuance.share_price.amount,
            }

            await convertAndCreateTransferStockOnchain(contract, transfer);
        }
        console.log(`Completed Seeding issuer ${uuid} on chain`)
    });

    contract.on("StakeholderCreated", async (id, _) => {
        console.log("StakeholderCreated Event Emitted!", id);

        const incomingStakeholderId = convertBytes16ToUUID(id);

        const stakeholder = await updateStakeholderById(incomingStakeholderId, { is_onchain_synced: true });

        console.log("✅ | Stakeholder confirmation onchain ", stakeholder);
    });

    contract.on("StockClassCreated", async (id, _) => {
        console.log("StockClassCreated Event Emitted!", id);

        const incomingStockClassId = convertBytes16ToUUID(id);

        const stockClass = await updateStockClassById(incomingStockClassId, { is_onchain_synced: true });

        console.log("✅ | StockClass confirmation onchain ", stockClass);
    });

    contract.on("StockTransferCreated", async (stock, event) => {
        console.log("StockTransferCreated Event Emitted!", stock.id);

        // const quantity = toDecimal(stock.quantity);

        // console.log("quantity", quantity);
    });

    // @dev events return both an array and object, depending how you want to access. We're using objects
    contract.on("StockIssuanceCreated", async (stock, event) => {
        console.log("StockIssuanceCreated Event Emitted!", stock.id);

        // TODO: (Victor): Think about data validation if the transaction is created onchain, without going through the API

        const sharePriceOCF = {
            amount: toDecimal(stock.share_price).toString(),
            currency: "USD",
        };

        const block = await provider.getBlock(event.blockNumber);
        // Type represention of an ISO-8601 date, e.g. 2022-01-28.
        // TODO: I think if we want to back date historial transactions we will need an option to either pass date or create new one from block
        const dateOCF = new Date(block.timestamp * 1000).toISOString().split("T")[0];
        const costBasisOCF = { amount: toDecimal(stock.cost_basis).toString(), currency: "USD" };
        const share_numbers_issuedOCF = [
            {
                starting_share_number: toDecimal(stock.share_numbers_issued.starting_share_number).toString(),
                ending_share_number: toDecimal(stock.share_numbers_issued.ending_share_number).toString(),
            },
        ];

        const stakeholder = await readStakeholderById(convertBytes16ToUUID(stock.stakeholder_id));
        if (!stakeholder) {
            console.log("stakeholder is null");
            return;
        }

        console.log("stakeholer ", stakeholder);

        const security_id = convertBytes16ToUUID(stock.security_id)
        // find stock issuance by security
            // if exists update it
            //  else create a new one
        const createdStockIssuance = await upsertStockIssuanceBySecId(security_id, {
            _id: convertBytes16ToUUID(stock.id),
            object_type: stock.object_type,
            stock_class_id: convertBytes16ToUUID(stock.stock_class_id),
            stock_plan_id: convertBytes16ToUUID(stock.stock_plan_id),
            share_numbers_issued: share_numbers_issuedOCF,
            share_price: sharePriceOCF,
            quantity: toDecimal(stock.quantity).toString(),
            vesting_terms_id: convertBytes16ToUUID(stock.vesting_terms_id),
            cost_basis: costBasisOCF,
            stock_legend_ids: convertBytes16ToUUID(stock.stock_legend_ids),
            issuance_type: stock.issuance_type,
            comments: stock.comments,
            security_id,
            date: dateOCF,
            custom_id: convertBytes16ToUUID(stock.custom_id), //TODO: is this uuid or custom id?
            stakeholder_id: stakeholder._id,
            board_approval_date: stock.board_approval_date,
            stockholder_approval_date: stock.stockholder_approval_date,
            consideration_text: stock.consideration_text,
            security_law_exemptions: stock.security_law_exemptions,
            // TAP Native Fields
            issuer: stakeholder.issuer,
            is_onchain_synced: true,
        });

        console.log("Stock created off-chain", createdStockIssuance);
    });
}

export default startOnchainListeners;
