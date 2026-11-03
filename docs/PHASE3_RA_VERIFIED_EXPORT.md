# Phase 3 — Install verified RA evidence artifact

**Date:** 2026-11-03  
**Verdict:** **DONE** (export `available=true` into ISI + Aksh).  
**Not** scientific validation, Gate C approval, or promoting the research working set to scientific claim support.

## Intent

After a rights-cleared import (`ra-anti-tnf-evidence` available), export the verified research artifact into product trees and confirm loaders serve it.

## Completed

| Step | Result |
| --- | --- |
| Phase 2 licence import | CLEARED — [`PHASE2_RA_LICENCE_IMPORT.md`](./PHASE2_RA_LICENCE_IMPORT.md) |
| Canonical commit | `3679fb4` (hsi-core) |
| `bun run ra:export-artifact -- isi aksh` | `available=true`; 2 sources / 8 passages |
| ISI `src/data/hsi/ra-anti-tnf/` | Rights-verified snapshot; `scientificReview: unreviewed` |
| Aksh `packages/platform-uk/data/hsi/ra-anti-tnf/` | Same snapshot / version |

## Honesty

Rights-verified ≠ scientifically approved. Product start against this corpus must keep `scientificReview: unreviewed` and must not invent claims or Gate C approval.
