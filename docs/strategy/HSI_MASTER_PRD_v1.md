# HUMAN SUPER INTELLIGENCE (HSI)

**Naming clarification — 5 November 2026:** HSI expands to **Human Super Intelligence**. This editorial correction does not change requirement status or clinical/data approvals. The [latest product direction](HSI_PRODUCT_DIRECTION.md) and [implementation crosswalk](HSI_PRODUCT_DIRECTION_IMPLEMENTATION.md) provide a connected research delivery brief.
## Master Product Requirements Document — Version 1.0

**Product:** Human Super Intelligence<br>
**Product category:** Connected clinical and biomedical intelligence platform  
**Primary market:** United Kingdom  
**Future market:** International healthcare and biomedical research  
**Stage:** Product architecture and existing-implementation assessment  
**Status:** Proposed — pending founder approval  
**Document owner:** Founder / Product Leadership  
**Last updated:** 2 November 2026  
**Stop condition:** Audit and planning only. **No implementation** until explicit founder approval.

### Authority and companions

This PRD is the **product requirements authority** for HSI (V1.0). Target vision remains [`HSI_MASTER_VISION.md`](./HSI_MASTER_VISION.md). Current maturity: [`HSI_CURRENT_STATE_INTELLIGENCE_REPORT.md`](./HSI_CURRENT_STATE_INTELLIGENCE_REPORT.md). FR gap matrix: [`HSI_FR_REQUIREMENTS_TRACEABILITY.md`](./HSI_FR_REQUIREMENTS_TRACEABILITY.md). MVP recommendation: [`HSI_PRD_GAP_ANALYSIS_AND_MVP.md`](./HSI_PRD_GAP_ANALYSIS_AND_MVP.md). Strategy index: [`README.md`](./README.md).

| Companion brief (PRD §18) | Canonical companion + elaboration packs |
|---------------------------|----------------------------------------|
| **Document 02** — Architecture & Data | **Canonical:** [`HSI_ARCHITECTURE_AND_DATA.md`](./HSI_ARCHITECTURE_AND_DATA.md) · Elaboration: [`HSI_FOUR_PRODUCT_ECOSYSTEM.md`](./HSI_FOUR_PRODUCT_ECOSYSTEM.md) · [`HSI_LIVING_HEALTH_KNOWLEDGE_GRAPH.md`](./HSI_LIVING_HEALTH_KNOWLEDGE_GRAPH.md) · [`HSI_TARGET_ARCHITECTURE.md`](./HSI_TARGET_ARCHITECTURE.md) · **§7** pack · Honesty: [`HSI_DOC02_03_RECONCILIATION.md`](./HSI_DOC02_03_RECONCILIATION.md) (Docs 02/03/04) |
| **Document 03** — Intelligence Engine | **Canonical:** [`HSI_INTELLIGENCE_ENGINE_SPEC.md`](./HSI_INTELLIGENCE_ENGINE_SPEC.md) · Elaboration: **§5** pack ([`HSI_INTELLIGENCE_ENGINE_ARCHITECTURE.md`](./HSI_INTELLIGENCE_ENGINE_ARCHITECTURE.md) et al.) + **§6** pack ([`HSI_CROSS_DOMAIN_REASONING_ARCHITECTURE.md`](./HSI_CROSS_DOMAIN_REASONING_ARCHITECTURE.md) et al.) · Honesty: [`HSI_DOC02_03_RECONCILIATION.md`](./HSI_DOC02_03_RECONCILIATION.md) (Docs 02/03/04) |
| **Document 04** — UX | **Canonical:** [`HSI_DESIGN_SYSTEM_AND_UX.md`](./HSI_DESIGN_SYSTEM_AND_UX.md) · Elaboration: **§8** pack ([`HSI_EXISTING_UX_AUDIT.md`](./HSI_EXISTING_UX_AUDIT.md) et al.) · Honesty: [`HSI_DOC02_03_RECONCILIATION.md`](./HSI_DOC02_03_RECONCILIATION.md) (Docs 02/03/04) |

**Explicit MVP (this PRD §12):** **HSI Scientific Intelligence** = §5 **Workflow B** (Immune Mechanism Investigation) = Cap 3 / product **M1 Biomedical Discovery Brief**. Clinical longitudinal and Trials products are later phases.

---

# 1. Executive Summary

## 1.1 Product Vision

**Human Super Intelligence connects human health information with biological knowledge, scientific evidence and clinical research opportunities to help people make better-informed decisions.**

HSI is a coordinated intelligence ecosystem spanning patient health, clinical care, biomedical research and clinical trials.

Its central proposition is:

**Connect the patient. Understand the biology. Evaluate the evidence. Discover opportunities. Improve decisions.**

HSI is not intended to replace hospitals, electronic health records, clinicians or scientific researchers.

It is designed to connect information and support investigation across systems that currently operate independently.

## 1.2 The Problem

Healthcare and biomedical knowledge are fragmented.

Clinical records are distributed across providers. Patient-generated information is stored in separate applications. Biomedical knowledge exists across scientific publications, molecular databases, pathway resources and research datasets. Clinical trial information is maintained in registries and institutional systems.

These sources are rarely connected in a way that preserves clinical context, biological meaning, evidence quality and uncertainty.

As a result:

