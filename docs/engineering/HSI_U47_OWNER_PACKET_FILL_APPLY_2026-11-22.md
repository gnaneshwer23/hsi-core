# U47 — Owner-packet fill-apply for Human #2/#3/#5 (22 November 2026)

**Phase:** P0 production hardening · extends U6 owner-packets scaffold  
**Owner approval:** Owner-packet fill-apply engineering authorized (22 November 2026).  
**Not claimed:** Human #2/#3/#5 closed, signed packets, invented signers/MoUs/hosts, production writes, Gate C, PHI, scientific approval, or GA.

## Change

1. Owner approval `hsiOwnerPacketFillApplyAuthorization`.  
2. Soft-land catalog.  
3. Proposal builder + dry-run (default) / dual-flag write apply into `hsi-10-owner-packets.pending.json`.  
4. CLI: `staging:owner-packets:apply-proposal`.  
5. Docs + readiness / ARCH-009 honesty.

## Honesty

| Claim | Soft-land |
|---|---|
| Fill non-placeholder Human #2/#3/#5 refs into U6 pending | **Yes** |
| Dry-run default; write only with dual owner env flags | **Yes** |
| Refuse placeholders / invented signers / MoUs / localhost hosts | **Yes** |
| Human #2/#3/#5 closed / signedPacketClaimed | **No** |
| Invented MoUs, Gate C, PHI, production writes | **No** |

## Acceptance

- `bun test test/hsiOwnerPacketFillApply.test.ts`  
- Dry-run: `bun run staging:owner-packets:apply-proposal -- --proposal <owner-proposal.json>`  

Verified HSI 1.0 acceptance stays **0 / 8** until owner packets actually close.
