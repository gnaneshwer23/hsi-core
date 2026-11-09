# HSI Architecture Principle 001 — Independent Intelligence, Connected Ecosystem

| Field | Value |
| --- | --- |
| ID | HSI-ARCH-001 |
| Version | 1.2 |
| Date | 2026-11-09 |
| Status | Adopted as target-state architecture principle; implementation not yet verified |
| Scope | Human Super Intelligence: Aksh Health, HSI Clinical, ISI and HSI Trials as governed modules |

## 1. Foundational declaration

**Human Super Intelligence (HSI) is one product: an evidence-grounded biomedical intelligence platform with four governed modules.**

The modules are Aksh Health (patient intelligence), HSI Clinical (longitudinal authorised clinical intelligence), ISI / Immune Super Intelligence (scientific discovery) and HSI Trials (biology, biomarkers, targets, studies and governed pre-screening). ISI’s scientific work must not depend on the Aksh Health module. Private patient data must never enter the research graph automatically. A module being unavailable must not disable the others’ core services.

This is a **target-state architectural requirement**, not a claim that all listed capabilities are currently implemented, clinically validated, or operational.

## 2. Architecture commitments

1. **Independent by design.** HSI owns its canonical contracts, source registry, persistence, evidence provenance, graph governance, APIs, and essential runtime capabilities.
2. **Comprehensive biology.** Native HSI knowledge spans organs, tissues, cells, immune, endocrine, metabolic, cardiovascular, renal, neurological, gastrointestinal and microbiome systems; genomics, transcriptomics, proteomics, metabolomics and molecular pathways.
3. **Evidence before inference.** Explicitly distinguish patient observations, curated evidence, population associations, computational inferences and unvalidated hypotheses. Record sources, biological context, uncertainty, versions and review status.
4. **Connected, not coupled.** Aksh, ISI, hospitals, laboratories, research institutions and trial registries integrate via versioned, governed, optional interfaces with failure isolation.
5. **Human accountability.** Agents may retrieve, compare, analyse and propose. Qualified reviewers control promotion of scientific claims; consequential clinical decisions remain under appropriate professional governance.

## 3. HSI-owned capability domains

- **Human biology and physiology:** organ–tissue–cell–pathway–function relationships and cross-system mechanisms.
- **Clinical intelligence:** authorised longitudinal context from independent clinical adapters, including encounters, observations, diagnoses, laboratory results, medications, imaging, treatments and outcomes. Clinical use requires identity, access, privacy, safety and regulatory controls.
- **Biomedical research:** independent evidence discovery, ingestion, normalisation, appraisal, contradiction analysis and reproducible investigations.
- **Immune and systems biology:** immune cells, inflammatory mechanisms, pathways, biomarkers, autoimmunity and multi-system effects; ISI is an optional specialist contributor.
- **Trial intelligence:** registry ingestion, criteria interpretation, missing-evidence identification and human-confirmed pre-screening.
- **AI and reasoning:** HSI-controlled agent orchestration, retrieval, bounded tools, verification, provenance and review workflows.
- **Platform operations:** independently governed authentication, permissions, audit, storage, observability, security and APIs.

Independence does **not** require copying every public dataset or duplicating well-maintained shared libraries. It requires control over core contracts, runtime continuity, legal access to data and independent capability to ingest, verify and serve necessary knowledge.

## 4. Living Health Knowledge Graph

Four logical, governed layers (not necessarily a single physical database):

1. **Patient context:** Patient → Encounter → Observation → Diagnosis → Lab Result → Medication → Treatment → Outcome. Patient identifiers and clinical records stay in authorised clinical environments with provenance, temporal context and access controls.
2. **Biology and physiology:** Organ → Tissue → Cell → Molecular Pathway → Physiological Function → Biomarker → Disease.
3. **Gut–immune–metabolic:** Microbiome → Microbial Function → Metabolite → Host Pathway → Immune Process → Metabolic Phenotype. Population association must not be presented as patient fact or proven causality.
4. **Biomedical evidence:** Publication → Dataset → Experiment → Finding → Relationship → Evidence Assessment → Contradiction → Proposed Hypothesis.

HSI owns its authoritative knowledge model and curation workflow. Imported ISI claims must undergo HSI provenance, licence, mapping and review controls; AI drafts cannot silently enter approved evidence.

## 5. Modules

