# HSI end-to-end research acceptance — 2026-11-09

**Scenario (brief):** Biomedical researcher investigates Tfh / IL-21 / B-cell responses / systemic sclerosis.  
**Production origin:** https://www.humansuperintelligence.tech/  
**Repo tip:** `f2c24e3`  
**Result:** **BLOCKED** — cannot claim PASS without authorised staging credentials and write-enabled deployment.

---

## Journey matrix

| Step | Expected | Production observation | Status |
|------|----------|------------------------|--------|
| 1 Open HSI | Homepage loads | 200; product demo + honesty | PASS |
| 2 Authenticate | Sign-in works | Provider reachable; full login **not** executed (no test identity) | BLOCKED |
| 3 Enter research workspace | Dashboard usable | `/research/dashboard` exists; anonymous API 401; writes disabled | BLOCKED |
| 4 Create research programme | Persists | Requires `writesEnabled` + researcher role | BLOCKED |
| 5 Define research question | Saved on investigation | Not executed | BLOCKED |
| 6 Launch investigation | Durable job | Not executed on production | BLOCKED |
| 7 Retrieve scientific evidence | Provenanced sources | Homepage demo `evidence: []`, `live_backend: false` | FAIL as live claim / PASS as illustrative disclosure |
| 8 Explore mechanism graph | Evidence-linked edges | Public educational graph available; production research graph 401 anon | LIMITED |
| 9 Supporting findings | Source-linked | Illustrative counts only on home | BLOCKED (live) |
| 10 Contradictions | Source-linked | Public contradiction explorer exists; live investigation path blocked | LIMITED |
| 11 Evidence gaps | Named gaps | Demo lists gaps honestly | LIMITED |
| 12 Candidate hypotheses | Unvalidated labels | Science workbench refuses unsupervised generation without reviewed evidence | LIMITED |
| 13 Next investigation | Proposal | Not executed live | BLOCKED |
| 14 Save notes | Persist | Requires writes | BLOCKED |
| 15 Generate research brief | From investigation | Requires authorised API | BLOCKED |
| 16 Export report | Opens | Not executed | BLOCKED |
| 17–20 Sign out / in / reopen | Persistence | Not executed | BLOCKED |

---

## Acceptance rule (brief)

> If any critical step is unavailable, record it as blocked rather than claiming the complete journey passed.

**Critical blockers**

1. No authorised production/staging researcher test identity in this audit session.
2. Production `writesEnabled=false` (`/api/research/health`).
3. Anonymous research APIs fail closed (correct security) — prevents unauthenticated “success” theatre.

---

## What can be rehearsed without credentials

| Rehearsal | Path | Honesty |
|-----------|------|---------|
| Illustrative SSc fibrosis path | `/` `#product-demo` | Curated example; not live investigation |
| Public science graph controls | `/science/graph` | Educational draft; `scientificApproval` false in builders |
| Synthetic validation UI | `/research/validation` | Synthetic / software validation labels required |
| Contact / access request | `/contact` | Access pathway, not automatic grant |

---

## Required next audit (staging)

1. Provision two Neon Auth accounts on **staging** red-wave branch with explicit grants (researcher + independent reviewer).
2. Enable writes only under `vercelResearch.ts` staging contract.
3. Re-run steps 2–20 with logs, investigation IDs, and brief hashes.
4. Attach evidence under `docs/qa/evidence/staging-YYYY-MM-DD/`.

Until then: **do not report Scenario G as passed.**
