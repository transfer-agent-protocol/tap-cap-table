import { startServer } from "./app.js";

// Function to check if the flag is present
const isFlagPresent = (flag) => process.argv.includes(flag);

// Setting the default value of the flag to true
const finalizedOnly = isFlagPresent("--finalized-only");

console.log("Finalized Only:", finalizedOnly);

startServer(finalizedOnly);
