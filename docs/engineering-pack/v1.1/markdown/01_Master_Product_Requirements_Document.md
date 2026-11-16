---
title: "01. Master Product Requirements Document"
subtitle: "HSI Engineering Specification Pack v1.1"
---

**Version:** 1.1, 16 November 2026 · **Owner:** Dr Gnaneshwer Jadav (CEO) · **Repo baseline:** `hsi-core@43da794`

# 1. Decision summary

- **Product:** an immunology research workbench that shows where a biological claim holds, where it fails and who checked it.
- **First user:** an academic or biotech immunologist investigating immune mechanisms that cross disease and organ boundaries, starting with gut–immune–metabolic links in type 2 diabetes and cross-disease comparisons in autoimmunity.
- **First proof point:** one cross-domain slice of 40 to 60 relationships with complete context and named expert review, published openly, plus a benchmark result we can state publicly.
- **What we will not do in v1:** clinical advice, patient data, drug design, autonomous "AI scientist" claims, or six domains at equal depth.
- **How we win:** context-stratified evidence, negative findings kept, review state on every edge, an open graph and a published accuracy record. Every large competitor hides at least two of these.

# 2. Vision

> Connecting human biology. Advancing scientific discovery. Transforming our understanding of health.

When mature, HSI answers five questions for any immune-mediated disease (from `docs/product/HSI_DEFINITIVE_PRODUCT_SPEC.md`):

1. What do we know?
2. What evidence supports or contradicts it, and in which biological context?
3. What remains unknown, under-studied or poorly translated to humans?
4. What research, data or experiments would resolve those gaps?
5. How do new findings change that picture over time?

The output is a structured investigation, not a chat answer. It has six sections: scientific landscape, evidence comparison, gap intelligence, translational intelligence, research action plan and evidence package.

Long term, the same governed graph serves four experiences: research (ISI), trials, clinical and personal health (Aksh). Only research is in scope for the next six months. The clinical experiences run in a separate plane (document 08).

# 3. The problem we solve

Immunology evidence is fragmented and context-dependent. A finding in collagen-induced arthritis in mice may not hold in human synovium. A pathway that works in RA may worsen multiple sclerosis (anti-TNF is the classic case). Today a researcher rebuilds this by hand from dozens of papers.

AI tools have made the reading faster but not more trustworthy. Published evaluations of autonomous "AI scientist" systems report fabricated results, data leakage and post-hoc selection, and Edison's own write-up says about 20% of Kosmos report content is inaccurate or debatable. General chatbots blend contexts into one confident paragraph. Researcher surveys from Elsevier and Wiley (2025, as summarised in `docs/strategy/HSI_RESTRUCTURED_VISION.md`) point the same way: citations, current literature, accuracy safeguards and human validation are what would raise trust.

# 4. Users

| Persona | Job to be done | What they need from HSI | Priority |
| --- | --- | --- | --- |
| **Academic immunologist** (PI or postdoc, rheumatology or autoimmunity) | Decide which mechanism to test next and defend it in a grant | Evidence split by species, tissue and patient subset; contradictions explained; a citable brief | **Primary** |
| **Biotech discovery scientist** (mid-size autoimmune biotech) | Assess a target's human evidence before committing budget | Human versus animal evidence, failed-translation history, trial landscape | Secondary (pilot customer) |
| **Expert reviewer** | Check candidate relationships quickly and record a decision | A review queue with passages, context and a decision form | **Required** (no reviewed graph without them) |
| **Patient foundation research lead** (for example a diabetes or autoimmunity research charity) | Fund the right research gaps | Gap register, evidence coverage, research priorities | Later |
| **Clinician or trial team** | Pre-screen trial criteria | Clinical plane only, after the gates in document 08 | Future |

# 5. Market and competitors

The AI-for-science market moved fast in 2026. Assume every large competitor can out-compute us. Win on trust, context and openness.

| Competitor | What they do well | Where HSI differs |
| --- | --- | --- |
| **Google Co-Scientist / Gemini for Science** | Multi-agent hypothesis generation, published in Nature (May 2026), free Hypothesis Generation tool | Optimises novelty of hypotheses; does not expose context-stratified evidence or review state per claim |
| **Edison Scientific (Kosmos)** | Autonomous long runs over ~1,500 papers; $70M seed; Incyte partnership | Black-box report; around a fifth of content judged inaccurate or debatable in its own evaluation |
| **Causaly** (London) | 500M-fact biomedical graph, agents, Microsoft partnership, full text from Sage journals | Proprietary; enterprise pricing and 8 to 16 week setup; no public accuracy record per claim |
| **Owkin K Pro** | Multimodal patient data network; licences to AstraZeneca, Sanofi, Boehringer (including immunology), Servier | Data moat we cannot match; serves top-10 pharma; not open |
| **BenchSci (ASCEND, EMET)** | Experiment-focused evidence for preclinical biology; large pharma customers | Pharma enterprise focus; reagent and experiment orientation |
| **Phylo (Biomni Lab)** | 300+ tools and databases in one agent environment; open-source roots; a16z-backed | Executes analyses; does not curate a reviewed mechanism graph |
| **Elicit, Undermind, Consensus** | Literature search and extraction at scale; Elicit has an MCP server and research agent | Paper-level answers; no biological context model or graph |
| **Claude Science, GPT-Rosalind** | General workbenches and models from frontier labs | Partners as much as competitors: Anthropic's stated position is that specialised science stays with partners |

