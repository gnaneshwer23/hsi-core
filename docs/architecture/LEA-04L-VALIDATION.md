# LEA-04L: validation of the Living Intelligence Graph workspace

**Date:** 28 November 2026
**Graph validated:** published candidate snapshot `044eb4d6`, with 157 concepts and 95 candidate relationships. The domain tree lists the 111 concepts that take part in a relationship.
**Scope:** LEA-04B to LEA-04K, the domain tree (#780) and the label-placement change in this pass.

## Verdict

The workspace is **fit for a research preview**. Every relationship stays a candidate: unreviewed, confidence not calibrated, source not verified.

Each mode either shows real data or says what it is missing. None of them invents a conflict, a mechanism, an approval or a collaborator.

One gate is still open. The account store (migration 034) is designed and tested, but it is held for production until the independent database review (Track B2). Until then, Scientific Memory is kept in the browser and Collaboration says sharing is not switched on.

## What each phase delivered and how it was checked

| Phase | Delivered | Evidence |
| --- | --- | --- |
| 04B (#760) | Assertion views, a versioned domain map, 12 modes as data, filters, bounded slices | Unit tests against the published graph |
| 04C (#761) | Shell, filters, 2D graph, table, inspector | e2e `graph-workspace.spec.ts`, axe at 1440, 390 and 320 px |
| 04D (#771) | 3D view, multiscale navigation | e2e; 3D is disabled with a reason when WebGL is absent |
| 04E (#772) | Entity inspector, evidence intelligence | e2e: identifiers, passages and rights shown as recorded |
| 04F (#762) | Contradiction mode, side-by-side comparison | e2e: "No pair is confirmed as a contradiction" |
| 04H (#773) | Gap, hypothesis and experimental modes | e2e: gaps stay gaps; a candidate next study is not a protocol |
| 04I (#774) | Personalised opening from onboarding | e2e: says why it opened there, and offers the default view in one click |
| 04J (#775) | NEXUS dock: deterministic checks over a bounded selection | e2e: records download with `scientificApproval:false`; language-model interpretation is off |
| Tree (#780) | Searchable six-domain tree on the homepage and in the workspace | 9 unit tests; e2e for search, filters, empty and failure states, axe, no overflow |
| 04G (this pass) | Scientific Memory: save from NEXUS, a log and section versions, archive | `test/graphMemory.test.ts`; e2e saves, notes, archives and reloads; no approval is stored |
| 04K (this pass) | Collaboration mode; scope registry and membership (ADR-014); identity verified in the database (ADR-013); bounded-neighbourhood endpoint | 54-check isolation suite on disposable PostgreSQL (CI job `investigation-store-isolation`); API tests; neighbourhood tests |
| Labels (this pass) | 2D labels never overlap each other or a dot as connected as their own; zooming in makes room for more | `test/graphLabels.test.ts`; e2e measures the rendered label boxes |

## The twelve modes

| Mode | Readiness | Opens | Why it is not "ready" |
| --- | --- | --- | --- |
| Biological Atlas | Ready | Yes | |
| Mechanism | Ready | Yes | |
| Evidence | Ready | Yes | |
| Contradiction | Ready | Yes | |
| Research Gap | Ready | Yes | |
| Hypothesis | Ready | Yes | |
| Experimental | Partial | Yes | The designs are candidates, not reviewed protocols |
| Scientific Memory | Partial | Yes | Investigations are kept in this browser until migration 034 is applied |
| Collaboration | Partial | Yes, as a status panel | Sharing needs the account store and a signed-in member of a scope |
| Temporal | Partial | Yes | Shows what changed since the previous verified version; relationships carry no validity interval |
| Translational | Partial | Yes | Candidate SSc trial results (D-02), negative results included; no trial-registry linkage; not treatment advice |
| Multi-omics | Partial | Yes | Genetic loci and tissue transcriptomic cell states only (D-02); no proteomic, epigenomic or integrated layers |

Update, 28 November 2026: the D-02 candidate batch (`docs/research/D-02-CANDIDATE-BATCH.md`) gave Multi-omics, Translational and Organ & Tissue their first data, so all twelve modes now open. Each still states what it lacks.

## Boundaries checked

- **No approval anywhere.** The browser store, the API and the database each refuse `scientificApproval` and `scientificClaimAllowed`, including when they are nested. The database enforces this with check constraints, which the isolation suite exercises directly.
- **Identity (ADR-013).** All of the following are refused inside the database:
  - forged, expired and impersonated sessions;
  - users with an unverified email;
  - banned users;
  - verified users without research access;
  - a forged `hsi.live_owner_id` setting.

  The runtime role cannot read any store table directly.
- **Isolation.** Researcher B cannot see, append to, archive or share A's investigation. An unknown id and a not-yours id return the same answer.
- **Scopes (ADR-014).**
  - Self-grant is refused, including by an admin.
  - Only a scope admin can grant or revoke. A revocation takes effect at once and cannot be undone below the API.
  - An inactive scope grants nothing.
  - A new programme is added as data by a research admin.
- **Append-only.** Events and section versions cannot be updated, deleted or truncated, even by the owner role. An investigation's question and graph pin cannot be rewritten.
- **No PHI.** The fixtures use synthetic users only. No patient data path was added.

## Commands

```
bun run check                                   # typecheck, lint, unit tests, validators, build
cd site && bun run build                        # bundle budgets
PLAYWRIGHT_CHROMIUM_EXECUTABLE=/usr/bin/google-chrome ./node_modules/.bin/playwright test
createdb hsi_store_it && psql -d hsi_store_it -v ON_ERROR_STOP=1 -f db/verify/034_investigation_store_setup.sql
HSI_LOCAL_PG_SOCKET_DIR=/tmp HSI_LOCAL_PG_DB=hsi_store_it bun scripts/verify-investigation-store-local.ts
```

## Open, with owners

1. **Track B2 database review of migration 034.** Owner: an independent reviewer. After it, follow `ADR-012-BACKFILL-PLAN.md`.
2. **Switch on `HSI_INVESTIGATION_STORE_ENABLED` on staging** after 034 is applied there. Owner: the project owner. Production follows a separate decision.
3. **D-02 candidates** need retrieval, rights and independent review like every other candidate. Owner: the curation programme.