- Clinicians spend time reconstructing patient histories.
- Patients struggle to understand their longitudinal health information.
- Researchers spend substantial effort connecting findings across disciplines.
- Trial teams face difficulties interpreting eligibility criteria and identifying potentially relevant candidates.
- Scientific insights are difficult to translate into clinically meaningful context.

HSI addresses these problems through interoperable data services, a governed knowledge graph and coordinated intelligence workflows.

## 1.3 Proposed Solution

HSI consists of four connected products supported by a shared intelligence foundation.

| Product | Primary purpose | Primary user |
|---|---|---|
| **Aksh Health** | Personal health context and longitudinal monitoring | Patients |
| **HSI Clinical** | Longitudinal clinical intelligence and evidence exploration | Clinicians |
| **Immune Super Intelligence (ISI)** | Biomedical knowledge exploration and scientific discovery | Researchers |
| **HSI Trials** | Clinical trial discovery and explainable screening | Trial teams |

All four products share the HSI Intelligence Core.

The core provides:

- Semantic interoperability.
- Living Health Knowledge Graph services.
- Scientific evidence retrieval.
- Cross-domain reasoning.
- AI orchestration.
- Source provenance.
- Identity and access control.
- Clinical and scientific safety controls.
- Auditability.

**HSI should deliver one connected understanding of health without creating one unrestricted database.**

---

# 2. Goals and Non-Goals

## 2.1 Product Goals

### G-01 — Connect fragmented knowledge

Enable authorised workflows to retrieve and connect relevant clinical, biological and research information.

### G-02 — Build evidence-grounded intelligence

Ensure material scientific and clinical claims are traceable to their supporting sources.

### G-03 — Support longitudinal understanding

Help patients and clinicians investigate changes over time.

### G-04 — Accelerate scientific investigation

Enable researchers to explore mechanisms, compare evidence, identify contradictions and develop testable hypotheses.

### G-05 — Connect biology with clinical research

Link disease mechanisms and therapeutic targets to relevant clinical trials.

### G-06 — Deliver coherent product experiences

Provide intuitive, role-specific interfaces rather than exposing internal agents and technical architecture.

### G-07 — Establish a trustworthy foundation

Build security, clinical safety, scientific verification and governance into the platform.

## 2.2 Business Goals

- Establish HSI as a differentiated clinical and biomedical intelligence platform.
- Demonstrate value through validated research and clinical workflows.
- Develop relationships with universities, hospitals and research organisations.
- Support institutional evaluation and future commercialisation.
- Reuse existing Aksh and ISI capabilities to reduce duplicated development.
- Build an extensible foundation for additional disease domains.

## 2.3 Non-Goals

HSI is not intended to:

- Replace an EHR.
- Provide universal access to hospital records.
- Diagnose patients autonomously.
- Prescribe or modify treatment autonomously.
- Automatically enrol patients in trials.
- Treat AI-generated hypotheses as established science.
- Merge all clinical and research data into an unrestricted repository.
- Build autonomous agents for every possible task.
- Launch unvalidated clinical functionality as a production medical service.

---

# 3. Target Users and Jobs to Be Done

## 3.1 Clinicians

**Primary job:** Understand the patient's available clinical history and investigate relevant evidence efficiently.

When reviewing a patient, clinicians need to:

- Locate authorised records.
- Verify patient identity.
- Understand longitudinal changes.
- Review medications and laboratory results.
- Identify missing or conflicting information.
- Explore relevant biomedical evidence.
- Review potentially relevant clinical trials.

### Core journey

Patient Search → Verified Identity → Longitudinal Timeline → Clinical Context → Evidence → Trial Screening.

## 3.2 Biomedical Researchers

**Primary job:** Investigate complex biological questions using connected, evidence-grounded knowledge.

Researchers need to:

- Search scientific concepts.
- Explore immune-cell and molecular relationships.
- Compare findings across studies.
- Investigate contradictory evidence.
- Identify underexplored mechanisms.
- Generate testable hypotheses.
- Prepare cited research briefs.

### Core journey

Scientific Question → Knowledge Graph → Mechanism Exploration → Evidence Comparison → Research Gaps → Research Brief.

## 3.3 Patients

**Primary job:** Understand and organise personal health information over time.

Patients need to:

- Record relevant health information.
- Track symptoms.
- Review measurements.
- Understand medication information.
- Prepare for appointments.
- Access understandable educational explanations.
- Share information through approved workflows.

### Core journey

My Health → Timeline → Symptoms → Medication → Monitoring → Care Team → Relevant Research Information.

## 3.4 Clinical Trial Teams

**Primary job:** Identify relevant studies and assess candidate information transparently.

Trial teams need to:

- Manage study criteria.
- Discover relevant trials.
- Review structured eligibility requirements.
- Compare authorised candidate information.
- Identify missing evidence.
- Record investigator decisions.

### Core journey

Study Criteria → Candidate Screening → Missing Evidence → Review → Recruitment Workflow.

## 3.5 Institutional Partners

Potential partners include:

- NHS organisations.
- Universities.
- Biomedical research institutes.
- Clinical trial centres.
- Pharmaceutical research teams.
- Healthcare technology organisations.

Their priorities include governance, integration feasibility, scientific validity, operational usefulness and measurable outcomes.

---

# 4. Product Scope

## 4.1 Product A — Aksh Health

### Purpose

Provide patient-facing health context, monitoring and educational intelligence.

### Core capabilities

