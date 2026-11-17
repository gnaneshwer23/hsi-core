---
title: "02. System Architecture and Technical Design"
subtitle: "HSI Engineering Specification Pack v1.1"
---

**Version:** 1.1, 16 November 2026 · **Owner:** Dr Gnaneshwer Jadav · **Repo baseline:** `hsi-core@43da794`

# 1. Decision summary

- **Keep the stack:** Bun 1.3, TypeScript, Vite + React 19 single-page app with prerendered public pages, Vercel serverless functions under `site/api/`, Neon Postgres, Neon Auth. No Next.js migration.
- **Two planes, one bridge:** the scientific plane is `hsi-core` and never holds patient data. A future clinical plane is a separate repository and deployment (ADR-0010).
- **Graph in Postgres, not a graph database.** The graph is small (thousands of edges for years) and must share transactions with evidence and review records. Published snapshots remain versioned JSON for the public site.
- **Durable runs move out of the request.** Investigations become jobs in a Postgres job table, consumed by a worker. Requests are capped at 30 seconds today.
- **One investigation store, one identity model.** Six investigation-related tables and two owner-binding patterns collapse into one of each before any held migration is applied.

# 2. Vision

One governed graph of human immunology, fed by rights-checked evidence, worked on by bounded agents, checked by independent verification and promoted only by named humans. The same graph is read by the public site, by researchers in the workbench, and later by other tools over an API and an MCP server.

# 3. System context

```text
                    Researchers, reviewers, public visitors
                                   |
                       humansuperintelligence.tech (Vercel)
         +-------------------------+---------------------------+
         |  Public site (prerendered)   Research workbench (SPA) |
         +-------------------------+---------------------------+
                                   |  HTTPS, same origin
                       Vercel functions  site/api/**
         +---------+-----------+-----------+----------+----------+
         |  Auth   | Research  | Ask/live  | Review   | Graph    |
         | gateway | API       | run       | API      | read     |
         +----+----+-----+-----+-----+-----+----+-----+----+-----+
              |          |           |          |          |
          Neon Auth   Neon Postgres (hsi schema, RLS)   Published snapshot
                         |                               (versioned JSON)
                   Job table  <---- Worker (new, long-running)
                                     |            |
                        Evidence providers     Model providers
                  (Europe PMC, OpenAlex,      (two distinct providers
                   PubMed, Open Targets,       for independent checks)
                   UniProt, Reactome,
                   ClinicalTrials.gov)

  ---------------- governed bridge (ADR-0010) ----------------
  Clinical plane: separate repo, UK-hosted DB, own auth and audit. Not built.
```

# 4. Where we are

| Component | Status | Location | Notes |
| --- | --- | --- | --- |
| Public site, prerender, SEO | Built | `site/src`, `site/scripts/build-seo.ts` | 6 public pages after the 15 November simplification |
| Research workbench SPA | Partial | `site/src/pages`, `site/src/features` | Many specialist pages; storage is browser-only |
| Auth gateway | Built | `src/server/neonAuthGateway.ts`, `site/api/auth/*` | Neon Auth (Better Auth); verified-email sessions |
| Research API | Partial | `site/api/research/*`, `src/server/*` | 38 route files; writes disabled in production (`HSI_RESEARCH_WRITES_ENABLED`) |
| Ask and live run | Partial | `site/api/ask.ts`, `src/investigation/liveRun.ts` | In-request, curated scenarios, 10 asks per user per hour per instance |
| Database | Partial | `db/migrations` 001 to 033 | 55 tables; 022 to 033 held by `src/db/migrationHolds.ts` |
| Durable agent checkpoints | Partial | migrations 009, 010; `ARCH-009-*` docs | Same-host reference worker only |
| Rate limiting | Partial | `src/server/researchRequestControls.ts` | In-memory per instance; optional shared admission service |
| Observability | Not started | none | No error tracking, tracing, log drain or alerts |
| Graph snapshot build | Built | `scripts/build-domain-graph.ts` | Digest-verified, versioned under `site/public/research/domain-graph/versions/` |
| Clinical plane | Synthetic only | `src/clinicalPlane/` | Must be liftable into its own repo unchanged |

# 5. Target architecture

## 5.1 Logical services (modules, not separate deployables)

Keep one repository and one deployment for the scientific plane. Separate by module boundary, not by network.

| Module | Owns | Reads | Never does |
| --- | --- | --- | --- |
| Identity | Sessions, principals, memberships, scopes | Neon Auth | Trusts a client-supplied user ID |
| Evidence | Sources, versions, passages, rights, retractions | Provider adapters | Stores text without a rights decision |
| Claims | Candidate assertions, context, support assessments | Evidence | Promotes a claim |
| Graph | Nodes, edges, releases, snapshots | Claims, reviews | Publishes an unreviewed edge as reviewed |
| Investigations | Questions, runs, outputs, briefs | Graph, evidence, claims | Runs longer than the request without a job |
| Review | Reviewer authority, decisions, adjudication | Claims, graph | Lets a reviewer approve their own work |
| Jobs | Queue, attempts, leases, dead letters | All | Executes without a budget |
| Bridge | Clinical-plane contracts | Graph | Accepts row-level patient data |

## 5.2 The critical flow

