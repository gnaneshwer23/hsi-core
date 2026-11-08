# N1 #2 rights — eng-assist progress notes (not CLEARED)

**Date:** 2026-11-08  
**Status:** **IN PROGRESS · eng-assist** · `rightsCleared=false` · `humanCleared=0` · `passageImported=0`  
**Artifacts:** `research/domain-graph/n1/licence-lookup-assist.v1.json` · `receipts/attestation-completeness.receipt.json`  
**Commands:** `bun run n1:attestation:prep` · `bun run n1:attestation:check`

Engineering looked up Crossref works `license` rows for all 12 `N1-C-*` DOIs (offline fixtures under `fixtures/*.crossref.json`). **No** `attestation.licenceEvidenceUri` / `principal` / `permittedUses` stamps were invented. Completeness gate remains **FAIL_CLOSED_INCOMPLETE**.

## Per-row status

| Queue | Eng lookup | Factual URL observed? | Still needs human principal |
|-------|------------|----------------------|-----------------------------|
| N1-C-01 | `candidate_uri_observed` | Yes — CC BY-NC-ND 3.0 (vor). Prefer metadata-only until NC/ND permittedUses decided. | Yes |
| N1-C-02 | `tdm_or_publisher_stub_only` | No usable reuse URI (Springer TDM stubs) | Yes — open Nature Immunology terms |
| N1-C-03 | `tdm_or_publisher_stub_only` | No (TDM-only) | Yes |
| N1-C-04 | `tdm_or_publisher_stub_only` | No (TDM-only) | Yes |
| N1-C-05 | `tdm_or_publisher_stub_only` | No usable reuse URI (OA at EPMC ≠ clearance; Springer TDM stubs) | Yes |
| N1-C-06 | `empty_crossref_licences` | No | Yes — Science landing |
| N1-C-07 | `candidate_uri_observed` | Yes — Elsevier OA userlicense (vor; not CC) | Yes |
| N1-C-08 | `empty_crossref_licences` | No (Crossref redirects to `10.1172/jci200319246`; empty license) | Yes — JCI landing |
| N1-C-09 | `empty_crossref_licences` | No | Yes — Science landing |
| N1-C-10 | `tdm_or_publisher_stub_only` | No (TDM-only; EPMC OA ≠ clearance) | Yes |
| N1-C-11 | `empty_crossref_licences` | No | Yes — Diabetes landing |
| N1-C-12 | `cc_uri_under_tdm_only` | CC BY 4.0 URL under **TDM-only** Crossref row — not auto-cleared | Yes — confirm VoR / publisher OA |

**Counts:** 2 rows with non-TDM candidate licence URLs · 1 row with CC URL under TDM-only · 9 rows looked up with no candidate reuse URI · **12/12 still need human principal**.

## Remaining human actions for #2

**Active checklist:** [`N1_ATTESTATION_HUMAN_CHECKLIST.md`](./N1_ATTESTATION_HUMAN_CHECKLIST.md)

1. For each row: open publisher terms (+ Crossref candidate URL when present).  
2. Decide reuse scope (prefer **metadata-only** if ambiguous / NC / ND / non-CC userlicense).  
3. Stamp `licenceEvidenceUri` · `permittedUses` · `principal` · `recordedAt` · `rationale` on the attestation worksheet.  
4. Set `passageImportAuthorized` only when import is actually allowed; keep `passageImported=0` until a separate import step.  
5. Do **not** treat eng-assist or Europe PMC OA/CC labels as clearance.

## Next after #2 (not started here)

- **#4** SME dual labels + adjudication  
- **#5** Live authenticated Ask→…→Export (+ staging two-account)

## Verify

```sh
bun run n1:attestation:check
bun run n1:check
bun run human-queue:check
bun --no-env-file test test/n1LicenceLookupAssist.test.ts test/n1PassageRightsInventory.test.ts test/humanQueueResidualPrep.test.ts
```

Expected: `rightsCleared=false`, `humanCleared=0`, gate `FAIL_CLOSED_INCOMPLETE`.
