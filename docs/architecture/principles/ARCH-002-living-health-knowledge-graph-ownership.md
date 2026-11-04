# HSI Architecture Principle 002 — Living Health Knowledge Graph Ownership

| Field | Value |
| --- | --- |
| ID | HSI-ARCH-002 |
| Version | 1.0 |
| Date | 2026-11-04 |
| Status | Adopted as target-state architecture principle; implementation and acceptance tests pending |
| Owner | HSI architecture and scientific governance |
| Scope | HSI Core, Research, Clinical, Trials, data ingestion, graph services, AI agents, optional Aksh and ISI integrations |
| Depends on | [HSI-ARCH-001 — Independent Intelligence, Connected Ecosystem](ARCH-001-independent-intelligence-connected-ecosystem.md) |

## 1. Foundational declaration

**HSI shall independently own and govern the canonical knowledge model, evidence lifecycle, graph services, provenance, access controls, review workflow and publication decisions for its Living Health Knowledge Graph (LHK-G).**

The LHK-G is an evidence-grounded, time-aware, context-rich logical graph connecting human biology, patient observations (when lawfully authorised), biomedical research, disease mechanisms, therapies, outcomes and clinical trials.

Aksh Health, Immune Super Intelligence (ISI), external biomedical databases and healthcare organisations may provide inputs through governed interfaces. No external product's graph, claim status, approval, identifiers or availability automatically becomes authoritative inside HSI.

**Graph ownership does not mean owning the copyright, intellectual property, consent rights or legal control of third-party source data.** HSI must respect source licences, data rights, privacy and contractual constraints.

This document defines a **target architecture**. It does not assert that the complete graph, ingestion pipelines, clinical adapters or governance services already exist.

## 2. Four logical knowledge layers

### L1 — Patient Context Graph (restricted)

Canonical relationship examples: Patient → Encounter → Observation → Diagnosis → Lab Result → Medication → Procedure/Treatment → Outcome.

- Each observation retains time, unit, method, source system, author/context, identity linkage confidence and permitted purpose.
- Patient facts are not biomedical population evidence and must not be copied into the public graph.
- Patient identity, linkage, clinical storage, access and retention are governed independently; do not assume an Aksh account or EHR integration is available.
- Patient-to-biomedical links use controlled concepts and policy-enforced query joins, not unrestricted identifier-bearing public graph edges.

### L2 — Human Biology and Physiology Graph

Organ → Tissue → Cell → Cell State → Molecular Pathway → Physiological Function → Biomarker → Disease/Phenotype.

- Covers immune, endocrine, metabolic, cardiovascular, renal, neurological, gastrointestinal, respiratory, musculoskeletal and other systems.
- Represents location, tissue, species, experimental model, directionality and biological context.
- Includes reference ontologies and mappings without treating all cross-ontology mappings as exact equivalence.

### L3 — Gut–Immune–Metabolic Graph

Microbiome/Taxon → Microbial Function → Metabolite → Host Pathway → Immune Process → Metabolic Phenotype.

- Distinguishes measured patient values from cohort-level observations, mechanistic experiments and hypotheses.
- A correlation, enrichment or pathway prediction is not automatically a causal relationship.
- Context includes host characteristics, tissue/site, specimen, assay, exposure, treatment and time where known.

### L4 — Biomedical Evidence and Trials Graph

Publication → Dataset → Experiment → Finding → Claim → Biological Relationship → Evidence Assessment → Contradiction/Uncertainty → Hypothesis.

Trial → Registry Record → Version → Condition → Intervention → Eligibility Criterion → Outcome Measure.

- Registry eligibility text is not automatically a computable clinical rule or confirmation of eligibility.
- Contradictions are contextualised by population, tissue, assay, intervention, dose, time, species and study design.
- Hypotheses and computational predictions remain separate from curated scientific assertions.

**Logical layers may use distinct physical databases and indexes.** HSI is not required to use a single graph database or expose one universal query endpoint.

## 3. Canonical graph contract

### 3.1 Node requirements

Every canonical entity must support, as applicable:

- Stable HSI identifier, entity type, preferred name and aliases.
- Source identifiers and ontology mappings with mapping relation/confidence.
- Version, creation/update timestamps, status and provenance.
- Appropriate domain context, data sensitivity and access policy.

Suggested entity families: Organ, Tissue, Cell, CellState, Gene, Protein, Metabolite, Microbe, Pathway, BiologicalProcess, Biomarker, Phenotype, Disease, Therapy, Drug, Exposure, Publication, Dataset, Experiment, Finding, Claim, EvidenceAssessment, Hypothesis, Trial, EligibilityCriterion; restricted clinical entities include Patient, Encounter, Observation, MedicationStatement and Outcome.

### 3.2 Relationship requirements

Each relationship must declare:

- **Typed predicate** with defined direction and domain/range constraints.
- Source and target entity IDs and resolvable source evidence.
- Assertion context (population, species, tissue, cell state, assay, time, dose, disease and intervention when applicable).
- Polarity/direction and explicit causal-versus-associative semantics.
- Evidence strength/uncertainty and **separate** human review state.
- Validity and ingestion/version timestamps, lineage, access classification and supersession status.

