# Production mandate: Phase 0 audit and implementation ledger

Date: 22 November 2026. Audited commit: `8a25c5be6f15fd2eeeeeb27880d28b90e8c5fa29` (main, after #629). Main checkout working tree: untracked `.claude/` and `.impeccable/config.json` only (not touched). All work is done in a separate worktree.

This is a code-and-CI audit. Nothing was deployed, no database was contacted, and no provider was called. It does not establish production readiness or scientific validity.

## State vocabulary

The six states are never treated as equivalent.

| Code | State | Meaning here |
| --- | --- | --- |
| I | Implemented | Working code exists, not only a contract |
| N | Integrated | Reached from a real entry point (API route, CLI, UI) |
| T | Tested | Automated tests exist and pass in CI |
| D | Deployed | Verified on a named target. **Not assessed in this audit** |
| S | Security accepted | Independent reviewer signed the scope. **None exists** |
| V | Scientifically validated | Independently adjudicated results exist. **None exist** |

Legend: yes, partial, no, n/a. D, S and V are "no" or "not assessed" in every row unless stated.

## Traceability matrix

| Capability | Existing code | I | N | T | Verified behaviour (this audit) | Missing production requirement | Priority | Release gate |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Authentication and session | `src/server/neonAuthGateway.ts`, `hsiEvidenceSessionGateway.ts`, `site/api/auth/*` | yes | yes | yes | Routes and gateway tests exist; main CI green | Independent security review; real-account evidence; migrations 031 to 033 stay held | P0 | Security signer, owner |
| Tenant isolation | `researchOrganisationTenantSecurity`, `stagingIsolationRunner`, `isolationProbeCatalog` and tests | partial | partial | yes | Unit and rehearsal tests only. The repo's own audit records a held owner-GUC weakness and no real-account pooled HTTP evidence | Real two-researcher staging run with protected evidence | P0 | Security signer |
| Request controls | `researchRequestControls`, `boundedRequestBody`, `askHandler` | yes | yes | yes | Per-user limits are per instance; cross-instance budget needs `HSI_SHARED_ADMISSION_URL` | Shared limiter, request correlation | P1 | Operations owner |
| Security headers | `site/vercel.json` | yes | yes | yes | **CSP is now `Content-Security-Policy` (enforced), changed from report-only.** Validated by loading all static routes in the built site under the enforced policy with no violation; the check fails when the policy is broken. `style-src` still allows `'unsafe-inline'`. Violations are still reported to `/api/csp-report` | No production report data was read before enforcing (no deployment access in this work); interactive flows are not covered by the route-load check; preview deployments will block the Vercel toolbar script; tighten `style-src`; verify the header on a real deployment | P1 | Security signer |
| Durable jobs | `nexusJobs`, `fileCheckpointStore`, `nexusWorker`, `nexusRunCommand` (#629) | yes | partial | yes | Fixture runs complete once; restart read and 6-process CAS race tested. Single host file store | DB-backed store (needs held migration approval); idempotency keys for side effects; dead-letter; worker health; a host outside the 30 s Vercel function cap | P0 | Owner approval |
| Agent orchestration and tool fencing | `hsiAgentOrchestrator`, `hsiAgentDurableCheckpoint`, `hsiCheckpointedExecutor`, `assertHsiToolPermission` | yes | partial | yes | Nine tool ids; per-manifest permission; denied calls recorded | Real live execution; checkpoint store not wired into the runtime | P0 | Owner approval |
| **Governed tool gateway (MCP)** | **None.** Provider calls are made ad hoc in about a dozen modules | **no** | no | no | No registry, catalogue, schema validation, egress allowlist, per-call audit or budget exists | Whole workstream C | **P0, first increment** | Owner approval |
| External providers | Europe PMC, Open Targets (`researchV2/sourceAdapters.ts`), OpenAlex, Crossref, Reactome, UniProt, registry refresh in `src/evidence/*` | partial | partial | yes | Each module fetches independently; no shared policy layer | Consolidate behind the gateway; current provider terms review | P0 | Source-policy owner |
| Source clearance (AEGIS) | `sourceClearanceReceipt`, `operationalSourceClearance`, `clearanceAuthority` | yes | partial | yes | Signed-receipt checks exist | A named human signs the policy; independent clearance authority | P0 | Source-policy owner |
| Evidence extraction and verification | `contextualEvidenceExtraction`, `passageLinkedContext`, `researchV2/scientificVerification`, `dualModelChallenge` | partial | partial | yes | Tested on recorded outputs; real model extraction unverified; model keys are not provisioned | Approved model deployments (two distinct verifiers) | P1 | Owner approval |
| Knowledge graph | `livingHealthKnowledgeGraph`, `knowledgeGraph/*`, published snapshot | yes | yes | yes | 153 concepts, 95 candidate relationships, 9 gaps, **0 reviewed** (read live in site) | Reviewed slice; reassessment after source corrections | P1 | Scientific reviewer |
| Gap navigation | `evidence/gapVerification`, `gapReport`, `/research/gaps` | partial | yes | yes | Deterministic gaps from the snapshot. No transparent multi-factor ranking verified | Ranking with stated factors and limits | P1 | Scientific reviewer |
| Scientific Companion | `site/src/pages/ScientificCompanion.tsx`, `/api/ask` | partial | partial | yes | `/api/ask` routes to curated scenarios; no free-text reasoning backend and none should be added outside the governed gateway | Evidence-grounded conversation on the investigation services | P2 | Owner approval |
| Research workspace persistence | `researcherWorkspaceApi`, migrations 023, 031 to 033 | partial | partial | yes | Device-local by default; server persistence blocked by held migrations | Security review, migration approval | P0 | Security signer |
| Scientific evaluation | `goldEvaluationSuite`, `immunoBenchmark`, `scientificAccuracyHarness` | partial | no | yes | Contracts and a 120-slot profile exist. **Zero adjudicated real cases** | Independent expert cases, thresholds | P0 | Scientific reviewers |
| Public frontend | `site/` (16 indexed pages) | yes | yes | yes | Build, axe and navigation e2e pass | Claims must track maturity | P2 | Owner |
| Observability | scattered `requestId` fields in a few modules | no | no | no | No structured logger, correlation id or trace layer found | Logger, correlation ids, trace ids, SLOs from measured values | P1 | Operations owner |
| CI/CD | `.github/workflows/*` | yes | yes | n/a | verify, e2e, bun audit, full-history gitleaks, generated-status check, production probe all run | Tenant-isolation run against a real database; rollback verification | P1 | Owner |

## Shortest dependency path to one secure, evidence-grounded investigation

```
authn/session (exists, unaccepted)
  -> governed tool gateway (ABSENT)          <- first increment
  -> source clearance receipts (exists, human policy needed)
  -> durable job host + DB checkpoint store (file store exists; DB held)
  -> model deployments for extraction and 2 verifiers (human approval)
  -> saved investigation (persistence held)
  -> independent review (human)
```

Items that coding cannot supply: a signed source policy, an independent security reviewer, appointed scientific reviewers, approved model deployments, real accounts, and held-migration approval. The repo's own ledger records the same boundary. Until those exist, the steps after the gateway can only be built and tested against fixtures, and must be reported as such.

## Open PRs inspected

Landing and marketing: #630 (mine), #592 and #591 (recommend close), #596 (docs, conflicts). Infrastructure and acceptance: #618 to #625. #622 (nested research API entries) and #624 (hold an unreviewed staging migration) touch security and database paths; they were not altered. No open PR implements a tool gateway.

## Implementation ledger

| Phase | Increment | State |
| --- | --- | --- |
| 0 | This audit | Written |
| 2 (partial) | File-backed checkpoint store, worker and fixture run command (#629) | Merged. Not wired to the agent runtime, not deployed |
| 3 | Governed tool gateway (`src/governedToolGateway.ts`): catalogue, permission via existing manifests, schema validation, host allowlist, timeout, bounded retry, byte cap, rate limit, per-investigation budget, idempotent replay, licence gate, injection flagging, provenance, hash-chained audit. First tool: Europe PMC literature search (metadata only) | Built and tested with injected fetchers only. **No real provider call was made.** Not wired to the agent runtime or any API route. Not an MCP server. Rate limit, budget and default idempotency are per process |
