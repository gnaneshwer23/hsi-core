---
title: "07. Scientific Discovery Workbench"
subtitle: "HSI Engineering Specification Pack v1.1"
---

**Version:** 1.1, 16 November 2026 · **Owner:** Dr Gnaneshwer Jadav · **Repo baseline:** `hsi-core@43da794`

# 1. Decision summary

- **One loop, five screens:** Home → Ask or Explore → Investigation → Evidence by context → Brief. Everything else (gap register, hypothesis ledger, review queue) hangs off that loop.
- **The graph is the entry point, the investigation is the unit of work.** Selections on the graph become an investigation in one click.
- **Every claim is one click from its evidence.** Source, passage, context and review state open in a side panel without leaving the page.
- **Saved means saved on the server.** Today most "saved" items live in one browser. That ends with persistence (doc 09).

# 2. Vision

An immunologist opens HSI, sees what changed on their topics, asks a mechanism question, inspects evidence split by species, tissue and patient group, sees why studies disagree, records hypotheses, and leaves with a brief they could put in a grant or hand to a colleague, who can reproduce it.

# 3. Where we are

| Screen or flow | Status | Location |
| --- | --- | --- |
| Researcher home (next moves, graph, "More" fold) | Built | `site/src/pages/ResearcherHome.tsx`, `site/src/lib/researchHome.ts` |
| Onboarding (topics, papers, required steps) | Built | `/welcome`; funnel recorded in the browser only |
| Graph explorer (canvas, filters, multi-select, inspector, gap markers) | Built | `site/src/components/graph/*`, `/knowledge-graph` |
| Evidence by context panel | Built | `ContextBreakdownView.tsx` |
| Ask (signed-in, curated scenarios) | Partial | `site/api/ask.ts`, `useAsk.ts` |
| Live investigation and trace | Partial | `useLiveRun.ts`, `/research/investigate` |
| Gap register | Partial | `/research/gaps`; user status in `localStorage` |
| Hypothesis ledger | Partial | `useLedger.ts`; `localStorage` |
| Methods compare and notebook | Partial | `methodsCompareHandler.ts`, `useNotebook.ts` |
| Brief export (JSON, Markdown, print) | Built | `site/src/lib/researchBrief.ts`, `printResearchDocument.ts` |
| Saved investigations | Partial | `useSaveInvestigation.ts`; server endpoint exists, writes disabled in production |
| Review queue | Partial | `site/api/research/scientific-review/*`; no reviewers |
| Target workflow, trial pre-screen, synthetic cohort | Partial | Synthetic and research-only; see doc 08 |
| Legacy specialist pages | Debt | About 60 routes; many demonstrations predate the current loop |

# 4. Target screens

| Screen | Purpose | Must show |
| --- | --- | --- |
| Home | What changed and what to do next | New evidence on followed topics; open investigations; gaps the user tracks |
| Ask | Start a question | Entity recognition preview ("we understood: butyrate, regulatory T cells, type 2 diabetes"); coverage warning if thin |
| Graph | Explore and select | Context filters (species, tissue, design); reviewed versus candidate styling; gap markers |
| Investigation | The unit of work | Outputs 01 to 06; run trace; status per section |
| Evidence by context | Why studies disagree | Strata table; negative findings; missing-context counts; conflict class |
| Brief | Hand-off | Question, findings with citations, contradictions, gaps, hypotheses, limitations, graph version, run IDs |
| Gap register and ledger | Track open questions | Status history; linked hypotheses; outcome recording |
| Review queue (reviewers only) | Decide candidates | Passage, context, candidate, verifier verdict, decision form |

## The investigation journey

1. Ask a question or select nodes on the graph.
2. Confirm entities and context (disease, tissue, species of interest).
3. The run executes as a job; progress shows stage by stage.
4. Read the six outputs. Each claim opens its evidence panel.
5. Record hypotheses and track gaps.
6. Export the brief; save; share a read-only link (later).

## Interaction rules

- Pending, failed and partial states are always explicit and say why.
- Reviewed and candidate content are visually distinct everywhere, including in exports.
- No blended confidence score appears anywhere.
- A failed search reads "search failed", never "no evidence found".

# 5. What to build next

| ID | Work | Acceptance criteria |
| --- | --- | --- |
| WB-01 | Server-side saving for investigations, gaps, ledger and topics | Two devices show the same state; cleared browser loses nothing (needs doc 09) |
| WB-02 | Async run UX | Run starts, survives a page reload, resumes progress display, and notifies on completion |
| WB-03 | Free-text Ask with entity confirmation (AG-06) | User confirms recognised entities before the run; unrecognised terms listed |
| WB-04 | Reviewed versus candidate styling | Graph, panels and briefs distinguish them; tested in Playwright |
| WB-05 | Brief v2 | Includes conflict classes, review states, graph release ID, run IDs, limitations; reproducible from the saved record |
| WB-06 | Reviewer queue UI (VER-06) | Reviewers can process 20 candidates in under 30 minutes in usability tests |
| WB-07 | Retire or hide legacy routes | Every route either belongs to the loop, is a reviewer tool, or redirects; route count halves |
| WB-08 | Usability sessions | 5 researchers complete the journey without help; findings logged (plan exists in `docs/`) |

# 6. Future options

- Shared read-only investigation links and team workspaces.
- Notifications by email for followed topics (needs an email sender and consent text).
- A "translation discordance" view comparing the same mechanism across diseases.
- Embeddable evidence widgets for papers and grant applications.

# 7. Open decisions

| ID | Decision | Recommendation |
| --- | --- | --- |
| D-60 | Which legacy routes to keep | Keep the loop, the reviewer tools and the synthetic clinical demos behind a "Labs" label; redirect the rest |
| D-61 | Sharing in v1 | No. Add read-only links after isolation tests pass |