Example: `[Macrophage] --produces (in tissue/context)--> [TNF]` is distinct from `[TNF] --associated_with--> [Disease]`; neither alone proves a patient-level mechanism or treatment recommendation.

### 3.3 Provenance and claim identity

A scientific claim is an identifiable, versioned assertion linked to one or more source passages, datasets or experiments, with extraction method and licensing status. Multiple papers supporting one claim must not erase counterevidence or context differences. Graph IDs are HSI-owned; original PMID, DOI, registry and ontology IDs remain traceable.

## 4. Knowledge ingestion and source ownership

HSI must maintain its own **source registry and ingestion orchestration** for approved external sources. Candidate source families include:

| Domain | Candidate sources and standards | Required checks |
| --- | --- | --- |
| Literature | PubMed, Europe PMC | Citation, passage rights, version, retraction/correction checks |
| Biology | UniProt, Reactome, Gene Ontology, Open Targets | Identifier mapping, provenance, evidence type, licensing |
| Cell/omics | Human Cell Atlas and approved transcriptomic/proteomic datasets | Dataset consent/licence, tissue, assay, sample context, QC |
| Trials | ClinicalTrials.gov, other authorised registries | Registry record version, update time, eligibility text, status |
| Clinical | Authorised FHIR R4/SMART-on-FHIR, HL7 v2, LIS, DICOM and clinical sources | Lawful access, identity matching, minimum necessary data, safety and audit |
| Product integrations | Aksh Health and ISI | Versioned contracts, licence, review mapping, optional connectivity |

**Listing a source is not proof of an implemented or licensed integration.** Each connector must have a recorded owner, rights basis, operational state, rate limits, freshness policy, schema version and failure behaviour.

Ingestion pipeline:

1. **Discover and acquire** from an authorised source.
2. **Preserve source record** and immutable retrieval metadata where rights permit.
3. **Normalise and map** identifiers, units, ontologies and terminology.
4. **Extract proposed claims** with precise passages/measurements and context.
5. **Run QC** for schema, duplicates, mapping uncertainty, source corrections, provenance and permissions.
6. **Evaluate evidence** including contradictory and negative findings.
7. **Submit for accountable scientific review** where curated graph promotion is sought.
8. **Publish a versioned graph release** with manifest, review evidence and rollback capability.
9. **Monitor and update** source changes, retractions, corrections and supersession.

No source, integration or AI model may bypass required promotion controls.

## 5. Evidence lifecycle and authority

States must remain distinct, for example:

`ingested → extracted_draft → qc_passed → under_review → approved | rejected | needs_more_evidence → published → superseded | retracted`.

- An **ingestion success** is not scientific approval.
- A **structurally valid** claim is not evidence of biological truth.
- A product-specific `approved` flag (including an ISI curator handoff) does not constitute HSI scientific approval.
- Agents may recommend or flag; only authorised reviewers may approve a claim for a specified evidence release.
- Reviewer identity, credentials/role, rationale, evidence, timestamp, conflicts and decision must be auditable.
- Retractions and material source corrections trigger impact assessment and may suspend or supersede affected graph edges.
- Rejected, retired, superseded or unreviewed assertions must not silently appear as approved knowledge.

Evidence strength, scientific consensus, review approval and uncertainty are **different fields**, not one composite confidence score.

## 6. Contradictions, hypotheses and reproducibility

Contradictions are represented as evidence-linked **candidates**, not automatically adjudicated truth. Compare polarity only after checking whether the studies address equivalent entities, predicates, population, tissue, experimental context and outcomes.

Hypotheses must have a separate namespace/store or rigorously enforced status and be labelled **unvalidated** with their supporting and opposing evidence. An agent may suggest experiments but cannot self-promote a hypothesis.

Each investigation run must retain: question, source/data versions, retrieval strategy, graph release ID, code/model/tool versions, parameters, method, quality checks, results, limitations, review decisions and reproducibility status. Do not claim reproducibility if necessary datasets or methods are unavailable.

## 7. Security, privacy and governance boundaries

- **Public biomedical evidence plane:** rights-verified, non-patient-identifiable material only.
- **Restricted research plane:** approved datasets under project-specific access, licences and ethics controls.
- **Clinical plane:** patient-identifiable data with lawful basis, purpose limitation, identity controls, RBAC/ABAC, audit, retention and appropriate UK clinical safety governance.
- Cross-plane joins use explicit authorisation and data minimisation; no implicit PHI export to public graph, prompts or external models.
- Patient-specific findings must identify data gaps and uncertainty; no autonomous diagnosis, prescribing, treatment changes or EHR write-back.
- Apply UK GDPR, relevant NHS requirements, clinical safety standards and MHRA considerations as appropriate to actual deployment and intended use.

## 8. Storage and service architecture

HSI shall own these logical capabilities regardless of physical technology:

