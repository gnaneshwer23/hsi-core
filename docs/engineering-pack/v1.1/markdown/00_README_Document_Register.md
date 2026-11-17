---
title: "00. README and Document Register"
subtitle: "HSI Engineering Specification Pack v1.1"
---

**Pack version:** 1.1, 16 November 2026 · **Owner:** Dr Gnaneshwer Jadav, CEO and scientific release owner · **Audience:** the engineer building HSI · **Repository baseline:** `github.com/gnaneshwer23/hsi-core` at commit `43da794` (16 November 2026)

# Read this first

This pack replaces the v0.1 drafts. Version 1.1 records the owner's decision that the first reviewed slice is cross-domain and that systemic sclerosis is not a priority. Those drafts were generic templates: they proposed Next.js and treated every capability as unbuilt. The repository already holds about 163,000 lines of TypeScript, 34 migrations, 38 API routes, roughly 2,400 unit test cases and 65 browser test files. Every document in this pack starts from what is actually in the code.

Three things matter more than anything else in the pack:

1. **Do not rebuild the stack.** Bun, TypeScript, Vite + React 19, Vercel functions, Neon Postgres and Neon Auth stay. The job is to finish, connect and prove what exists, not to start again.
2. **The first proof point is one fully reviewed cross-domain slice.** Ship 40 to 60 graph relationships linking immune, gut and metabolic biology (with a cross-disease autoimmune comparison), each with complete biological context (species, tissue, population, design) and named expert reviewers. Today the published graph has 131 relationships and 0 reviewed.
3. **Persistence is the critical path.** Saved investigations, the hypothesis ledger, accounts with data and any multi-researcher use are blocked behind 12 held migrations (022 to 033). Nothing user-facing scales until that is resolved.

# What HSI is, in one paragraph

Human Super Intelligence (HSI) is a biomedical research platform for immunology. It connects published evidence, biological mechanisms and experimental context in one knowledge graph. Every relationship keeps its source, its study context and its review state. Researchers use it to see why studies disagree, find what is still unknown and leave with a reproducible research brief. HSI does not give clinical advice and holds no patient data in this repository.

# How to use the pack

Every specification (01 to 16) has the same six parts, so you can scan any document the same way:

| Part | What it tells you |
| --- | --- |
| 1. Decision summary | The calls already made for this area, in three to six lines |
| 2. Vision | What this area must do when HSI is mature |
| 3. Where we are | What exists in the repo today, with file paths and a status per item |
| 4. What to build next | Numbered requirements with acceptance criteria. This is your backlog source |
| 5. Future options | Things to consider later. Do not build these now |
| 6. Open decisions | Calls only the owner can make, with a recommended answer |

Status words used everywhere:

| Status | Meaning |
| --- | --- |
| **Built** | Working code with tests, used in a real path |
| **Partial** | Real code with a blocker, a fixture-only path or missing coverage |
| **Not started** | Absent, or contract and types only |
| **Owner decision** | Engineering cannot proceed until the owner decides |

Requirement IDs follow the pattern `<area>-<number>`, for example `KG-04` or `SEC-02`. Document 15 orders all of them into one backlog.

# Document register

