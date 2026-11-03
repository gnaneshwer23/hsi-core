# Phase 6 — Context annotation benchmark kit

**Status:** Engineering kit ready for SME kickoff. **No expert labels in-repo.**  
**Not** a measured 85%/40% result, Gate C approval, or licence clearance.

## What shipped

| Artifact | Path |
| --- | --- |
| Typed kit + validators | `src/contextAnnotationBenchmark.ts` |
| Split policy | `research/ra-anti-tnf/benchmark-split-policy-v1.json` |
| SME protocol | `research/ra-anti-tnf/sme-labelling-protocol-v1.md` |
| Guideline / empty worksheet | existing `context-annotation-guideline-v1.md` / `context-annotation-worksheet-v1.json` |
| Scaffold CLI | `bun run ra:scaffold-annotation -- practice\|verified` |
| Generated empty stores | `research/ra-anti-tnf/annotation-kit/` |

## Behaviour

- **Practice:** scaffolds unlabelled rows from `ra-anti-tnf-research` into
  `practice_not_evaluation` + double-blind packets A/B.
- **Verified:** Phase 2 CLEARED — rights-verified `release.json` exists
  (`scientificReview: unreviewed`). Scaffolding mints empty eval/training rows
  and packets only; fabricated labels remain forbidden.
- Adjudication records start with `finalTags: null`; fabricated labels forbidden.
- Practice rows cannot enter the evaluation split.

## SME practice labelling (available now)

```sh
bun run ra:scaffold-annotation -- practice
bun run ra:submit-practice-labels -- annotator-a scripts/example-practice-submission-a.json
```

Or use ISI `/internal-research` → **Context annotation practice** (Annotator A/B forms).
Validated practice JSON downloads locally and stays `practice_not_evaluation`.

## SME next (evaluation)

1. Calibrate on practice packets (UI or CLI).
2. Complete Phase 2 licence import.
3. `bun run ra:scaffold-annotation -- verified`
4. Independent A/B labelling → adjudication → freeze evaluation partition.
5. Report inter-annotator agreement and accuracy only after real labels exist.
