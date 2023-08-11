import Issuer from "../objects/Issuer.js";

export const createIssuer = (issuerData) => {
    const issuer = new Issuer(issuerData);
    return issuer.save();
};