| No. | Document | Main question it answers |
| --- | --- | --- |
| 00 | README and Document Register | How to read the pack and what governs it |
| 01 | Master Product Requirements | What we are building, for whom, why we win, and how we measure it |
| 02 | System Architecture and Technical Design | How the parts fit, the planes, and the architecture decisions |
| 03 | Biomedical Knowledge Graph and Ontology | What a node and an edge are, how context is stored, how an edge gets promoted |
| 04 | Scientific Data Ingestion and Evidence Pipeline | How a paper becomes a source, a passage and a candidate claim, with rights intact |
| 05 | AI Agent Architecture and Orchestration | Which agents run, what they may touch, and how a run survives failure |
| 06 | Scientific Verification and Evaluation Engine | How a claim is checked and how we prove the system is accurate |
| 07 | Scientific Discovery Workbench | The researcher's screens and journeys, from question to brief |
| 08 | Clinical and Translational Intelligence | Trials and the separate clinical plane, and what must be true before real patient data |
| 09 | Database and Data Model | Tables, ownership, isolation and how migrations get released |
| 10 | API and Integration Contracts | Endpoints, payloads, errors and external adapters |
| 11 | UX/UI and Frontend Engineering | Information architecture, the public site, design system and accessibility |
| 12 | Security, Privacy and AI Governance | Threats, controls, model governance and the human review rules |
| 13 | Infrastructure, DevOps and Deployment | Environments, CI/CD, observability, backup and recovery |
| 14 | Testing, Benchmarking and Quality Assurance | Test layers, the scientific benchmark and release evidence |
| 15 | Implementation Roadmap and Engineering Backlog | The phases, the ordered backlog and the definition of done |
| 16 | Developer Handover and Operations Runbook | Setup, commands, environment variables and incident runbooks |

# Reading order for a new engineer

1. This document, then **01** (the product) and **15** (the plan).
2. **16** to get the repo running locally.
3. **02** and **09** before touching the server or database.
4. The specification for whatever backlog item you pick up.

# Rules that apply to every document

These come from the repository's own `AGENTS.md` and the owner's decisions. They are not negotiable inside a pull request.

1. **Candidate is not fact.** Anything an AI or an import produces is a candidate. Only a named human reviewer, through the review path, can promote it. No code path may auto-approve.
2. **Absence is stated, never filled.** A missing passage, a failed search or an unknown tissue is recorded as missing. It is never filled from model memory and never shown as "no evidence".
3. **No patient data in `hsi-core`.** Not in code, the database, logs, prompts, fixtures or tests. Synthetic data is labelled synthetic everywhere it appears (ADR-0010).
4. **No clinical advice.** No output is a diagnosis, treatment recommendation or trial-eligibility decision.
5. **Public claims match the register.** The website and investor material may only claim what `docs/STATUS.md` records. If the register is stale, fix the register first.
6. **Rights before text.** Full text or passages are stored only when the licence permits it. Otherwise the record is metadata-only and says so.

# Sources of truth in the repository

| Topic | File |
| --- | --- |
| Capability status | `operations/capability-register/capability-register.v1.json`, rendered to `docs/STATUS.md` by `bun run status:write` |
| Governing vision | `docs/strategy/HSI_VISION.md`, with the 15 November proposal in `docs/strategy/HSI_RESTRUCTURED_VISION.md` |
| Product outcome | `docs/product/HSI_DEFINITIVE_PRODUCT_SPEC.md` (investigation outputs 01 to 06) |
| Clinical boundary | `docs/architecture/ADR-0010-TWO-PLANE-CLINICAL-ARCHITECTURE.md` (accepted 15 November 2026) |
| Held migrations | `src/db/migrationHolds.ts` |
| Agent rules | `AGENTS.md` |

When this pack and the repository disagree, the repository's code is the fact and this pack is the intent. Raise the conflict with the owner rather than silently picking one.

# Change log

| Version | Date | Change |
| --- | --- | --- |
| 1.1 | 16 November 2026 | First reviewed slice is cross-domain (gut–immune–metabolic with a cross-disease autoimmune comparison); SSc removed as a priority. Existing SSc code (routes `/graph/ssc` and `/discovery/ssc`, the `research/ssc-tfh-il21/` package, the `ssc` review scope) is kept as legacy and generalised, not extended. Added a scientific scope table (P0 to P2, out of scope) and requirements PRD-13 and KG-10 for cross-disease comparison |
| 1.0 | 16 November 2026 | First rebuilt pack from the repository audit |

# Clean-up the pack asks for

The repository holds 462 Markdown files, including 88 strategy documents, several of which overlap or conflict (for example, the 6 November plan makes gut–immune–diabetes the first programme while the 13 November plan starts from two investigations across SSc, RA and gut–immune–metabolic scopes). Engineering should treat this pack as the build reference and the capability register as the status reference. Do not add new strategy documents; record decisions as ADRs in `docs/architecture/`.
