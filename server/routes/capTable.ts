import { Router } from "express";
import Issuer from "../db/objects/Issuer";
import Stakeholder from "../db/objects/Stakeholder";
import StockClass from "../db/objects/StockClass";
import { StockIssuance } from "../db/objects/transactions/issuance";
import { unscale } from "@tap/units";
import { getIssuerContract } from "../utils/caches";
import { convertUUIDToBytes16 } from "../utils/convertUUID";

export const capTable = Router();

capTable.get("/", async (req, res) => {
	res.send("Hello Cap Table!");
});

/**
 * Holdings from the chain (getAveragePosition), joined with Mongo metadata.
 *
 * Mongo stakeholder/class lists are ALWAYS returned when the issuer exists —
 * even if deployed_to is missing. Only onchain position reads require a contract.
 * (Previously a missing contract returned 400 and wiped the entire manage UI.)
 */
capTable.get("/holdings/stock", async (req, res) => {
	const issuerId = req.query.issuerId;
	if (!issuerId || typeof issuerId !== "string") {
		return res.status(400).send("issuerId query param required");
	}

	try {
		const issuer = await Issuer.findById(issuerId);
		if (!issuer) {
			return res.status(404).send("Issuer not found");
		}

		const [stakeholders, stockClasses, issuanceCount] = await Promise.all([
			Stakeholder.find({ issuer: issuerId }),
			StockClass.find({ issuer: issuerId }),
			StockIssuance.countDocuments({ issuer: issuerId }),
		]);

		// No contract yet — still return mirror so the UI can show people/classes
		if (!issuer.deployed_to) {
			return res.send({
				holdings: [],
				stockClasses,
				stakeholders,
				issuer,
				meta: {
					issuanceCount,
					positions: 0,
					chainSkipped: true,
					reason: "Issuer has no deployed_to",
				},
			});
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
					const q = typeof quantity === "bigint" ? quantity : BigInt(quantity);
					if (q === 0n) continue;
					const qp = typeof quantityPrice === "bigint" ? quantityPrice : BigInt(quantityPrice);
					const sharePriceScaled = qp / q;
					holdings.push({
						stockClass,
						stakeholder,
						quantity: Number(unscale(q)),
						sharePrice: Number(unscale(sharePriceScaled)),
						timestamp: Number(timestamp),
					});
				} catch (pairErr) {
					console.warn(
						`getAveragePosition failed for ${stakeholder._id}/${stockClass._id}:`,
						pairErr?.message || pairErr,
					);
				}
			}
		}

		res.send({
			holdings,
			stockClasses,
			stakeholders,
			issuer,
			meta: { issuanceCount, positions: holdings.length, chainSkipped: false },
		});
	} catch (error) {
		console.error(error);
		res.status(500).send(`${error}`);
	}
});
