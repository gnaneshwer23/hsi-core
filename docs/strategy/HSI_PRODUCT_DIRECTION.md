# Human Super Intelligence — Product Direction

## End-to-end product direction

**Product name:** Human Super Intelligence (HSI). Health is the current application domain, not an alternative expansion of the brand name.
**Recorded:** 5 November 2026. Founder-supplied direction, retained below with the name corrected.
**Meaning of this document:** Target product direction, not a statement of deployed functionality, clinical validation, certifications or partner agreements. Existing implementation, evidence and access gates still apply.
**Build alignment:** [Implementation crosswalk and next work package](HSI_PRODUCT_DIRECTION_IMPLEMENTATION.md). Existing requirements authority remains [Master PRD](HSI_MASTER_PRD_v1.md); architecture remains [Document 02](HSI_ARCHITECTURE_AND_DATA.md).

### Reading boundaries

- Human Super Intelligence supplies shared technology. ISI and Aksh retain their own interfaces, databases and product responsibilities. HSI Clinical and HSI Trials remain separately governed product directions.
- In this repository, no live clinical decision support, patient stores, EHR write-back or PHI-to-LLM processing is enabled. The clinical/person-level sections below describe the wider ecosystem's target state; they do not authorise those data flows into `hsi-core`.
- Biological chains and the example patient journey are illustrative research hypotheses. They do not establish causality or justify patient-specific testing. Unmeasured microbiome, SCFA, barrier or immune-cell states remain unknown.
- The proposed stack, month ranges and numerical metrics below are planning suggestions. Reuse the existing Vite/React, Bun/TypeScript and PostgreSQL foundations; evaluate additions through an architecture decision. Delivery depends on acceptance gates, not these illustrative month ranges.
- “Every claim is checked” is a required workflow objective, not a claim of complete scientific verification. Citation resolution, passage support and expert scientific review are distinct checks.

---

**HSI is an evidence-grounded health intelligence platform** that connects a person’s health data, laboratory results, lifestyle signals, biological mechanisms, scientific evidence, and clinical-trial context into transparent, research-grade insights.

Its purpose is not to replace clinicians or make automatic medical decisions. Its purpose is to help researchers, clinicians, and—later—authorised care teams understand **why** a health pattern may be occurring, what evidence supports or contradicts that explanation, what is still unknown, and what should be investigated next.

