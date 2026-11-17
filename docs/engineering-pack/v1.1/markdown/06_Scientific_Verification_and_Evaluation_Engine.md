---
title: "06. Scientific Verification and Evaluation Engine"
subtitle: "HSI Engineering Specification Pack v1.1"
---

**Version:** 1.1, 16 November 2026 · **Owner:** Dr Gnaneshwer Jadav (scientific release owner) · **Repo baseline:** `hsi-core@43da794`

# 1. Decision summary

- **The benchmark is the product's proof, and its marketing.** We publish the protocol, the error rates and the disagreements. No competitor publishes a per-claim error record.
- **Verification has five verdicts:** supported, contradicted, mixed, insufficient evidence, abstain. Each carries the quoted passage and a rationale.
- **Independence is structural:** a different provider verifies, it sees only the claim and the passage, and humans adjudicate disagreements.
- **Start small and real:** 20 to 50 calibration cases first, then 100 to 200, before the full 120-slot HSI-BENCH-IMMUNO is filled. Never fabricate labels; an incomplete benchmark reports "blocked".
- **Prospective proof:** every hypothesis HSI proposes is timestamped and later scored against new evidence.

# 2. Vision

Anyone can see how often HSI is right, how often it says "I don't know" and where experts disagree with it, broken down by disease and by context type. Each release of the system is gated on those numbers. Over time, a public hypothesis ledger shows whether HSI's proposals were borne out by later research.

# 3. Where we are

| Item | Status | Location |
| --- | --- | --- |
| Entailment verifier contract | Partial | `src/evidence/entailmentVerifier.ts`; tested with mocked models |
| Two-model directional challenge | Partial | `src/investigation/directionalChallenge.ts`; needs two distinct providers |
| Dual-verifier and receipt boundaries | Partial | `src/researchV2/scientificReliabilityGate.ts`, `trustedEvaluationGrounding.ts` |
| Benchmark protocol (HSI-BENCH-IMMUNO) | Partial | `evaluation/independent-evaluation/immuno-v1/protocol.v1.json`; 120 slots: 50 core, 30 disease, 20 cross-domain, 20 governance; **0 adjudicated** |
| Scoring and acceptance code | Partial | `src/evidence/immunoBenchmark*.ts` |
| Gold evaluation suite scaffolding | Partial | `evaluation/gold-evaluation-suite/`, `src/goldEvaluationSuite.ts` |
| Blinded expert rating of gap outputs | Partial | `docs/product/EVALUATION_SET.md`; independence rules, agreement and intervals |
| Hypothesis ledger | Partial | Client-side only (`site/src/lib/useLedger.ts`, `localStorage`) |
| Named independent reviewers | Not started | Owner is designated scientific release owner, not an independent rater |

# 4. Verification flow

```text
candidate claim
  -> source still valid? (identity, rights, retraction) -- no --> abstain (reason)
  -> exact passage available? -- no --> insufficient (metadata only)
  -> verifier (provider B) sees claim + passage only
        verdict + quoted span + context check (species, tissue, population match?)
  -> quote matches passage exactly? -- no --> reject verdict, mark verifier_error
  -> extractor and verifier agree on direction?
        yes -> candidate ready for human review
        no  -> disputed -> human adjudication
```

Verdict rules:

| Verdict | Meaning |
| --- | --- |
| Supported | The passage states the claim in the stated context |
| Contradicted | The passage states the opposite or no effect in the stated context |
| Mixed | The passage reports both, or differs by subgroup |
| Insufficient | The passage is related but does not establish the claim, or the context does not match |
| Abstain | Source invalid, passage unavailable, or the verifier could not decide |

A context mismatch (for example, the claim says human synovium and the passage reports mouse joints) is always "insufficient", never "supported".

# 5. Benchmark design

## 5.1 Case types

| Slot group | Count | What it tests |
| --- | --- | --- |
| Core claims | 50 | Supported and contradicted claims with clear passages |
| Disease-specific | 30 | T2D, T1D, RA and MS mechanisms, including failed translations |
| Cross-domain | 20 | Gut–immune, neuro-immune, metabolic–immune links |
| Governance traps | 20 | Retracted sources, misleading citations, context shifts, unsupported causal claims, injected instructions |

## 5.2 Labelling protocol

1. Two independent experts label each case blind to each other and to HSI output.
2. Disagreements go to an adjudicator.
3. Labels are frozen, hashed and stored in a vault the runtime cannot read.
4. Report inter-rater agreement (Cohen's kappa) before reporting HSI accuracy. If agreement is below 0.6, fix the guidelines before scoring.

## 5.3 Metrics and proposed release floors

| Metric | Definition | Proposed floor for pilot release |
| --- | --- | --- |
| False-support rate | Share of cases HSI calls supported that experts say are not | ≤ 5% |
| Context-shift detection | Share of context-mismatch traps labelled insufficient | ≥ 90% |
| Citation validity | Quoted span exists verbatim in the cited source | 100% |
| Contradiction recall | Share of expert-labelled contradictions HSI flags | ≥ 70% |
| Abstention appropriateness | Share of abstentions experts agree were warranted | ≥ 80% |
| Retraction handling | Retracted sources excluded or flagged | 100% |

The owner must approve the floors before the first scored run. Do not change them after seeing results.

# 6. What to build next

| ID | Work | Acceptance criteria |
| --- | --- | --- |
| VER-01 | Two-provider verifier in the runner (AG-04) | Verdicts as in section 4; quote validation enforced in code |
| VER-02 | Founder development set (HSI-P3-01) | Two questions per slot group, outside the 120; used for tuning only |
| VER-03 | Calibration tranche | 20 to 50 cases double-labelled; kappa reported; guidelines revised |
| VER-04 | Pilot tranche (PRD-09) | ≥ 50 adjudicated cases scored; report published at `/benchmark` |
| VER-05 | Label vault | Frozen labels stored outside the runtime's database role; scoring job reads them, runtime cannot |
| VER-06 | Reviewer queue (ARBITER, PRD-10) | Queue, decision form, attribution, no self-review, adjudication step; immutable decision records |
| VER-07 | Server-side hypothesis ledger | Hypotheses stored with timestamp and content hash; outcome fields (supported, refuted, inconclusive, pending) filled later by review |
| VER-08 | Blinded usefulness study (N6) | Protocol frozen; 3 or more experts compare HSI briefs, a deterministic baseline and their usual workflow; time to check recorded |

# 7. Future options

- A public, prospective hypothesis ledger scored automatically as SENTINEL finds new publications and trial results.
- External benchmark comparison: run the same cases through general chatbots and research assistants and publish the comparison.
- Calibrated uncertainty per stratum once enough reviewed data exists.

# 8. Open decisions

| ID | Decision | Recommendation |
| --- | --- | --- |
| D-50 | Reviewer recruitment and payment | Pay per adjudicated case; recruit one reviewer per domain (immunology, metabolism, gut microbiome) through the founder's network; record conflicts of interest |
| D-51 | Approve release floors | Accept the table in 5.3 or set stricter values before scoring |
| D-52 | Publish failures | Yes. Publish per-category error rates and example failures with each release |
