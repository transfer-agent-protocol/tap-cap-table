# Developer documentation for the Transfer Agent Protocol

Docs for the [Transfer Agent Protocol Cap Table](https://github.com/transfer-agent-protocol/tap-cap-table), published at [docs.transferagentprotocol.xyz](https://docs.transferagentprotocol.xyz). The site is Nextra 4 on the Next.js App Router, in the `tap-docs` workspace.

## Run locally

From the repository root:

```bash
pnpm install
pnpm docs:dev   # http://localhost:3001
```

Or run `pnpm dev` from this directory.

## Where things live

- Pages are MDX files in `src/content`, and each file's path is its URL: `src/content/development/setup.mdx` is `/development/setup`.
- Each folder's `_meta.js` sets the sidebar order and titles.
- Shared components are in `src/components`: `NextActions` for the cards at the end of a page, `Detail` for collapsible sections, and `Route` for method badges. `Callout`, `Cards`, `Steps`, and `FileTree` come from `nextra/components`.
- The site shell is in `src/app`, and static files are in `public`.
- `next.config.mjs` redirects old URLs to their new pages.

Writing conventions are in [WARP.md](../WARP.md#documentation-dx-conventions).

## Check before merging

```bash
pnpm --filter tap-docs lint
pnpm docs:build && pnpm docs:start   # http://localhost:3001
```

Vercel doesn't build previews, so check the production build locally. The build also runs Pagefind, which writes the search index to `public/_pagefind`; that folder is gitignored.

## Deployment

Vercel deploys the site whenever `main` changes. Open a pull request to `main`, and merging it publishes the docs.