- Personalised onboarding.
- Health profile.
- Patient-reported observations.
- Longitudinal timeline.
- Symptoms.
- Medication information.
- Metabolic monitoring.
- Relevant health trends.
- Care coordination support.
- Educational explanations.

### Existing capability assessment

Audit existing Aksh implementations, including:

- CANVAS.
- VOICE.
- SYNTHESIS.
- Dr.Assist.
- GUARDIAN.
- HORIZON.
- Navigator.
- Safety red-flag.
- Diabetes coach.

These names do not establish that the underlying functionality is complete.

### Scope boundary

Aksh must not independently diagnose, prescribe or change treatment.

---

## 4.2 Product B — HSI Clinical

### Purpose

Help authorised clinicians understand available longitudinal clinical information and relevant scientific context.

### Core capabilities

- Authorised patient search.
- Verified identity.
- Clinical timeline.
- Encounter comparison.
- Laboratory trends.
- Medication chronology.
- Clinical context summaries.
- Missing-information identification.
- Evidence-linked biological exploration.
- Trial screening entry point.

### Scope boundary

HSI Clinical supplements existing clinical systems and human judgement.

It is not an EHR replacement.

---

## 4.3 Product C — Immune Super Intelligence

### Purpose

Enable evidence-grounded investigation of human biology, immune mechanisms, disease relationships and scientific research questions.

### Core capabilities

- Biomedical entity search.
- Knowledge graph exploration.
- Immune-cell investigation.
- Molecular pathway exploration.
- Biomarker investigation.
- Microbiome evidence.
- Systems biology.
- Literature retrieval.
- Evidence comparison.
- Contradiction analysis.
- Research-gap identification.
- Hypothesis generation.
- Research brief preparation.

### Scope boundary

Computational predictions and generated hypotheses must remain distinguishable from experimentally validated findings.

---

## 4.4 Product D — HSI Trials

### Purpose

Connect biological mechanisms, diseases and authorised patient context with clinical research opportunities.

### Core capabilities

- Official trial registry discovery.
- Trial metadata retrieval.
- Eligibility criteria extraction.
- Structured screening.
- Missing-data assessment.
- Mechanism-linked trial exploration.
- Recruitment-status verification.
- Investigator review.

### Scope boundary

HSI does not autonomously determine final eligibility, contact patients without authorisation or enrol participants.

---

# 5. Core Product Requirements

Requirements use stable identifiers so that architecture, engineering, agent and UX specifications can reference them.

## 5.1 Ecosystem and Identity

| ID | Requirement | Priority |
|---|---|---|
| HSI-FR-001 | Provide a coherent ecosystem connecting four products | P0 |
| HSI-FR-002 | Support role-specific navigation and workspaces | P0 |
| HSI-FR-003 | Support appropriate authentication and authorisation | P0 |
| HSI-FR-004 | Enforce separation between clinical, research and public data domains | P0 |
| HSI-FR-005 | Provide contextual cross-product navigation | P1 |
| HSI-FR-006 | Preserve user context only when permitted | P0 |

## 5.2 Living Health Knowledge Graph

| ID | Requirement | Priority |
|---|---|---|
| HSI-FR-007 | Represent relevant biomedical entities and relationships | P0 |
| HSI-FR-008 | Support ontology-based entity resolution | P0 |
| HSI-FR-009 | Preserve evidence provenance and review status | P0 |
| HSI-FR-010 | Support typed graph relationships and traversal | P0 |
| HSI-FR-011 | Represent temporal context and uncertainty | P0 |
| HSI-FR-012 | Support disease-to-mechanism investigation | P0 |
| HSI-FR-013 | Support microbiome–immune–metabolic relationships | P1 |
| HSI-FR-014 | Connect relevant mechanisms with trial information | P1 |

## 5.3 Intelligence Engine

| ID | Requirement | Priority |
|---|---|---|
| HSI-FR-015 | Orchestrate specialised intelligence capabilities | P0 |
| HSI-FR-016 | Use controlled tools and defined agent contracts | P0 |
| HSI-FR-017 | Reuse validated Aksh capabilities where appropriate | P0 |
| HSI-FR-018 | Support scientific evidence retrieval and comparison | P0 |
| HSI-FR-019 | Identify contradictory findings and uncertainty | P1 |
| HSI-FR-020 | Support research-gap and hypothesis workflows | P1 |
| HSI-FR-021 | Validate material claims against evidence | P0 |
| HSI-FR-022 | Support human review and execution auditability | P0 |

## 5.4 Cross-Domain Reasoning

| ID | Requirement | Priority |
|---|---|---|
| HSI-FR-023 | Reconstruct longitudinal clinical context | P1 |
| HSI-FR-024 | Analyse medication and laboratory chronology | P1 |
| HSI-FR-025 | Connect disease phenotypes with biological mechanisms | P0 |
| HSI-FR-026 | Distinguish clinical facts from general scientific knowledge | P0 |
| HSI-FR-027 | Distinguish associations, inferences and hypotheses | P0 |
| HSI-FR-028 | Identify missing information | P0 |
| HSI-FR-029 | Support mechanism-to-trial investigation | P1 |
| HSI-FR-030 | Provide claim-level provenance | P0 |

## 5.5 Data and Interoperability

