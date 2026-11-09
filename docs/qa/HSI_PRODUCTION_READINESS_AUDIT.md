# HSI production readiness audit — 2026-11-09

**Production:** https://www.humansuperintelligence.tech/  
**Repository tip audited:** `f2c24e37553bbae72e5fe4a8029a0bd39fcf8f7e` (`main`, PR #148 merged)  
**Evidence:** `docs/qa/evidence/prod-2026-11-09/`  
**Stance:** Inspect live behaviour and code contracts. Do not invent credentials, metrics, Gate C auto-approve, MoU, PHI/CDS, or live scientific validation.

---

## 1. Executive summary

HSI production is a **credible public biomedical research website** with a **fail-closed research API shell** on Neon red-wave (`ep-hsi-production…`). It is **not** yet a complete operational scientific investigation platform for end-to-end researcher outcomes on production writes.

| Domain | Classification |
|--------|----------------|
| Public landing / marketing | **PASS** (with visual evolution debt vs approved comps) |
| Authentication provider reachability | **PASS** (anonymous) |
| Authenticated researcher onboarding E2E | **BLOCKED** (no authorised test identity; production writes parked) |
| Research workspace writes | **FAIL** for production GO scope — `writesEnabled=false` by design |
| Public knowledge graph / science explorers | **PASS** as research preview / educational draft |
| Live evidence retrieval → brief | **BLOCKED** / **NOT TESTED** with authorised identity |
| Scientific agents (autonomous runtime) | **NOT APPLICABLE** as live agents — deterministic local graph analysis only |
| Security fail-closed anonymous | **PASS** |
| Scientific governance (Gate C) | **PASS** (auto-approve remains false; human path not invented) |
| Performance / CWV field data | **NOT TESTED** (no invented RUM percentiles) |
| Full researcher acceptance journey | **BLOCKED** |

**Release recommendation for “full scientific platform GO”:** **NO-GO**.  
**Recommendation for “public site + fail-closed research shell LIMITED GO”:** **LIMITED GO** — see `HSI_RELEASE_DECISION.md`.

---

## 2. What was verified before code changes

| Check | Result |
|-------|--------|
| `bun run check` (unit/validate/build) | **Pass** on tip |
| Site Playwright sample (home / editorial) | **Pass** |
| Live `GET /api/research/health` | `configuration_validated`, `writesEnabled=false`, origin/auth/DB prefixes match |
| Live `GET /api/auth/diagnostics` | `provider_reachable`, `credentialsTested=false` |
| Live anonymous investigations / graph / session-diagnostics | **401** `BACKEND_PROVIDER_SESSION_REQUIRED` |
| Public marketing routes sampled | All **HTTP 200** |
| Homepage browser snapshot | Product demo + honesty labels present |
| Sign-in UI | Form enables after session probe (“Checking session…” is transient) |

---

## 3. Public website status (Phase 1)

### Positioning (live at audit start → remediation)

- H1 (remediated): **Investigate disease mechanisms with evidence you can trace.**
- Supporting line retained: **See the biology. Question the evidence.**
- Lead: biomedical researchers / relationships / conflicting evidence / gaps / next question.
- Trust: Built for researchers. Grounded in evidence. Reviewed by people.
- Primary CTA: Request Research Access → `/contact`
- Secondary: See How It Works → `/how-it-works`
- Illustrative SSc demo labelled `live_backend=false`

### Gap vs master QA comps

| Approved / mock | Status | Issue |
|-----------------|--------|-------|
| Approved headline | Adopted in audit PR | PROD-QA-001 resolved |
| Dark charcoal + burgundy 8-domain orbit hero | Not shipped | **PROD-QA-002** visual direction debt (P2) |
| Nav: Applications / Collaboration | Not in manifest | **NOT A DEFECT** — use real routes |

### Public routes (actual App manifest — sampled live)

Pass (200): `/`, `/platform`, `/science`, `/how-it-works`, `/products`, `/research`, `/evidence-safety`, `/technology`, `/for-aksh`, `/for-isi`, `/for-trials`, `/contact`, `/pricing`, `/solutions`, `/community`.

Routes named in the brief that **do not exist** as primary paths: “Applications”, “Research Intelligence”, “Research Outcomes”, “Collaboration” — map instead to existing `/products`, `/science`, `/research`, `/contact` / community as applicable.

---

## 4. Authentication status (Phase 2)

| Item | Status | Evidence |
|------|--------|----------|
| Auth diagnostics | PASS | `auth-diagnostics.json` |
| Anonymous get-session | PASS | null session acceptable |
| Sign-in / sign-up pages | PASS (UI) | `/sign-in` 200; fields enable after check |
| Password reset entry | PASS (route) | `/forgot-password` present |
| Full sign-up → verify → grant → workspace | BLOCKED | No production test credentials; grants admin-provisioned |
| Cross-user isolation | NOT TESTED | Requires two authorised accounts on staging |

**Honesty:** Signing in does not grant research writes. Production `writesEnabled` remains false unless staging-gated env contract is met (`vercelResearch.ts`).

---

## 5–9. Research workspace, evidence, graph, agents, briefs

| Capability | Status | Notes |
|------------|--------|-------|
| Create investigation on production | FAIL (scope) | POST rejected when writes disabled; anonymous 401 |
| Resume investigation | BLOCKED | Needs authorised staging identity |
| Live literature retrieval in homepage demo | NOT APPLICABLE | Demo contract: empty `evidence[]`, illustrative |
| Public science graph | PASS (preview) | `/science/graph`, educational draft, `scientificApproval:false` in builders |
| “Scientific agents” as autonomous AI | NOT APPLICABLE | UI states deterministic local foundation, not connected autonomous agents |
| Contradiction / gap pages | PASS (preview UI) | `/science/contradictions` etc. — not production write pipeline |
| Research brief from live investigation | BLOCKED | Requires writes + authorised journey |

---

## 10–12. Backend, security, performance

| Item | Status |
|------|--------|
| Neon red-wave endpoint alignment | PASS |
| Fail-closed without provider session | PASS |
| Gate C auto-approve | PASS (false everywhere checked) |
| CDS/PHI in HSI | PASS (non-goal enforced in docs/code) |
| Secrets in client bundles | NOT fully scanned this pass — prior audits + env hygiene assumed; track **PROD-QA-003** |
| Lighthouse / CWV 75th | NOT TESTED — do not invent |

---

## 13–14. Researcher acceptance & outcomes

Full Scenario G/E2E (authenticate → programme → evidence → brief → reopen): **BLOCKED**.

Outcome metrics (efficiency, citation validity rates, agent success rates): **NOT MEASURED** — baselines not fabricated.

---

## 15–16. Language & CI

- Public language largely professional; illustrative demos disclosed.
- CI: `bun run check` green; site e2e suite used in Research foundation workflow.
- Root `bun test` without `./test` path can pull Playwright files — use packaged scripts only.

---

## Related deliverables

- `HSI_END_TO_END_RESEARCH_ACCEPTANCE.md`
- `HSI_BACKEND_SECURITY_AUDIT.md`
- `HSI_SCIENTIFIC_OUTPUT_VALIDATION.md`
- `HSI_PRODUCTION_ISSUE_REGISTER.md`
- `HSI_RELEASE_DECISION.md`
