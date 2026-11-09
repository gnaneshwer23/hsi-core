# HSI end-to-end product acceptance (32-page IA)

**Audited tip:** `864710a`  
**Production:** https://www.humansuperintelligence.tech/  
**As of:** 2026-11-09  
**Do not merge/deploy write enablement until this file’s staging suite is green and preview is human-reviewed.**

Extends [`HSI_END_TO_END_RESEARCH_ACCEPTANCE.md`](./HSI_END_TO_END_RESEARCH_ACCEPTANCE.md) with the 32-template architecture.

---

## 1. Overall verdict (production)

| Scope | Verdict |
|-------|---------|
| Public website (P01–P10) | **PASS** (LIMITED GO) |
| Access shell (A01–A04) | **PASS** provider / **BLOCKED** full credentialed E2E |
| Research write spine (R02–R04, R11, G01–G02) | **FAIL / BLOCKED** on production |
| Flagship SSc investigation live | **BLOCKED** |
| Connected product (one investigation across modules) | **FAIL** on production |

---

## 2. Acceptance tests by band

### Public

| Test | Method | Pass? |
|------|--------|------:|
| All P0x routes HTTP 200 | curl / Playwright | yes |
| Homepage honesty (`illustrative`, `live_backend=false`) | e2e | yes |
| No fixture promotion on non-home public pages | e2e editorial-landing | yes |
| CTA destinations real | manual + ctaPolicy | yes |

### Access

| Test | Method | Pass? |
|------|--------|------:|
| Auth diagnostics / get-session anonymous | prod probe | yes (null session) |
| Sign-in / sign-up pages render | HTTP 200 | yes |
| Password recovery API contract | e2e | yes |
| Research account without session fail-closed | expected 401/redirect | yes |
| Full login → grant → dashboard | needs test identity | **not run** |

### Research platform

| Test | Method | Pass? |
|------|--------|------:|
| Health `configuration_validated` | prod | yes |
| Health `writesEnabled=false` on prod | prod | yes (policy) |
| Investigations anon 401 | prod | yes |
| SSC graph anon 401 | prod | yes |
| Dashboard create disabled when writes off | e2e mocked | yes |
| Create investigation persists | staging + writes | **not run on prod** |
| Brief export for investigation id | staging | **not run on prod** |
| Programme create | n/a | **missing** |

### Governance

| Test | Method | Pass? |
|------|--------|------:|
| Queue without reviewer 403 | e2e | yes |
| Decision without authority denied | contract | yes |
| Gate C auto-approve absent | policy + code review | yes |

### Ecosystem

| Test | Method | Pass? |
|------|--------|------:|
| /for-isi, /for-aksh, /for-trials honesty | copy + HTTP | yes |
| No CDS/PHI wiring | CDS_PHI_BOUNDARY | yes |
| Discovery packs not sold as live agents | honesty | yes |

---

## 3. Flagship scenario checklist (staging required)

Systemic sclerosis · Tfh–IL-21–B-cell:

1. [ ] Authenticate researcher test user  
2. [ ] Confirm `writesEnabled=true` on **staging only**  
3. [ ] Create investigation (programme TBD)  
4. [ ] Retrieve release-bound evidence with provenance  
5. [ ] Capture graph-context  
6. [ ] Record contradictions + named gaps  
7. [ ] Draft hypothesis without unsupervised “approval” language  
8. [ ] Export brief (md/json)  
9. [ ] Submit for scientific review  
10. [ ] Reviewer decision + reopen same investigation id  
11. [ ] Assert persistence hashes / audit rows  

**Production run of this checklist:** forbidden while `writesEnabled=false` unless founder explicitly enables staging-equivalent environment.

---

## 4. Navigation acceptance

| Path | Expected | Prod |
|------|----------|------|
| Home → Contact | works | PASS |
| Home → Sign-in → Dashboard | dashboard loads; writes blocked | LIMITED |
| Dashboard → Investigation → Brief | same id | BLOCKED |
| Science explorers ↔ Research tools | deep links | PARTIAL |
| Governance ↔ Investigation | reviewer only | RESTRICTED |

---

## 5. Sign-off fields

| Role | Sign-off | Date |
|------|----------|------|
| Engineering QA | | |
| Scientific governance | | |
| Founder / release | | |

Distinguish in every release report: **marketing QA** · **engineering QA** · **scientific validation** · **production readiness**.
