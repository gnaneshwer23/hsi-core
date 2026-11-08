# N2 evidence ledger status

**Phase:** N2 — Complete the evidence ledger  
**Plan:** [`docs/strategy/HSI_NEXT_BUILD_PHASES_2026-11-06.md`](../strategy/HSI_NEXT_BUILD_PHASES_2026-11-06.md)  
**Date:** 7 November 2026

This is an engineering status receipt. It is **not** scientific approval, claim entailment, Gate C clearance or a rights licence.

## N1 prerequisite

| Gate | Status | Notes |
| --- | --- | --- |
| N1 offline queue + adapters + identity fail-closed | **Present (local uncommitted)** | See [`N1_SOURCE_VERIFICATION_STATUS.md`](./N1_SOURCE_VERIFICATION_STATUS.md). |
| N1 live scientific acceptance | **Blocked** | Rights uncleared; 2 DOI↔title mismatches retained as failures. |
| N1 enough to start N2 | **Yes** | Matched metadata (`N1-C-01`) can draft a `reported_finding`; mismatched lookups cannot. |

N2 does **not** regress N1. Failed N1 outcomes remain blocked from becoming findings.

## Verdict

| Gate | Status | Notes |
| --- | --- | --- |
| Assertion kinds in types/storage | **CLEARED (engineering)** | `reported_finding` ≠ `prediction` ≠ `hypothesis` ≠ `experimental_observation`. |
| Versioned write/read + archive lineage | **CLEARED (engineering)** | Live draft + superseded archives; parentVersion required. |
| Explicit missing dose/assay/context | **CLEARED (engineering)** | Null context fields must appear in `missingFields`. |
| Invalid combinations fail closed | **CLEARED (engineering)** | Covered by unit tests. |
| SQL persistence on red-wave | **Applied (Audit #6)** | `016_hsi_evidence_ledger` in `hsi_schema_migrations` on red-wave; table + indexes live; Neon R/W helpers still residual. |
| Scientific entailment / Gate C / graph publish | **BLOCKED** | Explicitly out of scope; honesty flags forced false. |
| Full N2 (passage-linked claims for all sources, inspector UI, Neon write path) | **Residual** | See below. |

## Delivered in this increment

- Types + validators: `src/evidence/evidenceLedger.ts`
- Offline fixture: `research/domain-graph/n2/ledger.v1.json`
- Builder/check: `bun run n2:ledger` / `bun run n2:check`
- Migration stub: `db/migrations/016_hsi_evidence_ledger.sql` (extends 002; does not rewrite archives)
- Tests: `test/evidenceLedger.test.ts`
- Legacy map from migration-002 epistemic labels → N2 kinds (read-only compatibility)

## Honesty constraints retained

- Distinctions are real in types and storage; kinds are not collapsed.
- Lineage is `record → passageIds → sourceId → methodId` (plus optional N1 queue link).
- Failed lookups ≠ verified findings.
- No invented paper claims; fixture finding is metadata-only and passage-empty.
- No Gate C auto-approve, invented MoU, live CDS/PHI or immunecity Neon use.

## Verify locally

```sh
bun run n2:ledger
bun run n2:check
bun --no-env-file test test/evidenceLedger.test.ts
# Optional (red-wave only; not required for this offline slice):
# bun run db:migrate
```

## Residual toward full N2

1. Wire Neon read/write helpers for `hsi_evidence_ledger_records` behind the existing red-wave guard (`016` applied — Audit #6).
2. Attach permitted passages when N1 rights clearance exists; keep locator-only otherwise.
3. Inspector UI surfacing kind + lineage + missing context.
4. Qualified review for entailment/context — still a scientific dependency, not an engineering auto-gate.
5. Broader corpus import beyond the gut–immune–T2D fixture slice.
