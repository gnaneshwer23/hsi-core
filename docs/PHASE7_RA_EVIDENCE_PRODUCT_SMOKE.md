# Phase 7 — Rights-verified RA evidence product activation

**Date:** 2026-11-03  
**Verdict:** **DONE** (vendor sync + corpus verify + disposable DB smoke).  
**Not** scientific validation, Gate C approval, or SME label completion.

## Problem

Phase 3 installed `release.json` into ISI/Aksh, but product `raEvidenceRelease` parsers were still protocol v1 (no Crossref receipt fields). Readiness stayed `available=false` with `failed validation`.

## Fix

1. `bun scripts/sync-shared-technology.ts isi aksh` — protocol v2 parser with `licenceAttestation` / `crossref`.
2. Flip corpus verify + unit tests to expect rights-verified load (`public_real`, ≥2 passages, `scientificReview: unreviewed`, zero claims).
3. Phase 5 smoke scripts now assert `evidence_start_passages` instead of `evidence_not_ready`.

## Verify

```sh
bun --cwd ../immunecity scripts/verify-ra-research-corpus.ts
bun --cwd ../aksh-health-redesign/packages/platform-uk scripts/verify-ra-research-corpus.ts
```

Corpus verify: ISI/Aksh **8** evidence passages + **2** research passages, `scientificReview: unreviewed`.

Disposable DB Phase 5 smoke (`hsi_step3_test`): ISI and Aksh both PASS with
`evidence_start_passages`, research start, reload, cross-owner denial, review
without claim promotion, export.

## Honesty

Rights-verified ≠ scientifically approved. Research working set remains for practice. SME eval packets from Phase 6 stay unlabelled until humans annotate.
