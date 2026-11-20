# HSI Master Vision, Mission, Product & Prototype Engineering Specification

**Version:** 1.0 — 20 November 2026  
**Type:** Strategic specification and engineering handoff, not an implementation status report.

## 1. Vision
Connect biomedical knowledge, research capabilities, approved institutional data and scientific communities into an intelligent ecosystem that advances understanding of human biology and accelerates responsible discovery.

## 2. Mission
Empower researchers and institutions with evidence-grounded AI, connected biological knowledge and secure collaboration to investigate mechanisms, integrate diverse data, identify gaps, develop testable hypotheses and inform translational research.

**Unchanged scientific principle:** Understand the mechanism. Preserve the evidence. Explain the uncertainty. Inform the next decision.

## 3. Scope preservation
Maintain the established scientific foundation and all six broad scientific domains:
- Immunology & Inflammation
- Neuroscience
- Microbiome & Metabolism
- Genomics & Multi-omics
- Organ & Tissue Biology
- Disease Mechanisms

Do not make prostate cancer, T cells, SSc, RA, SLE or any individual disease the organising framework. They may serve as demonstration investigations.

Preserve the existing Research Workbench, Scientific Verification Engine, Evidence Intelligence, Living Knowledge Graph, Contradiction Analysis, Gap Analysis, Hypothesis Workspace, governed scientific review, and clinical/trial intelligence direction. Extend rather than rewrite. Audit actual implementation before assuming any module is production-ready.

## 4. Product model
**Layer A — Private scientific intelligence:** Institution/research-group workspaces, approved datasets, AI research investigations, reproducible evidence and hypotheses.
**Layer B — Federated data intelligence:** Connect public repositories and institution-controlled sources; prefer computation near protected data and source-authoritative identifiers.
**Layer C — Permission-based research network:** Verified profiles, expertise/method matching, collaboration opportunities, opt-in introductions, granular share approvals and revocation.
**Layer D — Translational ecosystem:** Future governed clinical cohorts, biomarker/target validation, trials, biotech/pharma partnerships, student opportunities and scientific communities.

## 5. Prototype journey
1. Visitor understands vision and selects role.
2. Sign up, verify email, join/create organisation, accept terms and complete role-specific onboarding.
3. Researcher enters question and creates a private investigation.
4. Select public evidence sources and permitted synthetic/approved dataset.
5. Ingest, validate, normalise, version and provenance-tag records.
6. Run evidence retrieval, verification, mechanism mapping, contradiction and gap analysis.
7. Explore connected knowledge graph and inspect evidence behind every edge.
8. Generate hypothesis proposals, uncertainty, missing variables and research brief.
9. View explainable collaborator recommendations from public or opt-in metadata.
10. Explicitly approve share-preview and send introduction; recipient accepts/declines.
11. Save, reopen, reproduce and refresh investigation; record changes and audit events.

## 6. Roles and personalised dashboard
- **Independent researcher/professor:** My investigations, evidence alerts, datasets, graph, hypotheses, collaborators.
- **Research-group principal investigator:** Group projects, member permissions, approvals, collaboration queue, research activity.
- **Lab scientist:** Dataset quality, assay metadata, batch effects, methods, analysis jobs, reproducibility.
- **Clinical researcher:** Approved cohort feasibility, protocol/trial evidence, strict clinical access gates.
- **Biotech/pharma scientist:** Target/mechanism landscape, validated evidence, partnership requests.
- **Student/early-career researcher:** Public learning investigations, approved projects, mentors, skills and opportunities; no automatic clinical access.
- **Institution administrator:** Identity, organisation policy, dataset grants, audit logs, retention, connectors.

All dashboards need clear private/public indicators, source freshness, dataset type (real/synthetic), incomplete analyses, uncertainties, notifications, accessible responsive layouts, empty/error/loading states.

