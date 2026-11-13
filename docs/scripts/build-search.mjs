import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";
import * as pagefind from "pagefind";

const routeCacheDir = ".next/server/route-cache/APP_PAGE";
const outputPath = "public/_pagefind";
const routeCacheEntries = await readdir(routeCacheDir, { withFileTypes: true }).catch((error) => {
    if (error.code === "ENOENT") return null;
    throw error;
});

// Adapter builds namespace HTML by source route. Each "$" directory retains
// the public paths; indexing their parent would put hashes in search URLs.
const directories = routeCacheEntries
    ? routeCacheEntries.filter((entry) => entry.isDirectory()).map((entry) => join(routeCacheDir, entry.name, "$"))
    : [".next/server/app"];

function checkErrors({ errors }) {
    if (errors.length) throw new Error(errors.join("\n"));
}

try {
    const created = await pagefind.createIndex();
    checkErrors(created);
    const { index } = created;
    if (!index) throw new Error("Pagefind did not create an index.");

    for (const path of directories) {
        checkErrors(await index.addDirectory({ path }));
    }
    checkErrors(await index.writeFiles({ outputPath }));

    const manifest = JSON.parse(await readFile(join(outputPath, "pagefind-entry.json"), "utf8"));
    const pageCount = Object.values(manifest.languages).reduce((total, language) => total + language.page_count, 0);
    if (!pageCount) throw new Error("Pagefind indexed no documentation pages.");
    console.log(`Pagefind indexed ${pageCount} pages.`);
} finally {
    await pagefind.close();
}
