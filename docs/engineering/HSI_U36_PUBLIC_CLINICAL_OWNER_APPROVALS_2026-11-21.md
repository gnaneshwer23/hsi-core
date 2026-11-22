# U36 — Public L0 + clinical synthetic owner approvals (21 November 2026)

**Phase:** Production readiness · owner deploy authorizations  
**Owner approval:** Explicit founder approval to advance clinical / PHI / public production deploy tracks (21 November 2026, Europe/London).  
**What this unlocks:** Public L0 production deploy GO; clinical-plane *synthetic* engineering advance.  
**What this does not unlock:** Real PHI, live CDS, ADR-0010 gate closure, held migrations 031–033, research write enablement, Gate C.

## Change

1. `src/hsiOwnerDeployAuthorizations.ts` — public L0 GO + clinical synthetic engineering envelopes.  
2. `src/clinicalPlane/clinicalPlanePrivateRepoReadiness.ts` — ADR-0010 gate catalog (all still open / interim-insufficient).  
3. Public launch QA packet + U11 soft-land updated with recorded owner GO.  
4. `assertHsiPhiRemainClosedUnderOwnerDeployApprovals` — chat approval cannot flip CDS/PHI invariants.

## Honesty

| Track | Authorized | Still closed |
|---|---|---|
| Public L0 site + Demo Universe deploy | **Yes** | Research writes, scientific approval |
| Clinical-plane synthetic / lift-ready code | **Yes** | Real patient data |
| Real PHI / live CDS / EHR write-back | **No** | Until every ADR-0010 gate closes |

## Acceptance

- `bun test test/hsiOwnerDeployAuthorizations.test.ts test/cdsPhiBoundary.test.ts`  
