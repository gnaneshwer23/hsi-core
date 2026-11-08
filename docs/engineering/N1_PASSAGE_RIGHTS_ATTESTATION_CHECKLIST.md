# N1 passage rights attestation checklist (Audit #2 residual)

**Phase:** production-readiness residual **#2**  
**Inventory (eng):** `research/domain-graph/n1/rights-inventory.v1.json`  
**Empty worksheet:** `research/domain-graph/n1/attestation-worksheet.v1.json`  
**Honesty:** Europe PMC OA/CC labels ≠ corpus reuse permission · `humanCleared=0` · `passageImported=0` until humans attest · no Gate C · red-wave only

Engineering inventory is **CLEARED**. Scientific / rights acceptance stays **BLOCKED**.

**Active human action (fill-ready):** [`N1_ATTESTATION_HUMAN_CHECKLIST.md`](./N1_ATTESTATION_HUMAN_CHECKLIST.md) — per-row eng lookup results, recommended decisions, worksheet fields, caution quotes for NC-ND / Elsevier OA / TDM-only CC, and post-fill verify transitions. Use that doc to stamp the worksheet; this page remains the eng scaffold checklist.

## A. What engineering already automated

- [x] Per-source provider OA/licence signals for all 12 candidates
- [x] Fail-closed inventory (`passageUsePermitted=false`, empty `licenceEvidenceUri`)
- [x] Empty attestation worksheet (12 rows; all attestation fields null)
- [x] `bun run n1:check` + `bun run human-queue:check` refuse invented clearance
- [x] Crossref works licence **eng-assist** lookups (`fixtures/*.crossref.json` · `licence-lookup-assist.v1.json`) — observations only; not attestation stamps
- [x] Fail-closed attestation completeness gate (`bun run n1:attestation:check`) — incomplete ≠ CLEARED
- [x] Progress notes: [`N1_RIGHTS_PHASE2_ENG_ASSIST_NOTES.md`](./N1_RIGHTS_PHASE2_ENG_ASSIST_NOTES.md) · residual status **IN PROGRESS · awaiting human principal** (not CLEARED)
- [x] Fill-ready human checklist: [`N1_ATTESTATION_HUMAN_CHECKLIST.md`](./N1_ATTESTATION_HUMAN_CHECKLIST.md)

## B. Human must attest (not inventable by code)

Follow [`N1_ATTESTATION_HUMAN_CHECKLIST.md`](./N1_ATTESTATION_HUMAN_CHECKLIST.md). Summary:

1. Open `providerArticleUrl` + publisher landing / Crossref license URL.
2. Decide reuse scope for HSI corpus (cite-metadata only vs passage storage/display); prefer **metadata-only** when ambiguous.
3. Record privately, then (when ready to stamp trusted workflow) fill:
   - `licenceEvidenceUri` (publisher terms / OA statement URI — not a chat invent)
   - `permittedUses` (explicit list)
   - `principal` + `recordedAt` + `rationale`
   - `passageImportAuthorized` only when passage import is actually allowed
4. Keep `passageImported=0` until a separate import step runs under the attested URI.
5. Do **not** invent CC clearance from Europe PMC labels or eng-assist URLs.

**Do not** edit `rights-inventory.v1.json` to invent `humanAttestation` fields from this agent chat.

## C. Explicit non-goals

- Inventing `licenceEvidenceUri` / principals in git to clear the residual
- Passage import before attestation
- Claim entailment / Gate C / graph promotion of uncleared text
- Pointing HSI at autumn-snow

## Verify

```sh
bun run n1:check
bun run n1:attestation:check
bun run human-queue:check
bun --no-env-file test test/n1PassageRightsInventory.test.ts test/n1LicenceLookupAssist.test.ts test/humanQueueResidualPrep.test.ts
```

Expected: `humanCleared=0`, `passageImported=0`, `rightsCleared=false`, attestation worksheet `anyLicenceEvidenceUriSet=false`, completeness gate `FAIL_CLOSED_INCOMPLETE`.
