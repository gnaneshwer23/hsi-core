# HSI 1.0 — U6 owner packets soft-land (21 November 2026)

**Status:** Engineering soft-land. CI-safe bundle of Human **#2 / #3 / #5** owner checklists onto existing clearance, isolation, and staging-persistence packets.  
**Not claimed:** Signed clearance, isolation security acceptance, staging persistence, migration hold removal, or scientific approval.

Typed catalog: [`src/operations/hsi10OwnerPacketsScaffold.ts`](../../src/operations/hsi10OwnerPacketsScaffold.ts).  
Pending worksheet: [`operations/staging/hsi-10-owner-packets.pending.json`](../../operations/staging/hsi-10-owner-packets.pending.json).  
Parent worksheet: [`HSI_1_0_OWNER_GATES_WORKSHEET_2026-11-20.md`](./HSI_1_0_OWNER_GATES_WORKSHEET_2026-11-20.md).

## Honesty

| Claim | Soft-land |
| --- | --- |
| Engineering surfaces for clearance / isolation / device-local save | Already shipped |
| `acceptedForScope` / `signedPacketClaimed` | Always `false` |
| Production writes / Gate C auto-approve / hold removal | Always `false` |
| Invented signer / staging URL / MoU | **Forbidden** |
| Fixture green = Human #2/#3/#5 closed | **Forbidden** |

## Packet map

| Human | Checklist | Reuse | Owner outcome |
| --- | --- | --- | --- |
| #2 | #2 verifiable permitted source | E2E-03 source clearance composition | Signed (or explicitly deferred) policy + managed signer + scoped live passage rights |
| #3 | #6 two-user isolation | NEXT-B + E2E-02 isolation packet | Named isolation signer + retained two-user staging HTTP evidence |
| #5 | #5 save/reopen in approved staging | E2E-05 staging save/resume | Staging write packet on disposable HSI Neon; holds stay closed unless scoped |

## What this soft-land adds

1. One typed inventory of the three GA-prerequisite owner packets.  
2. Per-packet owner checklists agents can hand to humans without inventing evidence.  
3. Mode assessor (`check` / `fixture`) that never closes Human #2/#3/#5.  
4. Pending JSON with UNASSIGNED / NOT_STARTED / NOT_APPROVED refs only.

## Owner next steps (not automated)

1. **Human #2** — assign policy approver + clearance authority; sign or defer the draft; provision managed signer; authorize one scoped live surface.  
2. **Human #3** — name isolation signer; run two-user staging HTTP; retain redacted digests.  
3. **Human #5** — approve disposable staging target; fill write-packet refs; keep migrations 022–033 held unless explicitly authorised.  
4. Update pending refs privately; do not invent hosts, MoUs, or signers in git.

## Explicit non-goals

- Enabling `productionWritesEnabled` or lifting held migrations from this PR  
- Inventing clearance signatures, MoUs, Gate C auto-approve, or isolation accounts  
- Closing Human #4 SME gold or Human #8 / NEXT-F (U7 / U8)  
- Treating soft-land / fixture green as HSI 1.0 acceptance  

**Never invent** clearance authorities, isolation signers, staging hosts, or MoUs in this scaffold.
