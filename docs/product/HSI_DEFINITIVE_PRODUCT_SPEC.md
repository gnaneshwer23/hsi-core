# Human Super Intelligence — Definitive Product Specification

**Status:** Canonical product direction (founder consolidation, 2026-11-08)  
**Motto:** Consolidating the vision, not restarting it.  
**Meaning:** One definitive outcome specification against which existing code is finished. This is **not** a claim that every function is operational, scientifically validated, or production-cleared.

**Binding companions**

| Document | Role |
|----------|------|
| [`../engineering/HSI_CAPABILITY_REGISTER_2026-11-08.md`](../engineering/HSI_CAPABILITY_REGISTER_2026-11-08.md) | Single capability inventory (execution step 01) |
| [`../engineering/HUMAN_QUEUE_RESIDUALS.md`](../engineering/HUMAN_QUEUE_RESIDUALS.md) | Human queue #2/#3/#4/#5/#8 stays **PARKED** |
| [`../CDS_PHI_BOUNDARY.md`](../CDS_PHI_BOUNDARY.md) | No live CDS / PHI in HSI |
| [`../NEON_PROJECT_MAP.md`](../NEON_PROJECT_MAP.md) | HSI Neon = red-wave only (never autumn-snow) |

**Honesty gates (unchanged)**

- No invented MoU / `legalBinding=true`
- No Gate C auto-approve
- No live CDS-PHI / EHR write-back in this repo
- Synthetic fixtures ≠ clinical or scientific gold
- Docs and scaffolds ≠ scientifically validated

---

## 1. The definitive HSI product

Human Super Intelligence is an **evidence-grounded biomedical research and translational intelligence SaaS platform**, centred on the immune system and its connections across human biology.

Its purpose is to connect existing scientific knowledge, biological mechanisms, authorised human health data, therapeutic development and clinical outcomes to answer five questions:

1. What do we know?
2. What evidence supports or contradicts it?
3. What remains unknown, inadequately studied or poorly translated into human medicine?
4. What research, data or experiments could resolve those gaps?
5. How do new findings change our understanding of disease, treatment and future research priorities?

This definition preserves the Living Health Knowledge Graph, the Human Intelligence Nexus, specialised AI agents (as logical capabilities), the evidence ledger and the existing HSI ecosystem.

**Boundary:** HSI is **not** primarily an in-silico drug-design or biological simulation platform. It may use existing computational research as evidence. Its central value is integrating, interrogating, verifying and translating knowledge into actionable research.

---

## 2. Established architecture (fixed)

The established architecture remains the reference. New articles, competitor examples and diagrams are evaluated as possible improvements — not reasons to restart.

```text
Human Super Intelligence
  Research, evidence and translational intelligence

  Human Intelligence Nexus
    Question understanding · Agent orchestration · Evidence reasoning · Research guidance

  Living Health Knowledge Graph
    Immune cells · Tissues · Organs · Diseases · Microbiome · Neural pathways · Omics · Therapies · Evidence

  Scientific evidence          Clinical evidence           Development landscape
  Publications, datasets       Authorised cohorts,         Targets, companies, trials
  and studies                  EHR, outcomes

  Continuous knowledge
  New findings, versions, contradictions

  Actionable Research Intelligence
  Evidence synthesis · Gap verification · Research planning · Translation analysis · Reproducible outputs
```

Aksh Health, HSI Clinical, Immune Super Intelligence (ISI) and HSI Trials remain **separately governed** products or experiences that can integrate with HSI. They do not replace HSI’s independent intelligence capabilities or force separate engines.

---

## 3. What HSI must deliver to a scientist

Target question (illustrative; no scientific results asserted):

> Investigate unresolved immune mechanisms in systemic sclerosis. Compare human and animal evidence, identify treatment-response gaps, relevant clinical trials, active research groups and the most promising next investigations.

The platform should produce a **structured investigation**, not just a chatbot answer.

### Investigation output 01–06

| # | Section | Scientist outcome |
|---|---------|-------------------|
| **01** | Scientific landscape | Concise synthesis of immune-cell involvement, tissue mechanisms, progression, therapies and major directions — linked to source evidence |
| **02** | Evidence comparison | Where studies agree or disagree across human tissue, cohorts, mouse, in-vitro and treatment outcomes **without** conflating biological context |
| **03** | Gap intelligence | Ranked, source-supported research questions with coverage, uncertainty, competing explanations and verification status |
| **04** | Translational intelligence | Targets, approaches, companies, institutions, registered trials and reported outcomes with source dates and status |
| **05** | Research action plan | Testable questions, patient characteristics, datasets, experiments, comparisons, collaborators and evidence needed |
| **06** | Evidence package | Downloadable maps, study tables, citations, permitted passages, methods, exclusions, uncertainties and reproducible records |

This outcome drives the software — not agent counts, dashboards, migrations or technical milestones alone.

---

## 4. Evidence must work forward and backward

```mermaid
flowchart LR
  SRC[Original scientific source] --> EXT[Extracted finding and study context]
  EXT --> CLM[Evidence-linked claim]
  CLM --> REL[Knowledge graph relationship]
  REL --> INV[AI investigation and comparison]
  INV --> GAP[Research gap or hypothesis]
  GAP --> NEXT[Recommended next research]
  NEW[New external evidence / results] --> SRC
  NEXT -.->|reverse trace| GAP
  GAP -.->|reverse trace| INV
  INV -.->|reverse trace| REL
  REL -.->|reverse trace| CLM
  CLM -.->|reverse trace| EXT
  EXT -.->|reverse trace| SRC
```

