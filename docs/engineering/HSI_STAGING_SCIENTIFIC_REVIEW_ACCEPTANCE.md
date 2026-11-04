# HSI staging scientific review — security and evidence-governance acceptance plan

Status: **Not validated against staging**. This document is an executable acceptance checklist, not proof of completed testing.

## Scope and isolation
- Target only the approved HSI staging branch and disposable test branch. Confirm project ID and database endpoint before any migration.
- Do not apply schema changes to production. Do not copy patient-identifiable data or real passwords into fixtures, logs, PRs, or tickets.
- Keep HSI clinical, Aksh and trial patient records outside this SSc public-biomedical review test.
- Authentication configuration and user provisioning are being handled separately; do not bypass them with hardcoded identities or browser-provided roles.

## Phase A — Environment readiness (blocking)
- [ ] Approved HTTPS auth endpoint is reachable and the frontend sign-in succeeds.
- [ ] Auth cookies are Secure, HttpOnly, scoped appropriately, and sent to the same-origin trusted API.
- [ ] Trusted Bun API is deployed behind an HTTPS reverse proxy; /api/research/interrogative/* does not resolve to the static SPA.
- [ ] API server uses staging HSI_DATABASE_URL and approved HSI_NEON_PROJECT_ID, with no client-side exposure.
- [ ] Migration 008 and its dependencies are reviewed and applied to staging by an authorised operator.
- [ ] Two distinct email-verified, unbanned, non-impersonated Neon Auth principals exist.
- [ ] Researcher has an explicit research access grant; reviewer has a valid scoped SSc reviewer authority grant.
- [ ] CI passes and deployment commit SHA matches tested SHA.

## Phase B — Authorisation matrix
| Scenario | Expected |
| --- | --- |
| No session cookie: GET investigation | 401 |
| No session cookie: POST submit or decision | 401 |
| Invalid/expired/impersonated session | denied |
| Cross-origin POST | 403, no mutation |
| Wrong Content-Type | 415, no mutation |
| Researcher reads own draft | allowed |
| Researcher reads another researcher's draft | denied |
| Verified SSc reviewer reads unrelated draft | denied |
| Verified SSc reviewer reads independently authored awaiting-review investigation | allowed |
| Researcher submits own valid draft | state becomes awaiting_scientific_review |
| Researcher submits another user's draft | denied |
| Researcher attempts reviewer decision | denied |
| Reviewer attempts to decide own investigation | denied |
| Revoked or out-of-scope reviewer attempts decision | denied |
| Reviewer sends wrong investigation hash or release manifest | denied |
| Reviewer approves without rationale, reviewed claims or limitations | denied |
| Valid independent reviewer decides awaiting investigation | one atomic decision and state transition |
| Second decision on same investigation | denied, original audit record unchanged |
| Agent/browser-supplied reviewer principal does not match authenticated actor | denied |
| Any review decision automatically publishes a knowledge-graph claim | **must never happen** |

## Phase C — Transaction and audit verification
- [ ] Verify hsi_interrogative_review_decisions contains exactly one decision row for the reviewed investigation.
- [ ] Verify persisted investigation state and decision are consistent in the same committed transaction.
- [ ] Verify decision_hash, investigation_hash, reviewer_principal, reviewed_at and release provenance.
- [ ] Verify rollback on failed validation or DB constraint; no half-written state.
- [ ] Verify approved investigation is not automatically promoted to a graph release.
- [ ] Verify audit access is restricted and audit logs redact tokens, secrets and patient data.
- [ ] Verify request_revision behavior: current implementation returns to draft but one-final-decision uniqueness prevents resubmission. Treat revision workflow as **blocked** until versioned investigation revisions and decision chains are designed and tested.

## Phase D — SSc scientific quality
- [ ] Keep Ricard, Taylor and Ly extraction source locators and evidence types visible.
- [ ] Distinguish abstract-only support from full-text-verified findings.
- [ ] Require independent reviewer examination of Tfh gating, cohorts, denominators and biological context before resolving Ricard/Ly differences.
- [ ] Keep hypotheses, computational inference and associations separate from established evidence.
- [ ] No review or graph approval based on synthetic fixtures.

## Release decision
**No-go** if authentication, reviewer independence, immutable audit, transaction atomicity, source traceability, or graph-publication separation fails. Do not claim a live scientific review workflow until staging evidence is recorded by an accountable operator.
