# B-04.4 — AI-first scientific verification engine

## First increment: deterministic candidate verification
This change integrates directly with B-04.3 `CandidateGraph` and B-04.1 evidence-state contracts. It produces structured verification receipts for Open Targets association candidates. It **does not** run an AI critic, check live publications, validate passages, or publish to the trusted graph.

- Every edge must belong to the provided candidate graph.
- Source references, entity identifiers, disease context and association-only semantics are checked.
- Metadata-only claims are explicitly marked as lacking passage grounding.
- Unsupported causal, therapeutic or tissue/cell-specific claims route to exception review.
- Receipts cannot approve evidence, assert scientific truth or activate graph promotion.
- No PHI, persistence, database migrations, reviewer impersonation or live writes.

## Next increments (not implemented here)
1. B-04.4.2 verified PMID/DOI resolution, corrections/retractions and licensed passage retrieval.
2. B-04.4.3 exact-span claim grounding, evidence polarity, methods and species/tissue/cell qualifiers.
3. B-04.4.4 independent critic/challenger with structured disagreements; model agreement is not proof.
4. B-04.4.5 calibration against independently adjudicated, held-out biomedical benchmarks; measure precision, citation correctness, false approvals and abstention.
5. B-04.4.6 risk-tiered automated candidate processing and human exception routing, preserving separate authorization for trusted graph approval.

## Acceptance
- [ ] Typecheck, tests, CI
- [ ] No unsupported publication, causal or mechanistic claims
- [ ] Source tampering and graph mutation tests
- [ ] B-03.4 real human-adjudicated benchmark before automated promotion claims
- [ ] A-01 independently accepted before persistent multi-user investigation records
- [ ] Explicit scientific governance approval before any trusted graph write
