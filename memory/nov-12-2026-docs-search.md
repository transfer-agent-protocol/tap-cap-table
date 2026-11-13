# docs search adapter build fix — 2026-11-12

- next 16.4.6 adapter builds put prerendered html under `.next/server/route-cache/APP_PAGE/<hash>/$/`; pagefind's old `.next/server/app` scan failed in production.
- index each adapter route root through the pagefind node api, with the original path retained for ordinary builds. fail an empty index. clear the old public search bundle before building so vercel's postbuild sync copies fresh files.
- validated next 16.4.6 and pagefind 1.5.2: normal and actual vercel adapter builds each index 35 pages. all 50 deployed search files match the fresh public bundle, including after seeding stale output. three indexing regression tests, docs lint, and docs typecheck pass; ci now runs the regression tests.
- no deployment performed locally. merge after ci and confirm the production docs deployment; #314 remains held for the user's browser test.
