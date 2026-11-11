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
- Legacy `sourceIdentityVerified`, `rightsVerified` and `retractionCleared` input flags cannot authorize egress. The harness now requires a server-injected `SourceClearanceVerifier`. The supplied verifier checks a pinned Ed25519 authority signature, exact source/version/passage hash, explicit `model_transmission` permission, freshness and current revocation state. It does not itself determine legal rights or retraction truth; an independent approved authority must operate those checks and sign receipts.
- The benchmark harness currently runs sequentially and caps at 1,000 cases. It does not persist results.
- Concordant models may share failure modes. Benchmark metrics are descriptive and cannot establish general clinical safety.
- No patient data, Neon writes or trusted graph promotion.

## P0 hardening contract

- The full evaluation batch is structurally validated before source lookups or model calls. Duplicate IDs, invalid gold labels/reviewers, malformed grounding receipts and unadjudicated examples are rejected before egress. Reviewer IDs remain declarations; this is not independent verification of reviewer qualifications or labels.
- If any example fails initial grounding or source clearance, the entire batch abstains without model calls. A source receipt is checked again immediately before each case; later expiry/revocation blocks that case without undoing already-completed calls.
- Only concordant support accepted by conservative adjudication counts as `supports`. A failed receipt cannot be overridden by agreeing models. Every attempted verifier execution gets a distinct internal run ID; provider request IDs remain explicitly null until real provider integration supplies them. Results are returned, not durably persisted.
- Report schema `hsi-reliability-report-2` separates adjudication coverage, inference coverage, technical abstention and evidence insufficiency. `falseDiscoveryRate` divides false support by predicted supports; `falsePositiveRate` divides it by non-supporting gold cases. Counts/denominators are included. `coverage`, `falseSupportRate` and combined `abstentionRate` remain legacy aliases with documented meanings; migrate consumers to the new fields.
- Provider configuration permits only exact code-reviewed OpenAI/Anthropic endpoints, with provider/endpoint pairing. The transport receives a frozen config, `redirect:"error"` and an abort signal. The runner enforces a deadline across headers/body, streamed byte limits, HTTP/JSON checks and no implicit retries. The trusted adapter must pass redirect/signal restrictions through to its HTTP client; deployment DNS/egress restrictions still require security acceptance. No credentials, provider-specific request/response codec, token/cost quota service or live provider activation is included.
- Source receipts are canonical JSON signed by an independent authority using Ed25519. The research backend pins public keys and requires a bounded, current revocation lookup that fails closed. No signing key or trusted source authority is provisioned by this PR. The default maximum freshness is 24 hours (policy may tighten it); revocation lookups default to a one-second deadline.

All scientific release, human review, HSI-only isolation and migration holds remain unchanged. See `P0_IMPLEMENTATION_AND_ACCEPTANCE.md` for remaining external acceptance work.
