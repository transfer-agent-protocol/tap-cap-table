# Cleanup stack — left off 2026-09-07

Merged on `main`:

- #281 removed unused app/server/chain-test/docs dead code and aligned agent docs.
- #282 pointed server scale/UUID at `@tap/units` (always 1e10), made `GET /issuer/id/:id` return the full issuer or 404, and passed legend IDs on operator `issueStock`.

Open stack (merge in this order; not on `main`):

- #285 splits the company workspace into left-nav screens (`Holdings`, `StockClasses`, `Shareholders`, `IssueStock`, `Transfer`, `Transactions`); `CapTableDashboard` is the shell.
- #286 deletes `POST /mint-cap-table` and the XState/yauzl/busboy zip pipeline.
- #287 generates only wallet write hooks plus `acceptStock`; do not hand-edit `app/src/generated.ts`.

Keep:

- Wallet `/app` writes and `/register-onchain`; server-signed `/create` for API/docs.
- `acceptStock` ABI, `POST /transactions/accept/stock`, and the generated write hook.
- `SAMPLE_ISSUER` mint prefill and landing factory/impl explorer links.
- Issuer ADMIN is the cap table deployer; `PRIVATE_KEY` is the local developer key, not OPERATOR_ROLE.
- `Issuer.is_manifest_created` stays on the schema (default false).

Do not:

- Beacon-upgrade or change `chain/src` logic.
- Empty `SAMPLE_ISSUER` or retarget landing addresses.
- Rename docs URLs.
- Delete `/create` or `acceptStock`.

Agent docs: `WARP.md`, `app/WARP.md`, `AGENTS.md`.
Next: merge #285 → #286 → #287; `acceptStock` UI is future work.
