# HSI Architecture Principle 001 — Independent Intelligence, Connected Ecosystem

| Field | Value |
| --- | --- |
| ID | HSI-ARCH-001 |
| Version | 1.0 |
| Date | 2026-11-04 |
| Status | Adopted as target-state architecture principle; implementation not yet verified |
| Scope | HSI Core, HSI Clinical, HSI Research, HSI Trials and optional Aksh/ISI integrations |

## 1. Foundational declaration

**Health Super Intelligence (HSI) shall be an independent, comprehensive, evidence-grounded biomedical and healthcare intelligence platform.**

HSI must not require Aksh Health, Immune Super Intelligence (ISI), or another specialised product to operate its core knowledge, scientific research, clinical intelligence, trial discovery, AI orchestration, governance, and platform services. Cross-product connections enhance HSI; they must not become prerequisites for its core functionality.

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

## 5. Product boundaries

| Product | Primary responsibility | HSI relationship |
| --- | --- | --- |
| **HSI** | Comprehensive biomedical, clinical, research and trial intelligence | Independent platform and authoritative governed knowledge |
| **Aksh Health** | Patient engagement, diabetes/cardiometabolic monitoring and clinician workflows | Optional, authorised clinical integration; not HSI's sole patient-data source |
| **Immune Super Intelligence (ISI)** | Specialist immunology research, education, exploration and community | Optional evidence and specialist capability contributor; not HSI's sole immune knowledge source |
| **Future products** | Specialised experiences and vertical workflows | Contract-based, independently deployable integrations |

No external product shall become a mandatory runtime dependency for HSI's core research, graph and trial discovery services. HSI clinical features may depend on authorised *clinical data sources* and must clearly indicate when such data are unavailable.

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
