# HSI release decision — 2026-11-09

**Product:** Human Super Intelligence  
**Production:** https://www.humansuperintelligence.tech/  
**Audited tip:** `f2c24e3` (main)  
**Decision owner:** Founder / release authority (human-gated)

---

## Decision

### A. Full scientific platform release (Phases 2–9, 13)

**NO-GO**

Mandatory researcher journey (authenticate → write investigation → live evidence → brief → reopen) is **BLOCKED**. Production writes are intentionally disabled. No authorised test identity was used. Live scientific agent orchestration is **not** claimed by the product.

### B. Public website + fail-closed research shell

**LIMITED GO**

Authorised scope:

1. Public marketing and honesty-labelled illustrative demonstration.
2. Public science explorers as **research preview / educational draft**.
3. Auth provider reachability and account request paths.
4. Research APIs that **fail closed** without verified session.
5. Neon red-wave configuration coherence (`ep-restless-dew…`).

Explicit exclusions from LIMITED GO:

- Production research writes / programme creation.
- Claiming live PubMed-backed homepage investigation.
- Autonomous scientific agent runtime.
- Gate C auto-approve or invented MoU.
- CDS / PHI / live clinical-data integrations.
- Fabricated CWV or adoption metrics.

---

## Domain scorecard

| Domain | Classification |
|--------|----------------|
| 1 Public website | PASS (LIMITED; visual comps debt open) |
| 2 Authentication | PASS (provider) / BLOCKED (credentialed E2E) |
| 3 Research workspace | FAIL for production write GO |
| 4 Evidence intelligence (live) | BLOCKED |
| 5 Knowledge graph (public preview) | PASS |
| 6 Scientific agents (live runtime) | NOT APPLICABLE / FAIL if claimed live |
| 7 Contradiction & gaps (live investigation) | BLOCKED |
| 8 Hypothesis planning (live) | BLOCKED |
| 9 Research briefs (live) | BLOCKED |
| 10 Backend reliability (anon + health) | PASS |
| 11 Security & governance (anon + contracts) | PASS (static) / NOT TESTED (authorised review E2E) |
| 12 Performance & a11y field CWV | NOT TESTED |
| 13 Full researcher acceptance | BLOCKED |
| 14 Outcome measurement | NOT TESTED |

---

## Release blockers (full GO)

1. **PROD-QA-004** — No staging/production authorised researcher E2E evidence.
2. **Writes parked** — `writesEnabled=false` on production health.
3. **Live evidence bind** — demo remains illustrative (`live_backend=false`).

---

## Operational ownership

| Surface | Owner |
|---------|-------|
| Public site / Vercel | HSI site |
| Neon Auth / research grants | HSI auth + admin |
| Scientific review | Independent human reviewers (Gate C human-only) |
| Capability honesty register | `docs/capability-status.json` |

---

## Deployment / rollback

- Production deploys from `main` via Vercel.
- Rollback: redeploy prior production deployment in Vercel.
- Do not enable `HSI_RESEARCH_WRITES_ENABLED` on production without staging contract compliance and human approval.

---

## Final instruction compliance

| Instruction | Done |
|-------------|------|
| Start from production + repo | Yes |
| Run existing tests before claiming readiness | `bun run check` pass; site e2e sample pass |
| Do not invent capabilities | Yes — LIMITED GO / NO-GO split |
| Do not merge fake science | N/A — docs-only + optional copy hygiene |
| Evidence-backed classifications | `docs/qa/evidence/prod-2026-11-09/` |

**Bottom line:** HSI **communicates** as a mature research product on the public site; it **must not** be released as a fully operational investigation platform until staging E2E and write-enabled acceptance pass.