## 7. Data points and canonical models
**Identity & governance:** user_id, organisation_id, group_id, role, verified affiliation, consent_id, grant_scope, dataset_owner, licence, access_policy, retention, audit_event.
**Research project:** project_id, title, scientific question, domain tags, hypothesis, methods, PI, project status, confidentiality, contributors, funding and disclosure restrictions.
**Patient/cohort (synthetic for prototype):** synthetic_subject_id, age band, sex where relevant, condition, diagnosis date, clinical phenotype, stage, treatment exposure, visit timestamp, response, adverse event, comorbidity, outcome, missingness and data lineage. No identifiable patient records in the initial pilot.
**Genomics:** sample_id, gene, variant, genome build, coordinate, reference/alternate allele, annotation, allele fraction, assay, QC, cohort.
**Transcriptomics:** gene ID, sample/cell ID, expression value, units, batch, cell type, library method, QC.
**Proteomics:** protein accession, sample ID, abundance, units, assay platform, normalisation, missingness, QC.
**Immunology:** immune cell subset, marker panel, TCR clonotype where appropriate, cytokine, assay method, tissue compartment, functional state, timepoint.
**Microbiome:** sample ID, taxa identifiers, relative abundance, sequencing method, diversity, batch, diet/medication context, QC.
**Metabolomics:** metabolite identifier, concentration, unit, specimen, platform, detection threshold, QC.
**Neuroscience:** neuroimmune marker, region or tissue, phenotype, imaging/assay modality, cognitive/functional assessment when appropriate, timepoint, QC.
**Organ/tissue:** anatomy ontology ID, tissue, histology, spatial coordinate/region, pathology feature, specimen provenance.
**Evidence:** PMID/DOI, source URL, publication date, version, licence, retraction/correction state, evidence span, study type, sample size, effect direction, limitation, confidence and independent verification outcomes.
**Graph:** entity ID, ontology, relationship predicate, context, evidence links, temporal validity, provenance, review status.
**Collaboration:** researcher_id, public expertise, methods, opted-in interests, matching reasons, match score components, share preview, consent, invitation status, acceptance and audit trail.

All modalities must use documented identifiers, units, timepoints and specimen joins. Never silently merge unpaired public omics records into a supposed real patient.

## 8. Public evidence and dataset sources
Candidate sources (validate current licences, APIs, schemas, availability and download rights before use):
- PubMed / NCBI E-utilities: https://www.ncbi.nlm.nih.gov/books/NBK25501/
- Europe PMC APIs: https://europepmc.org/RestfulWebService
- Open Targets: https://platform.opentargets.org/ and https://platform-docs.opentargets.org/data-access
- UniProt: https://www.uniprot.org/
- Reactome: https://reactome.org/
- ChEMBL: https://www.ebi.ac.uk/chembl/
- NCBI GEO: https://www.ncbi.nlm.nih.gov/geo/
- NCI GDC: https://portal.gdc.cancer.gov/
- Human Protein Atlas: https://www.proteinatlas.org/
- PRIDE proteomics: https://www.ebi.ac.uk/pride/
- MetaboLights: https://www.ebi.ac.uk/metabolights/
- MGnify microbiome: https://www.ebi.ac.uk/metagenomics/
- ClinicalTrials.gov API: https://clinicaltrials.gov/data-api/api

Prefer a real, properly paired multi-modal dataset where available. If no appropriate paired source exists, create **explicitly synthetic** coherent demonstration subjects and relationships with reproducible seed and generation scripts. Maintain dataset_manifest.json containing origin, licence, provenance, version, consent/access, transformation, QC, schema and synthetic flag.

## 9. Demonstration investigation
Use one cross-domain biological question (e.g. tumour immune microenvironment, T-cell functional states and treatment response) without narrowing platform scope. Provide synthetic longitudinal subjects with linked genomics, transcriptomics, proteomics, immune phenotyping, microbiome, metabolomics and neuroimmune fields. Mark associations as illustrative and do not imply causal or clinical validation. Pair these records with genuine retrievable literature and pathway evidence, keeping public and synthetic layers visibly separate.