| ID | Requirement | Priority |
|---|---|---|
| HSI-FR-031 | Support appropriate FHIR R4-aligned clinical models | P1 |
| HSI-FR-032 | Evaluate SMART-on-FHIR integration | P1 |
| HSI-FR-033 | Evaluate HL7 v2, laboratory and medication integration | P1 |
| HSI-FR-034 | Support approved biomedical source ingestion | P0 |
| HSI-FR-035 | Support official clinical trial registry retrieval | P1 |
| HSI-FR-036 | Support governed Aksh observation exchange | P1 |
| HSI-FR-037 | Preserve source lineage and data quality metadata | P0 |
| HSI-FR-038 | Track integration maturity and freshness | P0 |

## 5.6 Product Experience

| ID | Requirement | Priority |
|---|---|---|
| HSI-FR-039 | Provide a professional public HSI website | P0 |
| HSI-FR-040 | Explain the four-product ecosystem clearly | P0 |
| HSI-FR-041 | Show verified capability availability honestly | P0 |
| HSI-FR-042 | Provide an interactive scientific research workspace | P0 |
| HSI-FR-043 | Provide a longitudinal clinician workspace | P1 |
| HSI-FR-044 | Provide a coherent Aksh patient experience | P1 |
| HSI-FR-045 | Provide an explainable trial screening workspace | P1 |
| HSI-FR-046 | Provide source inspection and evidence drawers | P0 |

## 5.7 Safety and Governance

| ID | Requirement | Priority |
|---|---|---|
| HSI-FR-047 | Enforce lawful and purpose-bound processing | P0 |
| HSI-FR-048 | Protect identifiable patient information | P0 |
| HSI-FR-049 | Prevent unsafe patient identity matching | P0 |
| HSI-FR-050 | Apply clinical safety controls where required | P0 |
| HSI-FR-051 | Assess applicable medical device obligations | P0 |
| HSI-FR-052 | Enforce agent tool permissions | P0 |
| HSI-FR-053 | Maintain appropriate audit records | P0 |
| HSI-FR-054 | Support incident response and capability shutdown | P0 |

**Priority definitions:** P0 = foundational or necessary for the relevant initial workflow; P1 = subsequent validated capability. A P1 label does not permit bypassing any safety prerequisite when that capability is implemented.

---

# 6. Non-Functional Requirements

## 6.1 Security

- Strong authentication.
- Least-privilege authorisation.
- Encryption in transit and at rest.
- Secure secret management.
- Tenant isolation.
- Protected audit logging.
- Security testing.
- Incident response.

## 6.2 Privacy

- Data minimisation.
- Purpose limitation.
- Appropriate lawful processing.
- Data subject rights.
- Retention controls.
- Governed research access.
- Appropriate third-party processing agreements.

## 6.3 Scientific Quality

- Verifiable source references.
- Correct terminology mapping.
- Evidence classification.
- Contradiction handling.
- Scientific uncertainty.
- Reproducible investigation records.

## 6.4 Clinical Safety

- Verified identity.
- Source fidelity.
- Safe handling of incomplete records.
- Clinical hazard assessment.
- Human oversight.
- Appropriate regulatory evaluation.

## 6.5 Reliability

- Observable workflows.
- Safe failure handling.
- Retry controls.
- Data freshness indicators.
- Integration monitoring.
- Backup and recovery strategies.

## 6.6 Performance

Define measurable targets after establishing realistic baselines for:

- Entity search latency.
- Graph query response time.
- Evidence retrieval.
- Scientific investigation completion.
- Clinical timeline retrieval.
- Trial screening execution.

Do not invent performance targets without representative workloads.

## 6.7 Accessibility

Target WCAG 2.2 AA where applicable.

Support keyboard navigation, accessible charts, readable contrast and responsive layouts.

---

# 7. Core User Journeys

## Journey 1 — Researcher Investigation

**User question:** "Which immune-cell states are associated with treatment resistance in rheumatoid arthritis?"

### Workflow

1. Enter scientific question.
2. Resolve relevant concepts.
3. Query knowledge graph.
4. Retrieve supporting studies.
5. Compare evidence.
6. Identify contradictions.
7. Identify research gaps.
8. Generate cited research brief.

### Success condition

The researcher receives a scientifically reviewable investigation with traceable claims and explicit uncertainty.

---

## Journey 2 — Clinician Longitudinal Review

**User question:** "What changed across this patient's last five encounters?"

### Workflow

1. Authenticate clinician.
2. Verify patient identity and authorisation.
3. Retrieve available records.
4. Reconstruct timeline.
5. Identify documented changes.
6. Compare relevant measurements and medications.
7. Identify missing information.
8. Present source-linked summary.

### Success condition

The clinician can inspect relevant changes and verify their source without relying on unsupported AI conclusions.

---

## Journey 3 — Patient Health Understanding

**User question:** "How have my glucose readings changed over the past month?"

### Workflow

1. Authenticate patient.
2. Retrieve available observations.
3. Validate dates and units.
4. Calculate trends.
5. Present chart.
6. Explain limitations.
7. Support appropriate follow-up.

### Success condition

The patient understands the available trend without receiving an unsupported diagnosis or treatment recommendation.

---

## Journey 4 — Trial Screening

**User question:** "Which studies may be relevant to this patient's condition?"

### Workflow

1. Verify authorisation.
2. Retrieve relevant clinical attributes.
3. Search official registries.
4. Structure eligibility criteria.
5. Assess available information.
6. Identify unknown criteria.
7. Verify study status.
8. Produce investigator-reviewable results.

