# Phase A — Production capability truth audit

**Status:** Initial evidence-based repository audit, 2026-11-11. **Not** a live deployment, security, database or scientific validation certification.

## Governing source of truth
- `docs/strategy/HSI_VISION.md` governs product scope; `docs/STATUS.md` is generated from `operations/capability-register/capability-register.v1.json`, not manually edited.
- HSI is disease-agnostic and cross-domain; research-only science is separate from PHI and clinical decision support.
- Existing status register reports **19 implemented, 11 partial, 2 stub, 3 absent** as of 2026-11-10. These are register-level counts, not independently certified production capabilities.

## Verified code-level inventory

| Capability | Evidence in main | Observed truth | Release blocker |
|---|---|---|---|
| Public website and build | `site/package.json`, `site/vercel.json` | React/Vite, build checks and configured routes | Production route smoke tests, observability, accessibility and security acceptance |
| Research question workspace | `site/src/pages/ScientificDiscoveryExperience.tsx` | Seven-stage UI; only exact curated questions unlock all stages | Connect arbitrary question to executed investigation and persistent artifacts |
| Question triage | `src/scientificDiscoveryQuestionTriage.ts` | Fixture-specific branches and manually enumerated concepts | Replace domain-special-casing with generic scoped question planning |
| Literature search | `src/scientificPubmedRetrieval.ts`, `site/api/scientific-pubmed.ts` | Read-only PubMed search, up to 12 bibliographic hits; no scientific claim verification | Pagination, retrieval quality, provenance persistence, upstream resilience |
| Abstract inspection | `src/scientificAbstractContext.ts`, `site/api/scientific-abstract.ts` | Europe PMC abstract and candidate lexical mentions; terminology is hardcoded | Generic ontology-linked entities, licensing and scientific evidence validation |
| v2.4 candidate extraction | PR #247, `src/scientificEvidenceSignals.ts` on PR branch | Candidate source-offset sentence triage; **not on main at audit time** | CI, review and merge; scientific benchmarking; negation/context robustness |
| Investigation orchestration | `src/investigationService.ts` | Server-side service contracts, revisioned run model, provider interfaces | Wire into live user journey; runtime execution and durable recovery proof |
| Investigation persistence | `src/investigationBackend.ts` | Authenticated persistence and bounded protocol code exists | Live DB deployment, tenant isolation and E2E write/read/recovery evidence |
| Scientific contracts | `src/researchContracts.ts` | Explicit data classes, source provenance, claim curation, run events | Align live retrieval and workspace with common contract |
| Curated research outputs | `src/scientificInvestigation.ts` | Deterministic curated seed investigation | Must never be substituted for live findings for arbitrary questions |
| Claim graph | `src/knowledgeGraph/claimGraph.ts` | Working draft, `graphPromotable:false`, candidate exact alias mentions | End-to-end reviewed promotion into trusted graph, audit and version rollback |
| Database migrations | `docs/STATUS.md`, `docs/NEON_PROJECT_MAP.md` | SQL exists; migration apply status explicitly unverified; 022/023 held | Operator verification on HSI-owned database only; no credentials in logs |
| CI | `.github/workflows/research-foundation.yml` | Build, checks, dependency audit and Playwright E2E configured | Verify latest main and PR checks; staging/production smoke, load, recovery and security tests |

## Critical integration seams
1. **Experience → execution:** `ScientificDiscoveryExperience.tsx` uses `buildScientificInvestigation(questionId)` for full seven-stage workflow and separate live PubMed/Europe PMC calls. It does not demonstrate an arbitrary question entering `investigationService.ts` and producing persisted research stages.
2. **Retrieval → contracts:** Live bibliography and abstract payloads are not demonstrated as normalized `ResearchSource`, `ResearchPassage`, `ResearchClaim` objects with licence and provenance requirements.
3. **Candidate → graph:** `claimGraph.ts` explicitly forbids promotion; review and approved relationship persistence must be verified through separate existing governed services, not bypassed.
4. **Database truth:** Status documents do not establish live migrations, RLS or backups; verify using approved operator access on HSI-owned project.
5. **Scope drift:** `scientificDiscoveryQuestionTriage.ts` and `scientificAbstractContext.ts` contain disease-specific hardcoding. Preserve optional historical fixtures but eliminate preferential routing in universal investigation path.

## Required evidence before marking production-ready
- Real non-fixture investigation with captured request, execution history, source records, context, review and export.
- Independent reviewer cannot approve own candidate; rejected or superseded relationships remain auditable.
- Negative tests for missing licences, unavailable upstreams, no abstracts, contradictory context, tenant boundary and PHI rejection.
- Live staging authentication, migrations, backup restore, error budgets, monitoring and rollback rehearsal.
- Domain-balanced independent scientific evaluation with documented error rates.

## Explicitly not verified
Production deployment configuration and live auth, actual Neon schema/migration state, clinical data access, licensed source rights, independent security testing, scientific benchmark scores, performance SLOs, incident response and backups. Do not mark these as passed based on code presence.

## Next engineering slice
Produce a read-only end-to-end trace for **one arbitrary question**: question → PubMed → Europe PMC → normalized research evidence contract → persisted investigation event → researcher-visible evidence with provenance. No auto-promotion or graph writes.
