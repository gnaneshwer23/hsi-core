---
title: "05. AI Agent Architecture and Orchestration"
subtitle: "HSI Engineering Specification Pack v1.1"
---

**Version:** 1.1, 16 November 2026 · **Owner:** Dr Gnaneshwer Jadav · **Repo baseline:** `hsi-core@43da794`

# 1. Decision summary

- **Thirteen names, six runtime roles.** The named capabilities (NEXUS, SCOUT, AEGIS, LANTERN, ATLAS, HELIX, PARALLAX, VANTAGE, VERITAS, ARBITER, SENTINEL, CALIBER, WARDEN) stay as documentation and brand. The code runs six roles. Researchers see actions and a trace, not agent names.
- **Most of the pipeline is deterministic.** Models are used for two things only in v1: structured extraction and independent verification. Hypothesis proposals are optional and labelled.
- **Models never write to the graph and never call tools after reading source text.** Retrieved text is data passed into a schema-constrained call, not instructions.
- **Every run is a job with a budget, a run ID, pinned inputs and recorded provider responses,** so it can be replayed exactly.

# 2. Vision

A researcher asks a question and gets a structured investigation in minutes. Behind it, bounded workers retrieve, extract, compare and verify; each step is visible in a "How this was produced" trace; nothing an agent produces is treated as knowledge until a human reviews it.

# 3. Where we are

| Capability | What runs today | Status |
| --- | --- | --- |
| Orchestration (NEXUS) | One-request orchestrator in `src/investigation/liveRun.ts`; durable checkpoint tables (009, 010) exist but are not used by the live path | Partial |
| Retrieval (SCOUT) | Europe PMC, OpenAlex, Open Targets per curated scenario | Partial: live in preview, public sources only |
| Extraction (LANTERN) | Deterministic sentence co-mention with regex polarity and a priority score | Partial: no model extraction in the live path |
| Mapping (ATLAS) | Published snapshot read-only; run candidates are not written to any graph | Partial |
| Comparison (PARALLAX) | Grouping by disease context; deterministic comparability logic exists but is not in the live path | Partial |
| Mechanism (HELIX) | Disabled | Not started |
| Gaps and hypotheses (VANTAGE) | Gap index, literature-intersection heuristic, model-proposed hypotheses challenged by a second model | Partial: preview only |
| Verification (VERITAS) | Two models state direction and must quote the passage; runs only when two providers are configured; production has no keys | Partial |
| Source integrity (AEGIS) | Provider retraction flags shown | Partial |
| Monitoring (SENTINEL) | Radar generated on request | Partial |
| Evaluation (CALIBER) | Harness exists; no adjudicated cases | Partial |
| Guarding (WARDEN) | Per-run budget, per-instance limits, daily ceiling (`HSI_LIVE_MODEL_DAILY_RUNS`) | Partial |
| Review (ARBITER) | Review packet contracts; no reviewers | Partial (a human workflow, not an agent) |

The capability register (`docs/STATUS.md`) still says "0 live runs" for all 13. That is now out of date in the cautious direction. Reconcile it (AG-01).

# 4. Runtime roles

| Role | Covers named capabilities | Uses a model | May read | May write | May never |
| --- | --- | --- | --- | --- | --- |
| Orchestrator | NEXUS, WARDEN | No | Investigation, job, budget | Job state, events | Call a provider directly; approve anything |
| Retriever | SCOUT, AEGIS | No | Provider adapters | Sources, provenance | Store text without a rights decision |
| Extractor | LANTERN, ATLAS | Yes (provider A) | Permitted passages | Candidate assertions (schema-validated) | Invent a passage; set review state |
| Analyst | PARALLAX, HELIX, VANTAGE | Optional (provider A) | Candidates, graph release | Comparisons, gaps, labelled hypotheses | Present a hypothesis as a finding |
| Verifier | VERITAS | Yes (provider B) | Candidate + original passage only | Support assessment | See the extractor's reasoning; promote |
| Monitor and evaluator | SENTINEL, CALIBER | No (scheduled jobs) | Sources, benchmark | Refresh tasks, evaluation reports | Edit frozen benchmark labels |

