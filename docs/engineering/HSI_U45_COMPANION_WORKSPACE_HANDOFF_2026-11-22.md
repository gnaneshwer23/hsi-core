# U45 — Companion ↔ workspace evidence handoff (22 November 2026)

**Phase:** Vision Phase 2 deepen · builds on U41/U42 Companion  
**Owner approval:** Workspace handoff engineering authorized (22 November 2026).  
**Not claimed:** Companion network retrieval, claim verification, voice, avatar, networking, scientific approval, Gate C, PHI, production writes, restricted-preview GO, or GA.

## Change

1. Owner approval `hsiCompanionWorkspaceHandoffAuthorization`.  
2. Pure mappers: live records / candidates / rows → Companion bound evidence.  
3. Curated scenario fixture handoff (`il21-autoimmune`) for demo without live retrieval.  
4. Soft-land catalog.  
5. UI: `/research/companion?from=workspace&scenario=…` + fixture button; `scientificCompanionHref`.  
6. Docs + readiness / what’s-built honesty.

## Honesty

| Claim | Soft-land |
|---|---|
| Map workspace-shaped public metadata into Companion turns | **Yes** |
| Companion retrieves Europe PMC / OpenAlex itself | **No** |
| Fixture invents scientific findings | **No** (illustrative metadata only) |
| Claim-verified / voice / avatar / networking | **No** |

## Acceptance

- `bun test test/companionWorkspaceHandoff.test.ts test/workbenchPrimary.test.ts`  
- Open `/research/companion?from=workspace&scenario=il21-autoimmune` and run Discuss  
