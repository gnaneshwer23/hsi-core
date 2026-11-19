# Research Community Dashboard — implementation gap matrix

**Date:** 19 November 2026 (Europe/London)  
**Scope:** Stage 4 Research Community Dashboard shell on the shared science engine.  
**Content contract:** [`../strategy/HSI_STAGE4_DASHBOARD_CONTENT_MAP.md`](../strategy/HSI_STAGE4_DASHBOARD_CONTENT_MAP.md)  
**Visual language:** Shared `enterprise-dashboard.css`.

**Hard rules:** Circles durable store **held** · no automatic IP bleed · shared ≠ public by default · expert discussions proposed (not a vanity feed) · collaborative reviews require human Gate C. Not CDS; no PHI.

## Must-contain → status

| Must contain | Status | Surface |
| --- | --- | --- |
| Research Circles | **Demo sketches** · store held | `/enterprise/community` |
| Collaborative evidence reviews | **Demo paths** + deep-link | `/research/governance` · workspace |
| Expert discussions | **Proposed / not enabled** | Explicit vanityFeed: false |
| Shared scientific challenges | **Demo** + deep-link | `/research/gaps` |
| Researcher discovery | **Opt-in demo** | `/welcome` · `/research/home` |

## Soft-land / wiring

| Route | Role |
| --- | --- |
| `/enterprise/community` | Research Community shell (demo) |
| `/research/community-feed` | Existing local feed examples |
| `/community` | Still redirects to research home (unchanged) |

Does **not** enable live community publishing or Circles durable writes.

## Explicit non-goals

- Production Circles / org durable store  
- Automatic IP bleed or public-by-default sharing  
- Social vanity feed / live posting  
- PHI / live CDS  
- Replacing the Stage 2 journey as the build centre  
