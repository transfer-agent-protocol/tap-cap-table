import { Router } from "express";
import { validateAndCreateVestingTerms } from "../db/controllers/vestingTermsController.js";
import { countVestingTerms, readVestingTermsById } from "../db/operations/read.js";

const vestingTerms = Router();

/// @dev: Vesting Terms are complex and will not be supported in 2023. Leaving here for completeness of routes.

vestingTerms.get("/", async (req, res) => {
    res.send(`Hello Vesting Terms!`);
});

vestingTerms.get("/id/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const vestingTerms = await readVestingTermsById(id);
        res.status(200).send(vestingTerms);
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send(`${error}`);
    }
});

vestingTerms.get("/total-number", async (_, res) => {
    try {
        const totalVestingTerms = await countVestingTerms();
        res.status(200).send(totalVestingTerms.toString());
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send(`${error}`);
    }
});

vestingTerms.post("/create", async (req, res) => {
    try {
        const vestingTerms = await validateAndCreateVestingTerms(req.body);

        res.status(200).send({ vestingTerms });
    } catch (error) {
        console.error(`error: ${error}`);
        res.status(500).send(`${error}`);
    }
});

export default vestingTerms;
