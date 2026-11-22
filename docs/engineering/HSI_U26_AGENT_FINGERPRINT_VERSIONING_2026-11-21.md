# U26 — Agent fingerprint versioning + revision-round contract (21 November 2026)

**Phase:** Production readiness · ARCH-009 agent backend  
**Scope:** Name the two historical fingerprint algorithms, forbid silent cross-API digest equality / in-place rewrite, and soft-land append-only scientific-review revision-round identity.  
**Not claimed:** Neon migration, rewrite of stored hashes, live reviewer revision workflow, or scientific approval.

## Change

1. `src/hsiAgentFingerprint.ts` — versioned algorithms `json-insertion-order-sha256-v1` and `canonical-sorted-sha256-v1`.  
2. Migration policy constants: no in-place rewrite; no cross-algorithm equality.  
3. Soft-land `HsiReviewRevisionRound` contract (append-only; `implementedInDatabase: false`).  
4. Document that `hashHsiCheckpointInput` is the canonical-sorted algorithm.

## Honesty

| Claim | Soft-land |
|---|---|
| Historical digests migrated | **No** |
| Migration 008 UNIQUE supports revisions | **No** — revision rounds are design-only |
| Live agent / reviewer E2E | Still open |

## Acceptance

- `bun test test/hsiAgentFingerprint.test.ts`  
- No migrations / landing / write enablement  

## Follow-ons

- Owner-approved migration plan before any hash rewrite  
- Append-only revision table design after UNIQUE policy change  
