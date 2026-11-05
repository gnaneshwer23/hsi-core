# Human Super Intelligence — product direction implementation crosswalk

**Date:** 5 November 2026. **Scope:** Align the newly supplied direction with existing HSI work. This is a delivery brief, not a scientific validation or operational-readiness certificate.

[Product direction](HSI_PRODUCT_DIRECTION.md) · [Master PRD](HSI_MASTER_PRD_v1.md) · [Four-product ecosystem](HSI_FOUR_PRODUCT_ECOSYSTEM.md) · [CDS/PHI boundary](../CDS_PHI_BOUNDARY.md)

## 1. Identity and ownership

**Human Super Intelligence** is the shared technology platform. The name does not assert general artificial superintelligence or clinically validated reasoning.

| Owner | Responsibility | Data boundary |
| --- | --- | --- |
| HSI / `hsi-core` | Canonical research contracts, evidence provenance, governed graph, bounded investigations, independent-review contracts, exports and APIs | HSI-owned research substrate; no live CDS or PHI |
| ISI / `immunecity` | Immune-system research interface and specialist scientific workflows | Separate product database and interface; exchange validated research artifacts/contracts |
| Aksh Health | Personal health and separately governed clinical workflows | Separate product database and interface; keep identifiable patient context and clinical engines outside `hsi-core` |
| HSI Clinical / HSI Trials | Longer-term longitudinal and trial workflows | Product-specific governance and explicit acceptance; no implicit sharing of patient databases or confirmed eligibility |

Sharing technology means reusing schemas, evidence contracts, provenance, validation, authorization patterns and versioned APIs. It does not mean replacing product interfaces with links, sharing patient tables, or trusting browser-supplied roles.

## 2. Seven modules, mapped to code and delivery gates

The references below establish code presence only. They do not establish that the associated deployed workflow is connected or scientifically accepted.

| Direction module | Existing foundation to reuse | Next acceptance requirement |
| --- | --- | --- |
| Health Data Layer | `src/cdsPhiBoundary.ts`, `src/clinicalResearchScaffold.ts`, product-owned Aksh exports | In HSI, accept only permitted public/licensed non-PHI research inputs with explicit provenance and data class. Patient ingestion remains in its separately governed product plane. |
| Biological Knowledge Graph | `src/hsiSscGraphImport.ts`, `src/hsiGovernedGraphQuery.ts`, `src/hsiResearchGraphWorkbench.ts` | Preserve canonical identity, source links, context, draft/approved distinction, tenant authorization and pinned versions across every graph projection. |
| Evidence Intelligence | `src/evidence/sscLiteratureVerification.ts`, `src/evidence/sscEvidenceSnapshot.ts`, `src/researchContracts.ts` | Claim-level passage support, source identity/version and missing/conflicting evidence must remain visible and reproducible. |
| AI Research Workbench | `site/src/pages/ScientificResearchWorkbench.tsx`, `src/immuneMechanismInvestigation.ts`, `src/interrogativeQuestionEngine.ts` | One question-to-dossier-to-review journey that exposes inputs, limits and unanswered questions. Deterministic projections must not be labelled live LLM reasoning. |
| Trial Intelligence | `src/clinicalResearchScaffold.ts`, existing trials criteria demonstration | Distinguish registry facts, research relevance and missing criteria. No confirmed eligibility or clinical recommendation. Verify live registry ingestion separately. |
| Clinical Intelligence | Aksh product workflows; HSI research-safe scaffold | Separate clinical product approval, data access, consent/legal basis and evaluation. Do not introduce patient records or clinical engines into HSI to complete a research demonstration. |
| Governance and Safety | `src/server/vercelResearch.ts`, `src/db/neonAuthResearchActor.ts`, `src/interrogativeScientificReview.ts` | Verified identity, independent grants, record scope, self-review rejection and immutable decisions. Human review remains distinct from graph publication. |

## 3. The next work package: one complete research investigation

**User:** a translational researcher. **Initial indication:** use the existing source-linked systemic sclerosis workbench as a contained integration case; retain the previously shipped RA workflow as a separate proof point. Neither is evidence that the other indication is scientifically validated.

The newer `src/governedDiseaseDiscovery.ts` and `src/sscRaEvidenceComparison.ts` foundations also belong in this inventory. Preserve their supervised, source-separated interpretation: comparing SSc and RA evidence does not transfer a mechanism claim between diseases or establish target validity.

**User journey:**

```text
Choose a permitted, version-pinned research dataset
→ ask a bounded scientific question
→ resolve entities and review ambiguous mappings
→ examine a mechanism dossier and its source passages
→ inspect supporting, opposing, context-limited and missing evidence
→ record competing explanations and unanswered questions
→ export a reproducible research brief
→ submit for an independently authorised scientific review
→ retain the decision and audit trail
```

