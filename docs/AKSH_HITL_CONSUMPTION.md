# Aksh HITL consumption rules (P1)

`hsi-core` publishes a durable `aksh:` clinic-concept map for T2D / immuno-metabolic
seeds. Aksh may join on these ids for future HITL cards. Mapping is **not** clinical
decision support.

No live Aksh clinical KG repo yet exposes canonical graph node ids; ids are therefore
namespaced in hsi-core and grounded in Aksh platform clinic concepts (conditions,
findings with LOINC, medicines, risk, interactions) from akshhealth.com / platform-uk
lab catalog + diabetes pathway copy.

## Hard rules

1. **`isCdsSurfacable(edge)` stays false** unless both:
   - `curationReview === "approved"`
   - `hsiGrade === "established"`
2. Filling `claim.akshNodeId` **never** flips CDS eligibility, `cdsEligibleHint`, or Gate C.
3. **No EHR / patient-record write-back** from map presence alone.
4. **No PHI** in hsi-core seeds or exports.
5. **No invented PMIDs**; Aksh map does not approve Neon Gate C.
6. IO discovery seeds (e.g. PD-1 exhaustion) stay **unmapped** to Aksh unless a clinic pathway explicitly needs them (irAE→hyperglycemia is a bridge watch only).

## Id scheme

```
aksh:<kind>:<slug>
```

| Kind | Use |
|------|-----|
| `condition` | Clinic diagnoses (e.g. `aksh:condition:t2dm`, `aksh:condition:lada`) |
| `finding` | Labs / observations — LOINC when known (e.g. `aksh:finding:hba1c` → 4548-4) |
| `medicine` | Drug / class concepts (`aksh:medicine:metformin`, `aksh:medicine:sglt2i`) |
| `risk` | Risk slots (`aksh:risk:infection-susceptibility`) |
| `pathway` | Pathophysiology templates (`aksh:pathway:insulin-resistance`) |
| `interaction` | Immuno-metabolic bridge watches |
| `watch` | Cross-domain clinic watches (`aksh:watch:irae-hyperglycemia`) |

Export schema: `hsi-aksh-node-map-2` (includes `provisionalMigration` + `clinicConcepts`).

## Provisional → durable migration

| Provisional | Durable |
|-------------|---------|
| `AKSH-N-hba1c` | `aksh:finding:hba1c` |
| `AKSH-N-fpg` | `aksh:finding:fpg` |
| `AKSH-N-insulin-resistance` | `aksh:pathway:insulin-resistance` |
| `AKSH-N-beta-cell-dysfunction` | `aksh:pathway:beta-cell-dysfunction` |
| `AKSH-N-metformin` | `aksh:medicine:metformin` |
| `AKSH-N-sglt2i` | `aksh:medicine:sglt2i` |
| `AKSH-N-glp1ra` | `aksh:medicine:glp1ra` |
| `AKSH-N-obesity` | `aksh:condition:obesity` |
| `AKSH-N-cgm-tir` | `aksh:finding:cgm-tir` |
| `AKSH-N-glucocorticoid-hyperglycemia` | `aksh:interaction:glucocorticoid-hyperglycemia` |
| `AKSH-N-inflammation-insulin-resistance` | `aksh:interaction:inflammation-insulin-resistance` |
| `AKSH-N-tnf-insulin-resistance` | `aksh:interaction:tnf-insulin-resistance` |
| `AKSH-N-il6-t2d` | `aksh:interaction:il6-t2dm` |
| `AKSH-N-hscrp` | `aksh:finding:hscrp` |
| `AKSH-N-adipose-macrophage-ir` | `aksh:interaction:adipose-macrophage-ir` |
| `AKSH-N-nlrp3-metabolic-inflammation` | `aksh:interaction:nlrp3-metabolic-inflammation` |
| `AKSH-N-t2d-infection-risk` | `aksh:risk:infection-susceptibility` |
| `AKSH-N-hyperglycemia-innate` | `aksh:interaction:hyperglycemia-innate` |
| `AKSH-N-autoimmune-metabolic-comorbidity` | `aksh:interaction:autoimmune-metabolic-comorbidity` |
| `AKSH-N-irae-hyperglycemia` | `aksh:watch:irae-hyperglycemia` |
| `AKSH-N-islet-autoantibodies` | `aksh:finding:islet-autoantibodies` |
| `AKSH-N-lada` | `aksh:condition:lada` |

Use `migrateAkshNodeId()` / `PROVISIONAL_AKSH_TO_DURABLE` for any stored provisional pointers.

## Consume

```ts
import {
  claimsWithAkshMappings,
  akshNodeIdMap,
  listAkshNodeSuggestions,
  migrateAkshNodeId,
  isCdsSurfacable,
  HSI_T2D_IMMUNO_SEED_EDGES,
} from "hsi-core";

const claims = claimsWithAkshMappings();
const byClaim = akshNodeIdMap(); // Record<claimId, aksh:…>

for (const edge of HSI_T2D_IMMUNO_SEED_EDGES) {
  // Still false for every Phase-0/P1 seed until Gate C + established.
  if (!isCdsSurfacable(edge)) continue;
  // …render HITL card only here…
}
```

Export: `bun run export:aksh-map` → `exports/hsi-aksh-node-map.json`
(`schemaVersion: hsi-aksh-node-map-2`, `autoSurfaceCds: false`).
