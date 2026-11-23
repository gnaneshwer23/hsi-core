# U48 — SME reliability fill-apply for Human #4 (22 November 2026)

**Phase:** P1 production hardening · extends U7 scientific reliability scaffold  
**Owner approval:** SME reliability fill-apply engineering authorized (22 November 2026).  
**Not claimed:** SME gold filled, scientific approval, invented labels/adjudications, gold in git, Gate C, PHI, or GA.

## Change

1. Owner approval `hsiSmeReliabilityFillApplyAuthorization`.  
2. Soft-land catalog.  
3. Proposal builder + dry-run (default) / dual-flag write apply into U7 + E2E-10 pendings.  
4. CLI: `staging:sme-reliability:apply-proposal`.  
5. Docs + readiness / ARCH-009 honesty.

## Honesty

| Claim | Soft-land |
|---|---|
| Fill non-placeholder Human #4 SME / adjudicator refs | **Yes** |
| Mirror refs into E2E-10 vault pending | **Yes** |
| Dry-run default; write only with dual owner env flags | **Yes** |
| smeGoldFilled / scientificApproval / adjudicatedCases | **No** |
| Invented labels, adjudications, gold in git | **No** |

## Acceptance

- `bun test test/hsiSmeReliabilityFillApply.test.ts`  
- Dry-run: `bun run staging:sme-reliability:apply-proposal -- --proposal <owner-proposal.json>`  

Verified HSI 1.0 acceptance stays **0 / 8** until SME gold is actually adjudicated.
