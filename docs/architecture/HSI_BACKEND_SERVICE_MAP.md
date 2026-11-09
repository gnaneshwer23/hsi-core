# HSI backend service map

**Audited tip:** `864710a`  
**Production probe:** 2026-11-09  
**Neon isolation:** HSI red-wave only (`ep-restless-dew…` / project `red-wave-06625195`). Never autumn-snow (ISI).

---

## 1. Edge / API surfaces

| Surface | Entry | Owner module | Production observation |
|---------|-------|--------------|------------------------|
| Research gateway | `site/api/research/[...path].ts` → `src/server/vercelResearch.ts` | hsi-research | `/api/research/health` **200**, `writesEnabled=false` |
| Auth gateway | `site/api/auth/[...path].ts` + email helpers | Neon Auth | `get-session` anonymous → `null` / 200; provider reachable |
| Interrogative CRUD | `site/api/research/interrogative/*` | investigations + review | Session required |
| Investigations list/create | `site/api/research/investigations.ts` | research workspace | Anon **401** |
| SSC governed graph | `site/api/research/graph/ssc.ts` | graph | Anon **401** |
| SSC discovery | `site/api/research/discovery/ssc.ts` | discovery | Auth-gated |
| Scientific review queue/history | `scientific-review/queue.ts`, `history.ts` | governance | Role-gated |
| Session diagnostics | `session-diagnostics.ts` | ops | Config / session introspection |

Write gate (binding):

```text
writesEnabled =
  HSI_RESEARCH_WRITES_ENABLED === "true"
  && HSI_NEON_BRANCH_ID === staging branch
  && database host prefix === staging host
```

Production intentionally fails this check → POST research mutations **403** “Research writes are disabled”.

---

## 2. Database entities (HSI migrations)

| Migration | Entity / concern | Used by |
|-----------|------------------|---------|
| 001 | Substrate / base | platform |
| 002 | Evidence ownership | evidence |
| 003 | Scientific review guardrails | governance |
| 004 | `hsi_research_investigation_runs` | deterministic runs |
| 005 | Reviewer authority | G01/G02 |
| 006 | Research access grants | A04 / R02 |
| 007 | `hsi_interrogative_investigations` | R04/R11 |
| 008 | Interrogative review audit | G02 |
| 009–010 | Agent durable checkpoints / fenced artifacts | agent runtime (not public live) |
| 011–013 | LHKG governed graph + security | graph services |
| 012 isi | ISI research review (HSI-owned tables only) | review |
| 014 | Investigation graph context | R04 graph-context |
| 015 | Review delivery | brief / package |
| 016–018 | Evidence / experiment / dynamic evidence ledgers | evidence services |

**Missing for target IA:** dedicated **programme** entity (parent of investigations).

---

## 3. Scientific / graph services

| Service | Implementation | Live production status |
|---------|----------------|------------------------|
| Educational science graph | Static/browser modules + `/science/graph` | Available as draft educational |
| Domain / claim knowledge graph | Versioned JSON + client | Available as research candidates |
| Governed SSC graph | `/api/research/graph/ssc` | Restricted (401 anon) |
| Literature retrieval | Not bound in homepage demo | Not claimed live |
| Contradiction analysis | `/science/contradictions` + investigation payloads | Public explorer only without session |
| Agent orchestration | ARCH-009 durable execution docs + checkpoints | Not a public live product surface |

---

## 4. AuthN / AuthZ

| Control | Behaviour |
|---------|-----------|
| Session | Neon Auth cookies; same-origin `/api/auth` |
| Research grant | Human provisioned; not open signup→write |
| Reviewer role | Required for queue/decision |
| Anonymous research | Fail closed (401/403) — correct |
| CDS / PHI | Forbidden in hsi-core (`docs/CDS_PHI_BOUNDARY.md`) |

---

## 5. Product integrations (boundaries)

| Product | HSI surface | Integration reality |
|---------|-------------|---------------------|
| ISI | `/for-isi`, Discovery consume contracts | Consume wiring allowed under freeze-lift; no shared Neon |
| Aksh | `/for-aksh`, `/aksh-agents` demos | No live CDS/PHI into HSI |
| Trials | `/for-trials` | Planned; no live matching |
| Akeno | `/akeno` | Consumer demo boundary |

---

## 6. Broken / incomplete API integrations (evidence)

| Integration | Symptom | Severity |
|-------------|---------|----------|
| Production research writes | `writesEnabled=false` | Blocks R02–R11 journey |
| Anon investigations | 401 | Expected; blocks unauthenticated “complete product” claims |
| Anon SSC graph | 401 | Expected; workbench button fails closed |
| Programme APIs | None | Missing |
| Live PubMed on homepage | `evidence: []`, `live_backend: false` | Honest; not broken if not claimed |
| Agent runtime as public feature | Not exposed as working CTA | Do not market as live |

---

## 7. Operational health snapshot (production)

```json
{
  "service": "hsi-research",
  "status": "configuration_validated",
  "writesEnabled": false,
  "endpointPrefixesMatch": true,
  "databaseConnectionTested": false
}
```

Red-wave auth and database endpoint prefixes match. Connection not exercised on health (by design in this response).
