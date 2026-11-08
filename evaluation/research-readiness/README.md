# Research-question design and independent SME intake

This is a **50-question draft design bank**, not an expert-reviewed scientific benchmark. There are no approved evidence packets, factual expected answers, expert labels, frozen held-out split or scientific scores yet.

The draft stays within RA/SSc translational immunology and research boundaries. Eight categories cover mechanism reasoning, biomarkers/context, retrieval, contradictions, trial relevance, safety, entity resolution and uncertainty. Safety questions intentionally include prohibited requests as test inputs; they are never instructions to the application or a model.

## Files

- questions.draft.json: 50 unique design questions with explicit context requirements. Source packet and scientific label fields are empty.
- annotator-a.pending.json / annotator-b.pending.json: separate unassigned annotation slots bound to bank and case hashes.
- readiness.json: coverage, blockers and zero labelled cases; scientific metrics are null and model activation false.
- method-registry.json: existing deterministic source-selection method and exact prompt version/hash; no configured candidate model or measured scientific performance.

Regenerate/check with:
~~~
bun --no-env-file run readiness:prepare
bun --no-env-file run readiness:check
~~~

The first command updates generated, unanswered templates. Store actual annotations in separate protected copies; never put answers in the generated pending templates. These local JSON files cannot prove reviewer identity, approve source rights, grant roles or activate a model.

## Annotation protocol

1. A scientific owner refines the question and relevance rubric; preserve research/clinical boundaries and version any change.
2. A source owner supplies a permitted versioned packet with sources/passages/locators/hashes, species/tissue/stage/cell-state/assay/dose/timepoint/cohort context and relevant opposing/null observations. Missing context remains missing.
3. Bind each case to the exact packet hash. Never use synthetic evidence, generic hypothesis text, model memory or invented PMID/DOI/trial IDs as ground truth.
4. Two independently provisioned SMEs annotate separately: acceptable answer envelope, allowed/required source claims, opposing evidence, context limits, abstention expectation and rationale. An annotation slot is not a verified person.
5. Compare annotations and adjudicate disagreements with accountable human decisions; retain both original records, source versions and rationale.
6. Define development and held-out partitions before tuning. Keep questions/source variants from leaking across splits; record actual exposure/tuning history. No draft question here is claimed unseen.
7. Approve metrics and thresholds before measuring. Evaluate citation integrity separately from semantic support, context, contradiction recall, false certainty, abstention, usefulness, latency and cost.
8. Convert approved, scoped cases into the existing Phase E evaluation input/label contracts only when their source and reviewer permissions are verified. Evaluate baseline and candidate on identical frozen inputs.
9. Model activation and graph publication require their own gates; a high offline score or edited status field cannot activate them.

The existing engineering harness is documented in [Phase E](../../docs/PHASE_E_BOUNDED_AI_AND_SCIENTIFIC_EVALUATION.md). This packet broadens evaluation design, not measured scientific capability.

Gold Evaluation Suite v1 extends these contracts with ten capability slots (still empty of SME gold): see [GOLD_EVALUATION_SUITE_V1.md](../../docs/engineering/GOLD_EVALUATION_SUITE_V1.md) and `bun run gold:prepare` / `gold:check`.