ARBITER is the human review workflow (document 06), not an agent.

# 5. Run contract

Every run stores:

| Field | Purpose |
| --- | --- |
| `run_id`, `investigation_id`, `owner_id`, `scope_id` | Identity and ownership |
| `graph_release_id`, `adapter_versions`, `prompt_digests` | Pinned inputs |
| `model_ids` per role, `provider_ids` | Independence check (A ≠ B) |
| `budget` (max model calls, max tokens, max wall time) | Hard stop |
| `stage_events[]` | `scoped`, `searched`, `retrieved`, `extracted`, `compared`, `verified`, `hypothesised`, `brief` with status `ok`, `partial`, `failed`, `skipped` |
| `provider_responses` (digest + stored body for replay) | Exact replay |
| `outcome` | `completed`, `completed_partial`, `failed`, `cancelled`, `budget_exhausted` |

## Reliability rules

- Each stage is idempotent by `(run_id, stage, item_key)`.
- Retries: three attempts with backoff for provider errors; none for schema violations (record and skip).
- A lease on the job; an expired lease requeues from the last completed stage.
- Cancellation is checked between items.
- A failed search is never treated as "no evidence".

## Prompt-injection controls

- Source text goes in a delimited data field. System instructions say it is untrusted content.
- Extractor and verifier calls have **no tools**. Output must match a JSON schema or it is rejected.
- The verifier receives only the candidate claim and the original passage, never the extractor's explanation.
- A canary test set of passages containing injected instructions runs in CI (document 14).

# 6. What to build next

| ID | Work | Acceptance criteria |
| --- | --- | --- |
| AG-01 | Reconcile the capability register with what runs | Register shows preview-live status for SCOUT, VERITAS and VANTAGE; site copy regenerated from it |
| AG-02 | Investigation runner as a job (HSI-P2-01, ARCH-12) | `search → authorizePassage → extract → verify → append` composed in one runner; fixture mode gives identical output on replay |
| AG-03 | Model extraction over sections | Schema-validated extraction from methods and results passages; every candidate carries passage offsets |
| AG-04 | Independent verifier | Provider B; quote must match the passage exactly; verdicts `supported`, `contradicted`, `mixed`, `insufficient`, `abstain` |
| AG-05 | Put PARALLAX comparability logic into the live path | Contradictions in run outputs are classified by context like the graph's KG-03 view |
| AG-06 | Free-text questions, safely | Replace curated-scenario routing with entity recognition against the graph; unrecognised entities produce a clear "not yet covered" answer, not a guess |
| AG-07 | Budgets in configuration | Per-run call cap, per-user daily cap, global daily cap; exceeded budgets stop the run with `budget_exhausted` |
| AG-08 | "How this was produced" trace | Every output section links to its stage events, sources and model IDs |
| AG-09 | Injection canary suite | 30 adversarial passages; zero schema escapes; zero instructions followed |

# 7. Future options

- Turn HELIX on for mechanism chains once the verifier and benchmark are in place, measured against a deterministic baseline.
- Specialised model adapters (the repo already has proposal-only adapters for RDKit, ESM, AlphaFold 3, Boltz) behind a benchmark (N8).
- An MCP server so external agents can call HSI's verified retrieval and evidence-by-context as tools.
- A scheduled SENTINEL that watches each researcher's topics and proposes re-review when new evidence appears.

# 8. Open decisions

| ID | Decision | Recommendation |
| --- | --- | --- |
| D-40 | Approved model deployments | Anthropic for extraction, OpenAI for verification, with versions pinned and spend caps set |
| D-41 | Keep agent names in the public UI | No. Keep them in documentation; show actions and the trace to researchers |
| D-42 | Hypothesis generation in v1 | Allowed only as labelled proposals stored in the ledger, never in the reviewed graph |
