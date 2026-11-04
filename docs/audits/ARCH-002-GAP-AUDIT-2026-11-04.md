# ARCH-002 implementation audit — 2026-11-04

**Method:** repository source review, not a live database, deployed endpoint, licence, source-paper or clinical validation. **Status: partial; ARCH-002 acceptance tests not passed.**

| ARCH-002 area | Observed repository evidence | Gap / decision |
| --- | --- | --- |
| Canonical scientific edges | `src/schema.ts`, `src/seed/sscTfhBIl21.ts`, `site/src/features/science/typedGraphSchema.ts` | Multiple graph representations; no single persistent canonical model and ontology-mapping governance. |
| Source registry | `src/sourceRegistry.ts`, `src/sourceRegistrySchema.ts`, `src/cli/source-registry.ts` | Public metadata revision hashing and quarantine exist; not an independent production literature harvester or passage-rights verifier. |
| SSc evidence | `src/seed/sscTfhBIl21.ts`, `src/sscPathwayPack.ts`, `site/public/discovery/hsi-ssc-pathway-pack.json` | PMID/DOI-backed **candidate** claims exist; no authenticated Gate C approvals, verified claim-level source passages, reproducible scientific corpus release or current independent paper verification. |
| Persistence | `db/migrations/001_hsi_substrate.sql` | Claims, edges, and Gate C queue schema exist; no complete versioned source→passage→claim→review→release model or verified live deployment. |
| Scientific review | `hsi_gate_c_reviews` SQL table and local curator tooling | Human-only status represented, but reviewer authentication, durable authorised workflow and audit are not demonstrated. |
| Graph retrieval | `site/src/features/science/knowledgeGraph.ts`, `researchOrchestrator.ts` | Bounded in-memory traversal; no proven durable release-aware, permission-filtered retrieval backend. |
| Contradictions | Site evidence dossier and contradiction candidates | Contextual comparison exists, but no independently reviewed source-backed contradiction corpus. |
| Patient/clinical | `src/clinicalResearchScaffold.ts`, `src/akshHsiGateway.ts` | Synthetic/stub boundaries; no authorised FHIR clinical integration; retain PHI isolation. |
| Trial intelligence | Clinical/trial bridge modules | Synthetic numeric evaluation, not validated registry ingestion or clinical eligibility. |
| Independence | HSI-owned code and schema, optional Aksh/ISI interfaces | Offline integration failure and HSI-owned durable research capability not yet demonstrated. |

## Priority implementation

**P0** Introduce additive HSI-owned evidence provenance schema: source records, passages with explicit rights, draft claims, evidence links, human review decisions and versioned graph releases. Do not automatically approve or publish. Preserve existing `hsi_claims`, `hsi_edges`, and Gate C workflows.

**P1** Curate SSc Tfh–IL-21–B-cell pathway using existing candidate PMIDs (30760472, 21314428, 16339522, 29514998, 33175976). For each: independently verify bibliographic metadata, DOI, full-text/passage rights, exact claim support, study context and contradictory evidence. Review by qualified scientists before release. Source-verified metadata alone is insufficient.

**P2** Build HSI-owned ingestion adapter and source-change/retraction monitoring, typed ontology mapping and a release-aware query API. Use actual rights-cleared scientific data, not synthetic scientific assertions. Keep synthetic records for test fixtures only.

**P3** Implement authenticated reviewer service, append-only audit, signed/manifested releases, replay and rollback; add independent outage tests with Aksh/ISI disabled.

## Current change boundary

The additive migration `db/migrations/002_hsi_evidence_ownership.sql` creates **schema only**, not live deployment, not curated corpus, not reviewer authentication and not graph release publication. Do not describe this migration as completing ARCH-002.

## Verification checklist

- [ ] Database migration applied in isolated HSI environment and rolled back in test environment.
- [ ] Referential integrity, unique claim-source linkage, reviewer role enforcement and RLS tested.
- [ ] Public-source metadata and passage licence independently verified.
- [ ] SSc claims reviewed and approved by authenticated accountable scientist.
- [ ] Approved graph release published with provenance and revocation handling.
- [ ] Release-aware graph retrieval tested with negative/contradictory evidence.
- [ ] HSI works with Aksh and ISI disconnected.
- [ ] CI, security, privacy and deployment checks passed.
