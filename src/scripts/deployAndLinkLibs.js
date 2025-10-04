import { spawn } from "child_process";
import fs from "fs";
import path from "path";
import sleep from "../utils/sleep.js";
import { setupEnv } from "../utils/env.js";

setupEnv();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL;
const CHAIN_ID = process.env.CHAIN_ID;
const rootDirectory = "./src/lib";
const excludeDirectory = "./src/lib/transactions";

function extractImports(filePath) {
    const content = fs.readFileSync(filePath, "utf8");
    const importRegex = /import\s+"([^"]+)"/g;
    const imports = [];
    let match;
    while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        if (
            (!importPath.startsWith("../../transactions/") && importPath.startsWith("../") && !importPath.startsWith("../../")) ||
            importPath.startsWith("./")
        ) {
            const resolvedPath = path.resolve(path.dirname(filePath), importPath);
            // const fileName = path.basename(resolvedPath, '.sol');
            const libraryName = extractLibraryName(resolvedPath);
            imports.push(libraryName);
        }
    }
    return imports;
}

function extractLibraryName(filePath) {
    const content = fs.readFileSync(filePath, "utf8");
    const libraryRegex = /library\s+(\w+)\s*{/;
    const match = libraryRegex.exec(content);
    return match ? match[1] : null;
}

function getAllLibraries(dirPath) {
    let transactionsLibs = [];

    const items = fs.readdirSync(dirPath);

    for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stats = fs.statSync(itemPath);

        if (stats.isDirectory() && itemPath !== excludeDirectory) {
            transactionsLibs = transactionsLibs.concat(getAllLibraries(itemPath));
        } else if (path.extname(item) === ".sol") {
            const fileNameWithoutExtension = path.basename(item, path.extname(item));
            const imports = extractImports(itemPath);
            const libraryName = extractLibraryName(itemPath);

            transactionsLibs.push({
                path: "./" + itemPath,
                fileName: fileNameWithoutExtension,
                deps: imports,
                libraryName,
                address: null,
            });
            if (libraryName == "StockCancellationLib") console.log({ imports });
        }
    }

    return transactionsLibs;
}

async function deployLib(lib, libs) {
    return new Promise((resolve, reject) => {
        console.log(`Starting deployment for ${lib.libraryName || lib.fileName}`);

        // Logging the dependencies and their addresses
        const librariesDepsArgs = lib.deps
            .map((idx) => {
                console.log(`Dependency: ${libs[idx].libraryName}, Address: ${libs[idx].address}`);
                return ["--libraries", `${libs[idx].path}:${libs[idx].libraryName}:${libs[idx].address}`];
            })
            .flat();
        console.log("librariesDepsArgs:", librariesDepsArgs);

        // Forge command arguments
        const args = [
            "c",
            "-r",
            // Using the RPC_URL from .env
            RPC_URL,
            "--chain",
            CHAIN_ID,
            "--private-key",
            PRIVATE_KEY,
            `${lib.path}:${lib.libraryName || lib.fileName}`,
            "--json",
            ...librariesDepsArgs,
        ];
        // TODO: only log when things break
        // console.log(`Forge command arguments: ${args.join(" ")}`);

        // Executing the forge command
        const subprocess = spawn("forge", args);

        subprocess.stdout.on("data", (data) => {
            console.log(`stdout: ${data}`);
            try {
                lib.address = JSON.parse(data).deployedTo;
                console.log(`${lib.fileName} Deployed Successfully - Address: ${lib.address}`);
            } catch (err) {
                console.error(`Error parsing JSON from stdout: ${err}`);
            }
        });

        subprocess.stderr.on("data", (data) => {
            const errorDetails = data.toString(); // Convert Buffer to string
            console.error(`stderr: ${errorDetails}`);
        });

        subprocess.on("error", (error) => {
            console.error(`Spawn error: ${error}`);
            reject(new Error(`Error executing forge command for ${lib.fileName}`));
        });

        subprocess.on("close", (code) => {
            if (code !== 0) {
                console.error(`${lib.fileName} deployment failed with exit code ${code}`);
                reject(new Error(`${lib.fileName} deployment failed. Details in the logs above.`));
            } else {
                console.log(`${lib.fileName} deployment process exited successfully`);
                resolve();
            }
        });
    });
}

const deployAndLinkLibs = async (libs) => {
    const buildProcess = spawn("forge", ["build", "--via-ir"]);

    buildProcess.stdout.on("data", (data) => {
        console.log(`build::stdout ${data}`);
    });

    buildProcess.stderr.on("data", (data) => {
        console.error(`build::stderr ${data}`);
    });

    buildProcess.on("close", (code) => {
        console.log(`build::child process exited with code ${code}`);
    });

    for (const lib of libs) {
        await deployLib(lib, libs);
        await sleep(300);
    }
    const librariesArgs = libs
        .map(({ address, path, libraryName, fileName }) => ["--libraries", `${path}:${libraryName || fileName}:${address}`])
        .flat();

    console.log({ librariesArgs });
    const subprocess = spawn("forge", ["build", "--via-ir", ...librariesArgs]);

    subprocess.stdout.on("data", (data) => {
        console.log(`FinalBuild::stdout: ${data}`);
    });

    subprocess.stderr.on("data", (data) => {
        console.error(`FinalBuild::stderr: ${data}`);
    });

    subprocess.on("close", (code) => {
        // console.log(`finalBulid::child process exited with code ${code}`);
        if (code !== 0) {
            new Error(`FinalBuild::child process exited with code ${code}`);
        } else {
            console.log("✅ | Deployment completed");
        }
    });
};

function buildGraph(libraries) {
    const graph = new Map();
    for (const lib of libraries) {
        const edges = lib.deps
            .map((depName) => {
                const depLib = libraries.find((item) => item.libraryName === depName);
                return depLib ? depLib.libraryName : null;
            })
            .filter(Boolean); // Exclude null values
        graph.set(lib.libraryName, { data: lib, edges: edges });
    }
    return graph;
}

function topologicalSort(graph) {
    const visited = new Set();
    const stack = [];
    for (const [nodeName] of graph.entries()) {
        if (!visited.has(nodeName)) {
            dfs(nodeName, visited, stack, graph);
        }
    }
    return stack.map((node) => node.data);
}

function dfs(nodeName, visited, stack, graph) {
    visited.add(nodeName);
    for (const neighbor of graph.get(nodeName).edges) {
        if (!visited.has(neighbor)) {
            dfs(neighbor, visited, stack, graph);
        }
    }
    stack.push(graph.get(nodeName));
}

function convertNamesToIndices(sortedLibraries) {
    for (const lib of sortedLibraries) {
        lib.deps = lib.deps.map((depName) => sortedLibraries.findIndex((item) => item.libraryName === depName));
    }
    return sortedLibraries;
}

const allLibs = getAllLibraries(rootDirectory);
const graph = buildGraph(allLibs);
const sortedLibraries = convertNamesToIndices(topologicalSort(graph));

console.log("Sorted libraries", JSON.stringify(sortedLibraries, null, 2));
(async () => await deployAndLinkLibs(sortedLibraries))();
