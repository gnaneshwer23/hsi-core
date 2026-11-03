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
- **Verified:** refused while `release.json` remains
  `awaiting_verified_source_import` (Phase 2 blocker). When a rights-verified
  release exists, mints empty eval/training rows and packets only.
- Adjudication records start with `finalTags: null`; fabricated labels forbidden.
- Practice rows cannot enter the evaluation split.

## SME next

1. Calibrate on practice packets (optional).
2. Complete Phase 2 licence import.
3. `bun run ra:scaffold-annotation -- verified`
4. Independent A/B labelling → adjudication → freeze evaluation partition.
5. Report inter-annotator agreement and accuracy only after real labels exist.
