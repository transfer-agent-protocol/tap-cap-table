const fs = require("fs").promises;
const path = require("path");

async function readAndParseJSON(inputPath, notRealCompany) {
    const dataPath = path.join(`./custom-offchain-scripts/samples/${notRealCompany}`, inputPath);
    try {
        const data = await fs.readFile(dataPath, "utf8");
        const jsonData = JSON.parse(data);
        return jsonData;
    } catch (err) {
        console.error(`Error reading file: ${err}`);
    }
}

module.exports = readAndParseJSON;
