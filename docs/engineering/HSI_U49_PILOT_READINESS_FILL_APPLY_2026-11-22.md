# U49 — Pilot readiness fill-apply for Human #8 (22 November 2026)

**Phase:** P1 production hardening · extends U8 pilot readiness scaffold  
**Owner approval:** Pilot readiness fill-apply engineering authorized (22 November 2026).  
**Not claimed:** Soak accepted, signed pilot release, checklist #8 invites, invented on-call/alerts/soak evidence, Gate C, PHI, or GA.

## Change

1. Owner approval `hsiPilotReadinessFillApplyAuthorization`.  
2. Soft-land catalog.  
3. Proposal builder + dry-run (default) / dual-flag write apply into U8 + NEXT-F pendings.  
4. CLI: `staging:pilot-readiness:apply-proposal`.  
5. Docs + readiness / ARCH-009 honesty.

## Honesty

| Claim | Soft-land |
|---|---|
| Fill non-placeholder Human #8 ops / soak refs | **Yes** |
| Mirror refs into NEXT-F soak pending | **Yes** |
| Dry-run default; write only with dual owner env flags | **Yes** |
| soakAccepted / pilotReleaseSigned / checklist #8 invites | **No** |
| Invented on-call, alerts, soak evidence, invites | **No** |

## Acceptance

- `bun test test/hsiPilotReadinessFillApply.test.ts`  
- Dry-run: `bun run staging:pilot-readiness:apply-proposal -- --proposal <owner-proposal.json>`  

Verified HSI 1.0 acceptance stays **0 / 8** until Human #8 / NEXT-F actually closes.
