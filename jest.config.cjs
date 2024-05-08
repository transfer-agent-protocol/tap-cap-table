/** @type {import('ts-jest').JestConfigWithTsJest} */

// This allows us to avoid messing with the state of people's standard dev database
process.env["DATABASE_OVERRIDE"] = "jest-integration";
process.env["USE_ENV_FILE"] = ".env.test.local";

/** @type {import('jest').Config} */
module.exports = {
    testEnvironment: "jest-environment-node",
    transformIgnorePatterns: ["node_modules/(?!(p-retry|is-network-error)/)"],
    transform: {
        "^.+\\.(js|ts|jsx)$": "babel-jest",
    },
    // Indicates whether each individual test should be reported during the run
    verbose: true,
};
