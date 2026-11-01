# Aksh HITL consumption rules (P1)

`hsi-core` publishes a **provisional** `akshNodeId` map for T2D / immuno-metabolic seeds.
Aksh may join on these ids for future HITL cards. Mapping is **not** clinical decision support.

## Hard rules

1. **`isCdsSurfacable(edge)` stays false** unless both:
   - `curationReview === "approved"`
   - `hsiGrade === "established"`
2. Filling `claim.akshNodeId` **never** flips CDS eligibility, `cdsEligibleHint`, or Gate C.
3. **No EHR / patient-record write-back** from map presence alone.
4. **No PHI** in hsi-core seeds or exports.
5. **No invented PMIDs**; Aksh map does not approve Neon Gate C.
6. IO discovery seeds (e.g. PD-1 exhaustion) stay **unmapped** to Aksh unless a clinic pathway explicitly needs them (irAE→hyperglycemia is a bridge watch only).

## Consume

```ts
import {
  claimsWithAkshMappings,
  akshNodeIdMap,
  listAkshNodeSuggestions,
  isCdsSurfacable,
  HSI_T2D_IMMUNO_SEED_EDGES,
} from "hsi-core";

const claims = claimsWithAkshMappings();
const byClaim = akshNodeIdMap(); // Record<claimId, akshNodeId>

for (const edge of HSI_T2D_IMMUNO_SEED_EDGES) {
  // Still false for every Phase-0/P1 seed until Gate C + established.
  if (!isCdsSurfacable(edge)) continue;
  // …render HITL card only here…
}
```

Export: `bun run export:aksh-map` → `exports/hsi-aksh-node-map.json`
(`schemaVersion: hsi-aksh-node-map-1`, `autoSurfaceCds: false`).

## Id namespace

Provisional ids use `AKSH-N-*` (clinic concepts) and are **substrate stubs** until a live
Aksh clinical KG / pilot org binds them. Do not treat them as production rule engine keys yet.
