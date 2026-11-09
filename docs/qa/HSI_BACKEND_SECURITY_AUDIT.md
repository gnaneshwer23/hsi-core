# HSI backend & security audit — 2026-11-09

**Scope:** Production research/auth gateway, Neon isolation, anonymous attack surface.  
**Out of scope this pass:** Offensive exploit development; credentialed penetration; PHI processing (HSI non-goal).

---

## Classification summary

| Area | Result |
|------|--------|
| Deployment configuration coherence | PASS |
| Neon project isolation (red-wave) | PASS (prefix evidence) |
| Anonymous research API fail-closed | PASS |
| Production write gate | PASS (closed) |
| Auth provider reachability | PASS |
| Session → research grant separation | PASS (design) |
| Gate C / auto-approve | PASS (refused in contracts) |
| CDS/PHI boundary | PASS (documented non-goal) |
| Rate limiting / injection / CSRF full suite | NOT TESTED comprehensively |
| Backup / restore drill | NOT TESTED |
| Secret scanning of client bundles | NOT TESTED this pass |

---

## Verified production probes

| Probe | Result | Evidence file |
|-------|--------|---------------|
| `GET /api/research/health` | 200 `configuration_validated`, `writesEnabled=false`, auth/DB `ep-restless-dew…` match | `evidence/prod-2026-11-09/research-health.json` |
| `GET /api/auth/diagnostics` | 200 `provider_reachable`, credentials not tested | `auth-diagnostics.json` |
| `GET /api/research/investigations` | 401 `BACKEND_PROVIDER_SESSION_REQUIRED` | `investigations-anon.json` |
| `GET /api/research/graph/ssc` | 401 | `_api_research_graph_ssc.json` |
| `GET /api/research/session-diagnostics` | 401 | `_api_research_session-diagnostics.json` |
| `GET /api/auth/get-session` | 200 null session | `_api_auth_get-session.json` |

---

## Write enablement contract (code)

`src/server/vercelResearch.ts` enables writes only when:

1. `HSI_RESEARCH_WRITES_ENABLED === "true"`
2. `HSI_NEON_BRANCH_ID` equals staging branch id constant
3. Database host prefix equals staging host prefix

Production therefore correctly reports `writesEnabled=false`. POST research writes return 403 when disabled.

**Implication:** A polished dashboard UI without this gate open must not be described as a live research workspace.

---

## AuthZ model (as designed)

1. Neon Auth provider session (email verified).
2. Separate HSI research / reviewer grants in HSI database.
3. Sign-in ≠ research permission (UI copy and account page).
4. Scientific review decisions require independent reviewer identity (contracts refuse self-approve / Gate C auto-approve).

---

## Findings

| ID | Severity | Finding | Status |
|----|----------|---------|--------|
| SEC-001 | Info | Anonymous APIs fail closed | Open (expected behaviour) |
| SEC-002 | P2 | Sign-in session probe lacks `.catch` (Nav has catch; SignIn relies on resolved AuthResult) | Track — low risk given client timeout race |
| SEC-003 | P2 | Full AppSec battery (XSS/CSRF/injection/headers) not re-executed this pass | Deferred |
| SEC-004 | P1 if misconfigured | Neon preview integration env vars on Vercel must remain isolated from HSI red-wave | Hygiene — prior live audit noted |

---

## Acceptance vs brief Phase 11

> No critical security vulnerabilities or unauthorised scientific approval paths remain open.

**For anonymous production surface:** no P0 security defect confirmed.  
**For “no unauthorised scientific approval paths”:** Gate C auto-approve remains false in contracts; live review E2E **not** re-proven with credentials this pass → classify scientific governance runtime as **PASS (static) / NOT TESTED (authorised workflow)**.
