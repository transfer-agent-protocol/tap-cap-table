const fs = require("fs").promises;
const path = require("path");

const ROOT_PATH = "./src/custom-offchain-scripts/samples/";

async function readAndParseJSON(inputPath, notRealCompany) {
    const dataPath = path.join(ROOT_PATH + notRealCompany, inputPath);
    try {
        const data = await fs.readFile(dataPath, "utf8");
        const jsonData = JSON.parse(data);
        return jsonData;
    } catch (err) {
        console.error(`Error reading file: ${err}`);
    }
}

module.exports = readAndParseJSON;
