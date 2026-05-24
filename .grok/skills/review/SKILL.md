---
name: review
description: >
  Project-aware self-review for the Transfer Agent Protocol (TAP) Cap Table monorepo.
  Spawns a verifier that reads WARP.md, app/WARP.md, and CONTRIBUTING.md before checking
  the actual changes against the hybrid onchain/offchain model, OCF validation, fixed-point
  scaling, UUID↔bytes16 conversion, ADMIN/OPERATOR roles, atomic MongoDB transactions,
  invariant + security tooling, and the styled-components rules in `app/`.
  Triggers on: "/review", "review my work", "check my changes", "self-review", "verify this".
metadata:
  short-description: "TAP-aware self-review and verification"
---

# /review — TAP Cap Table Project Review

Project-aware verification skill. Higher priority than the generic global `/check` for work in this repo.

## Usage

```
/review [optional focus area]
```

## Execution flow

1. **Same-turn vs. standalone**: if invoked in the same turn as the user's primary task, finish that task first, then review. Otherwise start at step 2.
2. **Spawn the verifier subagent** (`subagent_type: "general-purpose"`, description `"[TAP review] <label>"`) with the **TAP VERIFIER PROMPT** below plus any user-supplied focus area.
3. Read the verifier's output and locate `VERDICT: PASS` or `VERDICT: FAIL`.
4. **PASS** → summarize the strongest evidence and stop. **FAIL** → fix every listed issue and re-invoke (max 3 iterations).

## TAP VERIFIER PROMPT

You are an expert verifier for the **Transfer Agent Protocol (TAP) Cap Table** monorepo. You have full tool access and full repo access. Determine whether the recent work correctly and completely addresses the user's request **and** obeys this project's invariants.

### Phase 0 — Read the source-of-truth docs

Read these files in full before doing anything else:

- `WARP.md` (root) — architecture, important patterns, common pitfalls, Documentation DX conventions, Git workflow.
- `app/WARP.md` — styled-components style guide and frontend conventions.
- `CONTRIBUTING.md` and `.github/pull_request_template.md` — PR shape and review expectations.
- `docs/DOCS_AUDIT.md` if it exists — current docs scoring baseline.

Everything that follows assumes those docs are the authoritative spec. Do not duplicate them here.

### Phase A — Trace the request

1. Restate the user's request in one sentence.
2. Reconstruct what the agent actually did: `git diff --cached`, `git diff`, recent commit log on the active branch.
3. List every file domain touched (`chain/`, `server/`, `app/`, `docs/`, root config).

### Phase B — Per-domain checks

For each touched domain, apply the matching rule set from the docs:

- `chain/src/**/*.sol` or `chain/test/**/*.sol`: NatSpec, custom errors, events, SPDX 0.8.30, via-ir compatibility, `onlyOperator`/`onlyAdmin` correctness, snake_case struct fields, and that new logic is covered by both unit **and** invariant tests.
- `server/**`: OCF validation via `validateInputAgainstOCF`, conversion helpers (`convertUUIDToBytes16`, `toScaledBigNumber`), `withGlobalTransaction` for atomic multi-doc writes, poller/state-machine consistency.
- `app/src/**`: every rule in `app/WARP.md` (file naming, theme tokens only, transient `$` props, allowed cubic-beziers, no new fontWeights).
- `docs/src/pages/**/*.mdx`: every bullet in the "Documentation DX conventions" section of root `WARP.md` and the bar in `DOCS_AUDIT.md`.

Run the actual commands appropriate to the scope: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `make test`, `make test-invariant`, `make security`, `pnpm docs:build`. A broken build, lint, or relevant test = automatic FAIL.

### Phase C — Architecture invariants

Answer each explicitly:

- Is the blockchain still the source of truth (no DB writes that bypass the contract)?
- Are all cross-boundary values scaled and converted (UUID↔bytes16, prices/quantities scaled)?
- If multi-document DB writes were added, are they wrapped in `withGlobalTransaction`?
- If access-control surfaces changed, is the ADMIN/OPERATOR model still respected?
- Were the right tests (including invariants and security tools for contract work) added or run?

### VERDICT

End your response with exactly one of:

```
VERDICT: PASS
```

or

```
VERDICT: FAIL
```

On PASS, briefly cite the commands you ran and the strongest evidence. On FAIL, list concrete issues with file paths and (where possible) line numbers — be precise about what must change.
