# HSI Demo Research Universe — reuse inventory & Phase 1–2

**Date:** 19 November 2026 (Europe/London)  
**Branch:** `cursor/demo-universe-landing-previews-2f71` (stacks on Demo PR5 / `#566`)  
**Code:** [`src/demoUniverse/`](../../src/demoUniverse/) · UI [`/demo/universe`](../../site/src/pages/DemoUniversePage.tsx) · role + omics + landing preview panels  
**Honesty:** Synthetic users/orgs + verified public bibliographic metadata + labelled simulated findings. Not scientific approval. No production graph writes. No PHI to external AI. Real cohort data remains disabled.

---

## Reuse map (audit)

| Asset | Path | Reuse decision |
| --- | --- | --- |
| Offline Europe PMC / Open Targets / UniProt fixtures | `src/demo/evidenceFixtures.ts` | **Reuse** PMIDs `27912057`, `11298065` as verified public sources |
| Eight-step investigation → brief | `src/demo/investigation.ts` | **Pattern reuse** (journey shape); new universe is typed + referential |
| Investor IL-21 catalogue | `src/demonstration/scenarios.ts` | **Keep separate** — do not overwrite |
| Curated disagreement pack | `src/investigation/curatedDisagreementPack.ts` | **Pointer** `gut-treg-vs-scfa-th17` from core + neuroimmune scenarios |
| Sealed domain graph | `research/domain-graph/graph.v1.json` | **Read-only** via `sealedGraphEdgeIdRef` only |
| Shared demo catalog | `src/demoUniverse/fixtures/sharedCatalog.ts` | **Phase 2** cross-scenario nodes, orgs, researchers, publications |
| Enterprise / workspace demos | `src/enterprise/*Demo.ts` | **Later PR adapters** — do not fork catalogs in PR1–2 |
| Synthetic validation corpus (1000 evidence) | `research/validation/v0.1/` | **Do not promote** as demo “evidence” |
| Clinical synthetic cohort | `src/clinicalPlane/`, public JSON | **PR5** only; keep release gate |
| Landing scenario sketches | `site/src/components/editorial/homeResearchScenarios.ts` | **PR6** pack-backed via `listDemoLandingPreviews` / home sketch map |
| Capability status | `docs/capability-status.json` | **Do not invent** availability |

### Do not overwrite

Sealed graph versions, gold/SME vaults, capability-status honesty, Gate C fixtures, clinical-plane non-synthetic paths.

---

## Phase 1 delivered

One complete investigation: **gut-immune-metabolic** / `DEMO-INV-001`

`question → evidence context → mechanism graph → conflicting findings → uncertainty → candidate hypothesis → reviewable brief`

| Layer | IDs |
| --- | --- |
| Scenario | `gut-immune-metabolic` |
| Verified publications | `DEMO-PUB-001` (PMID 27912057), `DEMO-PUB-002` (PMID 11298065) |
| Synthetic comparison | `DEMO-CLAIM-001` vs `DEMO-CLAIM-002` → `DEMO-COMP-001` |
| Insufficient-evidence claim | `DEMO-CLAIM-005` |
| Brief | `DEMO-BRIEF-001` with explicit limitations |

---

## Phase 2 delivered (this PR)

Five additional domain scenarios sharing `sharedCatalog` nodes. Each has a synthetic conflict pair, one curated bibliographic claim, one insufficient-evidence claim, gaps, hypothesis and brief.

| Scenario id | Investigation | Domain |
| --- | --- | --- |
| `immune-inflammation` | `DEMO-INV-002` | immune-inflammation |
| `neuroimmune-signalling` | `DEMO-INV-003` | neuroscience |
| `single-cell-omics` | `DEMO-INV-004` | genomics-multi-omics |
| `tissue-remodelling` | `DEMO-INV-005` | organ-tissue-biology |
| `comparative-disease-mechanisms` | `DEMO-INV-006` | disease-mechanisms |

Factory: `src/demoUniverse/fixtures/buildScenarioBundle.ts`  
Bundles: `src/demoUniverse/fixtures/phase2Scenarios.ts`

### Provenance classes enforced

1. **verified_public_source** — real PMID/DOI required; no abstract reproduction  
2. **curated_demonstration_interpretation** — unreviewed interpretation linked to identifiable sources  
3. **fully_synthetic_fixture** — invented results only; no fake PMID/DOI  

---

## Phase 3 delivered (this PR)

Interactive evidence comparison + reviewable brief UI at **`/demo/universe`**.

| Layer | Path |
| --- | --- |
| Presentation helpers | `src/demoUniverse/presentation.ts` — `listDemoScenarioSummaries`, `buildDemoComparisonView` |
| Page | `site/src/pages/DemoUniversePage.tsx` |
| Shell | `site/src/components/demo/DemoUniverseShell.tsx` |
| Tests | `test/demoUniversePresentation.test.ts` · `site/e2e/demo-universe.spec.ts` |

## Phase 4 delivered (this PR)

Role dashboard adapters — `demoUniverseSliceForRole` maps professor / student / biotech / clinical / lab / community onto seeded scenarios without duplicating catalogs. Shared `DemoUniverseRolePanel` on six enterprise shells; deep-links use `/demo/universe?scenario=…`.

| Layer | Path |
| --- | --- |
| Adapters | `src/demoUniverse/roleAdapters.ts` |
| Panel | `site/src/components/demo/DemoUniverseRolePanel.tsx` |
| Tests | `test/demoUniverseRoleAdapters.test.ts` · `site/e2e/demo-universe-roles.spec.ts` |

## Phase 5 delivered (this PR)

Omics assay sketches, unreviewed omics candidates, and **synthetic-only** cohort aggregates with small-cell withholding. Does **not** load clinical-plane patient shards or enable real data.

| Layer | Path |
| --- | --- |
| Pack | `src/demoUniverse/omicsCohorts.ts` |
| Panel | `site/src/components/demo/DemoOmicsCohortPanel.tsx` |
| Tests | `test/demoUniverseOmicsCohorts.test.ts` · `site/e2e/demo-universe-omics.spec.ts` |

## Phase 6 delivered (this PR)

Landing-page product previews: pack-backed conflict cards on the public homepage, home sketch → Demo Universe map, and e2e coverage.

| Layer | Path |
| --- | --- |
| Adapter | `src/demoUniverse/landingPreviews.ts` — `listDemoLandingPreviews`, `HOME_SKETCH_TO_DEMO_SCENARIO` |
| Panel | `site/src/components/demo/DemoLandingPreviewPanel.tsx` on `Home` `#product-demo` |
| Home sketches | `site/src/components/editorial/homeResearchScenarios.ts` — pack_backed where mapped |
| Tests | `test/demoUniverseLandingPreviews.test.ts` · `site/e2e/demo-universe-landing.spec.ts` |

---


## Adapter contract

```ts
import {
  getDemoInvestigationJourney,
  listDemoScenarioIds,
  buildDemoComparisonView,
  demoUniverseAllowsProductionWrite,
} from "@hsi/demoUniverse";

demoUniverseAllowsProductionWrite(); // always false
listDemoScenarioIds(); // six seeded scenario ids
buildDemoComparisonView("immune-inflammation");
getDemoInvestigationJourney("DEMO-INV-001");
```

Integrity: `validateDemoUniverseBundle` / `assertValidDemoUniverseBundle` in `src/demoUniverse/schema.ts`.
