# U12 — L1 restricted-preview readiness + write/health codes (21 November 2026)

**Phase:** Production readiness · restricted preview path  
**Not claimed:** Staging grant evidence, preview GO, write enablement, scientific approval.

## Change

1. L1 readiness soft-land (`hsi10RestrictedPreviewReadinessU12SoftLand`) — engineering vs owner staging-grant catalog.  
2. `handleHealth` → `METHOD_NOT_ALLOWED` on non-GET/HEAD.  
3. `vercelResearch` POST with writes off → `RESEARCH_WRITES_DISABLED`; a few remaining gateway errors gain stable `code`s.

## Acceptance

- `bun test test/hsi10RestrictedPreviewReadinessU12SoftLand.test.ts test/vercelResearch.test.ts` (and health assertions if present)  
- `restrictedPreviewClaimed` / `productionWritesEnabled` stay false  

## Follow-ons

- Owner staging grant continuous run (U4 / U6 Human #5)  
- L0 owner GO (U11) before inviting preview users  