**Positioning statement (use on the website once true):** *The only biomedical graph that shows you where a claim holds, where it fails, and who checked it.* It becomes true when the first reviewed slice (requirement PRD-03) ships.

**What we must never claim:** autonomous discovery, clinical utility, accuracy figures before the benchmark exists, partnerships without a signed agreement.

## Scientific scope by priority

| Priority | Areas | Notes |
| --- | --- | --- |
| **P0** (pilot) | Immunology as the centre; evidence intelligence (support, contradiction, gaps); immune links to gut and metabolism | The first reviewed slice lives here |
| **P1** (after pilot) | Cross-disease autoimmune comparison; translational targets and trial registry research | Translational work is research only, in the scientific plane |
| **P2** (later) | Neuro-immune; multi-omics evidence; biomarkers; experimental validation records | Each needs its own reviewers and data licences |
| **Out of scope** | Oncology; in-silico drug design; trial matching or eligibility for patients | Oncology is Owkin's ground; matching belongs to the clinical plane under ADR-0010 |

# 6. Where we are

| Area | Status | Evidence in the repo |
| --- | --- | --- |
| Public website and graph explorer | Built | `site/`, live at humansuperintelligence.tech; graph canvas, filters, selection, brief export |
| Candidate knowledge graph | Partial | `site/public/research/domain-graph/graph.v1.json`: 153 concepts, 95 source-candidate edges, 36 gap edges, 75 sources, **0 reviewed** |
| Context completeness | Partial | Of 95 candidate edges: 45 have no study system, 90 no tissue, 85 no population |
| Evidence by context (no blended score) | Built | `src/knowledgeGraph/contextBreakdown.ts`; conflict classification added in KG-03 slice 1 |
| Live investigation | Partial | `src/investigation/liveRun.ts`: Europe PMC + OpenAlex + Open Targets, deterministic sentence extraction, optional two-model challenge; curated scenarios only |
| Accounts | Partial | Neon Auth sign-up and sign-in work; no account-backed data |
| Saved work | Partial | Hypothesis ledger, gap tracking and saved investigations live in browser `localStorage` only |
| Scientific benchmark | Not started (scaffold only) | 120 authoring slots, 0 adjudicated cases |
| Clinical plane | Synthetic only | ADR-0010; synthetic cohort and trial pre-screening pages |

# 7. Requirements

## Must have for the pilot (next 16 weeks)

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| PRD-01 | A researcher can create, save, reopen and export an investigation from any device | Two devices, same account, same investigation; export reproduces byte-identical evidence lineage; works after a server restart |
| PRD-02 | Every assertion links to its source, passage (where permitted), context and review state in one click | Click-through audit on 50 random assertions: 100% resolve; missing passage shows the reason |
| PRD-03 | One reviewed cross-domain slice | 40 to 60 edges across the slice defined in D-01; 100% have model, tissue, population and design filled or explicitly "not reported"; each reviewed by at least 2 named experts; disagreements adjudicated |
| PRD-04 | Evidence by context replaces any single score | No UI anywhere shows a blended confidence number for a relationship |
| PRD-05 | Contradictions are classified | Each disagreement shows one of: same context, different context, context not stated (KG-03) |
| PRD-06 | Gap register and hypothesis ledger persist server-side | Entries survive a cleared browser; each hypothesis is timestamped and immutable once recorded |
| PRD-07 | Research brief export | Markdown, JSON and print-to-PDF; brief carries graph version, run IDs and review states |
| PRD-08 | A working access request | Submitted requests reach the owner within 5 minutes; spam-controlled; the page never claims delivery it does not do |
| PRD-09 | Published benchmark v0 | At least 50 adjudicated cases with reported false-support rate, abstention rate and inter-rater agreement |

## Should have (pilot quality)

| ID | Requirement | Acceptance criteria |
| --- | --- | --- |
| PRD-10 | Expert review queue | Reviewer sees passage, context and candidate; records accept, reject, revise or "insufficient"; decision is attributable and immutable |
| PRD-11 | Retraction and correction flags | Retracted sources are excluded from runs and flagged on the edge within 24 hours of the provider flag |
| PRD-12 | Personal topics | A researcher picks diseases and entities; home page shows new evidence on them |
| PRD-13 | Cross-disease mechanism comparison | For a chosen mechanism (for example anti-TNF or IL-17 blockade), one view compares evidence and trial outcomes across diseases, flagging failed translations; built on evidence by context |

