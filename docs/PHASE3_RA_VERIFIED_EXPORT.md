# Phase 3 — Install verified RA evidence artifact

**Date:** 2026-11-03  
**Verdict:** **READY TO RUN** (Phase 2 CLEARED). Not yet completed — export + product install still required.  
**Not** scientific validation, Gate C approval, inventing passages, or promoting the research working set to verified evidence.

## Intent

After a rights-cleared import (`ra-anti-tnf-evidence` available), export the verified research artifact into product trees and confirm loaders serve it:

1. Commit canonical `research/ra-anti-tnf/*` (export refuses dirty tree)
2. `bun run ra:export-artifact -- isi aksh` with `readiness.available === true`
3. Product corpora under `ra-anti-tnf-evidence` stop returning `evidence_not_ready`
4. ISI / Aksh consume the verified bundle without inventing claims

Phase 3 does **not** include: inventing CC URIs, weakening the importer, or treating `ra-anti-tnf-research` as verified evidence.

## Dependency

| Step | Result |
| --- | --- |
| Phase 2 licence import | **CLEARED** — [`PHASE2_RA_LICENCE_IMPORT.md`](./PHASE2_RA_LICENCE_IMPORT.md) |
| `research/ra-anti-tnf/release.json` | Rights-verified; `raEvidenceReadiness.available === true`; `scientificReview: unreviewed` |
| Sources / passages | 2 / 8; both `licenceAttestation: crossref_works` |

## Success criteria

| Criterion | Status |
| --- | --- |
| Phase 2 import writes rights-verified `release.json` with exact passages | Met |
| Export `available=true` into ISI + Aksh artifact dirs | Pending commit + `ra:export-artifact` |
| Product loaders expose verified corpus (not only research working set) | Pending |
| No invented licences / passages / scientific approval | Met so far |

## Next command (after commit)

```bash
bun run ra:export-artifact -- isi aksh
```

Then commit product artifact paths in ISI and Aksh. Do not declare Phase 3 done until that export lands with `available=true`.

## Honesty

Phase 2 clearance unblocks Phase 3; it does **not** complete Phase 3. Shipping the research working set alone is still not Phase 3 completion.
