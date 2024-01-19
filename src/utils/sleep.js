function sleep(ms, logPrefix = null) {
    if (logPrefix) {
        console.log(`${logPrefix} ${(ms / 1000).toFixed(1)} seconds`);
    }
    return new Promise((resolve) => setTimeout(resolve, ms));
}

export default sleep;
