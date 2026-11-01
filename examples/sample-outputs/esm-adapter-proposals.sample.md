# HSI FAIR ESM-2 adapter proposals (P3.3 spike) — sample

> Illustrative snippet. Regenerate full artifact with `bun run outputs` → `hsi-esm-adapter-proposals.md`.

Schema: `hsi-esm-adapter-proposals-1` · runtime: **stub** · `autoApprove=false` · does not set `hsiGrade` · `partnerSigned=false` · no weight vendoring · Boltz deferred

## Why FAIR ESM-2 (Boltz deferred)

MIT FAIR / `research_ok_documented`; protein-language embedding sidecars (hash/ref) complement RDKit + OpenMM + REINVENT4; no multi-GB weight vendoring. Boltz structure/affinity weights path deferred.

## Embeddings (shape)

| Fixture | edgeId | dim | engine | runtime |
|---------|--------|-----|--------|---------|
| TNF-α public fragment | `HSI-E-RA-001` | 1280 | stub | stub |
| FOXP3 public fragment | `HSI-E-GUT-003` | 1280 | stub | stub |

## Proposals (shape)

| Proposal | S — P — O | Teaching | Evidence |
|----------|-----------|----------|----------|
| `HSI-MP-ESM2-TNF-001` | TNF-α public fragment → RA pathway embedding … — associated_with — research FAIR ESM-2 embedding sidecar slot … | hypothesized | pack:hsi-pilot-evidence-pack; edge:HSI-E-RA-001; runtime:stub |
| `HSI-MP-ESM2-FOXP3-001` | FOXP3 public fragment → mucosal Treg embedding … — associated_with — research FAIR ESM-2 embedding sidecar slot … | hypothesized | pack:hsi-gut-immune-pack; edge:HSI-E-GUT-003; runtime:stub |

License gate: `adapter-esm` · `research_ok_documented` · `blockedUntilSignOff=false`. Blocked adapters (e.g. AF3/TDC) are refused. EvolutionaryScale ESM-3/ESMC = separate review.
