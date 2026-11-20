# Workspace evidence reliability honesty

**Date:** 20 November 2026 (Europe/London)  
**Programme:** HSI 1.0 Integration First — P0 evidence reliability (engineering surface only)  
**Stacked on:** continuous Stage 2 trail (`WORKSPACE_CONTINUOUS_TRAIL.md`)  
**Honesty:** `sourceClearanceVerified=false` · `scientificApproval=false` · `writesEnabledClaimed=false`

## Intent

On the continuous Ask → Evidence → Passport → Brief path, surface **existing** fail-closed source fields so every cited finding shows locators and explicit non-clearance — without inventing source clearance approval, rights grants, or scientific validation.

## Surfaces

| Surface | Behaviour |
| --- | --- |
| Claim inspect (`#ws-vf-h`) | Source URL + `formatLiveSourceReliabilityMeta` (DOI/PMID or “not stated”, licenceStatus, verificationState, rights, `sourceClearanceVerified: false`) |
| View all sources | Same meta line per record |
| Passport evidence table | Source cell links URL; shows DOI/PMID when present; `rights: unverified`; clearance not verified |
| Brief limitations / markdown | `liveSourceReliabilityLimitations()` always visible |

Helper: `src/investigation/liveSourceReliabilityHonesty.ts`.

## Explicit non-goals

- Signing or inventing source clearance (Track B1 / Human #2)  
- Enabling production writes or lifting migrations  
- Claiming NEXT-A composition acceptance from CI green  
- Changing comparison engines or Demo Universe fixtures  

## Owner still required

Signed clearance policy · live passage rights · SME adjudication · staging durable persistence.
