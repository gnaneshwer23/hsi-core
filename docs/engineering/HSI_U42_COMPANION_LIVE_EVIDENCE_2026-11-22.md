# U42 — Scientific Companion live-evidence binding (22 November 2026)

**Phase:** Vision Phase 2 deepen · builds on U41 text-first Companion  
**Owner approval:** Live-evidence binding engineering authorized (22 November 2026).  
**Not claimed:** Companion network retrieval, claim verification, voice, avatar, networking, scientific approval, Gate C, PHI, production writes, restricted-preview GO, or GA.

## Change

1. Owner approval `hsiScientificCompanionLiveEvidenceAuthorization`.  
2. Runtime accepts optional caller-supplied public literature metadata on `runHsiScientificCompanionTurn`.  
3. Soft-land catalog for binding vs gated retrieval / verification / avatar surfaces.  
4. Companion UI: optional JSON paste for bound evidence + sample loader.  
5. Docs + readiness phase row.

## Honesty

| Claim | Soft-land |
|---|---|
| Bind caller-supplied public metadata into text companion turns | **Yes** |
| Companion performs Europe PMC / OpenAlex retrieval itself | **No** |
| Bound records are claim-verified | **No** (`metadata_retrieved_not_claim_verified`) |
| Voice / avatar / networking | **No** (Phase 3+) |
| Scientific approval / Gate C / PHI / production writes | **No** |

## Acceptance

- `bun test test/hsiScientificCompanionLiveEvidence.test.ts test/hsiScientificCompanionRuntime.test.ts`  
- Open `/research/companion`, load sample bound metadata, run Discuss  