### Success condition

The trial team can inspect criterion-level evidence and record an informed review decision.

---

# 8. User Experience Requirements

## 8.1 Public Website

The public HSI website must explain:

- What HSI is.
- The fragmentation problem.
- The four connected products.
- How the intelligence foundation works.
- Current capabilities.
- In-development capabilities.
- Scientific evidence and governance.
- Institutional collaboration.

Avoid exposing internal engineering roadmaps as primary navigation.

## 8.2 Clinician Workspace

Prioritise:

Patient Search → Timeline → Clinical Context → Evidence → Trial Screening.

## 8.3 Researcher Workspace

Prioritise:

Question → Knowledge Graph → Mechanisms → Evidence → Gaps → Research Brief.

## 8.4 Patient Workspace

Prioritise:

My Health → Measurements → Symptoms → Medication → Care.

## 8.5 Trial Workspace

Prioritise:

Study → Criteria → Screening → Missing Evidence → Review.

## 8.6 Shared UX

All workspaces should use:

- Consistent navigation patterns.
- Clear status indicators.
- Source-linked claims.
- Evidence inspection.
- Progressive disclosure.
- Meaningful loading and error states.
- Accessible visualisations.

The user should not need to understand internal AI agents to operate HSI.

---

# 9. Data and Evidence Requirements

## 9.1 Clinical Sources

Evaluate:

- HL7 FHIR R4.
- SMART-on-FHIR.
- HL7 v2.
- EHR systems.
- Laboratory systems.
- Medication and pharmacy data.
- Imaging metadata and reports.
- Approved patient identity services.

## 9.2 Biomedical Sources

Evaluate:

- Open Targets.
- Human Cell Atlas.
- PubMed.
- Europe PMC.
- UniProt.
- Reactome.
- Gene Ontology.
- Relevant single-cell and multi-omics resources.

## 9.3 Trial Sources

Evaluate:

- ClinicalTrials.gov.
- WHO ICTRP.
- Appropriate participating and national registries.

## 9.4 Patient Sources

Evaluate:

- Aksh Health.
- Approved wearable integrations.
- Home monitoring.
- Patient-reported outcomes.
- Symptoms and lifestyle observations.

## 9.5 Mandatory Evidence Classification

Every substantive conclusion must distinguish:

1. Observed patient fact.
2. Established scientific evidence.
3. Statistical association.
4. Computational inference.
5. Unvalidated hypothesis.

Do not collapse these categories into one apparently certain conclusion.

---

# 10. Safety, Privacy and Governance

HSI must be designed for applicable UK requirements.

Assess:

- UK GDPR and Data Protection Act.
- Appropriate lawful bases.
- Confidentiality obligations.
- Patient identity verification.
- Role- and attribute-based access.
- Clinical safety management.
- DCB0129 and DCB0160 applicability.
- DSPT requirements.
- MHRA software medical device classification.
- Research ethics.
- Trial recruitment governance.
- Model evaluation.
- Security threat modelling.

## Mandatory boundary

Identifiable clinical information must not be exposed to unauthorised research workflows.

Human oversight is required for consequential clinical and trial decisions.

Compliance and regulatory approval must never be claimed without supporting evidence.

---

# 11. Success Metrics

HSI should measure real task outcomes rather than the number of AI agents or graph nodes.

## 11.1 Researcher Metrics

- Scientific investigation completion rate.
- Citation verification rate.
- Unsupported-claim rate.
- Entity mapping accuracy.
- Researcher assessment of usefulness.
- Time required to prepare evidence briefs.

## 11.2 Clinician Metrics

- Accuracy of longitudinal summaries.
- Source traceability.
- Medication chronology correctness.
- Missing-information detection.
- Clinician task completion.
- Clinical safety incidents.

## 11.3 Patient Metrics

- Onboarding completion.
- Relevant observation capture.
- Trend comprehension.
- Continued engagement.
- Patient-reported usefulness.

## 11.4 Trial Metrics

- Eligibility extraction accuracy.
- Criterion-level screening correctness.
- Unknown-criterion identification.
- Registry freshness.
- Investigator review completion.

## 11.5 Platform Metrics

- Integration reliability.
- Graph query correctness.
- Access-control enforcement.
- Workflow completion.
- Availability.
- Cost per completed investigation.
- Audit coverage.

### Measurement principle

Establish baselines and evaluation datasets before agreeing numerical performance targets.

---

# 12. MVP Strategy

The first HSI release should prove the core differentiation without requiring universal clinical connectivity.

## MVP Objective

Demonstrate that HSI can connect biomedical entities, scientific evidence, biological mechanisms and research questions through a usable, verifiable workflow.

## Recommended Initial MVP

**HSI Scientific Intelligence MVP**

**Alignment:** §5 **Workflow B** / Cap 3 / product **M1 Biomedical Discovery Brief** (research-first). Earlier Gap Analysis “Workflow A Biomedical Discovery” refers to the same scientific milestone under prior naming — use §5 Workflow B going forward.


### Included

- Professional HSI public website.
- Clear four-product ecosystem explanation.
- ISI research workspace.
- Biomedical entity search.
- Existing knowledge graph exploration.
- Mechanism investigation.
- Evidence retrieval.
- Source inspection.
- Contradiction and uncertainty presentation.
- Structured research brief.
- Basic intelligence orchestration.
- Scientific evaluation framework.

