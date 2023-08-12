import { Router } from "express";

const stakeholder = Router();

stakeholder.get("/", async (req, res) => {
    res.send(`Hello stakeholder!`);
});

stakeholder.get("/:id", async (req, res) => {
    const { id } = req.params;
});

stakeholder.post("/create", async (req, res) => {});

stakeholder.post("/reflect-onchain", async (req, res) => {});

export default stakeholder;
