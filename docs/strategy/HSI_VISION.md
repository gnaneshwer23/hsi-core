# The Vision of Human Super Intelligence (HSI)

**Definitive product vision frozen — 18 November 2026:** See [`HSI_DEFINITIVE_PRODUCT_VISION.md`](./HSI_DEFINITIVE_PRODUCT_VISION.md). That freeze is the north star for product, scientific and engineering decisions: *Building the intelligence layer for understanding human biology.* Product promise: *Understand the mechanism. Preserve the evidence. Explain the uncertainty. Inform the next decision.* Where purpose/USP/maturity wording conflicts with older sections below, **the freeze wins**.

**Business vision execution audit — 19 November 2026:** [`HSI_BUSINESS_VISION_EXECUTION_AUDIT_2026-11-19.md`](./HSI_BUSINESS_VISION_EXECUTION_AUDIT_2026-11-19.md) — repository truth vs USP A/B/C and the 13-step researcher journey; next five PRs; blockers; lean budget. **Build centre = complete scientific journey, not more dashboard shells.**

**Public positioning correction — 13 November 2026 (explicit user direction):** HSI is one scientific intelligence technology. Do not market it as a portfolio, four-product ecosystem or collection of named product modules. The homepage, platform, navigation, public diagrams and search metadata must present the Living Knowledge Graph, evidence, context and scientific investigation under HSI alone. Older product-naming sections below are historical architectural **ownership** context and do not authorise public promotion. Existing data isolation, source permissions, no-PHI/no-CDS and independent human-review boundaries remain binding.

**Document status:** Canonical governing product doctrine (operational wrapper)  
**Adopted:** 9 November 2026 · **Vision freeze:** 18 November 2026  
**Audience:** Every landing page, backend service, knowledge-graph relationship, AI agent and product decision in the HSI ecosystem  
**Honesty:** Intended capabilities are **not** all independently verified as production-ready. Distinguish ambition from shipped status via [`../capability-status.json`](../capability-status.json), public honesty labels, and fail-closed research writes.

**Elaboration:** Longer historical target-state detail remains in [`HSI_MASTER_VISION.md`](./HSI_MASTER_VISION.md).  
**Boundaries:** [`../CDS_PHI_BOUNDARY.md`](../CDS_PHI_BOUNDARY.md) · four-product ownership [`HSI_FOUR_PRODUCT_ECOSYSTEM.md`](./HSI_FOUR_PRODUCT_ECOSYSTEM.md) · LHK-G [`HSI_LIVING_HEALTH_KNOWLEDGE_GRAPH.md`](./HSI_LIVING_HEALTH_KNOWLEDGE_GRAPH.md) · cross-domain biology [`../architecture/HSI_CROSS_DOMAIN_BIOLOGY_ARCHITECTURE.md`](../architecture/HSI_CROSS_DOMAIN_BIOLOGY_ARCHITECTURE.md) · landing↔backend honesty [`../architecture/HSI_LANDING_PAGE_BACKEND_MATRIX.md`](../architecture/HSI_LANDING_PAGE_BACKEND_MATRIX.md) · brand redesign [`../design/HSI_PREMIUM_BRAND_IDENTITY_REDESIGN_2026-11-18.md`](../design/HSI_PREMIUM_BRAND_IDENTITY_REDESIGN_2026-11-18.md).

**Binding constraints (always):**

- HSI is **cross-domain** (immune, microbiome, neuro, metabolic, molecular, organ/tissue, disease mechanisms). Systemic sclerosis is a **validation case**, not the product boundary.
- Four products remain **independently governed** and interoperable for ownership (Aksh, HSI Clinical, ISI, HSI Trials) — **not** a public marketing portfolio.
- Private clinical PHI must **not** auto-enter the research knowledge graph. **No live CDS** in `hsi-core`.
- Neon for HSI substrate: **red-wave only**. No Gate C auto-approve. No invented MoU.

---

## Purpose (frozen)

**Building the intelligence layer for understanding human biology.**

A connected scientific intelligence platform that integrates biological knowledge, research evidence and AI-assisted reasoning to help scientists understand mechanisms, evaluate uncertainty, generate testable hypotheses and advance biomedical discovery.

HSI is **not** simply a healthcare chatbot, a literature search box, a molecular modeller or a disease-specific assistant. It is a scientific investigation environment where evidence, biological context, mechanisms and uncertainty are examined together.

---

## 1. Why HSI exists

Human biology is interconnected; scientific knowledge is fragmented across publications, datasets, pathways, organs, diseases and disciplines. Researchers can find papers; connecting them into reliable mechanistic understanding remains hard.

HSI connects discovery, graph, context, verification and investigation into one workflow — rather than competing only on search or only on a black-box answer.

---

## 2. Product ownership planes (not public marketing)

