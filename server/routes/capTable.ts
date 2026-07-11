import { Router } from "express";
import Issuer from "../db/objects/Issuer";
import Stakeholder from "../db/objects/Stakeholder";
import StockClass from "../db/objects/StockClass";
import { StockIssuance } from "../db/objects/transactions/issuance";
import { getIssuerContract } from "../utils/caches";
import { decimalScaleValue } from "../utils/convertToFixedPointDecimals";
import { convertUUIDToBytes16 } from "../utils/convertUUID";

export const capTable = Router();

capTable.get("/", async (req, res) => {
	res.send("Hello Cap Table!");
});

/**
 * Holdings from the chain (getAveragePosition), joined with Mongo metadata.
 *
 * Previously we only queried positions for stakeholder/class pairs that already
 * had a StockIssuance doc written by the poller — so a lagging poller made the
 * UI look empty even when shares existed onchain. We now iterate every known
 * stakeholder × stock class from Mongo (including register-onchain metadata).
 */
capTable.get("/holdings/stock", async (req, res) => {
	const issuerId = req.query.issuerId;
	try {
		const stakeholders = await Stakeholder.find({ issuer: issuerId });
		const stockClasses = await StockClass.find({ issuer: issuerId });
		const issuer = await Issuer.findById(issuerId);

		if (!issuer?.deployed_to) {
			return res.status(400).send("Issuer has no deployed cap table address");
		}

		const { contract } = await getIssuerContract(issuer);
		const holdings = [];

		for (const stakeholder of stakeholders) {
			for (const stockClass of stockClasses) {
				try {
					const [quantityPrice, quantity, timestamp] = await contract.getAveragePosition(
						convertUUIDToBytes16(stakeholder._id),
						convertUUIDToBytes16(stockClass._id),
					);
					if (quantity == 0n || quantity === 0 || quantity === "0") {
						continue;
					}
					const q = Number(quantity);
					const qp = Number(quantityPrice);
					if (!Number.isFinite(q) || q === 0) continue;
					const sharePrice = q !== 0 ? qp / q : 0;
					holdings.push({
						stockClass,
						stakeholder,
						quantity: q / decimalScaleValue,
						sharePrice: sharePrice / decimalScaleValue,
						timestamp: Number(timestamp),
					});
				} catch (pairErr) {
					// Skip pairs the contract rejects (e.g. unknown ids) without failing the whole request
					console.warn(
						`getAveragePosition failed for ${stakeholder._id}/${stockClass._id}:`,
						pairErr?.message || pairErr,
					);
				}
			}
		}

		// Also surface issuance count from Mongo (poller mirror) for debugging
		const issuanceCount = await StockIssuance.countDocuments({ issuer: issuerId });

		res.send({
			holdings,
			stockClasses,
			stakeholders,
			issuer,
			meta: { issuanceCount, positions: holdings.length },
		});
	} catch (error) {
		console.error(error);
		res.status(500).send(`${error}`);
	}
});
