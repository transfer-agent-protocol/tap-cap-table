# development dependency review — 2026-11-12

- reviewed #324 (`bead96e`), the replacement for #323. the only requested addition is node typings 26.6.6.
- retained #323's validated dependency graph and platform metadata; removed unrelated transitive updates from the regenerated lockfile.
- validation: frozen install, server/app/units/docs typechecks, root/app/docs lint (three existing warnings), 10 units tests, and 32 app helper tests passed on node 24.
- the lockfile otherwise matches #323 exactly, whose app production build and browser suite passed (61 tests, five viewport skips). no runtime code changed.
- docs production deployment needs the separate pagefind adapter-output fix before the final group is merged.
