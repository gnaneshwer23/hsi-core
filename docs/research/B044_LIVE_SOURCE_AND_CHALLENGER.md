# B-04.4 — Live publication retrieval and challenger contracts

## Added
- Live Europe PMC PMID metadata resolver with exact identifier matching, injectable fetch, schema validation and fail-closed handling of ambiguous results.
- Explicitly **unknown** correction/retraction status unless a retraction is flagged; no publisher permission or passage is inferred.
- Independent challenger **contract** and deterministic adjudication of structured challenge submissions. Contradiction, abstention, missing evidence or failed passage verification trigger exception routing.
- No graph promotion, clinical use, PHI, persistence or model-backed semantic entailment.

## Remaining blockers
1. A trusted source pipeline for rights-checked article passages and independently verified correction/retraction information.
2. Actual semantic entailment models with passage citations and biological qualifiers, independently benchmarked against expert-adjudicated biomedical corpora.
3. Real independent challenger execution, model diversity, verifier authorization and reproducible traces.
4. Calibration of error rates and abstention thresholds; independent AI agreement is not scientific truth.
5. A-01 researcher authorization for persistence; separate human scientific approval for authoritative graph promotion.

## Integration note
PR includes B-04.4.2/3 source and passage gates from the previously stacked branch, which had been merged into a feature branch but was not present on main at the time this work began.