```text
Question
  -> investigation record (owner, scope, pinned graph version)
  -> job enqueued
  -> retrieval (governed adapters, rights check)
  -> passage capture (permitted text only) or metadata-only
  -> candidate extraction (schema-validated)
  -> independent verification (two providers, quote required)
  -> context comparison and gap detection
  -> outputs 01 to 06 written, each with lineage
  -> optional: candidate edges proposed to the review queue
  -> named reviewers decide -> graph release -> new snapshot
```

Every arrow writes an event. A run can be replayed from its events with recorded provider responses.

# 6. Architecture decisions

Existing accepted decisions: ADR-009 (agent intelligence phase 1), ADR-0010 (two-plane clinical architecture). The following are new and need recording as ADRs in `docs/architecture/`.

| ADR | Decision | Reasoning | Alternative rejected |
| --- | --- | --- | --- |
| ADR-011 | **Postgres job table** (`SELECT … FOR UPDATE SKIP LOCKED`, leases, attempts, dead letter) with a long-running worker | Run state lives beside the data it writes; one less vendor; replay is a query; works on Neon | Managed workflow or queue service. Re-evaluate if concurrency exceeds what one worker pool handles; verify current Vercel and Neon documentation before choosing the worker host |
| ADR-012 | **One investigation store**: `hsi_investigations` + `hsi_investigation_events` + `hsi_investigation_outputs` | Six tables (004, 007, 014, 015, 022, 030) model the same thing differently; held migrations cannot be safely applied until this is fixed | Keep all six and map between them |
| ADR-013 | **One identity binding**: verify the session inside `SECURITY DEFINER` functions (the 027 model); never trust a session variable set by the app | Forged settings cannot cross tenants; testable in SQL | The 030 model with a server-set `hsi.live_owner_id` |
| ADR-014 | **Scope registry, not literal lists** | Migration 027 hard-codes `('ssc','ra')`; every new disease would need a migration | Enum per disease |
| ADR-015 | **Graph in Postgres** tables (`hsi_lhkg_nodes`, `hsi_lhkg_relationships`, dossiers), exported to versioned JSON snapshots | Scale is small; transactional consistency with reviews matters more than traversal speed | Neo4j or another graph database. Revisit above ~1M edges |
| ADR-016 | **Two distinct model providers for verification** (one extracts, the other verifies) | Same-provider checks are not independent | Single provider with two prompts |
| ADR-017 | **Embeddings deferred** | Retrieval is by provider search plus entity terms; vector search adds cost without a measured need | pgvector now. Add when the benchmark shows recall is the bottleneck |

# 7. Non-functional requirements

| ID | Requirement | Target |
| --- | --- | --- |
| ARCH-01 | Public page load | Largest Contentful Paint < 2.5 s at the 75th percentile on mobile |
| ARCH-02 | API latency (non-run reads) | p95 < 500 ms |
| ARCH-03 | Investigation run | Completes or fails explicitly within 10 minutes; progress visible every stage |
| ARCH-04 | Recovery | Worker crash mid-run resumes from the last completed stage with no duplicate writes |
| ARCH-05 | Data durability | Point-in-time restore tested monthly; recovery point ≤ 1 hour |
| ARCH-06 | Cost | Per-run model budget enforced; monthly provider cap set in each provider console |
| ARCH-07 | Isolation | Two-account adversarial tests pass before any second researcher gets write access |
| ARCH-08 | Reproducibility | A saved run records graph version, adapter versions, model IDs, prompts digest and provider response digests |

# 8. What to build next

| ID | Work | Acceptance criteria |
| --- | --- | --- |
| ARCH-10 | Write ADR-011 to ADR-017 and get owner sign-off | ADRs merged; each lists consequences and a revisit trigger |
| ARCH-11 | Job table, worker and run state machine | Stage states `queued → running → stage_n → done / failed / cancelled`; lease expiry requeues; dead letter after 3 attempts; tests for crash at each stage |
| ARCH-12 | Move the live run from the request into a job | `POST /api/ask` returns 202 with a run ID; client polls `GET /api/runs/{id}`; no run exceeds the function limit |
| ARCH-13 | Consolidate investigation storage (ADR-012) | One migration that creates the new tables and a backfill plan; old tables read-only, then dropped after one release |
| ARCH-14 | Scope registry (ADR-014) | Scopes in a table; review authority checked against it; adding SLE needs no migration |
| ARCH-15 | Observability baseline | See document 13 |

# 9. Future options

- An **MCP server** exposing read-only graph, evidence-by-context and brief generation to external workbenches.
- A **public read API** with keys and quotas for the reviewed graph.
- **Event-sourced graph releases** so any past graph state can be rebuilt from review events.
- The **clinical plane** as its own deployable in a UK region, joined only through the bridge contracts.

# 10. Open decisions

| ID | Decision | Recommendation |
| --- | --- | --- |
| D-10 | Where the worker runs | A small always-on container (for example Fly.io, Railway or a Vercel-supported long-running option) in the EU or UK; confirm current platform limits first |
| D-11 | Which two model providers | Anthropic for extraction and OpenAI for verification (both already have code paths); set spend caps in both consoles |
| D-12 | Neon region and plan | EU region; plan with point-in-time restore of at least 7 days |