## 10. Backend architecture
Reuse existing code. Target interfaces:
- Authenticated API gateway with server-verified identity, RBAC/ABAC and tenant isolation.
- Organisation/group/project and invitation services.
- Dataset connector registry, upload pipeline, validation, normalisation, versioning and provenance.
- Scientific retrieval + evidence rights/retraction checks + independent verification.
- Graph query and governed graph persistence.
- Durable agent jobs, idempotency, retry/recovery and cost/latency telemetry.
- Investigation storage, audit trail, export and refresh.
- Collaboration matching using public/explicitly approved metadata, consent and messaging.
- Feature flags and test-only synthetic fixtures.

Never rely on client-supplied researcher IDs or PostgreSQL custom session settings alone as identity proof. Use verified server-side sessions and test two-tenant isolation. No automatic promotion of AI claims to approved graph facts.

## 11. Frontend architecture
Public: home, platform, science domains, how it works, scientific credibility, demonstration.
Authenticated: onboarding wizard, role dashboard, organisation settings, dataset manager, investigation workbench, evidence viewer, graph explorer, contradiction/gap panels, hypothesis workspace, research briefs, collaborator discovery, approval modal, invitation inbox, notifications, audit/access controls.
Each investigation displays source citations, status, confidence/uncertainty, synthetic labels, permission state and reproducibility metadata. Meet keyboard, screen-reader, contrast, mobile and reduced-motion needs.

## 12. Security and governance
Private by default; no cross-tenant disclosure. Data access requires lawful basis, permissions, institutional approvals and relevant agreements. Initial prototype excludes real identifiable patient data. Institutional/clinical expansion requires DPIA where applicable, appropriate UK GDPR conditions, ethics/confidentiality approvals, data minimisation, encrypted storage/transit, retention/deletion controls, auditability and disclosure-risk review. Never train shared models on private institutional data without separate authorisation.

## 13. Scientific evaluation
Independent domain experts adjudicate sampled findings. Measure claim attribution, retrieval quality, retraction/licence compliance, contradiction accuracy, false gap discovery, uncertainty calibration, reproducibility, graph-edge evidence coverage and abstention. Include negative controls, prompt-injection tests, contradictory papers, unsupported hypotheses and missing-data cases.

## 14. End-to-end acceptance criteria
- New user signs up and sees correct role dashboard.
- User creates private project, ingests valid synthetic dataset and receives clear validation/QC.
- Agent retrieves real cited evidence; report separates synthetic observations from public facts.
- Graph nodes/edges open their supporting provenance.
- Contradiction/gap/hypothesis panels show limitations and uncertainty.
- Saved investigation reopens with identical data/source versions.
- Matching displays reasons, only permitted profile data and no private leak.
- Explicit sharing preview, approval, acceptance, rejection and revocation work.
- Second tenant cannot read any private project, dataset, job, graph context or invitation.
- CI, migrations, accessibility, security and deployment smoke tests pass.

## 15. Implementation sequence
**Gate 0:** Evidence-based audit of repository, deployments, existing work, tests, auth, Neon branches, migrations and CI.
**Gate 1:** Repair existing security/persistence blockers before private data ingestion.
**Gate 2:** One coherent synthetic multi-omics dataset and public evidence connectors.
**Gate 3:** Working end-to-end scientific investigation and verified graph/evidence UX.
**Gate 4:** Personalised onboarding and role dashboards.
**Gate 5:** Permissioned researcher profiles, explainable matching and introductions.
**Gate 6:** Adversarial isolation, scientific expert evaluation and demonstrable prototype.
**Gate 7:** Only after validation, plan real institutional data integration and clinical translation.

## 16. Cursor deliverables
Current-state matrix with file/line/test evidence; architecture delta; data dictionary and dataset manifests; UX sitemap and wireframes; API contracts; migration plan; threat model; CI/evaluation plan; prioritised issues/PRs; end-to-end demo script; explicit blockers. Do not report proposed functionality as implemented.
