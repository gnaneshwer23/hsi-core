# B-04.4 — Operational scientific reliability validation

## Status
This increment adds an executable benchmark harness for **injected** model runners, with per-case rights/source clearance checks and model-failure abstention. It does **not** provision provider credentials, certify source rights, create expert-labelled evidence or authorize production rollout.

## Operational checklist
1. Configure two approved provider deployments in server-side secret storage, with restricted egress, cost caps, audit identifiers and timeouts. Never commit API keys.
2. Integrate an independent source clearance service to validate PMID–PMCID identity, rights/attribution and current retraction/correction status. Never trust unverified fields provided by the model.
3. Build held-out SSc, RA and SLE evaluation cases; obtain two independent expert labels and resolve disagreements before locking the gold set.
4. Run `evaluateWithTwoModels` on the locked corpus. It skips uncleared passages, records model failures as abstentions and reports precision/false-support metrics.
5. Pre-register risk-tier thresholds, confidence intervals, subgroup coverage and a review/rollback plan. The harness always sets `releaseEligible:false` until independent scientific and security acceptance.

## Known limitations
- No model provider is provisioned; the harness executes only injected runners.
- `sourceIdentityVerified`, `rightsVerified` and `retractionCleared` are upstream attestations, not independently checked in this module; production caller must prevent fabricated attestations.
- The benchmark harness currently runs sequentially and caps at 1,000 cases. It does not persist results.
- Concordant models may share failure modes. Benchmark metrics are descriptive and cannot establish general clinical safety.
- No patient data, Neon writes or trusted graph promotion.
