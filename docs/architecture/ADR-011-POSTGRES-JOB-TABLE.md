# ADR-011: Postgres job table for durable investigation runs

**Status:** Proposed — needs owner sign-off before implementation.
**Date:** 17 November 2026
**Source:** Engineering pack v1.1 § Architecture decisions; build plan A3.1.
**Related:** ADR-009 (agent intelligence), ARCH-009 Phase 2 durable execution notes, held migrations 022–033.

## Context
Investigation runs today can outlive a single HTTP request. Managed workflow products add another vendor and make replay harder. Neon already hosts the research substrate; run state should live beside the data it writes.

## Decision
Use a **Postgres job table** with a long-running worker:

- Claim work with `SELECT … FOR UPDATE SKIP LOCKED`.
- Track leases, attempts and a dead-letter state after bounded retries (default: 3).
- Stage machine: `queued → running → stage_n → done | failed | cancelled`.
- Lease expiry requeues; crash mid-run resumes from the last completed stage without duplicate durable writes.
- `POST /api/ask` (and similar) return **202** with a run id; clients poll `GET /api/runs/{id}`.

Canonical table shape (target): `hsi_jobs` with `id`, `kind`, `payload`, `status`, `attempts`, `lease_until`, `last_error`.

## Consequences
- One less external queue; replay is a SQL query over jobs and investigation events.
- Worker host must be chosen against current Vercel/Neon limits; revisit if concurrency exceeds one worker pool.
- Jobs **never** set scientific approval, graph promotion or review decisions. Promotion constraint: only authenticated human review paths may change those flags.

## Alternatives rejected
Managed workflow or queue service as the default. Re-evaluate only if measured concurrency or host limits require it.

## Revisit trigger
Worker pool saturation, lease contention, or a host that cannot safely run long workers against Neon.
