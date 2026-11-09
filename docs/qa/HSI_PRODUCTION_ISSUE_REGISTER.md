# HSI production issue register — 2026-11-09

Evidence root: `docs/qa/evidence/prod-2026-11-09/`

Severity: **P0** security / data loss / fabricated science / review bypass · **P1** major journey / persistence · **P2** visual / polish.

---

## Open

| ID | Sev | Area | Impact | Reproduction | Root cause | Correction | Status |
|----|-----|------|--------|--------------|------------|------------|--------|
| PROD-QA-001 | P2 | Homepage copy vs master brief | Approved H1 adopted; tagline retained | — | — | H1 set to brief wording; “See the biology…” kept as supporting line | Resolved in audit PR |
| PROD-QA-002 | P2 | Visual comps | Mock charcoal/burgundy 8-domain orbit not shipped | Compare `mock-home-*.jpg` vs live light editorial home | Visual evolution not yet implemented | Separate design PR; keep honesty labels | Open |
| PROD-QA-003 | P2 | Security hygiene | Client bundle secret scan not re-run | N/A this pass | Timeboxed audit | Run defensive scan on next AppSec pass | Open |
| PROD-QA-004 | P1 | Researcher E2E | Cannot accept full investigation journey on production | Attempt create investigation without grant / with writes off | Writes parked; no test identity | Staging credentials + staging write contract | Open / Blocked |
| PROD-QA-005 | P1 | Live evidence | Homepage cannot show provenance-bearing sources | Inspect demo JSON `evidence: []` | Illustrative contract | Keep labels; bind live only when verified | Open (by design until live_backend) |
| PROD-QA-006 | P2 | Sign-in UX | Session probe hang if promise rejects | Rejecting session() without catch | Missing `.catch` on SignIn | Added catch → unlock form + error | Resolved in audit PR |
| PROD-QA-007 | P2 | Route naming | Brief names Applications / Collaboration | 404 if invented | Manifest differs | Use real routes in QA scripts | Closed as documentation |

---

## Closed / verified earlier

| ID | Sev | Notes |
|----|-----|-------|
| LIVE-001 | P1 | Favicon aliases — fixed prior; `favicon.ico` now 200 on production |
| Homepage product demo duplication | P1 UX | Fixed in #148 follow-up (single `#product-demo`) |

---

## Explicit non-issues (do not “fix” into false capability)

| Observation | Why not a bug |
|-------------|---------------|
| `writesEnabled=false` on production | Binding honesty / staging-only write contract |
| Anonymous 401 on research APIs | Required fail-closed security |
| No autonomous agent runtime | Product correctly refuses to claim connected AI agents |
| Gate C not auto-approved | Binding policy |

---

## PR / verification linkage

| Change | Link |
|--------|------|
| Homepage research instrument | https://github.com/gnaneshwer23/hsi-core/pull/148 (merged) |
| This audit pack | Branch `eng/production-readiness-audit-2026-11-09` |