1. **Source registry** and connector configuration.
2. **Immutable/provenance-aware evidence store** subject to rights and retention.
3. **Ontology/terminology mapping service** with explicit mapping uncertainty.
4. **Claim ledger** with context, polarity and review workflow.
5. **Canonical graph persistence and versioned release service**.
6. **Graph query/retrieval service** with bounded traversal, provenance and permission filters.
7. **Contradiction, gap and hypothesis workspaces**.
8. **Clinical context adapter boundary** isolated from public evidence.
9. **Trial registry and criteria service**.
10. **Audit, lineage, monitoring, quality and release rollback**.

API contracts should distinguish `draftClaims`, `approvedEvidence`, `hypotheses`, `patientContext` and `trialCriteria`; no single untyped graph endpoint should blur trust boundaries.

## 9. Engineering requirements

| ID | Requirement |
| --- | --- |
| ARCH-002-R01 | HSI owns stable canonical entity/edge IDs, types and ontology mapping contracts. |
| ARCH-002-R02 | HSI maintains an independent source registry and rights-aware ingestion pipeline. |
| ARCH-002-R03 | Every promoted scientific edge has traceable evidence, context and review decision. |
| ARCH-002-R04 | Drafts, associations, hypotheses, approved evidence and patient facts remain distinguishable in storage and queries. |
| ARCH-002-R05 | Graph releases are versioned, reproducible as far as source rights permit, auditable and rollback-capable. |
| ARCH-002-R06 | Patient-identifiable data remain restricted; cross-plane joins require explicit access controls. |
| ARCH-002-R07 | External ISI/Aksh claims are inputs subject to HSI mapping, licensing and approval, not authoritative imports. |
| ARCH-002-R08 | HSI biomedical research graph remains usable when Aksh and ISI are offline. |
| ARCH-002-R09 | Contradictions retain contextual counterevidence; retractions and supersession propagate to affected releases. |
| ARCH-002-R10 | Trial criteria preserve registry versions, uncertainty and human-confirmation boundaries. |
| ARCH-002-R11 | Research agents can propose but cannot approve, publish or alter curated graph assertions without authorised review. |
| ARCH-002-R12 | Every graph query returns appropriate provenance, release ID, permissions and uncertainty metadata. |

## 10. Acceptance tests (target-state, not claimed passed)

| Test | Expected result |
| --- | --- |
| ISI and Aksh unavailable | HSI independently ingests authorised evidence, queries curated graph and investigates a disease mechanism. |
| Two sources disagree | Both contextual claims and counterevidence are retained; no false majority-vote resolution. |
| AI proposes a claim | Draft is stored separately and does not appear as approved graph evidence. |
| Reviewer rejects claim | Rejected edge is excluded from curated queries and downstream published releases. |
| Publication retracted | Affected claims are identified and flagged for review/suspension with lineage. |
| Ontology mapping ambiguous | Ambiguity remains explicit; no forced equivalence. |
| Public graph request references patient ID | Access denied; no PHI leakage through graph or retrieval output. |
| Graph release rollback | Previous signed/versioned release can be restored without losing audit history. |
| Trial eligibility extraction | Registry criteria and missing evidence are surfaced; no unverified patient eligibility determination. |
| Research investigation replay | Inputs, methods, versions and limitations can be inspected and rerun when data rights allow. |
| Source licence disallows storage | Connector respects rights and does not persist prohibited content. |
| Cross-domain query | Biology, microbiome, disease and evidence links preserve provenance and association-versus-causation distinctions. |

## 11. Delivery sequencing and migration

**Stage A — audit and ownership:** inspect existing HSI, ISI and Aksh graph stores, source adapters, claim ledgers, review flags, runtime imports and licensing; document ownership and maturity. Do not rewrite functioning components.

**Stage B — independent biomedical core:** source registry, canonical ontology mappings, evidence/claim ledger, durable graph persistence, versioned releases and accountable reviewer authentication. Use a small, rights-verified **systemic sclerosis (SSc)** corpus as the first deep scientific vertical; compare rheumatoid arthritis (RA) subsequently without forcing a product pivot.

**Stage C — intelligence workbench:** independent retrieval, bounded GraphRAG, contradiction/gap analysis, hypothesis separation, provenance-rich research outputs and reproducible investigation records.

**Stage D — domain expansion:** physiology, metabolic, microbiome, omics and other disease evidence with controlled mappings and scientific QC.

**Stage E — governed clinical and trials:** independently authorised clinical adapters, longitudinal context and trial registry ingestion, followed by human-confirmed pre-screening after evaluation.

**Stage F — optional ecosystem integrations:** connect Aksh and ISI through versioned adapters, independently tested outage behaviour and explicit data rights.

Do not conflate a passed unit test, a demo fixture, an implemented API contract or a graph visualisation with independently validated scientific or clinical functionality.

## 12. Architecture decision rule

**Can HSI independently ingest, validate, govern, version and retrieve this knowledge with source-level provenance, appropriate access controls and accountable review?**

If not, the feature is not yet an HSI-owned knowledge capability. Document the gap, assign an owner and either implement the missing service or classify the functionality as an optional integration.

**Governing statement: HSI owns the knowledge lifecycle; external systems contribute evidence; humans govern scientific promotion; patients' data remain protected.**
