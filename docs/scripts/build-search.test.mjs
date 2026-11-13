import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";
import test from "node:test";

const script = fileURLToPath(new URL("./build-search.mjs", import.meta.url));
const html = '<html lang="en"><body><main data-pagefind-body><h1>Documentation</h1>Cap table.</main></body></html>';

async function fixture(t, paths) {
    const cwd = await mkdtemp(join(tmpdir(), "tap-search-"));
    t.after(() => rm(cwd, { recursive: true, force: true }));
    for (const path of paths) {
        const file = join(cwd, ".next/server", path);
        await mkdir(dirname(file), { recursive: true });
        await writeFile(file, html);
    }
    return cwd;
}

async function indexedUrls(cwd) {
    const root = join(cwd, "public/_pagefind");
    const manifest = JSON.parse(await readFile(join(root, "pagefind-entry.json"), "utf8"));
    assert.equal(manifest.languages.en.page_count, 2);
    const files = await readdir(join(root, "fragment"));
    const urls = await Promise.all(
        files.map(async (file) => {
            const raw = gunzipSync(await readFile(join(root, "fragment", file)));
            return JSON.parse(raw.subarray(raw.indexOf("{"))).url;
        }),
    );
    assert.deepEqual(urls.sort(), ["/", "/development/setup.html"]);
}

test("indexes the standard Next.js output with public URLs", async (t) => {
    const cwd = await fixture(t, ["app/index.html", "app/development/setup.html"]);
    const result = spawnSync(process.execPath, [script], { cwd, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    await indexedUrls(cwd);
});

test("combines adapter source routes without leaking cache prefixes into URLs", async (t) => {
    const cwd = await fixture(t, [
        `route-cache/APP_PAGE/${"a".repeat(64)}/$/index.html`,
        `route-cache/APP_PAGE/${"b".repeat(64)}/$/development/setup.html`,
    ]);
    const result = spawnSync(process.execPath, [script], { cwd, encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    await indexedUrls(cwd);
});

test("fails the build when there are no pages to index", async (t) => {
    const cwd = await fixture(t, []);
    await mkdir(join(cwd, ".next/server/app"), { recursive: true });
    const result = spawnSync(process.execPath, [script], { cwd, encoding: "utf8" });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /Pagefind|index/i);
});
