# HSI — End-to-End Vision & Technology Architecture

**Status:** Ambition doctrine + proposed delivery sequence (19 November 2026, Europe/London).  
**Does not claim** that every capability is production-ready, that patient data is live, or that dual-provider verification / source-rights / scientific benchmarking gates are closed.  
**Binding companions:** [`HSI_VISION.md`](./HSI_VISION.md) · [`HSI_DEFINITIVE_PRODUCT_VISION.md`](./HSI_DEFINITIVE_PRODUCT_VISION.md) · [`../CDS_PHI_BOUNDARY.md`](../CDS_PHI_BOUNDARY.md) · capability register / `docs/STATUS.md`.

## Definitive positioning

**HSI is a connected scientific intelligence ecosystem that brings together researchers, biological systems, biomedical evidence and governed research data to accelerate cross-disciplinary discovery, collaboration and evidence-grounded scientific decisions.**

Central principle (unchanged):

> Understand the mechanism. Preserve the evidence. Explain the uncertainty. Inform the next decision.

### Disease-agnostic (binding correction)

Systemic sclerosis (SSc), CD4+ T-cell examples, and the illustrative professor laboratory are **demonstration scenarios only**. They are **not** the scientific scope, product boundary, architecture limit or roadmap focus of HSI.

HSI must support researchers across the spectrum of human biology and biomedical science (immunology, neuroscience, microbiome, metabolism, genomics/omics, physiology, oncology, cardiovascular biology, infectious diseases, and other biomedical domains). A researcher in Alzheimer’s, diabetes, cancer, SSc or cardiovascular disease should receive the same depth of scientific intelligence. Cross-domain investigation must not be restricted by department.

Validation may remain incremental (selected use cases first) without hardcoding the platform around those diseases.

Public positioning remains **one scientific intelligence technology** (Living Knowledge Graph, evidence, experimental context, scientific investigation) — not a marketed multi-product portfolio. Historical ownership planes stay for governance only.

---

## 1. Master vision — end-to-end ecosystem

```mermaid
flowchart TB
    H["HUMAN SUPER INTELLIGENCE"]
    H --> USERS["Users and Organisations"]
    H --> SCI["Scientific Intelligence"]
    H --> DATA["Research Data"]
    H --> COLLAB["Collaboration and Opportunities"]
    USERS --> IND["Individual Researchers"]
    USERS --> UNI["Universities and Institutes"]
    USERS --> BIO["Biotech and Pharma"]
    USERS --> LAB["Research Laboratories"]
    UNI --> DEPT["Departments"]
    DEPT --> GROUP["Research Groups"]
    GROUP --> PI["Professors / Principal Investigators"]
    GROUP --> MEMBERS["Postdocs / PhD / MSc Researchers"]
    SCI --> IMM["Immunology"]
    SCI --> MIC["Microbiome"]
    SCI --> NEU["Neurobiology"]
    SCI --> MET["Metabolism"]
    SCI --> GEN["Genomics and Omics"]
    SCI --> PHY["Physiology and Fibrosis"]
    SCI --> ONC["Oncology"]
    SCI --> CAR["Cardiovascular"]
    SCI --> INF["Infectious Diseases"]
    SCI --> OTH["Other Biomedical Domains"]
    DATA --> PUB["Publications and Evidence"]
    DATA --> TRIAL["Clinical Trials"]
    DATA --> EXP["Experimental and Omics Data"]
    DATA --> PAT["Approved Patient Research Cohorts"]
    COLLAB --> COMMUNITY["Research Circles"]
    COLLAB --> PARTNER["Institutions and Companies"]
    COLLAB --> FUND["Funding and Careers"]
    IND --> CORE["HSI Scientific Intelligence Engine"]
    PI --> CORE
    MEMBERS --> CORE
    BIO --> CORE
    LAB --> CORE
    IMM --> CORE
    MIC --> CORE
    NEU --> CORE
    MET --> CORE
    GEN --> CORE
    PHY --> CORE
    ONC --> CORE
    CAR --> CORE
    INF --> CORE
    OTH --> CORE
    PUB --> CORE
    TRIAL --> CORE
    EXP --> CORE
    PAT --> GOV["Privacy / Ethics / Access Governance"]
    GOV --> CORE
    COMMUNITY --> CORE
    PARTNER --> CORE
    FUND --> CORE
    CORE --> KG["Living Biomedical Knowledge Graph"]
    KG --> VERIFY["Evidence Verification and Uncertainty"]
    VERIFY --> DISC["Cross-Domain Scientific Discovery"]
    DISC --> DEC["Research Decision Intelligence"]
    DEC --> OUT["Research Briefs / Hypotheses / Collaboration / Publication"]
```

