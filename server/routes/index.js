import { Router } from "express";

const router = Router();

router.get("/", async (req, res) => {
    console.log("Welcome to TAP");
    res.status(200).send(`Welcome to the future of Transfer Agents 💸`);
});

export default router;
