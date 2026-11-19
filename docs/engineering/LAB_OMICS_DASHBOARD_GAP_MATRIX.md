# Laboratory & Omics Dashboard — implementation gap matrix

**Date:** 19 November 2026 (Europe/London)  
**Scope:** Stage 4 Laboratory & Omics Dashboard shell on the shared science engine.  
**Content contract:** [`../strategy/HSI_STAGE4_DASHBOARD_CONTENT_MAP.md`](../strategy/HSI_STAGE4_DASHBOARD_CONTENT_MAP.md)  
**Visual language:** Shared `enterprise-dashboard.css`.

**Hard rules:** No fake QC scores · no invented feature counts · no unmeasured integration quality % · missing assay fields stay explicit · multi-omics stays candidate / unreviewed. Not CDS; no PHI.

## Must-contain → status

| Must contain | Status | Surface |
| --- | --- | --- |
| Assay metadata | **Demo fields** with explicit missings | `/enterprise/lab` → `/research/methods` · workspace |
| Experiment comparisons | **Demo** + deep-link | `/science/study-comparison` · methods |
| Multi-omics interpretation | **Candidate-labelled** | KG deep-link |
| Reproducibility checks | **Honesty-labelled** (no fake QC) | Dual-model / retraction notes |
| Pathway mapping | **Demo / source-linked** | `/science/paths` |
| Biological evidence integration | **Null quality %** + Stage 2 deep-link | `/research/workspace` |

## Soft-land / wiring

| Route | Role |
| --- | --- |
| `/enterprise/lab` | Laboratory & Omics shell (demo) |
| `/academic` · biotech · clinical | Cross-links |

Does **not** rewrite Stage 2 investigation as the primary path. Soft-lands `#511`–`#512` stay owner-paused.

## Explicit non-goals

- Production writes or lifting migrations 022–033  
- PHI / live CDS  
- Fake QC scores, invented feature counts, unmeasured integration %  
- Community shell in this increment  
- Replacing the Stage 2 journey as the build centre  
