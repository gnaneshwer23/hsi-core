# B-04.4 — OA full-text retrieval and model entailment execution adapter

This increment introduces an actual Europe PMC OA fullTextXML HTTP retrieval function and an injectable model-runner interface for semantic entailment, with deterministic quote matching and fail-closed dispositions. Synthetic tests verify contracts; real API integration and accuracy have not been validated.

## Limitations and controls
- XML extraction intentionally supports only a bounded simple abstract paragraph; it is **not** a general JATS parser. Unsupported markup/entities fail closed. No persistent caching, content redistribution or full-article storage.
- A detected Creative Commons URL is **not** proof of rights. `reuseRightsVerified=false` always. A trusted licence verifier must establish permissions and attribution obligations before using passages for downstream publication.
- Live PMID resolution and fullTextXML PMCID retrieval are separate: an independently verified PMID→PMCID linkage must be added before treating passages as belonging to a specific publication.
- Correction/retraction status is unverified. Existing passage verification requires separately attested rights and clear status.
- Model execution is injected; no configured production LLM or independent model diversity is claimed. Quoted span matches are necessary but not sufficient for entailment.
- The challenger contract accepts model IDs but cannot prove independence; adversarial model evaluation and calibrated thresholds are pending.
- No PHI, patient data, database writes or trusted graph promotion.

## Next
Connect trusted licence/PMCID/retraction validation; add production model configuration and two independently executed challengers; benchmark entailment and abstention against expert-labelled cases before any automated scientific acceptance.
