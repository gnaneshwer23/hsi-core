# Delivery Phase E — bounded assistance and scientific evaluation

Implemented 5 November 2026. **The evaluation infrastructure and deterministic source baseline are implemented. Scientific acceptance and model activation remain pending.** This is Human Super Intelligence, a research technology substrate.

## What is functional

A saved investigation with a verified Phase D package now has a **Source-grounded baseline** inside **Evidence brief and independent review**. It selects exact statements and complete excerpts from the primary SSc release, retains citation locators, passage/source versions and hashes, and restricts this view to matching human context. The separate RA comparison stays in its existing graph view; no transfer into SSc evidence occurs. Other experimental systems remain inspectable in the full graph. A failed package verification prevents assistance from appearing.

This is deterministic source selection, not a generated answer to the research question. The existing Phase A question planner still handles bounded question interpretation. Excerpts do not establish that a claim answers that question, that an association is causal, or that a candidate mechanism is validated. No model/provider is called, and no new network endpoint, database table, migration or grant is introduced.

`src/scientificEvaluation.ts` exports browser-safe, versioned contracts for assistance input/output, an extractive baseline, bounded product-adapter requests and offline evaluation. `assistanceFromReviewPackage` verifies package/context/passage integrity but does **not** establish authorization: call it only after the existing trusted read has authorized source access. Production UI uses the existing authenticated, verified delivery view and keeps the derived baseline in memory.

Model candidates must return exact source selections under `hsi-assistance-output-1`. Freeform interpretations, treatment advice, invented explanations, roles, approval flags and extra output fields are refused. A safe selected-claim explanation preserves the reviewed statement and source excerpt; it is not a novel biological hypothesis. This deliberately narrow contract is the first evaluation surface. Future generative synthesis requires separate sentence-level SME grounding and evaluation before widening the contract.

## Reproducible offline comparison

From repository root:

```bash
bun --no-env-file run evaluation:scientific \
  --labels evaluation/phase-e/sme-labels.pending.json \
  --thresholds evaluation/phase-e/thresholds.pending.json \
  --out /tmp/hsi-e-report.json \
  --requests /tmp/hsi-e-request-packet.json
```

Output paths must be new files. Input JSON files are bounded to 8 MB; candidate/case schemas and complete one-to-one case coverage are enforced. No `.env` files, network connections or database operations are needed. Use a different output filename when rerunning. The report contains measured local baseline latency, so its run hash can change; dataset/case/label/prompt hashes remain stable for identical inputs.

For a candidate produced by an approved product-owned adapter, supply `--candidate /path/to/candidate-run.json`. This command reads previously generated output; it does not launch a model. A `hsi-scientific-run-1` contains:

- Exact dataset SHA-256, model ID/version, configuration SHA-256, prompt version and SHA-256 of `SOURCE_SELECTION_INSTRUCTIONS`.
- Exactly one result per case: `caseId`, strict `output`, non-negative finite `latencyMs`, and non-negative `costUsd` or `null` when unknown.
- Output fields: `schemaVersion`, `outcome` (`source_summary`, `conflicting_sources`, `abstain`), and `selections`; each selection contains `claimId`, `passageId`, `passageHash`, `statement`, `quote`.

The request packet omits actor/session information and excludes mismatched context, uncleared rights, unreviewed/unassessed evidence and recognizable instruction-like source text. This is a defensive heuristic, **not** a comprehensive prompt-injection detector or de-identification engine. There is no execution facility capable of following source instructions. Inputs must already be approved non-identifying research material. Export of any governed input still requires its data terms; hash verification is not permission to share it with a provider.

## What the numbers mean

The report pins dataset, labels, run, prompt and configuration. Per-case results retain category, structural checks, citations, label coverage, latency and cost; category coverage shows omissions. Baseline/candidate deltas require identical dataset, labels and prompt. The runner reports:

| Measure | Meaning and limitation |
| --- | --- |
| Citation correctness | Fraction of selected citations whose claim/passage binding, quote and hash match the pinned input. **Not semantic scientific correctness.** Null if no citations were selected. |
| Unsupported claims | Selection fails exact quotation/statement checks, eligible context/rights/review checks, or the imported SME allowed-claim set. Without SME labels this measures mechanical grounding violations only. |
| Required-claim recall | Imported SME-required claims recovered / total required. Null without labels or required claims. |
| Outcome accuracy | Agreement with imported SME outcomes. Null without labels. |
| Abstention accuracy | Agreement on whether abstention is required across all labelled cases. Null without labels. |
| Structural failures | Includes non-empty abstentions, empty summaries, missing supporting context and unacknowledged conflicting evidence. |
| Latency | p95 over every case, using nearest rank. External candidate measurements are operator supplied. |
| Cost | Sum across every case; null if any cost is unknown. Candidate telemetry is not provider verified. |

`thresholds.pending.json` intentionally contains **null proposals**. Offline proposal checks cannot mark missing thresholds or unmeasured metrics as passing. Changing a threshold status to `sme_approved` is rejected. Reports always keep `scientificValidityEstablished=false`, `modelActivationAllowed=false` and `scientificSuperiorityEstablished=false`; a local JSON file cannot grant trusted scientific authority.

## Benchmark and SME handoff

`evaluation/phase-e/engineering-cases.json` v1.0.0 has **12 explicitly labelled engineering fixtures**, spanning supported, unsupported, conflicting, wrong disease/species context, insufficient evidence, rights/review failures and instruction-like text. The observations and approval-shaped test fields are contract fixtures, **not real publications, human approvals or scientific labels**. They are isolated from the published evidence corpus, production sources and graph. `sme-labels.pending.json` has no fabricated annotations; it is a schema demonstration, not an SME-labelled benchmark. Existing Phase 6 context-annotation work remains separate and unchanged.

The current Phase B working corpus has **zero eligible candidates**. No result from these engineering fixtures establishes scientific performance. Complete these steps before live model assistance:

1. An accountable source-rights reviewer and domain SMEs select cleared passages and bounded RA/SSc questions. Populate an `hsi-scientific-evaluation-1` dataset from permitted research packages; keep release/context/claim/source/passage bindings. Include all six categories, especially conflicting experimental models and unsupported inference. Reuse the Phase B source inventory and Phase 6 annotation guidelines.
2. Separate development from a frozen **held-out** benchmark at publication and question level. With `--dataset held-out.json`, the runner requires `--development-dataset development.json` and rejects shared source IDs or normalized duplicate questions. Use canonical source IDs consistently: aliases/paraphrases and broader contamination still require human review. Product model training must not use the held-out set; this code performs no training.
3. Generate a blank worksheet using `--dataset benchmark.json --label-template /tmp/sme-labels.json`. Each row pins its case hash. Have independent domain reviewers label outcomes, allowed/required claims, identity and rationale, reconcile disagreements, and record provenance through the trusted review process. The local importer uses `operator_supplied_unverified`; it cannot authenticate an SME or fabricate adjudication. Never fill labels by copying model/baseline outputs.
4. SMEs agree threshold proposals for citation grounding, unsupported claims, abstention, outcome accuracy, latency and cost **before** the held-out comparison. Record their agreement outside this unverified importer and check limitations per category; do not infer safety from aggregate accuracy.
5. Evaluate the deterministic baseline and the pinned candidate on the same cases and labels. Retain model configuration, prompt, raw outputs and actual telemetry under approved data terms. Measure added value in question interpretation, source synthesis or candidate explanation before proposing activation. Candidate latency/cost are declared inputs, not billing verification.
6. Independently verify labels, rights, thresholds, results and deployment permissions. Define the product-owned activation mechanism and ongoing evaluation separately; **this phase supplies no bypass or activation switch**. Re-run source-access checks at use time.

No automatic scientific approval, evidence-grade changes, Gate C approval, publication, live CDS, PHI-to-model flow, shared patient database or model orchestration is added to HSI core. The existing Phase D immutable human decisions stay unchanged. Actual live workflow acceptance still depends on the paused authentication/database work and unapplied migrations `014`/`015`.

## Verification

Local verification passed: **670 core tests**, including **16 Phase E checks**; **73 browser checks**, including two new baseline/integrity/mobile checks; core build, site/API build, frontend type check and pinned evidence-corpus check. The CLI accepted an exactly bound candidate comparison and refused an incomplete run. Missing SME metrics and thresholds remained null, and activation remained false. Existing large frontend bundle warning remains. No model/provider, live authentication, database or production deployment was tested; these checks do not establish SME accuracy or production readiness.