Organisational, scientific and research-data systems stay connected while permissions and evidence standards remain distinct. Private PHI must not auto-enter the research graph; no live CDS in `hsi-core`.

---

## 2. University enterprise — professor and student journey

```mermaid
flowchart TD
    A["HSI Website"]
    B["Sign Up / Sign In"]
    C{"Choose Workspace"}
    A --> B --> C
    C --> I["Individual Researcher"]
    C --> E["Enterprise Organisation"]
    E --> U["University / Institute"]
    U --> D["Departments"]
    D --> G["Research Groups"]
    G --> P["Professor Dashboard"]
    G --> S["Researcher Dashboards"]
    P --> P1["Research Team Overview"]
    P --> P2["Scientific Project Tree"]
    P --> P3["Cross-Domain Opportunity Radar"]
    P --> P4["Shared Investigations"]
    P --> P5["Approved Cohort Insights"]
    P --> P6["Funding / Industry / Collaborators"]
    S --> S1["Personal Research Profile"]
    S --> S2["Topic-Specific Paper Alerts"]
    S --> S3["AI Research Assistant"]
    S --> S4["Cross-Domain Explorer"]
    S --> S5["Research Circles"]
    S --> S6["Publication Quality Workspace"]
    I --> S
    P4 --> SH["Permission-Aware Shared Research"]
    S3 --> SH
    S5 --> SH
    SH --> REV["Scientific Review and Decisions"]
```

**Demonstration scenario (not product boundary):** A professor leads a research group with postdocs, PhD and master’s researchers. Each researcher owns a personalised profile; the professor inspects only authorised shared projects, overlaps and candidate gaps — never private notes or unpublished restricted work by default.

Engineering preview shells (PR1): `/enterprise`, `/enterprise/professor`, `/enterprise/student` — demonstration-labelled; see [`../engineering/ENTERPRISE_DASHBOARD_GAP_MATRIX.md`](../engineering/ENTERPRISE_DASHBOARD_GAP_MATRIX.md).

---

## 3. Scientific discovery — cross-domain opportunities

HSI does not stop at retrieving papers about one mechanism. It helps investigators compare candidate relationships **across** biological domains.

```mermaid
flowchart TD
    S["Disease / Mechanism Investigation"]
    S --> I["Immune Dysregulation"]
    S --> F["Fibrosis / Tissue Remodelling"]
    S --> V["Vascular / Organ Context"]
    I --> CD4["Immune Cell Programmes"]
    I --> BC["B-cell / Antibody Biology"]
    I --> SIG["Signalling Axes"]
    F --> FB["Stromal / Fibroblast Programmes"]
    V --> END["Endothelial / Vascular Biology"]
    S -.-> GUT["Gut Microbiome"]
    S -.-> NEU["Neuroimmune Biology"]
    S --> OM["Genomics and Omics"]
    S --> CLIN["Clinical Phenotypes"]
    GUT -.-> GM["Microbial Metabolites"]
    GM -.-> CD4
    NEU -.-> NS["Neural / Immune Signals"]
    NS -.-> V
    OM --> CELL["Cell States / Gene Expression"]
    CLIN --> AB["Phenotype Markers"]
    CD4 --> QUESTION["Cross-Domain Research Questions"]
    BC --> QUESTION
    FB --> QUESTION
    GM --> QUESTION
    NS --> QUESTION
    CELL --> QUESTION
    AB --> QUESTION
    QUESTION --> EVID["Retrieve and Compare Evidence"]
    EVID --> CONFLICT["Check Context and Contradictions"]
    CONFLICT --> GAP["Identify Candidate Knowledge Gaps"]
    GAP --> HYP["Generate Testable Hypotheses"]
    HYP --> EXP["Suggest Discriminating Experiments"]
    EXP --> REVIEW["Scientific Review"]
```