| Module | Primary responsibility | Boundary |
| --- | --- | --- |
| **Aksh Health** | Patient intelligence: symptoms, medications, labs, wearables, metabolic context | Consented patient-data plane. Not a source of automatic research-graph edges |
| **HSI Clinical** | Longitudinal authorised clinical intelligence and missing information | Purpose-limited access. No EHR write-back from this repository |
| **ISI / Immune Super Intelligence** | Scientific discovery across immune, nervous, microbiome, metabolic and molecular systems | Does not require Aksh Health in order to run |
| **HSI Trials** | Biology, biomarkers, targets, studies, eligibility and governed pre-screening | Unknown stays unknown. Similarity never satisfies an eligibility criterion |

The Living Health Knowledge Graph is the centre, not a fifth product. Every edge carries biological context, provenance, uncertainty and review state. Association is not a demonstrated causal mechanism.

No module is a mandatory runtime dependency for another module’s core service. HSI Clinical may depend on an authorised clinical source and must say when that source is absent.

## 6. Mandatory engineering requirements

| ID | Requirement |
| --- | --- |
| ARCH-001-R01 | Core HSI services operate when Aksh and ISI are offline. |
| ARCH-001-R02 | HSI owns authoritative domain models, source registry, evidence provenance, persistence and governance. |
| ARCH-001-R03 | Integrations are optional, explicitly configured, versioned and failure-isolated. |
| ARCH-001-R04 | APIs and schemas are documented and contract-tested; use appropriate standards such as FHIR where relevant. |
| ARCH-001-R05 | Claims retain evidence, biological context, uncertainty and review status; only authorised human-reviewed claims may enter curated knowledge. |
| ARCH-001-R06 | Patient-identifiable data remain isolated from research/public knowledge environments except through explicitly authorised, compliant workflows. |
| ARCH-001-R07 | HSI controls its own research agent orchestration and verification, even when invoking optional external tools. |
| ARCH-001-R08 | Reuse validated standards and components where sensible without introducing mandatory product-level runtime coupling. |
| ARCH-001-R09 | External failures degrade gracefully without corrupting HSI state or disabling essential services. |
| ARCH-001-R10 | Document actual capability maturity: implemented, integrated, tested, scientifically validated and operationally approved are different states. |

## 7. Architecture acceptance tests (required, not yet claimed as passed)

| Scenario | Expected result |
| --- | --- |
| Aksh unavailable | HSI research, graph and evidence services remain available. |
| ISI unavailable | HSI immune evidence search and investigation remain available. |
| Both unavailable | Core biomedical research, graph exploration and trial discovery remain operational. |
| Independent source ingestion | HSI retrieves and validates evidence using its own configured biomedical sources. |
| Independent graph | HSI persists, queries, versions and curates its own authoritative knowledge. |
| AI proposes unsupported claim | No automatic promotion into curated evidence. |
| Unauthorised PHI transfer | Rejected and auditable; research stores remain isolated. |
| Integration restored | Connection recovers without inconsistent state or duplicate promotion. |
| Agent investigation | Records sources, methods, versions, limitations and human review state. |
| Primary user experience | HSI workbenches remain usable without Aksh/ISI. |

## 8. Migration policy

1. Inventory all direct and indirect dependencies between `hsi-core`, `aksh-health-redesign` and `immunecity`.
2. Classify each as essential HSI-owned, optional integration, reusable component, or unnecessary coupling.
3. Preserve existing validated code, scientific evidence controls, PHI boundaries and human-in-the-loop safeguards.
4. Build missing HSI-owned services incrementally, with independent source ingestion and graph persistence.
5. Introduce versioned integration adapters and outage/failure-isolation tests.
6. Validate through automated checks and expert review before claiming production or clinical readiness.

**No wholesale repository rewrite is authorised by this principle.**

## 9. Decision and exception rule

For each feature, agent, service or data dependency ask: **Can HSI deliver this core capability independently, with appropriate evidence, governance and operational resilience?**

If not, establish the missing HSI-owned capability or classify the feature explicitly as optional. Exceptions require a documented architecture decision, risk assessment, accountable approval and expiry/review criteria.

## 10. Governing statement

**HSI is the comprehensive intelligence platform. Aksh Health and ISI are independently valuable specialised products in a connected ecosystem.**

