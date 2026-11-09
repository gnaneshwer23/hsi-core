# M20 Release Readiness Report

**Date:** 2026-11-09  
**Version tip (at report authoring):** post-merge `main` including M17 PR5 [#141](https://github.com/gnaneshwer23/hsi-core/pull/141) + M19 PR1 [#142](https://github.com/gnaneshwer23/hsi-core/pull/142); M20 master audit [#143](https://github.com/gnaneshwer23/hsi-core/pull/143) in-flight / follow-on  
**Environment:** www `https://www.humansuperintelligence.tech` (production writes **off**)  

## Final recommendation

| Decision | Scope |
|----------|-------|
| **LIMITED GO** | Synthetic demo rehearsal only (`LIMITED_GO_SYNTHETIC_DEMO_ONLY`) |
| **NO-GO** | Live scientific acceptance, public research SaaS launch, production writes |

## Included capabilities (LIMITED GO)

- Demo accounts pack (fixture personas; no passwords in git).
- Offline 22-step SSc journey against synthetic fixture investigation.
- Eng honesty: science BLOCKED · live ops BLOCKED · productionReadyClaimed=false.

## Excluded

- Live neon_auth two-account ops (#5).
- Passage rights / SME gold (#2/#4).
- Durable restart-proven orchestration.
- LHKG Neon live reads (FORCE RLS deny-by-default).
- Therapeutic/RWE/clinical as validated product (fixture contracts only).

## Gate summary

| Gate | Result |
|------|--------|
| A Functional (demo) | **PASS** (synthetic) |
| B Scientific (live) | **BLOCKED** |
| C Reproducibility (live) | **BLOCKED** |
| D Security (demo boundary) | **PASS** (synthetic boundary only) |
| E Governance (demo) | **PASS** (distinct reviewer persona) |
| F Usability pilot | **PENDING** (no enrolled researchers) |
| G Operations (live) | **BLOCKED** |
| H Research value | **PENDING** |

## Open P0 (outside LIMITED GO)

Remain PARKED for any broader launch: #2 rights, #4 SME, #5 staging auth, LHKG ops policies, durable recovery, pilot trusted gates.

## Rollback

Docs + fixture packs only for this LIMITED GO. Revert PR; www writes stay false by default.

## Sign-off language

**Approved for:** offline / fixture-labelled demo rehearsal of researcher + reviewer workflows.  
**Not approved for:** scientific publication claims, clinical use, production research writes, or marketing “production ready.”