## Will not have in v1

Clinical decision support, patient data, team workspaces with sharing permissions, payments, mobile apps, model fine-tuning, more than one reviewed slice.

# 8. Success metrics

| Metric | Target by end of pilot (week 24) | Why it matters |
| --- | --- | --- |
| Reviewed edges with complete context | ≥ 50 in the first slice | The core claim of the product |
| False-support rate on benchmark | Stated publicly, target ≤ 5% | Trust is the buying criterion |
| Pilot researchers active weekly | 5 of 8 | Real use, not curiosity |
| Brief usefulness | Blinded experts prefer the HSI brief over their usual workflow in ≥ 60% of comparisons, or find it faster to check | Document 06, N6 study |
| Time to check a brief | Lower than the baseline workflow | Researchers buy time |
| Paid or committed pilot | 1 signed letter of intent | Commercial signal |

Do not report node counts, agent counts or test counts as success.

# 9. Future options (not for v1)

- An HSI MCP server so Claude Science, Gemini for Science and Elicit users can call the reviewed graph from their own workbench.
- A public, prospective hypothesis ledger scored automatically as new papers and trial results arrive.
- Team workspaces and shared review queues for biotech customers.
- Further reviewed slices: autoimmune comparisons (SLE, IBD), then neuro-immune links, each with its own domain reviewers.
- An experiment ledger linking a pre-registered prediction to protocol, raw data and measured outcome (N7; migration 017 exists).
- Multi-omics evidence (single-cell, proteomic datasets such as GEO and ImmPort) as a new evidence type with its own licences and reviewers.
- Licensed full text from publishers, as Causaly has done with Sage.
- The clinical plane (document 08) after every regulatory gate is met.

# 10. Open decisions

| ID | Decision | Recommendation |
| --- | --- | --- |
| D-01 | Boundaries of the first reviewed slice | **Decided: cross-domain, SSc excluded (16 November 2026).** Recommended slice: gut microbial metabolites → immune signalling → insulin resistance in type 2 diabetes, with a type 1 diabetes comparison track and one cross-disease autoimmune comparison (anti-TNF in RA versus MS). All these diseases are already graph nodes. Recruit one reviewer per domain (immunology, metabolism, gut microbiome) |
| D-02 | Named external reviewers | Two immunologists outside the company, paid per adjudicated case, conflicts declared |
| D-03 | Brand descriptor | Lead with "context-conflict audit for immunology research"; keep "Human Super Intelligence" as the company name |
| D-04 | Pricing hypothesis | Test a free academic tier with limits and a paid project-based pilot for biotech; decide after 5 pilot interviews |
| D-05 | Repository visibility | The repo is public and contains competitor analyses and a partner shortlist. Decide whether to make it private or move those files |

# Sources

- [Google DeepMind: Co-Scientist (19 May 2026)](https://deepmind.google/blog/co-scientist-a-multi-agent-ai-partner-to-accelerate-research/)
- [Edison Scientific profile](https://geo.sig.ai/brands/edison-scientific.md) · [Incyte and Kosmos](https://intuitionlabs.ai/articles/agentic-ai-pharma-rd-incyte-kosmos) · [Kosmos accuracy coverage](https://eu.36kr.com/en/p/3541494388355200)
- [Causaly Copilot](https://causaly.com/life-science-ai/generative-ai-copilot) · [Causaly and Sage](https://www.causaly.com/news/causaly-and-sage-bring-full-text-scientific-literature-into-ai-powered-drug-discovery-research) · [Causaly index entry](https://theaiagentindex.com/agents/causaly)
- [Owkin and Boehringer Ingelheim](https://allsci.com/news/licensing-and-partnerships/owkin-k-pro-ai-platform-boehringer-ingelheim/) · [Owkin and Servier](https://www.unite.ai/?p=465549)
- [Phylo Biomni Lab](https://www.synbiobeta.com/read/phylo-launches-biomni-lab-and-secures-13.5m-seed-round)
- [BenchSci EMET launch](https://www.benchsci.com/news/the-fragmented-nightmare-of-modern-drug-discovery-ends-here-we-ve-been-building-emet-for-a)
- [Elicit](https://simplify.jobs/c/Elicit) · [Elicit blog](https://elicit.com/blog)
- [Claude Science (The New Stack)](https://thenewstack.io/?p=22828417)
- [Hidden pitfalls of AI scientist systems (arXiv 2509.08713)](https://arxiv.org/abs/2509.08713) · [Undark on AI scientists](https://undark.org/2026/01/26/ai-scientists-human-research/)