Trustworthy health AI should be valid, reliable, safe, secure, accountable, transparent, explainable, privacy-enhanced, and fair; it also requires clearly defined human oversight and context-specific validation. [airc.nist](https://airc.nist.gov/airmf-resources/airmf/3-sec-characteristics/)

***

## 1. Product vision

> **HSI connects biological mechanisms, scientific evidence, and authorised health data to help researchers and healthcare professionals understand complex health questions—with traceable reasoning, human oversight, and clearly labelled uncertainty.**

HSI answers questions such as:

- Why might this person have persistent inflammation?
- Which immune, gut, metabolic, or brain pathways could explain this pattern?
- Which biomarkers are relevant, and what do they actually reflect?
- What evidence supports or contradicts a proposed mechanism?
- Which clinical trials or research studies are relevant?
- What evidence is missing, and what should be measured next?

HSI does **not** diagnose, prescribe, or determine trial eligibility on its own.

***

## 2. Who HSI serves

| User | What they need | HSI outcome |
|---|---|---|
| **Biomedical researcher** | Mechanism exploration and evidence synthesis | Evidence-linked mechanism maps and research briefs |
| **Translational scientist** | Biomarker and target hypotheses | Testable hypotheses and evidence-gap analysis |
| **Clinician** | Fast, source-linked context | Evidence summaries—not autonomous decisions |
| **Biotech / pharma team** | Target, biomarker, and trial landscape | Competitive and scientific intelligence |
| **Health app / lab** | Explainable health-data insights | White-label intelligence modules |
| **Patient** | Understandable health information | Future patient-education mode, separate from clinical decision support |

***

## 3. HSI product modules

HSI should be built as one platform with clearly separated modules.

### 1. Health Data Layer

Connects authorised clinical, laboratory, wearable, and lifestyle data.

### 2. Biological Knowledge Graph

Connects cells, tissues, organs, pathways, diseases, biomarkers, medications, and outcomes.

### 3. Evidence Intelligence

Connects claims to scientific literature, datasets, guidelines, and trial evidence.

### 4. AI Research Workbench

Lets users ask questions, explore mechanisms, test hypotheses, and generate research briefs.

### 5. Trial Intelligence

Maps diseases, biomarkers, therapies, trial eligibility, endpoints, and evidence gaps.

### 6. Clinical Intelligence

Builds longitudinal patient context from authorised clinical data.

### 7. Governance and Safety Layer

Controls data access, evidence promotion, AI accountability, privacy, audit trails, and human review.

***

## 4. End-to-end data flow

```text
1. Data sources
   ↓
2. Secure ingestion
   ↓
3. Normalisation and standardisation
   ↓
4. Canonical health and biology model
   ↓
5. Knowledge graph and evidence graph
   ↓
6. AI reasoning and investigation
   ↓
7. Claim verification
   ↓
8. Human review
   ↓
9. Research brief or approved insight
   ↓
10. Continuous learning and improvement
```

### Stage 1: Data sources

HSI can ingest:

| Data type | Examples |
|---|---|
| Clinical records | Diagnoses, encounters, medications, procedures, outcomes |
| Laboratory data | Blood tests, immune markers, metabolic panels, inflammatory markers |
| Wearable data | Sleep, HRV, steps, heart rate, glucose variability |
| Lifestyle data | Diet, exercise, stress, alcohol, smoking |
| Microbiome data | Microbial diversity, SCFAs, dysbiosis markers |
| Omics data | Genomics, transcriptomics, proteomics, metabolomics |
| Scientific literature | Papers, reviews, guidelines, open-access full text |
| Clinical trials | Trial design, eligibility, interventions, endpoints, results |
| Patient-reported data | Symptoms, quality of life, medication adherence |

### Stage 2: Secure ingestion

Data enters through governed adapters.

```text
Hospital EHR → FHIR API → HSI ingestion service
Laboratory system → FHIR / HL7 / custom API → HSI ingestion service
Wearable → device API → time-series ingestion
Research dataset → secure upload / API → validated ingestion
Literature → PubMed / Europe PMC → evidence pipeline
Clinical trials → ClinicalTrials.gov API → trial pipeline
```

Every record receives:

- Source ID
- Ingestion timestamp
- Data classification
- Consent or legal basis
- Licence information
- Quality-control status
- Version identifier

### Stage 3: Normalisation

Raw data is messy. HSI converts it into a common scientific language.

Example:

```text
“CD4 T cell in gut tissue”
→ Cell Ontology ID
→ Uberon tissue ID
→ Disease ontology ID
→ Canonical graph node
→ Context metadata
```

Standards include:

- **HL7 FHIR** for clinical-data interoperability
- **OMOP CDM** for standardised observational research data
- **LOINC** for laboratory tests
- **RxNorm** for medications
- **SNOMED CT** for clinical concepts
- **Cell Ontology, Uberon, MONDO, HPO, Gene Ontology, ChEBI** for biology

FHIR and OMOP are complementary: FHIR supports clinical-data exchange, while OMOP standardises observational data for research analysis. NIH describes FHIR and common data models as resources for integrating and exchanging clinical data for research.

### Stage 4: Canonical model

HSI creates a unified representation of the person and their biology.

```text
Patient profile
├── Conditions
├── Lab results
├── Medications
├── Symptoms
├── Lifestyle factors
├── Wearable signals
├── Microbiome features
├── Immune-cell profile
├── Omics profile
└── Outcomes
```

This becomes the input for biological reasoning.

***

## 5. The HSI knowledge graph

The knowledge graph is HSI’s scientific backbone.

It connects:

```text
Cells → cell states → molecules → pathways → tissues → organs
→ biomarkers → symptoms → diseases → disease stages
→ medications → interventions → outcomes → clinical trials
→ evidence → hypotheses
```

### Example: metabolic inflammation

```text
Low-fibre diet
→ altered gut microbiome
→ reduced SCFA production
→ gut-barrier stress
→ immune activation
→ IL-6 / TNF signalling
→ insulin resistance
→ worsening HbA1c
```

### Example: immune disease

```text
Dendritic cell
→ antigen presentation
→ CD4 T-cell activation
→ Th17 differentiation
→ IL-17 production
→ neutrophil recruitment
→ psoriasis inflammation
```

### Example: treatment

```text
Pembrolizumab
→ inhibits PD-1
→ reduces PD-1/PD-L1 immune suppression
→ restores CD8 T-cell activity
→ may improve melanoma control
→ evaluated in KEYNOTE-006
```

Every edge includes:

- Direction
- Relationship type
- Biological context
- Evidence status
- Source
- Confidence
- Review status
- Graph version

***

## 6. How HSI analyses data

HSI uses **hybrid retrieval and bounded AI reasoning**.

### Step 1: User asks a question

Example:

> “Why might this patient have persistent inflammation and worsening glycaemic control?”

### Step 2: Question planner

The planner breaks the question into research tasks:

- Identify the outcome
- Identify relevant conditions and biomarkers
- Identify immune, gut, metabolic, and lifestyle pathways
- Retrieve evidence
- Look for contradictions
- Identify missing data
- Propose testable hypotheses

### Step 3: Entity resolution

HSI maps language to canonical entities.

```text
“High CRP”
→ hs-CRP biomarker
→ inflammatory marker
→ possible immune activation
→ requires context before interpretation
```

### Step 4: Hybrid retrieval

HSI combines:

| Method | What it finds |
|---|---|
| Vector search | Similar research passages and concepts |
| Graph traversal | Biological paths across cells, pathways, and diseases |
| Keyword search | Exact biomarkers, drugs, trials, and genes |
| Metadata filters | Human studies, gut tissue, disease stage, evidence type |

### Step 5: Mechanism reasoning

The graph reasoner builds possible biological paths.

```text
Poor sleep
→ autonomic stress response
→ inflammatory signalling
→ insulin resistance
→ worsening glucose control
```

It also considers alternatives:

```text
Recent infection
→ temporary inflammatory response
→ unrelated to long-term metabolic change
```

### Step 6: Interrogative verification

HSI agents ask follow-up questions to test the conclusion:

- Is inflammation acute or chronic?
- Is there evidence of infection?
- Are inflammatory markers consistently elevated?
- Is there gut-barrier or microbiome evidence?
- Is insulin resistance independent of inflammation?
- Could medication or lifestyle explain the pattern?
- What evidence contradicts each proposed mechanism?
- What data is missing?

The result is a transparent decision tree, not a single overconfident answer.

### Step 7: Claim verification

Every AI-generated claim is checked against evidence.

```text
AI claim
→ Extract factual assertions
→ Retrieve supporting passages
→ Check biological context
→ Detect contradictions
→ Assign evidence status
→ Flag unsupported claims
```

Evidence states include:

| Status | Meaning |
|---|---|
| Supported | Evidence directly supports the claim in context |
| Contested | Credible evidence disagrees |
| Context-limited | True only under specific conditions |
| Inconclusive | Evidence is mixed or insufficient |
| Not curated | Evidence may exist but has not been reviewed |
| No direct evidence identified | Nothing relevant found in searched sources |
| AI draft | Generated hypothesis, not established fact |
| Synthetic demo | Test data, never scientific evidence |

### Step 8: Human review

AI prepares; accountable humans decide.

```text
AI hypothesis
→ Evidence mapping
→ Expert review
→ Approved / revised / rejected
→ Versioned graph update
→ Audit trail
```

AI-generated output must remain interpretable, context-specific, and subject to documented human oversight; NIST’s AI RMF emphasises documented test methods, metrics, human oversight, and validation for intended use. [airc.nist](https://airc.nist.gov/airmf-resources/playbook/map/)

***

## 7. HSI outcomes

HSI produces different outputs for different users.

### For researchers

- Evidence-linked mechanism map
- Biomarker hypothesis
- Research-gap analysis
- Testable experiment plan
- Reproducible research brief

### For clinicians

- Source-linked evidence summary
- Longitudinal patient-context view
- Relevant research and trial context
- No autonomous diagnosis or treatment recommendation

### For biotech and pharma

- Target landscape
- Biomarker stratification hypotheses
- Trial landscape
- Competitive evidence analysis
- Evidence-gap report

### For labs and health apps

- Explainable lab-report insights
- Trend interpretation
- Research-grade context
- White-label intelligence modules

### For patients — future mode

- Plain-language explanations
- Education only
- No diagnosis, treatment recommendation, or trial-enrolment decision

***

## 8. Example end-to-end journey

### Input

```text
Synthetic patient:
52-year-old woman
Early type 2 diabetes
HbA1c 6.8%
hs-CRP 4.2 mg/L
IL-6 elevated
Low HRV
Poor sleep
Low-fibre diet
Bloating and fatigue
Metformin
```

### HSI question

```text
Why might this patient have persistent inflammation
and worsening glycaemic control?
```

### HSI analysis

```text
1. Identify outcome:
   Persistent inflammation + worsening glycaemic control

2. Retrieve patient context:
   HbA1c, CRP, IL-6, sleep, HRV, diet, medications

3. Build biological paths:
   Low-fibre diet → microbiome change → reduced SCFAs
   → gut-barrier stress → immune activation
   → IL-6/TNF signalling → insulin resistance
   → higher HbA1c

4. Consider alternatives:
   Recent infection
   Poor sleep and stress
   Medication effects
   Autoimmune activity

5. Retrieve evidence:
   Supporting and conflicting studies

6. Identify uncertainty:
   No microbiome sequencing
   No longitudinal immune profiling
   No infection markers

7. Generate hypotheses:
   Gut-driven immune activation
   Sleep/stress-driven metabolic inflammation
   Temporary infection-related inflammation

8. Recommend next measurements:
   Faecal SCFAs
   Calprotectin
   Cytokine panel
   Continuous glucose monitoring
   HRV and sleep tracking
```

### HSI output

```text
Conclusion:
No single cause is established.

Most testable hypothesis:
Gut-driven immune activation and poor sleep may jointly
contribute to inflammation and glycaemic instability.

Evidence status:
Context-limited

Confidence:
Low

Recommended next step:
Collect longitudinal microbiome, inflammatory, sleep,
and glucose-variability data.

Status:
AI-generated research hypothesis — requires review.
Not a diagnosis or treatment recommendation.
```

***

## 9. Technology architecture

```text
┌────────────────────────────────────────────┐
│              HSI Experience                │
│ Research workbench • Graph • Briefs • APIs │
└─────────────────────┬──────────────────────┘
                      │
┌─────────────────────▼──────────────────────┐
│           Agent Orchestration              │
│ Planner • Retrieval • Reasoning • Verify   │
└─────────────────────┬──────────────────────┘
                      │
┌─────────────────────▼──────────────────────┐
│             Tool & Data Layer              │
│ FHIR • OMOP • Literature • Trials • Omics  │
└─────────────────────┬──────────────────────┘
                      │
┌─────────────────────▼──────────────────────┐
│      Evidence & Provenance Layer           │
│ Claims • Sources • Context • Audit trail   │
└─────────────────────┬──────────────────────┘
                      │
┌─────────────────────▼──────────────────────┐
│        Canonical Knowledge Core            │
│ Ontologies • Knowledge graph • Evidence    │
└────────────────────────────────────────────┘
```

### Recommended MVP stack

| Layer | Technology |
|---|---|
| Frontend | Next.js, React, TypeScript |
| Graph database | Neo4j, Memgraph, or PostgreSQL + Apache AGE |
| Vector database | pgvector or Qdrant |
| Clinical interoperability | HL7 FHIR |
| Research data model | OMOP CDM |
| Literature | PubMed / Europe PMC |
| Pathways | Reactome |
| Trials | ClinicalTrials.gov API |
| AI orchestration | LangGraph or custom Python workflow engine |
| LLMs | Frontier model for reasoning; smaller model for extraction and verification |
| Evaluation | Python evaluation harness and expert-review dashboard |
| Security | OAuth 2.0, RBAC, encryption, audit logs, tenant isolation |

***

## 10. Agent layer

HSI uses bounded agents, not one autonomous super-agent.

| Agent | Responsibility |
|---|---|
| **Question Planner** | Breaks a question into an investigation plan |
| **Entity Resolver** | Maps text to canonical biomedical entities |
| **Evidence Retriever** | Finds papers, datasets, trials, and passages |
| **Graph Reasoner** | Builds biological mechanism paths |
| **Interrogator** | Generates follow-up questions to test conclusions |
| **Contradiction Analyst** | Finds conflicting or context-limited evidence |
| **Hypothesis Generator** | Drafts testable explanations and experiments |
| **Trial Intelligence Agent** | Maps trials, eligibility themes, and evidence gaps |
| **Claim Verifier** | Checks every claim against evidence |
| **Safety & Policy Gate** | Blocks unsupported, unsafe, or out-of-scope claims |

Every agent has:

- A narrow task
- Allowed tools
- Retry and token limits
- Required output schema
- Audit logging
- Human-review checkpoint where needed

***

## 11. Data governance

HSI separates four data classes:

| Data class | Example | Rule |
|---|---|---|
| **Public biomedical** | Literature, pathways, public trials | Usable with licence and provenance |
| **Synthetic** | Demo patients and fake lab data | Never evidence-bearing |
| **Licensed / partner** | Omics, proprietary datasets | Contract-bound and access-controlled |
| **Patient-identifiable clinical** | EHR, identifiable labs, genomic data | Isolated, consent-bound, minimised, encrypted, audited |

Patient-identifiable information must not enter public research environments unless an explicitly authorised, legally compliant workflow permits it. Responsible genomic and health-data sharing should be guided by privacy, human rights, non-discrimination, and procedural fairness. [ga4gh](https://www.ga4gh.org/product/framework-for-responsible-sharing-of-genomic-and-health-related-data/)

***

## 12. Product roadmap

### Phase 1 — Evidence foundation

**Months 1–3**

- Build canonical data model
- Build knowledge graph
- Ingest public literature, pathways, ontologies, and trials
- Add provenance and evidence states
- Create synthetic sandbox for demos

### Phase 2 — Research workbench

**Months 4–6**

- Build question-to-brief workflow
- Add hybrid retrieval
- Add graph reasoning
- Add claim verification
- Add human-review queue

### Phase 3 — Health-data connection

**Months 7–9**

- Add FHIR ingestion
- Add OMOP normalisation
- Add lab, medication, and longitudinal patient context
- Add governed patient-consent workflows

### Phase 4 — Multimodal intelligence

**Months 10–12**

- Add omics, microbiome, wearable, and imaging adapters
- Add biomarker discovery
- Add disease-progression reasoning
- Add trial intelligence and evidence-gap analysis

### Phase 5 — Controlled translation

**Months 12+**

- Add clinician-review workflow
- Add clinical decision-support evaluation
- Add patient-education mode
- Complete regulatory, safety, and privacy assessment before clinical use

***

## 13. Success metrics

| Metric | Target |
|---|---|
| Citation validity | At least 98% of sampled citations resolve and support the cited passage |
| Claim grounding | At least 90% of factual claims rated supported by expert reviewers |
| Critical unsupported claims | Zero in safety-critical evaluation suite |
| Contradiction detection | At least 80% recall on expert-labelled conflicts |
| Entity resolution | At least 95% for priority biomedical entities |
| Research-brief reproducibility | 100% preserve sources, graph version, prompts, tools, and timestamps |
| Researcher usefulness | At least 80% of pilot users rate briefs useful |
| Synthetic-data leakage | Zero synthetic records treated as real evidence |
| Human oversight | 100% of consequential outputs have documented review status |

NIST recommends documenting test sets, metrics, evaluation tools, human oversight, limitations, and downstream user actions as part of trustworthy AI measurement. [airc.nist](https://airc.nist.gov/docs/AI_RMF_Playbook.pdf)

***

## 14. Strategic positioning

HSI should not be positioned as:

- A diagnosis engine
- A replacement for clinicians
- A general-purpose medical chatbot
- A black-box prediction system
- A platform that claims 100% accuracy

HSI should be positioned as:

> **A transparent health-intelligence platform that connects health data, biological mechanisms, scientific evidence, and clinical-trial context—while making uncertainty, evidence quality, and human oversight visible.**

## Final principle

> **HSI turns fragmented health data into evidence-linked understanding: what is known, what is uncertain, what conflicts, what is missing, and what should be investigated next.**

That is the end-to-end HSI direction: **connect data responsibly, reason biologically, verify every claim, keep humans accountable, and expand only as evidence and governance mature.** [airc.nist](https://airc.nist.gov/airmf-resources/airmf/3-sec-characteristics/)
