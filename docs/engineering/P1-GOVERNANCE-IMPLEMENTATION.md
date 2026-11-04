# P1 governance implementation — incremental, not production validated

## Implemented in this commit
- HSI-owned scientific agent registry contract, role/tool allowlist and cost ceiling.
- Data classification boundaries: research agent execution refuses synthetic and patient-identifiable data.
- Provenance schema for research investigations, source/release, model/prompt, tool calls, cost and human review.
- Explicit fail-closed rule: an investigation record cannot publish scientific claims. Human approval must be independently verified by a trusted review and release service.
- Unit tests for tool permissions, budget, privacy and promotion controls.

## Not implemented or verified
- No live agent orchestration, external model invocation, model evaluation dataset, signed approval or persisted agent registry.
- No clinical privacy certification, independent scientific validation or secure live API.
- No Aksh/ISI contract implementation, outage testing or observability backend.
- P0 dependencies (authenticated Gate C, live graph release, research dashboard integration) remain open.

## Next P1 sequence, after P0
1. Curate real SSc sources and have independent qualified scientific reviewers evaluate evidence.
2. Build durable model/agent registry and evaluation harness with approved test datasets, metrics and budget telemetry.
3. Implement authorised, versioned Aksh and ISI contracts, explicitly optional for HSI runtime.
4. Add security/privacy threat model, least-privilege credentials and negative cross-tenant tests.
5. Add timeout, circuit-breaker, idempotent retry, monitoring and outage/recovery tests.
6. Validate end-to-end with human scientific reviewers before operational sign-off.
