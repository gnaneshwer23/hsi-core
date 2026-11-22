# ARCH-009 Phase 2 — Durable Execution and Adapter Milestone
Date: 2026-11-04
Status: Implemented in source; latest CI pending; persistence integration NOT deployed.

## Implementation
- src/hsiAgentOrchestrator.ts: bounded dependency-aware execution and role-based permission checks.
- src/hsiAgentDurableCheckpoint.ts: atomic compare-and-swap checkpoint store interface, versioned checkpoint hash, explicit operator recovery with maximum three attempts, no replay of completed/running tasks.
- src/hsiArch003AgentAdapters.ts: adapters for the existing deterministic SSc question planner and falsification analysis. Output persistence is injected by the caller and must be trusted.
- Tests: hsiAgentOrchestrator, hsiAgentDurableCheckpoint and hsiArch003AgentAdapters.
- Denied tool attempts are preserved in run traces without being counted as authorised tool executions.

## Limits and open gates
1. No actual durable database adapter, deployment or database migration exists. In-memory tests prove the interface semantics only, not restart survival.
2. ~~The orchestrator is not yet wired to checkpoint storage; execution results are in-process.~~ **Engineering soft-land (U35 + U39, 21 Nov 2026):** `runHsiAuthorizedResearchAgentRuntime` wraps ARCH-003 executors with `checkpointHsiExecutor` under owner approval; `pipeline: "expanded_ssc"` adds claim_verifier / hypothesis_generator / safety_policy_gate (optional evidence_retriever). Live multi-process restart E2E and Neon durable adapter deploy remain open.
3. Timeout via Promise.race does not stop an executor's side effects. Before external tools, add cooperative AbortSignal, isolation, lease/fencing tokens and idempotency keys. A timed-out tool must not commit a late result.
4. Recovery is operator-authorised by a nonempty identifier at the contract level; authentication, authorisation and append-only approval auditing must be enforced by a trusted backend.
5. Fingerprint versioning and multi-round scientific review remain separate migration/design dependencies. Never overwrite historical decisions.
6. Agent adapters are deterministic. No claim of autonomous multi-agent research or real scientific validation.
7. Phase 2 production or staging deployment requires explicit permission and completed integration/safety tests.

## Next acceptance gates
- CI passes full test/build/validation.
- Trusted Neon staging checkpoint adapter with atomic transaction and schema migration.
- Server-verified operator grants and immutable recovery decision log.
- Abort-aware executors with idempotent output sink and fencing.
- Restart/recovery tests against staging.
- No PHI exposure or autonomous scientific approval.

## Update 22 Nov 2026: file-backed checkpoint store and job worker
- `src/fileCheckpointStore.ts` implements `HsiCheckpointStore` on the local file system with cross-process compare-and-swap (lock directory, version check under lock, flushed temp file renamed into place, versions advance by exactly one, stale locks reclaimed). Tests include a restart read and six processes racing one claim.
- `src/nexusWorker.ts` drains the `nexusJobs` journal with bounded concurrency, a daily cap read from durable state, cooperative abort, and no automatic retry of failed jobs. All claims and leases stay in `runDurable`.
- **Scope and limits.** Single host or a shared volume with working `mkdir` and `rename`; not a distributed lock service. It does not replace the Trusted Neon staging adapter above (that still needs migration approval; migrations 022 to 033 stay held). It is not wired to a scheduler or deployed, no real live run has been made, and it does not make timeouts kill external work. Records hold identifiers, states, hashes and references only.

### Run command (22 Nov 2026)
`bun run nexus:submit --fixture <name|path>`, `bun run nexus:work [--concurrency n] [--max-jobs n] [--daily-cap n] [--retry-failed] [--loop]`, `bun run nexus:status` (script: `scripts/nexus-worker.ts`, logic: `src/nexusRunCommand.ts`). Output goes to `out/nexus` (git-ignored): `jobs/` journal, `queue/` submitted fixtures, `audit/<jobId>/` one hash-chained audit store per job.
- **Fixture mode only.** Replays recorded synthetic inputs: no network, no model, nothing promoted. Every result carries the fixture notice.
- **Live is deliberately not reachable.** A background worker cannot type the human confirmation that names the job, so `--live` is refused and the guarded path stays `scripts/run-investigation.ts --mode live --execute`.
- Not wired: the file checkpoint store is not yet used by this command (the agent runtime that consumes it needs owner approval), no scheduler or service unit, no deployment.
