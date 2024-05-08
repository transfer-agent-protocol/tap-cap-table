/*
Entrypoint for our long running event poller
*/
import { startEventProcessing } from "./chain-operations/transactionPoller";
import { isFlagPresent } from "./utils/commandLine";

const options = {
    finalizedOnly: isFlagPresent("--finalized-only"),
};
console.log("Parsed options: ", options, " from ", process.argv);
await startEventProcessing(options);
