import { config } from "dotenv";
import fs from "fs";
import pathTools from "path";

const getEnvFile = (fileName) => {
    // Find the .env file by walking up from PWD. Do not go past the repo root, or the filesystem
    // root when no ancestor is named tap-cap-table (e.g. a worktree with another name).
    const repoRootDirName = "tap-cap-table";
    let dir = process.env.PWD;
    let check = pathTools.join(dir, fileName);
    while (!fs.existsSync(check)) {
        const parent = pathTools.dirname(dir);
        if (pathTools.basename(dir) === repoRootDirName || parent === dir) {
            throw new Error(`Unable to locate .env in ${check}`);
        }
        dir = parent;
        check = pathTools.join(dir, fileName);
    }
    return check;
};

let _ALREADY_SETUP = false;

export const setupEnv = () => {
    if (_ALREADY_SETUP || process.env.NODE_ENV == "production") {
        return;
    }
    // In Docker, env vars are passed directly via docker-compose
    // Skip .env file loading if required vars are already set
    if (process.env.DATABASE_URL && process.env.PORT) {
        console.log("setupEnv: using environment variables (Docker mode)");
        _ALREADY_SETUP = true;
        return;
    }
    const fileName = process.env.USE_ENV_FILE || ".env";
    // Use process.cwd() as fallback when PWD is not set (common in Docker)
    const cwd = process.env.PWD || process.cwd();
    process.env.PWD = cwd; // Ensure PWD is set for getEnvFile
    const path = getEnvFile(fileName);
    console.log("setupEnv with:", path);
    config({ path });
    _ALREADY_SETUP = true;
};