Dashed edges are **exploratory**, not established causation. Every connection must carry provenance, experimental context (Context Passport), uncertainty and review status (candidate vs reviewed).

---

## 4. AI research engine — question to verified brief

```mermaid
flowchart TD
    Q["Research Question"]
    Q --> PLAN["Investigation Planning"]
    PLAN --> SEARCH["Source Discovery"]
    SEARCH --> RIGHTS{"Rights / Source Integrity Check"}
    RIGHTS -->|Approved| EXTRACT["Evidence Extraction"]
    RIGHTS -->|Restricted / Unclear| BLOCK["Exclude or Restrict Content"]
    EXTRACT --> CTX["Evidence Context Passport"]
    CTX --> KG["Context-Aware Knowledge Graph"]
    KG --> COMP["Structured Evidence Comparison"]
    COMP --> M1["Independent Model Assessment A"]
    COMP --> M2["Independent Model Assessment B"]
    M1 --> ADJ["Compare Assessments"]
    M2 --> ADJ
    ADJ --> DEC{"Agreement and Evidence Quality"}
    DEC -->|Sufficient| CLAIM["Qualified Scientific Finding"]
    DEC -->|Conflicting| CON["Contradiction Investigation"]
    DEC -->|Insufficient| ABS["Abstain / Evidence Gap"]
    CLAIM --> REV["Scientific Review / Governance"]
    CON --> REV
    ABS --> REV
    REV --> BRIEF["Versioned Research Decision Brief"]
    BRIEF --> ACTION["Research / Experiment / Collaboration Decision"]
    ACTION --> FEED["New Evidence and Feedback"]
    FEED --> PLAN
```

**Honesty:** This is the intended scientific workflow. Existing HSI components cover parts of it. Production provider verification, source-rights approval, scientific benchmarking and durable end-to-end acceptance remain **gates** — soft-land catalogs must not invent credentials, independence proofs or gate pass.

---

## 5. Translational research — approved patient data (future governed)

```mermaid
flowchart TD
    P["Approved Patient Research Cohort"]
    P --> G["Ethics / Consent or Lawful Basis / Data Governance"]
    G --> SEC["Project-Specific Access and Pseudonymisation"]
    SEC --> CL["Clinical Phenotypes"]
    SEC --> LAB["Laboratory Measurements"]
    SEC --> OM["Omics / Microbiome"]
    SEC --> TX["Treatment and Outcomes"]
    CL --> COHORT["Governed Cohort Analysis"]
    LAB --> COHORT
    OM --> COHORT
    TX --> COHORT
    LIT["Published Biomedical Evidence"] --> COMP["Research Evidence Comparison"]
    COHORT --> COMP
    COMP --> ASSOC["Associations and Subgroup Patterns"]
    ASSOC --> HYP["Mechanistic Hypotheses"]
    HYP --> TEST["Statistical and Experimental Validation"]
    TEST --> REV["Researcher / Ethics / Scientific Review"]
    REV --> RESULT["Qualified Translational Research Findings"]
    RESULT --> PAPER["Publication / Future Study"]
    RESULT --> NEW["New Research Questions"]
```

**Not authorised live patient integration.** First implementations use synthetic or appropriately licensed public research datasets until ethics, security and access controls are approved. No identifiable uploads or PHI→LLM in `hsi-core`.

---

## 6. Proposed implementation roadmap

```mermaid
flowchart TD
    A["Phase 0: Secure Existing HSI Foundation"]
    B["Phase 1: Professor and Student Dashboards"]
    C["Phase 2: Research Groups and Permissions"]
    D["Phase 3: Cross-Domain Research Intelligence Tree"]
    E["Phase 4: Personalised Literature and Alerts"]
    F["Phase 5: Shared Investigations and Research Circles"]
    G["Phase 6: Scientific Quality and Publication Tools"]
    H["Phase 7: Research Opportunity and Industry Intelligence"]
    I["Phase 8: Governed Translational Research Pilot"]
    J["Phase 9: Multi-Department Enterprise Deployment"]
    K["Phase 10: Federated Scientific Discovery Ecosystem"]
    A --> B --> C --> D --> E --> F --> G --> H --> I --> J --> K
```

