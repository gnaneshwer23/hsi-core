# B-03.4 — Scientific context benchmark protocol

**Status: protocol and structural evaluation gate implemented; real-publication corpus NOT YET collected or independently adjudicated. No validated performance claims.**

## Corpus requirements
- Begin with systemic sclerosis (SSc), Tfh, IL-21, B-cell mechanisms; include negative/null results, species distinctions, tissues, cohort and method differences, interventions, comparators, outcomes, and limitations.
- Retrieve verifiable real-publication metadata, permitted source passages, PMID, URL, source version, locator, passage SHA-256, and reuse rights. Do not fabricate text, citations or licences.
- Obtain two independent scientific annotations and a separate adjudicator; retain disagreement logs and reviewer identities. Never call a synthetic test fixture a real validation study.
- Separate development and held-out evaluation publications; report case counts and class balance; report per-field precision, recall, F1 and confusion counts.
- Evaluate negation, uncertainty, association versus causation, study limitations, and source-grounding in separate benchmarks. Current exact-phrase matcher does **not** perform these tasks.
- Target context F1 >= 0.85, grounding precision >= 0.95 and citation correctness >= 0.99; none is demonstrated by this PR.

## Acceptance
The runner rejects empty, synthetic, unreviewed, unlicensed or untraceable cases. Its numerical output is meaningful only when upstream provenance and independent annotation have been externally verified. A metadata string or mock SHA is not cryptographic verification; source retrieval and digest verification remain necessary. No automated graph promotion, patient data, Neon migration or production write.
