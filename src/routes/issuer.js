import { Router } from "express";
import { getIssuerById, createIssuer } from "../controllers/issuerController.js"; // Importing the controller functions

const issuer = Router();

issuer.get("/", getIssuerById);
issuer.post("/create", createIssuer);

export default issuer;