### Conditional inclusion

- Research-gap investigation, where evidence coverage supports meaningful assessment.
- Hypothesis generation, clearly marked as unvalidated.
- Mechanism-linked trial discovery, if official registry integration is verified.

### Excluded from initial MVP

- Live multi-hospital patient record access.
- Autonomous clinical decision-making.
- Patient-specific treatment recommendations.
- Autonomous recruitment.
- Unapproved clinical data processing.
- Unvalidated medical device functionality.

## Rationale

This MVP demonstrates HSI's scientific differentiation while reducing dependency on institutional clinical data agreements.

It also creates reusable foundations for HSI Clinical and HSI Trials.

---

# 13. Phased Product Roadmap

## Phase 0 — Existing Product Audit

Audit:

- HSI Core.
- Immune Super Intelligence.
- Aksh Health.

Verify:

- Existing code.
- Working features.
- Graph capabilities.
- Agents.
- Integrations.
- Authentication.
- Data models.
- UX.
- Tests.
- Security controls.

**Exit criterion:** Evidence-based current-state assessment approved.

## Phase 1 — Shared Foundation

Define:

- Product architecture.
- Shared terminology.
- Evidence provenance.
- Graph interfaces.
- Intelligence orchestration.
- Design system.
- Access boundaries.

**Exit criterion:** Approved architecture and validated foundation.

## Phase 2 — Scientific Intelligence MVP

Deliver the initial research investigation experience.

**Exit criterion:** Core scientific workflows pass expert-reviewed evaluation.

## Phase 3 — Aksh Integration

Connect validated patient-generated information capabilities through governed interfaces.

**Exit criterion:** Reliable and permission-controlled exchange.

## Phase 4 — HSI Clinical Evaluation

Develop longitudinal clinical workflows using appropriately authorised evaluation data.

**Exit criterion:** Clinical, security and governance requirements satisfied for the defined evaluation.

## Phase 5 — HSI Trials

Deliver official trial discovery and explainable eligibility screening.

**Exit criterion:** Criteria extraction and screening evaluated with investigator oversight.

## Phase 6 — Cross-Domain Intelligence

Connect approved clinical context, biological mechanisms, evidence and trial opportunities.

**Exit criterion:** End-to-end workflows demonstrate correctness, traceability and safety.

## Phase 7 — Institutional Expansion

Pursue governed pilots, partnerships and additional disease domains.

**Exit criterion:** Evidence of usefulness, operational readiness and applicable approvals.

This is a dependency-based roadmap, not a commitment to dates.

---

# 14. Dependencies

## Technical

- Existing repository architecture.
- Knowledge graph maturity.
- Biomedical terminology services.
- Source integration APIs.
- Evidence retrieval services.
- Authentication and authorisation.
- Hosting and operational infrastructure.

## Scientific

- Reliable biomedical datasets.
- Ontology mappings.
- Evidence review methodology.
- Expert validation.
- Evaluation datasets.

## Clinical

- Participating healthcare organisations.
- Approved clinical data access.
- Clinical safety review.
- Identity and record matching.
- Appropriate governance.

## Commercial

- Institutional collaboration.
- Product validation.
- Operational costs.
- Sustainable access to third-party data.
- Appropriate contractual arrangements.

---

# 15. Major Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Platform becomes a collection of unrelated tools | Shared core and task-oriented product journeys |
| Scientific hallucinations | Claim-level provenance and verification |
| Unsupported causal conclusions | Explicit evidence categories |
| Unsafe clinical data access | Purpose-bound authorisation and domain separation |
| Duplicate agent development | Audit and reuse existing Aksh capabilities |
| Overengineered infrastructure | Workflow-driven architecture decisions |
| Poor researcher usability | Evidence-first graph workbench |
| Misleading product claims | Verified capability availability labels |
| Clinical regulatory uncertainty | Intended-purpose assessment and expert review |
| High integration complexity | Phased, source-specific integration strategy |
| Uncontrolled development scope | Approval gates and prioritised requirements |

---

# 16. Acceptance Criteria

The initial scientific MVP is acceptable only when:

1. A researcher can submit a defined scientific question.
2. The system resolves relevant biomedical entities.
3. Graph queries retrieve actual stored relationships.
4. Scientific evidence is retrieved from approved sources.
5. Material claims link to verifiable evidence.
6. Unsupported claims are rejected or clearly identified.
7. Contradictory evidence is not silently suppressed.
8. The user can inspect underlying sources.
9. The system communicates missing evidence and uncertainty.
10. A structured research brief can be generated.
11. The workflow produces an auditable execution record.
12. Access controls are enforced.
13. Error states do not fabricate results.
14. The interface is accessible and usable.
15. Scientific evaluation results are documented.

Later clinical and trial capabilities require their own acceptance criteria and governance gates.

---

# 17. Open Questions and Decisions

| ID | Open question | Decision owner |
|---|---|---|
| HSI-D01 | Which existing ISI graph components should be retained? | Architecture / Founder |
| HSI-D02 | Which Aksh agents are operational and reusable? | Engineering / Founder |
| HSI-D03 | Which biomedical sources should be integrated first? | Scientific Product |
| HSI-D04 | What is the initial scientific evaluation dataset? | Scientific Lead |
| HSI-D05 | Which orchestration approach best fits existing infrastructure? | Architecture |
| HSI-D06 | How should the shared design system integrate existing branding? | Design / Founder |
| HSI-D07 | Which clinical partner workflows should be evaluated first? | Clinical Product |
| HSI-D08 | Which intended functions require medical device assessment? | Regulatory / Clinical Safety |
| HSI-D09 | Which trial registry integrations are feasible and permitted? | Trials / Data Engineering |
| HSI-D10 | What infrastructure and operational budget is appropriate? | Founder / Engineering |

