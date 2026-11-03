# Phase 6 — Context annotation benchmark kit

**Date:** 2026-11-03  
**Status:** **READY FOR SME KICKOFF** — verified empty scaffolds minted. **No expert labels in-repo.**  
**Not** a measured 85%/40% result, Gate C approval, or scientific validation.

## What shipped

| Artifact | Path |
| --- | --- |
| Typed kit + validators | `src/contextAnnotationBenchmark.ts` |
| Split policy | `research/ra-anti-tnf/benchmark-split-policy-v1.json` |
| SME protocol | `research/ra-anti-tnf/sme-labelling-protocol-v1.md` |
| Guideline / empty worksheet | `context-annotation-guideline-v1.md` / `context-annotation-worksheet-v1.json` |
| Scaffold CLI | `bun run ra:scaffold-annotation -- practice\|verified` |
| Generated stores | `research/ra-anti-tnf/annotation-kit/` |

## Verified scaffold result (this tip)

```sh
bun run ra:scaffold-annotation -- verified
```

| Partition | Rows | Labels |
| --- | --- | --- |
| `practice_not_evaluation` (preserved) | 2 | none |
| `evaluation_frozen` | 4 | none |
| `training_candidate` (+ holdout) | 4 | none |
| Double-blind eval packets A/B | 8 rows each (identical ids) | none |

`STATUS.json`: `ready_for_sme_kickoff`, `labelledRows: 0`.  
Sources cover PMIDs 18375541 / 24586782 with receipted CC BY licence identifiers. No tags, grounding spans, or annotator ids were invented.

## Behaviour

- **Practice:** scaffolds unlabelled rows from `ra-anti-tnf-research` into
  `practice_not_evaluation` + double-blind packets A/B.
- **Verified:** mints empty eval/training rows from rights-verified
  `research/ra-anti-tnf/release.json` and writes `eval-packet-annotator-{a,b}.json`.
  Preserves prior practice rows in `benchmark-kit.json`.
- Adjudication records start with `finalTags: null`; fabricated labels forbidden.
- Practice rows cannot enter the evaluation split.

## SME practice labelling

```sh
bun run ra:scaffold-annotation -- practice
bun run ra:submit-practice-labels -- annotator-a scripts/example-practice-submission-a.json
```

Or use ISI `/internal-research` → **Context annotation practice**.

## SME next (human — not this tip)

1. Calibrate on practice packets (UI or CLI).
2. Independent A/B labelling of `eval-packet-annotator-*.json`.
3. Adjudication → freeze evaluation partition.
4. Report inter-annotator agreement and accuracy only after real labels exist.

## Honesty

Phase 6 engineering tip ends at empty scaffolds + double-blind packets. Shipping fabricated SME labels or flipping `scientificReview` would violate the benchmark protocol.
