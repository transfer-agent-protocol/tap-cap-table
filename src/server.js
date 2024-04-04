/*
Entrypoint for service
 */
import { startServer } from "./app";
import "./tracer";
import { isFlagPresent } from "./utils/commandLine";

const options = {
    finalizedOnly: isFlagPresent("--finalized-only"),
    runPoller: !isFlagPresent("--no-poller"),
};
console.log("Parsed options: ", options, " from ", process.argv);

startServer(options);
