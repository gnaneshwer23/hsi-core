# HSI-BENCH-IMMUNO v1.1: proposed additions

**Status: proposal.** Scientific acceptance of the benchmark is still blocked (see [P1_B_IMMUNO_BENCHMARK_ACCEPTANCE.md](P1_B_IMMUNO_BENCHMARK_ACCEPTANCE.md)): there are zero authored or adjudicated cases, no approved quality floors, and no named experts. This document adds to v1.0; it does not replace it, and it invents no case, label or reviewer.

## Why add anything
v1.0 already gives 120 allocated slots, eight scored dimensions, a five-class conflict matrix, two independent experts plus adjudication, vault-held gold, contamination rules and a safety gate. It compares only HSI's own configurations (deterministic, single verifier, dual verifier). Four things are missing:

1. No objective test of whether a system **flattens context** (v1.0 scores context preservation by reviewer rating, 0 to 5).
2. No structured way to code **failed translation** from preclinical work to humans, although `translational_failure_investigation` exists as a category.
3. No comparison against **systems we do not control**.
4. No **prospective** test. Everything in v1.0 is retrospective.

## 1. Case profile: `translation_pair`
A preclinical claim (species, model, tissue, intervention, readout, evidence ids) paired with the human result (population, design, outcome, evidence ids). Outcome is one of supported, failed, mixed, harmful, not tested; the translation label is **derived** from it, never typed freely. Any outcome other than supported or not tested must state the **context boundary**: where the preclinical claim holds and where it does not. Failures are first-class cases, not exclusions.
Implemented and tested: `src/evidence/benchmarkV11Profiles.ts` (`validateTranslationPair`, `deriveTranslationLabel`).

## 2. Case profile: `pooled_claim_decomposition`
A pooled claim that an expert has split into 2 to 24 strata. Each stratum is keyed by species, tissue, population subset, disease stage and study design, carries a direction (supports, opposes, null, mixed) and lists its studies. A study sits in exactly one stratum.
A system is scored against the adjudicated breakdown by **counting**, not by rating:
- stratum recall and precision (keys matched case-insensitively),
- exact study-count agreement per matched stratum,
- direction agreement per matched stratum,
- a **flattened** flag when the system returns one stratum for a claim the experts split.

A single blended score ("0.82") can score recall for at most one stratum, which is the point. Implemented and tested: `validatePooledClaim`, `scoreDecomposition`.

## 3. Headline reporting
Lead with error rates, not with an overall score, and report every layer, domain and risk subgroup as v1.0 requires:
- false-support rate among supported predictions (v1.0 definition),
- flattened-answer rate on pooled-claim cases,
- failed-translation recall (failures the system surfaced / failures in gold),
- abstention appropriateness.

Publish the **failures** alongside the successes: counts by category, and case-level diagnostics once a case rotates out of the holdout. No quality average is multiplied by a safety indicator; provenance and safety stay independent hard gates (v1.0).

## 4. External baseline arm (optional, after v1.0 runs)
Compare against general-purpose systems on the same frozen cases only if all of these hold:
- terms of service permit benchmarking and the vendor's output can be stored,
- each system receives identical questions and cutoff, with prompts and settings recorded; outputs are scored blind to system identity by reviewers who did not author the case,
- the protocol, rubric and thresholds are hash-locked and published **before** any external run,
- results state which version, date and access tier were tested, and any case a system could not process is reported, not dropped.

Caveat: a benchmark we wrote and score ourselves favours us. Pre-registration, blind scoring, publishing failures and external adjudicators are the mitigations; none removes the conflict entirely.

## 5. Prospective arm
Separate from the retrospective holdout. A hypothesis is frozen when generated: text digest, graph version, timestamp, predicted outcome, resolution criteria and a resolve-by date, recorded append-only. It is scored only against a later publication or trial readout that meets the pre-registered criteria. Report resolved, unresolved and contradicted counts; an unresolved hypothesis is never counted as a success. Needs a ledger store; the append-only pattern in the investigation store (#347) and held migration 031 (#351) is the model. No ledger or scoring code is included here.

## Needs humans, not code
- Scientists to author and adjudicate real cases, including real failed translations, and to approve the dispute rule.
- Approval of quality floors and the freeze and rotation schedule.
- Named, conflict-declared expert reviewers and the custody of the vault.
- A decision on whether to run the external arm at all.

## Candidate cases for a scientist to assess (not verified, not gold)
Two translation examples are commonly cited: IL-17 pathway blockade in rheumatoid arthritis (strong preclinical support, disappointing trials) and anti-TNF therapy (effective in RA, worse outcomes reported in MS). They are listed only as prompts. Their facts, citations and contexts must be established from primary sources by the authoring scientist before either becomes a case.

## What this does not claim
Nothing here shows HSI is accurate. It specifies how to find out, and what would count as a failure.
