import { Router } from "express";
import {
    getAllStakeholders,
    createStakeholder,
    getStakeholderById,
    getTotalNumberOfStakeholders,
    reflectStakeholderOnchain,
} from "../controllers/stakeholderController.js"; // Importing the controller functions

const stakeholder = Router();

stakeholder.get("/", getAllStakeholders);
stakeholder.post("/create", createStakeholder);
stakeholder.get("/onchain/id/:id", getStakeholderById);
stakeholder.get("/onchain/total-number", getTotalNumberOfStakeholders);
stakeholder.post("/onchain/reflect", reflectStakeholderOnchain);

export default stakeholder;