**Build intelligence independently. Connect knowledge responsibly. Govern every consequential decision.**

## 11. Operational amendments (v1.1, 2026-11-04)

These amendments refine ARCH-001 without changing its independent-platform principle or replacing ARCH-002.

### 11.1 Canonical Knowledge Core

HSI owns the authoritative **logical** biomedical concept, evidence, ontology-mapping, review and approved-insight contracts. Physical stores may be separated by access boundary and purpose. Aksh, ISI and other products may hold derived views or caches that identify source, graph release/version and refresh time. No downstream product can modify canonical HSI records except through governed authenticated HSI ingestion/review APIs.

### 11.2 Data classification and isolation

Every record and operation must declare one of: `public_biomedical`, `synthetic`, `licensed_partner`, `patient_identifiable_clinical`. Apply classification-specific retention, access, audit, encryption, licensing, lawful-basis and transfer controls. Synthetic material is never evidence-bearing. Patient-identifiable material must not be copied to public research stores by default; authorised de-identification or research use requires its own documented workflow.

### 11.3 Orthogonal evidence taxonomy

Keep **workflow status** (`draft`, `qc_passed`, `under_review`, `approved`, `rejected`, `superseded`, `retracted`) distinct from **scientific assessment** (`not_curated`, `no_direct_evidence_identified`, `context_limited`, `supported`, `partially_supported`, `contested`, `inconclusive`, `approved_curated`, `rejected`) and **epistemic type** (`observational_association`, `experimental_finding`, `review_summary`, `computational_inference`, `hypothesis`). `synthetic_demo` is a data classification/use label, not scientific evidence. Do not treat `metadata_only` licence status as evidence validation or permission to reuse passages.

Each evidence-bearing relationship must record source ID/type/locator, source version, retrieval time, rights, supporting passage or structured measurement reference where permitted, biological context, evidence grade, accountable reviewer, review timestamp and graph release version. No AI-generated proposal is promoted without authenticated scientific review and release controls.

### 11.4 Model and agent governance

Maintain an HSI-owned registry of agent/model identity, intended use, tool permissions, model/provider version, prompt version, evaluation dataset/metrics, known limitations, approval state and retirement. Consequential runs retain actor/role, question, source/release IDs, model/prompt/tool versions, outputs, verification results, human decisions and final disposition. Research hypotheses are never silently presented as established findings.

### 11.5 Contract-first integrations

Use versioned documented OpenAPI/AsyncAPI (or suitable equivalent), stable identifiers, scoped OAuth2/OIDC access, idempotency keys for writes, cursor pagination where appropriate, structured errors, quotas/rate limits, signed webhooks with replay protection and CI contract tests. Adopt a default 90-day deprecation notice for breaking changes unless safety, security or legal urgency requires a documented exception.

### 11.6 Resilience

External adapters require bounded timeouts, exponential backoff with jitter, circuit breakers, isolation/bulkheads, dead-letter or replay strategies where relevant, idempotent reconciliation, health checks and graceful read-only fallbacks. Cache only where data classification and licence permit, with explicit freshness and invalidation rules. Test Aksh/ISI outages and recovery without duplicate or corrupt evidence promotion.

### 11.7 Observability

For consequential ingestion, review, promotion, research and clinical-boundary operations record trace ID, authorised actor/role, data classification, source/release version, relevant model/prompt/tool versions, latency, error category, cost/token usage where applicable, and human review outcome. Do not log patient data, secrets or prohibited licensed content; apply retention, redaction and least privilege.

### 11.8 Additional acceptance gates

1. Canonical graph creation, retrieval, versioning, audit and governance function without Aksh/ISI.
2. Synthetic-to-curated and unauthorised patient-to-public research promotion fail closed.
3. Unreviewed AI findings cannot enter `approved_curated` or published releases.
4. Agent runs record source, model, prompt, tool and human-decision provenance.
5. Breaking API contracts fail compatibility tests; cross-product outages degrade safely.
6. Authentication, authorisation, audit, encryption and privacy-minimisation checks pass.
7. Model evaluation thresholds, run budgets, cost telemetry and recovery reconciliation are tested.
8. Capability maturity labels distinguish code, integration, automated tests, scientific validation and operational approval.

**Implementation status:** these are governing requirements, not assertions that the repository or live services currently satisfy them. See the ARCH-002 Step 6 readiness audit for known gaps.
