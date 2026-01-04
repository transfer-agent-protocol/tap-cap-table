import { Router } from "express";
import { upsertFactory } from "../db/operations/update";

export const router = Router();

router.get("/", async (req, res) => {
    res.send("Hello Factory!");
});

router.post("/register", async (req, res) => {
    /*
    Register the factory contracts addresses
    */
    try {
        const { factory_address, implementation_address } = req.body;
        const factory = await upsertFactory({ factory_address, implementation_address });
        res.send({ factory });
    } catch (error) {
        console.error(error);
        res.status(500).send(`${error}`);
    }
});