| Product | Role | Governance note |
|---------|------|-----------------|
| **Aksh Health** — Patient Intelligence | Individual health trajectories; PHI stays in Aksh. | Separate clinical plane. |
| **HSI Clinical** — Longitudinal Clinical Intelligence | Authorised clinical history; not a live hospital feed in `hsi-core`. | Honesty-labelled. |
| **Immune Super Intelligence (ISI)** — Scientific Discovery | Immunology-centred discovery UX; consumes published HSI artifacts. | Separate product DB. |
| **HSI Trials** — Translational & Trial Intelligence | Research/pre-screen demos; live enrolment **not** offered. | Honesty-labelled. |

HSI’s scientific intelligence must not depend on Aksh. Private clinical information must not automatically enter the research knowledge graph. Public pages market **one** HSI technology.

---

## 3. Six interconnected scientific domains (vision freeze)

| Domain | Focus |
| --- | --- |
| Immunology & Inflammation | Immune regulation and inflammatory mechanisms |
| Neuroscience | Neural biology and neuroimmune interactions |
| Microbiome & Metabolism | Host–microbe and metabolic mechanisms |
| Genomics & Multi-omics | Integrated molecular evidence |
| Organ & Tissue Biology | Tissue physiology and inter-organ interactions |
| Disease Mechanisms | Pathogenesis and therapeutic response |

Shared layer: knowledge · evidence provenance · context-aware reasoning · scientific verification.  
Not six products. Live department slugs migrate only via ADR ([`../../site/src/lib/departments.ts`](../../site/src/lib/departments.ts)).

---

## 4. Technology → vision (HSI 1.0 vs later)

| Technology | Role | Band |
| --- | --- | --- |
| Scientific Discovery | Find knowledge and evidence | 1.0 |
| Biological Knowledge Graph | Connect entities and mechanisms | 1.0 |
| Biological Context Intelligence | Preserve experimental conditions | 1.0 |
| Scientific Verification | Support, disagreement, uncertainty | 1.0 |
| Scientific Investigation Workbench | Unified research experience | 1.0 |
| Scientific Decision Memory | How conclusions evolve | 1.0 |
| Hypothesis Intelligence | Testable explanations | Later; validation-gated |
| Research Integration | New evidence into open investigations | Later; validation-gated |

---

## 5. Defining research experience

Example: *How do microbial metabolites influence neuroinflammation through immune signalling?*

Intended outcome: a **scientific investigation record** — mechanisms, supporting/opposing evidence, conditions, provenance, uncertainty, alternatives, open questions — updateable without silently rewriting approved conclusions. Not a bare AI answer.

---

## 6. USP (proposed; evaluation-gated)

**Context-aware scientific evidence and mechanism intelligence.**

Connect mechanisms with experimental context, verification and traceable decisions. Advantage must be shown by independent evaluation, not assumed from architecture.

---

## 7. Vision / mission / promise / ambition

| | Statement |
| --- | --- |
| Vision | Make the complexity of human biology understandable through connected, evidence-grounded scientific intelligence. |
| Mission | Equip researchers with AI-assisted tools to investigate mechanisms, evaluate evidence in context and make more informed research decisions. |
| Promise | Understand the mechanism. Preserve the evidence. Explain the uncertainty. Inform the next decision. |
| Long-term | A living scientific intelligence layer connecting knowledge, evidence, hypotheses and validated discoveries. |

---

## 8. Maturity stages (one platform)

| Stage | Scope |
| --- | --- |
| **HSI 1.0** | Reliable investigation platform: retrieval, context, mechanism exploration, verification, persistence, traceable briefs. |
| **HSI 2.0** | Stronger hypothesis evaluation, decision memory, collaboration, systematic evidence integration. |
| **Long-term** | Discovery environment linking research knowledge, experimental results and translational reasoning under human oversight. |

---

## 9. Decision filter

If a feature, investment or partnership does **not** improve scientific understanding, evidence reliability or the researcher’s ability to act on findings, it is not a priority.

---

## Ambition vs shipped (quick reference)

| Ambition (doctrine) | Typical shipped / honest public status |
|---------------------|----------------------------------------|
| Universal connected biology | Unequal curated coverage; illustrative demos; SSc = validation case |
| Full investigation record UX | Partial; honesty labels required |
| Live cross-product write spine | Fail-closed writes; public demos `live_backend=false` |
| Live CDS / PHI in research KG | **Non-goal** in `hsi-core` |
| Gate C auto-approve | **Forbidden** |
| Four-product public portfolio | **Forbidden** in marketing; ownership planes remain |
| Hypothesis intelligence / deep integration | Later-stage; not claimed as live |

Update when [`../capability-status.json`](../capability-status.json) or production probes change — do not invent readiness in marketing copy.
