# ARCH-002 Step 5 — Research Intelligence Workbench

**Status:** HSI-owned deterministic investigation primitive committed; no deployed graph API or live researcher UI integration. No scientific approval claimed.

## Existing application
The site already has `site/src/features/science/researchOrchestrator.ts`, a deterministic investigation over a local editorial typed graph, plus evidence dossier and contradiction modules. Preserve it until a trusted graph-release retrieval API is operational; do not relabel its local graph as an approved scientific corpus.

## Added
- `src/researchWorkbench.ts` operates on a release snapshot supplied by a **trusted server-side HSI adapter**.
- Evidence output includes exact claim ID, relationship, biological context, source versions, review decision ID, release ID/version/hash.
- Bounded exact-identifier filtering, conservative opposite-predicate contradiction candidates, missing-evidence and association-only gaps.
- Deterministic investigation ID, explicit methods and limitations.
- Hypothesis list deliberately empty: no model is deployed and no unvalidated mechanism is fabricated.
- `test/researchWorkbench.test.ts` checks provenance, revocations, no-evidence and invalid inputs.

## Critical limitations
The in-memory snapshot and `published` flag can be fabricated by a caller; the current release manifest is not a signed evidence-payload digest. **Never expose this function as a public authoritative graph API.** Step 4 must first implement authenticated database-backed release verification and publication. Step 3 must implement real identity-provider authentication and reviewer authority. Step 2 must complete source-passage verification and actual human scientific review.

## Remaining production work
1. Implement HSI-owned database-backed release service, signed or trusted release manifests and permission-filtered retrieval.
2. Bind the existing site research orchestrator to the authenticated HSI retrieval endpoint, with clear local-versus-authoritative status in the UI.
3. Add persistent, access-controlled investigation runs recording dataset/release/model/method versions, QC, inputs and output.
4. Extend contradictions to contextual scientific assessment and support cross-release source corrections and retractions.
5. Build governed agent workstreams: Evidence Investigator, Mechanism Investigator, Contradiction Investigator, Gap Investigator and Hypothesis Investigator. Agents propose, scientists decide.
6. Validate end-to-end on a curated SSc corpus and test with Aksh/ISI offline.
7. Ensure no patient-identifiable information is processed by this research-only module.

**Never describe these tests or illustrative records as scientific validation.**
