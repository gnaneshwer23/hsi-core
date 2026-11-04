# ARCH-003 — Step 8: Systemic Sclerosis validation and release gate

Status: **BLOCKED — no scientific release authorised**.

## Observed staging evidence (2026-11-04)

- Schema migrations: 001–007 applied.
- Neon Auth users: 0; authorised SSc scientific reviewers: 0.
- HSI evidence sources: 0; published graph releases: 0; persisted interrogative investigations: 0.
- No patient-identifiable records or production promotion authorised.

## Engineering verification

Steps 1–7 provide versioned research contracts, question planning, explicit graph-binding interrogation, conservative contradiction signals, an interactive workbench and a pure human-review decision validator. The website workbench currently has an honest empty state, not an authenticated data loader. Human review decisions are not yet immutably persisted, and there is no real SSc corpus or approved release.

The new `assessSscReleaseReadiness` evaluator fails closed on twelve independent gates. Passing them yields **READY_FOR_HUMAN_RELEASE_REVIEW**, never automatic deployment or scientific approval.

## Blockers to clear before a release decision

1. Verify the latest CI run and the workbench route after the Vercel rewrite correction.
2. Finish server-side authenticated investigation loading and persistence; confirm session semantics with Neon Auth.
3. Add immutable review-decision storage with transaction-safe state transitions, reviewer authority checks and replay protection.
4. Ingest real SSc source metadata, check licensing, corrections and retractions, and document search coverage.
5. Establish actual researcher accounts and independently authorised reviewers through approved identity administration.
6. Obtain accountable scientific review of claims and publish the first cryptographically verified HSI graph release.
7. Execute end-to-end interrogative investigation on the reviewed release and persist the evidence/falsification dossier.
8. Have an independent SSc expert evaluate candidate contradictions, missing evidence, clinical overclaims and reproducibility.
9. Complete safety/privacy/governance sign-off, regression and integration tests, then obtain explicit human release authorisation.

## Non-negotiable

No synthetic fixture may count as live evidence. No LLM may self-approve. An empty graph is not a negative finding. Research decisions are not patient-level clinical recommendations. Production changes require separate authorisation.
