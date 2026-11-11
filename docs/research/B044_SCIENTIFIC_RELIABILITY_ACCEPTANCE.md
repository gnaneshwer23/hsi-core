# B-04.4 Scientific Reliability Gate — acceptance plan

This PR establishes **contracts, deterministic metrics and fail-closed checks**. It does not complete the reliability gate.

## Source authority
- PMID→PMCID linkage must be checked against independently obtained authoritative metadata.
- A trusted licence evaluator must interpret permissions and attribution; scraped licence URLs are not sufficient.
- Current correction/retraction status requires independent authoritative feeds and timestamped verification.
- Unverified or corrected/retracted articles require exception handling; no automatic approval.

## Model providers
- Register two separately controlled production deployments with server-managed credentials, endpoint allowlists, request limits, cost/timeout budgets, auditable run IDs and structured output.
- Existing injected model runners and provider transport contract are **not** live production integrations.
- Distinct model names do not prove independence.

## Scientific benchmark
- Create a held-out, disease-diverse expert-adjudicated set with at least two independent human labels per case and conflict resolution.
- Include SSc, RA and SLE; association vs causality, species/tissue mismatch, negative findings, retractions, ambiguous and unsupported passages.
- Pre-register false-support, precision, calibration, disagreement and abstention thresholds by risk tier. Stratify by disease and claim class; evaluate confidence intervals and dataset leakage.
- The metrics module is descriptive and always reports `releaseEligible:false`. No automatic trust promotion.

## Security and operational boundaries
- No PHI, no A-01 database writes, no automatic graph publication.
- Security-review provider endpoints and transport for SSRF, egress restrictions, secret handling, logging and retention.
- Human exception handling remains for high-risk or uncertain findings until empirical validation supports a scoped reduction.