These decisions should be resolved using evidence rather than assumptions.

---

# 18. Document Relationships

This PRD governs three detailed companion specifications. **Canonical founder companions** for Documents 02, 03 and 04 are ingested below (status: **Proposed / pending founder approval** — **not** implementation approval). Detailed strategy packs (§2–§8) remain elaboration, ADRs, and Phase 0 audit evidence. Honesty ledger: [`HSI_DOC02_03_RECONCILIATION.md`](./HSI_DOC02_03_RECONCILIATION.md) (Documents 02 / 03 / 04).

## Document 02 — HSI Architecture and Data Design

Defines: shared system architecture; data domains; knowledge graph; interoperability; storage; provenance; security; reliability; deployment boundaries; future-state intelligence north star. References HSI-FR identifiers.

**Canonical companion:** [`HSI_ARCHITECTURE_AND_DATA.md`](./HSI_ARCHITECTURE_AND_DATA.md) (Document 02 — Proposed / pending founder approval).

**Elaboration / audit mapping:**

| Topic | Document |
|-------|----------|
| Logical architecture & planes | [`HSI_TARGET_ARCHITECTURE.md`](./HSI_TARGET_ARCHITECTURE.md) |
| Four products + ownership | [`HSI_FOUR_PRODUCT_ECOSYSTEM.md`](./HSI_FOUR_PRODUCT_ECOSYSTEM.md) |
| Living Health Knowledge Graph | [`HSI_LIVING_HEALTH_KNOWLEDGE_GRAPH.md`](./HSI_LIVING_HEALTH_KNOWLEDGE_GRAPH.md) · [`HSI_KNOWLEDGE_GRAPH_MASTER_PLAN.md`](./HSI_KNOWLEDGE_GRAPH_MASTER_PLAN.md) |
| Interoperability / sources | §7 pack — start [`HSI_INTEROPERABILITY_ARCHITECTURE.md`](./HSI_INTEROPERABILITY_ARCHITECTURE.md) · [`HSI_DATA_SOURCE_CATALOGUE.md`](./HSI_DATA_SOURCE_CATALOGUE.md) |
| Clinical safety / privacy | [`HSI_CLINICAL_SAFETY_AND_GOVERNANCE.md`](./HSI_CLINICAL_SAFETY_AND_GOVERNANCE.md) · §7 [`HSI_DATA_SECURITY_AND_GOVERNANCE.md`](./HSI_DATA_SECURITY_AND_GOVERNANCE.md) |
| Proposed vs Observed | [`HSI_DOC02_03_RECONCILIATION.md`](./HSI_DOC02_03_RECONCILIATION.md) (Documents 02 / 03 / 04) |

## Document 03 — HSI Intelligence Engine and Agent Specifications

Defines: existing agent audit obligations; orchestration; agent/tool contracts; cross-domain reasoning; evidence verification; safety; evaluation; failure handling; future multimodal/mechanistic research gates. References HSI-FR identifiers.

**Canonical companion:** [`HSI_INTELLIGENCE_ENGINE_SPEC.md`](./HSI_INTELLIGENCE_ENGINE_SPEC.md) (Document 03 — Proposed / pending founder approval).

**Elaboration / audit mapping (§5–§6 packs remain detailed elaboration):**

| Topic | Document |
|-------|----------|
| Intelligence Engine (§5) | [`HSI_INTELLIGENCE_ENGINE_ARCHITECTURE.md`](./HSI_INTELLIGENCE_ENGINE_ARCHITECTURE.md) · [`HSI_EXISTING_AGENT_AUDIT.md`](./HSI_EXISTING_AGENT_AUDIT.md) · [`HSI_AGENT_AND_CAPABILITY_CATALOGUE.md`](./HSI_AGENT_AND_CAPABILITY_CATALOGUE.md) · [`HSI_ORCHESTRATION_WORKFLOWS.md`](./HSI_ORCHESTRATION_WORKFLOWS.md) |
| Tools / safety / eval | [`HSI_TOOL_AND_API_CONTRACTS.md`](./HSI_TOOL_AND_API_CONTRACTS.md) · [`HSI_AGENT_SAFETY_MODEL.md`](./HSI_AGENT_SAFETY_MODEL.md) · [`HSI_EVIDENCE_VERIFICATION_DESIGN.md`](./HSI_EVIDENCE_VERIFICATION_DESIGN.md) · [`HSI_AGENT_EVALUATION_FRAMEWORK.md`](./HSI_AGENT_EVALUATION_FRAMEWORK.md) |
| Cross-domain reasoning (§6) | [`HSI_CROSS_DOMAIN_REASONING_ARCHITECTURE.md`](./HSI_CROSS_DOMAIN_REASONING_ARCHITECTURE.md) · [`HSI_REASONING_PIPELINE.md`](./HSI_REASONING_PIPELINE.md) · [`HSI_CLAIM_PROVENANCE_SCHEMA.md`](./HSI_CLAIM_PROVENANCE_SCHEMA.md) · [`HSI_EVIDENCE_CATEGORY_SPECIFICATION.md`](./HSI_EVIDENCE_CATEGORY_SPECIFICATION.md) |
| Proposed vs Observed | [`HSI_DOC02_03_RECONCILIATION.md`](./HSI_DOC02_03_RECONCILIATION.md) (Documents 02 / 03 / 04) |

