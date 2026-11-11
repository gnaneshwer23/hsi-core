# B-04.4.2 + B-04.4.3 — Source and exact-passage verification

This additive module consumes verified source envelopes and candidate claims, checks identity metadata, documented rights, correction/retraction state, SHA-256 passage integrity and exact quoted spans, and preserves biological qualifiers. It returns **grounded candidates**, not approved graph relationships.

## Trust boundaries
- `identityChecked`, `correctionStatus`, and rights fields are **attestations from an upstream trusted verifier**; this module cannot establish that they are true.
- There is **no live PubMed/Crossref/retraction API lookup** in this increment; no publisher licence determination and no autonomous AI critic.
- Matching an exact quote does not establish that the quote supports the interpretation. Semantic entailment, methods, polarity, conflicting findings and species/tissue applicability need subsequent independent tests.
- Synthetic unit tests do not demonstrate scientific accuracy on real biomedical literature.
- The existing B-04.2 Europe PMC adapter has `passageUsePermitted:false`; it cannot be promoted to passage rights by this code. A separately authorized and audited source pipeline is required.
- No patient data, database writes, AI approval or trusted knowledge graph publication.

## Required next verification
1. Trusted independent PMID/DOI resolver and current correction/retraction feed.
2. Permission-aware full-text/passage ingestion with reproducible hashes and immutable source snapshots.
3. Biological relation entailment evaluation with expert-adjudicated datasets and calibrated abstention.
4. Integrate these results into B-04.4.1 verification receipts and researcher UI; implement reviewer exception queue without treating AI confidence as truth.
5. Complete CI and independent scientific/security validation before expanding automatic processing.