Use `/research/scientific-workbench` as the existing entry surface and the existing authenticated investigation/review routes for governed records. Public demonstrations and editorial graph projections do not become authorised scientific records merely through navigation.

### Definition of done

1. The researcher can identify the dataset version, license/permission basis, data class and graph/release version before interpreting results.
2. Question/entity selection exposes unresolved mappings; it does not infer a disease solely from a cell/tissue label.
3. Each displayed mechanism edge identifies its source, passage locator, biological context and curation status. An unreviewed edge stays unreviewed in maps, briefs and exports.
4. The dossier distinguishes measured inputs, literature associations, mechanistic hypotheses and supported findings. Missing inputs remain missing.
5. A brief preserves the question, source/release versions, included/excluded evidence, method, limitations, review status and integrity metadata. An export must not claim to include a live execution trace unless such a trace exists.
6. Where identity or backend access is unavailable, the governed action fails clearly; a public fixture does not substitute for the user's protected record.
7. A second, independently authorised reviewer can examine the eligible record. The author cannot approve their own work; a model cannot supply scientific authority.
8. A recorded review does not automatically publish graph facts, grant clinical permission, or become training data.
9. Ownership, unauthorized reads, tampered releases, unsupported claims, expired/revoked access and failure recovery have negative acceptance checks using existing meaningful tests where possible.
10. Research users can complete the connected desktop/mobile flow with visible focus, labelled inputs and clear feedback. Keep the internal workflow outside public landing-page marketing sections.

**Operational dependency:** the database/access task is explicitly paused at the founder's request. The last supplied diagnostic showed staging Auth and the production database endpoint. Do not claim an authenticated end-to-end acceptance pass until that separate configuration issue is resolved. Development using explicit fixtures can continue; runtime and scientific acceptance remain distinct.

## 4. Scientific interpretation corrections for the supplied direction

| Illustration in the direction | Implementation rule |
| --- | --- |
| “High CRP” maps directly to “hs-CRP” | Preserve the reported assay and units. CRP and high-sensitivity CRP measure the same protein using different assay sensitivities; an unspecified CRP report does not establish an hs-CRP assay. |
| Cell/tissue text maps to a disease ID | Resolve only supplied or independently supported concepts. A CD4 T cell in gut tissue alone does not identify a disease. |
| Low fibre → reduced SCFAs → barrier stress → inflammation → HbA1c | Treat each connection as a separately contextualised research claim. The chain is not a measured finding or an established cause for the example person. |
| A single HbA1c, CRP and sleep/HRV observations imply a worsening trend | A trend requires comparable observations over time. Preserve assay, timestamp, units, intervention and confounding context. |
| Gut-driven inflammation is the “most testable” explanation | Do not rank explanations without an explicit, evaluated method and relevant observations. Show missing microbiome, immune and longitudinal information. |
| Suggested additional laboratory measurements | Represent these as variables an expert may assess when designing an approved research protocol, not patient-specific test orders. |
| “Supported” / “contested” / “AI draft” / “synthetic” as one status field | Keep claim support, curation/review, data class and artifact maturity as separate dimensions. Map UI labels to the existing typed contracts instead of flattening them. |
| Continuous learning | Use versioned, consent/licence-compatible, human-curated evaluation feeds. No automatic retraining, approval promotion or reuse of private records. |

## 5. Architecture and sequencing

Retain the current Vite/React frontend, Bun/TypeScript server functions and HSI PostgreSQL boundary. The supplied Next.js, Neo4j/AGE, Qdrant and Python orchestration list is an option catalogue, not a migration instruction. Add a component only after a documented capability/performance/operational need and license review.

1. **Connect the research experience:** inventory and close the acceptance gaps above against the existing scientific workbench, mechanism dossier, graph projections and review surfaces.
2. **Strengthen retrieval and evaluation:** add source passage grounding and contradiction benchmarks before presenting autonomous hypothesis generation. Keyword/graph projections are not evidence that vector retrieval is live.
3. **Research lab-context adapter:** after the research loop is accepted, consider permitted non-PHI datasets with assay, units, reference interval, time and source preserved. Validate ontology mappings and missing-data behaviour first.
4. **Additional modalities and indications:** add one evaluated pack at a time; public/deidentified data still require licence and privacy review. Wearables do not establish microbiome or immune-cell measurements.
5. **Controlled clinical translation:** remains a separately approved product programme. No live EHR access, clinical model deployment or shared patient database is introduced by this direction.

The document's numerical goals are proposed evaluation targets. Define held-out datasets, expert labels, sample sizes, confidence intervals, failure categories and intended use before using them as acceptance thresholds. Citation resolution and passage support must be measured independently. No new calendar delivery promise is created here.
