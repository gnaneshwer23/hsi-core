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
| Security headers | `site/vercel.json` | yes | yes | yes | **CSP is now `Content-Security-Policy` (enforced), changed from report-only in #637, merged 22 Nov 2026 16:42 UTC.** Before the change: all static routes in the built site loaded under the enforced policy with no violation, and the check fails when the policy is broken. **After the change (22 Nov, read-only):** production logs for the previous 7 days held one `csp_violation` (`script-src-elem`, inline, page `/`, 16 Nov 15:06 UTC, during the report-only period; cause not established, a browser extension is the usual source and the live home page has no executable inline script); none in the 40 minutes after the deploy; the live header is enforced with no report-only header; 10 live routes (marketing, gap register, journey, graph, sign-in) loaded client-side with a violation listener and recorded zero. `style-src` still allows `'unsafe-inline'`. Violations still report to `/api/csp-report` | Only 7 days of logs and probably light traffic; interactive and authenticated flows not exercised; re-check after a day or two of real traffic with `vercel logs --environment production --no-follow --no-branch --since 24h --query csp_violation`; tighten `style-src`; Vercel preview deployments block the toolbar script | P1 | Security signer |
| Durable jobs | `nexusJobs`, `fileCheckpointStore`, `nexusWorker`, `nexusRunCommand` (#629), `fileLock`, `gatewayLimitStore` | yes | partial | yes | Fixture runs complete once; restart read and 6-process CAS race tested. Single host file stores. Per-task budgets and rate windows can now persist across restart (`createFileLimitStore`, opt-in, atomic across 6 processes in tests) | DB-backed store (needs held migration approval); dead-letter; worker health; a host outside the 30 s Vercel function cap; a store shared by several hosts; no host selects the file stores by default | P0 | Owner approval |
| Agent orchestration and tool fencing | `hsiAgentOrchestrator`, `hsiAgentDurableCheckpoint`, `hsiCheckpointedExecutor`, `assertHsiToolPermission` | yes | partial | yes | Nine tool ids; per-manifest permission; denied calls recorded. **Executors now get `ctx.callTool`, which runs the same permission check and then the gateway.** An interrupt, restart and authorised recovery was demonstrated in tests with an injected fetcher: the provider was contacted once across both attempts | Hard process kill is not covered (a `running` checkpoint is refused for recovery by design). No production executor calls a tool yet. The checkpoint store is not wired into the authorised runtime's defaults. Real live execution | P0 | Owner approval |
| **Governed tool gateway** | `src/governedToolGateway.ts` (#634) | yes | partial | yes | Catalogue, manifest permission, input and output schema, https host allowlist, no redirects, timeout, bounded retry, byte cap, per-provider rate limit, per-task budget, idempotent replay, licence gate, injection flag, provenance, hash-chained audit. Fails closed. 48 gateway, wiring, provider and limit-store tests (17, 7, 12, 12), all with injected fetchers | **Not an MCP server or client.** No production code path calls it. No real provider call was made. Allowlist is by hostname, no DNS pinning. Injection handling is structural plus a heuristic flag. Needs an independent security read before any wiring into a request path | **P0** | Security signer, owner |
| External providers | Behind the gateway (metadata only): Europe PMC, OpenAlex, Crossref, ClinicalTrials.gov, Open Targets (`governedProviderTools.ts`). Still ad hoc: Reactome, UniProt, registry refresh, `evidence/openAlexRelatedWorks.ts`, others in `src/evidence/*` | partial | partial | yes | Response shapes checked against current docs and a one-time live read (see `HSI_PROVIDER_CONTRACTS_2026-11-22.md`). **OpenAlex keyless use shares a $0.10/day budget per network address; a live response carried a notice addressed to AI agents, which the gateway drops** | Move remaining providers behind the gateway; PubMed/NCBI, ontologies and omics not built; rate limits and terms for ClinicalTrials.gov not found; the repo's Open Targets query and Europe PMC not re-verified; source-policy owner must approve each provider's terms and quota; an OpenAlex key is a human decision | P0 | Source-policy owner |
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
  -> governed tool gateway (BUILT, tested, not yet called by any production path)
  -> source clearance receipts (exists, human policy needed)
  -> durable job host + DB checkpoint store (file store exists; DB held)
  -> model deployments for extraction and 2 verifiers (human approval)
  -> saved investigation (persistence held)
  -> independent review (human)
```

Items that coding cannot supply: a signed source policy, an independent security reviewer, appointed scientific reviewers, approved model deployments, real accounts, and held-migration approval. The repo's own ledger records the same boundary. Until those exist, the steps after the gateway can only be built and tested against fixtures, and must be reported as such.

## Open PRs inspected

Landing and marketing: #630 (mine), #592 and #591 (recommend close), #596 (docs, conflicts). Infrastructure and acceptance: #618 to #625. #622 (nested research API entries) and #624 (hold an unreviewed staging migration) touch security and database paths; they were not altered. At the time of the audit no open PR implemented a tool gateway; see the ledger below for what has since landed.

## Implementation ledger

Updated 22 November 2026 against `main` at `0af9a41ca2d14042f844595979af7f28c459dfe9`. States use the vocabulary above: nothing here is deployed, security accepted or scientifically validated.

| Phase | Increment | PR | State |
| --- | --- | --- | --- |
| 0 | This audit | #631 | Merged |
| 2 (partial) | File-backed checkpoint store, worker and fixture run command | #629 | Merged. Fixture mode only; live execution deliberately unreachable from the worker. Not deployed |
| 3 | Governed tool gateway: catalogue, manifest permission, schema validation, host allowlist, timeout, bounded retry, byte cap, rate limit, budget, idempotent replay, licence gate, injection flag, provenance, hash-chained audit | #632 (closed, superseded), included in #634 | Merged as part of #634. Injected fetchers only. Not an MCP server |
| 2/3 | Gateway wired into the orchestrator and authorised runtime (`ctx.callTool`), durable file idempotency store, per-task budget key, interrupt-and-recover demonstration | #633 (closed, superseded), included in #634 | Merged as part of #634. The demonstration passes in tests; breaking the durable store makes it fail. Hard process kill not covered |
| 3 | Providers behind the gateway: OpenAlex, Crossref, ClinicalTrials.gov, Open Targets (several providers per tool id; caller names one) | #634 | Merged. Metadata only. No real provider contacted by tests. No key or account created |
| 2/3 | Persisted limit store for per-task budgets and per-provider rate windows; `fileLock` extracted | #635, included in #634 | Merged as part of #634. Opt-in; atomic across 6 processes in tests; fails closed |

### Still open from the audit's dependency path

1. Independent security read of the gateway's egress, idempotency and budget logic, then a wiring PR that lets a real executor call it. Nothing in production code does yet.
2. Source-policy approval of each provider's terms and quota; an OpenAlex key decision.
3. Database-backed checkpoint, idempotency and limit stores (needs held-migration approval); a worker host outside the 30 s Vercel function cap.
4. Real model deployments for extraction and two independent verifiers (human approval).
5. Persistence, tenant isolation and authentication acceptance (independent security reviewer, real accounts).
6. Scientific evaluation with independently adjudicated cases.
7. Tighten `style-src` (CSP is enforced since #637), structured logging and correlation ids, rollback verification.