## Document 04 — HSI Unified Design System and UX

Defines: public website; role-based onboarding; clinical / research / patient / trial workspaces; shared components; accessibility; usability testing. References HSI-FR identifiers.

**Canonical companion:** [`HSI_DESIGN_SYSTEM_AND_UX.md`](./HSI_DESIGN_SYSTEM_AND_UX.md) (Document 04 — Proposed / pending founder approval).

**Elaboration / audit mapping (§8 pack remains detailed elaboration + Phase 0 UX audit):**

| Topic | Document |
|-------|----------|
| Phase 0 UX audit | [`HSI_EXISTING_UX_AUDIT.md`](./HSI_EXISTING_UX_AUDIT.md) |
| Information architecture | [`HSI_PRODUCT_INFORMATION_ARCHITECTURE.md`](./HSI_PRODUCT_INFORMATION_ARCHITECTURE.md) |
| Public website | [`HSI_PUBLIC_WEBSITE_SPECIFICATION.md`](./HSI_PUBLIC_WEBSITE_SPECIFICATION.md) |
| Design system / tokens | [`HSI_UNIFIED_DESIGN_SYSTEM.md`](./HSI_UNIFIED_DESIGN_SYSTEM.md) |
| Role workspaces | [`HSI_RESEARCHER_WORKSPACE_UX.md`](./HSI_RESEARCHER_WORKSPACE_UX.md) · [`HSI_CLINICIAN_WORKSPACE_UX.md`](./HSI_CLINICIAN_WORKSPACE_UX.md) · [`HSI_PATIENT_WORKSPACE_UX.md`](./HSI_PATIENT_WORKSPACE_UX.md) · [`HSI_TRIAL_TEAM_WORKSPACE_UX.md`](./HSI_TRIAL_TEAM_WORKSPACE_UX.md) · [`HSI_ROLE_BASED_ONBOARDING.md`](./HSI_ROLE_BASED_ONBOARDING.md) |
| Trust UI / a11y / roadmap | [`HSI_EVIDENCE_AND_TRUST_UI.md`](./HSI_EVIDENCE_AND_TRUST_UI.md) · [`HSI_RESPONSIVE_ACCESSIBILITY_PLAN.md`](./HSI_RESPONSIVE_ACCESSIBILITY_PLAN.md) · [`HSI_UX_IMPLEMENTATION_ROADMAP.md`](./HSI_UX_IMPLEMENTATION_ROADMAP.md) |
| Proposed vs Observed | [`HSI_DOC02_03_RECONCILIATION.md`](./HSI_DOC02_03_RECONCILIATION.md) (Documents 02 / 03 / 04) |

---

# 19. Instructions to Cursor

This PRD defines the intended product, not proof that every feature exists.

Before modifying code:

1. Inspect the existing HSI, ISI and Aksh repositories.
2. Identify the current architecture.
3. Verify working capabilities.
4. Identify duplicated components.
5. Assess integration maturity.
6. Assess scientific and clinical safety.
7. Compare existing implementation against HSI-FR-001 through HSI-FR-054.
8. Classify each requirement (Verified working | Implemented unverified | Partial | Mocked | Missing | Broken | Not assessed).
9. Produce an implementation gap analysis ([`HSI_FR_REQUIREMENTS_TRACEABILITY.md`](./HSI_FR_REQUIREMENTS_TRACEABILITY.md), [`HSI_PRD_GAP_ANALYSIS_AND_MVP.md`](./HSI_PRD_GAP_ANALYSIS_AND_MVP.md)).
10. Recommend the smallest coherent scientific MVP (Workflow B / Cap 3 / M1).
11. Identify dependencies and risks.
12. Present architecture decisions requiring approval.

Do not:

- Rebuild validated functionality unnecessarily.
- Invent integrations.
- Present mocked data as real clinical information.
- Claim unverified agents are operational.
- Replace the existing knowledge graph without an evidence-based decision.
- Add unnecessary autonomous agents.
- Publish internal roadmaps as the public product experience.
- Modify production databases.
- Commit, merge, push or deploy without explicit approval.

---

# 20. Final Product Definition

**Human Super Intelligence is a governed clinical and biomedical intelligence ecosystem that connects longitudinal health information, human biology, scientific evidence and clinical research opportunities through interoperable data services, a living knowledge graph and coordinated AI-assisted reasoning.**

Its differentiation is not the number of AI agents, databases or features.

Its differentiation is the ability to help users investigate how health information and biological knowledge are connected, while preserving source provenance, scientific uncertainty, privacy, clinical safety and human accountability.

**The first objective is to prove this intelligence through a scientifically credible, working research experience. The longer-term objective is to extend that foundation into authorised clinical and patient workflows and explainable clinical trial intelligence.**

**Approval gate:** Audit and planning only. Implementation requires explicit founder approval.

**This document status:** Proposed — **pending founder approval**. Companions §2–§8 and FR/gap docs do **not** authorise builds.