```text
Forward:  source → finding/context → claim → graph relationship → investigation → gap/hypothesis → next research
Backward: next research ← gap ← investigation ← relationship ← claim ← finding ← original source
Continuous: new evidence → re-verify / version (human approval for promoted claims)
```

**Forward:** From a publication, dataset or clinical observation, HSI identifies biological relationships, compares them with other evidence and determines what research questions arise.

**Backward:** From a suggested research opportunity, the scientist can inspect the exact claims, original studies, experimental context, supporting and conflicting findings, and the reasoning used to reach that recommendation.

Consequences:

- An AI-generated hypothesis is never presented as an established finding.
- A missing paper is not automatically a scientific gap.
- A mouse result is not silently promoted to a human treatment conclusion.
- Continuous learning may update indexes and flag prior conclusions; it must **not** silently overwrite approved scientific claims or retrain on unverified material.

---

## 5. AI-agent system (logical capabilities — not a new catalogue)

Retain the existing agent architecture. The Human Intelligence Nexus orchestrates specialist capabilities according to the research question. The researcher interacts with **one** research assistant; orchestration handles specialists in the background.

| Agent capability | What it contributes |
|------------------|---------------------|
| Research Orchestrator | Understands the question and coordinates the investigation |
| Evidence Investigator | Finds, filters and compares scientific literature and datasets |
| Immune Cell Investigator | Explores cell lineages, states, functions and tissue relationships |
| Mechanism Investigator | Connects pathways, molecular signals and disease biology |
| Microbiome / Neuroimmune Investigator | Investigates cross-system biological relationships |
| Clinical Evidence Investigator | Examines permitted human cohorts, disease trajectories and outcomes |
| Contradiction Investigator | Identifies conflicting findings and their biological contexts |
| Research Gap Investigator | Tests whether a proposed gap is genuine or a coverage limitation |
| Therapeutic / Trial Investigator | Maps drug targets, development programmes and clinical studies |
| Research Planning Agent | Proposes evidence requirements, analyses and next experiments |
| Evidence Verifier | Checks source grounding, context, uncertainty and traceability |

These are **logical responsibilities**. Naming an agent in the repository is not proof that it performs scientific investigation. Audit which are working services, deterministic workflows, or conceptual only — see the capability register.

---

## 6. Existing GitHub implementation (preserve / improve)

| Existing work | Preserve or improve? | Next engineering action |
|---------------|----------------------|-------------------------|
| Immune-cell spine and biological relationship vocabulary | Preserve and expand | Curate broader cell, tissue and disease coverage |
| Living graph and evidence/claim contracts | Preserve | Connect graph navigation to question-specific investigations |
| Source provenance, versions and review records | Preserve | Expose reverse evidence tracing directly in research results |
| RA and SSc evidence packages | Preserve | Use as initial scientifically bounded integration tests |
| Saved investigation and research outcome APIs | Preserve | Make them power one continuous research journey |
| Research dashboard and multiple workbenches | Consolidate | One researcher workspace, with specialist views |
| Synthetic patient validation records | Keep separate | Never present as real cohort evidence |
| Trial and therapeutic scaffolding | Extend | Connect versioned real registry data and development landscapes |
| Scientific evaluation harness | Complete | Obtain independent expert labels and measure actual scientific quality |
| AI orchestration and agent contracts | Audit and connect | Establish real end-to-end execution, recovery and verification |

Repository honesty already recorded elsewhere: unified research outcome currently **composes saved evidence** rather than generating new scientific conclusions; real patient connectors are not in that outcome; scientific approval, expert evaluation and live operational acceptance remain incomplete. Frontend redesign alone will not close those gaps.

---

## 7. Execution sequence (within existing architecture)

| Step | Name | Acceptance |
|------|------|------------|
| **01** | Repository reconciliation | One verified capability inventory; no unnecessary rebuilds |
| **02** | Unified research journey | Scientist completes one investigation without switching disconnected tools |
| **03** | Living evidence and graph expansion | Source-grounded navigation across initial immune-disease domains |
| **04** | Agent intelligence and gap verification | Gap recommendations traceable and tested against expert-labelled cases |
| **05** | Translational landscape intelligence | Mechanism → research activity → development outcomes |
| **06** | Patient-to-research evidence bridge | Governed cohort-level comparison without exposing patient identities |
| **07** | Continuous evidence intelligence | Investigations remain current, reproducible and reviewable over time |

### Competitive note

Retain Causaly, BenevolentAI, Owkin, BenchSci, Tempus AI, TriNetX and OpenEvidence in a competitive capability matrix. Differentiation to **test** (not claim): immune-centred biological navigation, cross-context evidence synthesis, reverse traceability, research gap verification, translational intelligence and actionable research planning in one SaaS workflow.

Do not claim superiority until comparative benchmarks demonstrate it. Relevant metrics: evidence retrieval quality, claim accuracy, unsupported-gap rate, time to a useful research plan, researcher satisfaction and reproducibility.

---

## 8. What is fixed from this point

1. Established HSI architecture remains the reference.
2. Delivery discipline: **existing requirement → existing code → missing functionality → implementation → tests → working researcher outcome**.
3. Maintain a **single capability register** with statuses: `implemented` · `connected` · `scientifically_validated` · `blocked` · `planned` (plus honesty label `synthetic_only` where fixtures apply).
4. Begin with **01 Repository reconciliation** then **02 Unified research journey** — not another landing-page redesign, not another agent catalogue, not a new platform architecture.

**Goal:** A researcher enters a question about immune-connected human biology, and HSI produces a credible, evidence-traceable investigation that reveals what is known, what is missing and what can meaningfully be done next.

Everything we build is measured against that outcome.
