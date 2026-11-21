# HSI 1.0 — owner-gates worksheet soft-land (20 November 2026)

**Status:** Engineering soft-land. CI-safe mapping of acceptance checklist **#5–#8** onto existing packets.  
**Not claimed:** Staging persistence, isolation review, SME gold, signed pilot, or scientific approval.

Typed catalog: [`src/operations/hsi10OwnerGatesWorksheet.ts`](../../src/operations/hsi10OwnerGatesWorksheet.ts).  
Pending worksheet: [`operations/staging/hsi-10-owner-gates.pending.json`](../../operations/staging/hsi-10-owner-gates.pending.json).  
Acceptance matrix: [`HSI_1_0_ACCEPTANCE_STATUS_2026-11-20.md`](./HSI_1_0_ACCEPTANCE_STATUS_2026-11-20.md).

## Honesty

| Claim | Soft-land |
| --- | --- |
| Engineering surfaces for #1–#4 / brief UI | Already shipped (#569–#573) |
| `acceptedForScope` / `pilotReadinessClaimed` / `signedPacketClaimed` | Always `false` |
| Production writes / Gate C auto-approve | Always `false` |
| Invented staging URL / signer / SME gold / pilot invite | **Forbidden** |
| Checklist #8 researcher invites | **Blocked until Human #8 / NEXT-F** |
| Fixture green = owner acceptance | **Forbidden** |

## Gate map

| Checklist | Disposition | Reuse |
| --- | --- | --- |
| #5 Save/reopen in approved staging | Owner-gated | E2E-05 staging save/resume |
| #6 Two-user isolation | Owner-gated | NEXT-B + E2E-02 isolation packet |
| #7 Expert-adjudicated benchmark | Owner-gated | E2E-10 SME gold + NEXT-D vault freeze |
| #8 Usable evidence-linked decision brief (pilot) | Blocked until Human #8 / NEXT-F | NEXT-F soak / signed pilot + brief UI already on continuous path |

## What this soft-land adds

1. Typed inventory of four remaining acceptance gates.  
2. Mode assessor (`check` / `fixture`) that never claims owner acceptance or pilot readiness.  
3. Pending JSON with UNASSIGNED / NOT_STARTED / BLOCKED refs.  
4. Explicit Human #8 / NEXT-F prerequisite before checklist #8 invites.

## Owner next steps (not this PR)

1. Work the U6 owner-packets scaffold ([`HSI_10_OWNER_PACKETS_U6_SOFT_LAND.md`](./HSI_10_OWNER_PACKETS_U6_SOFT_LAND.md)): Human #2 clearance, Human #3 isolation, Human #5 staging persistence.  
2. Close Human #5 staging write packet on disposable HSI Neon without inventing hosts.  
3. Name Human #3 isolation signer; retain two-user staging HTTP evidence.  
4. Populate Human #4 SME gold vault — never invent expert labels in git.  
5. Accept Human #8 / NEXT-F operational soak; **then** invite 3–5 researchers for checklist #8.

## Explicit non-goals

- Enabling `productionWritesEnabled` or lifting held migrations 022–033  
- Inventing clearance signatures, MoUs, or Gate C auto-approve  
- Treating soft-land / fixture green as HSI 1.0 acceptance  
- Rebuilding Track B / NEXT-B / E2E soft-lands already in tree  

**Never invent** staging hosts, isolation signers, SME gold labels, or pilot invites in this worksheet.  