Proposed delivery sequence — **not** a claim that each phase is complete or that all phases are required before a pilot. Reuse existing substrate, investigation workspace, graph, passport, dual-model harness and fail-closed gates. Do not lift held migrations or invent MoUs from green PRs.

| Phase | Near-term engineering note |
| --- | --- |
| 0 | Soft-lands, isolation, clearance, rate limits — in flight / merged catalogs |
| 1 | Enterprise shells `#513` (demo-labelled; human merge) |
| 2+ | Profiles, membership UI, live tree/feed — still no unapproved persistence |

---

## 7. Multi-stakeholder workspaces (one engine, many shells)

HSI is **not** only for professors, PhD students or universities. It should serve the wider biomedical research ecosystem. The **scientific intelligence engine stays shared**; dashboards, permissions and workflows vary by stakeholder.

### Proposed workspace architecture

```mermaid
flowchart TD
    H["HSI Scientific Intelligence Platform"]
    H --> AUTH["Identity / Organisation / Permissions"]
    AUTH --> A["Individual Research Workspace"]
    AUTH --> B["Academic and Research Group Workspace"]
    AUTH --> C["Biotech / Pharma R and D Workspace"]
    AUTH --> D["Clinical Research Workspace"]
    AUTH --> E["Laboratory and Omics Workspace"]
    AUTH --> F["Research Network Workspace"]
    A --> CORE["Shared Scientific Intelligence Engine"]
    B --> CORE
    C --> CORE
    D --> CORE
    E --> CORE
    F --> CORE
    CORE --> KG["Biomedical Knowledge Graph"]
    CORE --> EV["Evidence and Verification"]
    CORE --> CROSS["Cross-Domain Investigation"]
    CORE --> GAP["Research Gaps and Hypotheses"]
    CORE --> COL["Collaboration and Research Decisions"]
```

| Workspace | Primary users | Focus (proposed) | Status |
| --- | --- | --- | --- |
| Individual research | Independent / early researchers | Profile, investigations, alerts | Demo shell `/workspaces/researcher` + `/research/*` |
| Academic & research group | PI, postdocs, PhD, MSc | Team tree, supervision, shared projects | Demo `/workspaces/professor` · `/workspaces/student` (+ PR1 `/enterprise/*`) |
| Biotech / pharma R&D | Discovery, translational, medical affairs | Targets, mechanisms, landscape, portfolio | Demo shell `/workspaces/biotech` |
| Clinical research | Clinician-scientists, CROs | Approved cohorts, phenotypes, trials research | Demo `/workspaces/clinical` — cohorts **disabled**; not CDS; PHI gated |
| Laboratory & omics | Core facilities, bioinformaticians | Assays, omics interpretation, reproducibility | Demo shell `/workspaces/laboratory` |
| Research network | Societies, consortia | Circles, shared reviews, challenges | Demo shell `/workspaces/community` |
| University / enterprise admin | Research administrators | Departments, roles, subscriptions | Demo shell `/workspaces/enterprise` (roles ≠ seats) |
| Patients / participants | Research participants | Consent, contribution, updates | **Future separate governed experience** — not the scientific dashboard |

Interactive concept hub: `/workspaces` (shared navigation, domain map, evidence cards, AI panels).

### Roles vs subscriptions

- **Role** = what a user is authorised to do (server-side grants, tenant membership, project sharing).
- **Subscription** = commercial capability / usage limits.

An institutional subscription must **not** automatically unlock confidential scientific data for every university administrator. Patient/PHI paths remain separately governed (`CDS_PHI_BOUNDARY`).

### Market sequence (proposed, not domain restriction)

1. Individual researchers and small academic groups  
2. Biotech discovery / translational teams  
3. University departments / institutes  
4. Laboratory and omics teams  
5. Clinical research organisations  
6. Patients / research participants (separate regulated path)

Collaboration across organisations must stay permission-aware: no automatic exposure of confidential company data, unpublished university results or patient records.

---

## One-sentence vision

HSI connects people, biological mechanisms, scientific evidence and governed research data into one collaborative intelligence system that helps scientists discover opportunities, evaluate uncertainty, design better investigations and produce more rigorous research.

**Strongest early demonstration (scenario, not scope):** a research group collaboratively investigating immune, stromal and cross-domain mechanisms with evidence-linked AI investigations and permission-aware workspaces — using whatever disease focus the group actually studies.
