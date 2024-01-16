import { Router } from "express";

export const capTable = Router();

capTable.get("/", async (req, res) => {
    res.send("Hello Cap Table!");
});
