import { config } from "dotenv";
import fs from "fs";
import pathTools from "path";

const splitPath = (path) => {
    /* 
    Split the file/dir path into its directory and the rightMost piece
     ie /home/user/file.txt --> {dir: "/home/user", rightMost: "file.txt"}
    */
    const normalizedPath = path.replace(/\/+$/, '');
    const lastIndex = normalizedPath.lastIndexOf('/');
    const dir = normalizedPath.substring(0, lastIndex);
    const rightMost = normalizedPath.substring(lastIndex + 1);
    return { dir, rightMost };
};


const getEnvFile = (fileName) => {
    // Find the .env file by iterating up the PWD. However do not go past the repo root!
    const repoRootDirName = "tap-cap-table"
    const cwd = process.env.PWD
    let { dir, rightMost } = splitPath(cwd);
    let check = pathTools.join(cwd, fileName);
    while (!fs.existsSync(check)) {
        if (rightMost === repoRootDirName) {
            throw new Error(`Unable to locate .env in ${check}`);
        }
        // Check our current dir
        check = pathTools.join(dir, fileName);
        // The dir to look in next
        ({ dir, rightMost } = splitPath(dir));
    }
    return check;
};

let _ALREADY_SETUP = false;

export const setupEnv = () => {
    if (_ALREADY_SETUP) {
        return;
    }
    const fileName = process.env.USE_ENV_FILE || '.env';
    const path = getEnvFile(fileName)
    console.log("setupEnv with:", path);
    config({ path });
    _ALREADY_SETUP = true;
};
