# Step 2 — SSc scientific evidence curation

**Status:** preliminary abstract-grounded candidate assessment committed; **no human Gate C review, source passage reuse clearance, database import or approved graph release**.

## Sources reviewed

- PMID 30760472 (Ricard et al., 2019): SSc cohort cTfh increase and ex vivo IL-21-dependent plasmablast differentiation. Separate observational and experimental claims.
- PMID 29514998 (Taylor et al., 2018): human SSc skin Tfh-like cell association and **separate mouse-model** IL-21/ICOS intervention findings.
- PMID 33175976 (Ly et al., 2021): no difference in overall cTfh proportion versus controls but increased Tfh1 subset. Preserve contextual disagreement with Ricard; do not invent adjudication.
- PMID 21314428 and 16339522 remain pending independent source assessment in this Step 2 candidate pack.

Source links: https://pubmed.ncbi.nlm.nih.gov/30760472/ ; https://pubmed.ncbi.nlm.nih.gov/29514998/ ; https://pubmed.ncbi.nlm.nih.gov/33175976/

## Files and boundaries

`research/ssc-tfh-il21/curation-candidates.v1.json` is an **unreviewed research candidate manifest**, not a scientifically approved dataset. `src/sscCuration.ts` validates status, provenance identifiers, context and comparison references. `test/sscCuration.test.ts` guards against treating this manifest as approved. No claim is automatically inserted into `hsi_evidence_claim_drafts` or promoted to the published graph.

## Required next work

1. Run Step 1 Europe PMC ingestion and verify PMIDs/DOIs and publication metadata against live responses.
2. Review full papers where legally accessible, assess methods, sample sizes, confounding, source corrections, evidence quality and licensing.
3. Map candidate relationships to controlled ontology identifiers and predicates.
4. Build rights-aware, idempotent import into the draft claim/support tables with source references and claim-level lineage.
5. Implement authenticated Gate C scientist review with immutable audit and role enforcement.
6. Release only reviewed and approved claims via a versioned manifest; keep contradictory evidence and model distinctions visible.
7. Execute tests and CI, and verify Aksh/ISI independence.

**No patient data, clinical decision support, autonomous claim approval or therapeutic recommendations.**
