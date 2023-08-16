import { Router } from "express";
import { getIssuerById, createIssuer, reflectIssuerOnchain } from "../controllers/issuerController.js";

const issuer = Router();

issuer.get("/", getIssuerById);
issuer.post("/create", createIssuer);
issuer.post("/onchain/reflect", reflectIssuerOnchain);

export default issuer;
