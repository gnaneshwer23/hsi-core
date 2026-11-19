# HSI Demo Research Universe — reuse inventory & Phase 1

**Date:** 19 November 2026 (Europe/London)  
**Branch:** `cursor/demo-research-universe-2f71`  
**Code:** [`src/demoUniverse/`](../../src/demoUniverse/)  
**Honesty:** Synthetic users/orgs + verified public bibliographic metadata + labelled simulated findings. Not scientific approval. No production graph writes. No PHI to external AI.

---

## Reuse map (audit)

| Asset | Path | Reuse decision |
| --- | --- | --- |
| Offline Europe PMC / Open Targets / UniProt fixtures | `src/demo/evidenceFixtures.ts` | **Reuse** PMIDs `27912057`, `11298065` as verified public sources |
| Eight-step investigation → brief | `src/demo/investigation.ts` | **Pattern reuse** (journey shape); new universe is typed + referential |
| Investor IL-21 catalogue | `src/demonstration/scenarios.ts` | **Keep separate** — do not overwrite |
| Curated disagreement pack | `src/investigation/curatedDisagreementPack.ts` | **Pointer** `gut-treg-vs-scfa-th17` from core investigation |
| Sealed domain graph | `research/domain-graph/graph.v1.json` | **Read-only** via `sealedGraphEdgeIdRef` only |
| Enterprise / workspace demos | `src/enterprise/*Demo.ts` | **Later PR adapters** — do not fork catalogs in PR1 |
| Synthetic validation corpus (1000 evidence) | `research/validation/v0.1/` | **Do not promote** as demo “evidence” |
| Clinical synthetic cohort | `src/clinicalPlane/`, public JSON | **PR5** only; keep release gate |
| Landing scenario sketches | `site/src/components/editorial/homeResearchScenarios.ts` | **PR6** wire-up; empty evidence arrays today |
| Capability status | `docs/capability-status.json` | **Do not invent** availability |

### Do not overwrite

Sealed graph versions, gold/SME vaults, capability-status honesty, Gate C fixtures, clinical-plane non-synthetic paths.

---

## Phase 1 delivered (this PR)

One complete investigation: **gut-immune-metabolic** / `DEMO-INV-001`

`question → evidence context → mechanism graph → conflicting findings → uncertainty → candidate hypothesis → reviewable brief`

| Layer | IDs |
| --- | --- |
| Scenario | `gut-immune-metabolic` |
| Verified publications | `DEMO-PUB-001` (PMID 27912057), `DEMO-PUB-002` (PMID 11298065) |
| Synthetic comparison | `DEMO-CLAIM-001` vs `DEMO-CLAIM-002` → `DEMO-COMP-001` |
| Insufficient-evidence claim | `DEMO-CLAIM-005` |
| Brief | `DEMO-BRIEF-001` with explicit limitations |

### Provenance classes enforced

1. **verified_public_source** — real PMID/DOI required; no abstract reproduction  
2. **curated_demonstration_interpretation** — unreviewed interpretation linked to identifiable sources  
3. **fully_synthetic_fixture** — invented results only; no fake PMID/DOI  

---

## Planned expansion (later PRs)

| PR | Scope |
| --- | --- |
| 2 | Five remaining domain scenarios + shared nodes |
| 3 | Interactive evidence comparison + brief UI |
| 4 | Role dashboard adapters over shared records |
| 5 | Omics / assays / synthetic cohorts |
| 6 | Landing-page product previews + e2e |

---

## Adapter contract

```ts
import {
  getDemoInvestigationJourney,
  demoUniverseAllowsProductionWrite,
} from "@hsi/demoUniverse";

demoUniverseAllowsProductionWrite(); // always false
getDemoInvestigationJourney("DEMO-INV-001");
```

Integrity: `validateDemoUniverseBundle` / `assertValidDemoUniverseBundle` in `src/demoUniverse/schema.ts`.
