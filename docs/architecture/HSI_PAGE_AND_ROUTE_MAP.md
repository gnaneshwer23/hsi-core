# HSI page and route map (32 logical templates)

**Audited tip:** `864710a` (main)  
**Production:** https://www.humansuperintelligence.tech/  
**As of:** 2026-11-09  
**Rule:** Target information architecture — map to existing routes; do not invent duplicate pages.

Status vocabulary:

| Status | Meaning |
|--------|---------|
| existing_functional | Renders; advertised public/static behaviour works |
| existing_partial | Route exists; core advertised persistence/API incomplete or fail-closed |
| existing_broken | Route present but known broken navigation/API contract |
| missing | No dedicated route/entity for the logical template |
| restricted | Requires auth/role; anonymous correctly denied |

---

## Journey spine (one investigation identity)

```text
Homepage → Contact/Sign-in → Research account → Research dashboard
  → Programme (missing) → Investigation → Evidence → Mechanisms
  → Contradictions → Gaps → Hypotheses → Research brief → Governance review
```

**Identity key (when writes enabled):** `hsi_interrogative_investigations.id` (`hsi-interrogative-…`) preserved across interrogative APIs (`/brief`, `/graph-context`, `/decision`, `/outcome`).  
**Production today:** writes disabled; anonymous APIs return 401 — journey cannot persist.

---

## 1. Public website (10)

| ID | Logical page | Route(s) | Status | Notes |
|----|--------------|----------|--------|-------|
| P01 | Homepage | `/` | existing_functional | Product instrument + illustrative demo (`live_backend=false`) |
| P02 | Platform | `/platform` | existing_functional | Marketing overview |
| P03 | How it works | `/how-it-works` | existing_functional | Workflow narrative |
| P04 | Evidence & safety | `/evidence-safety` | existing_functional | Honesty / evidence approach |
| P05 | Science hub | `/science` | existing_functional | Educational explorer entry |
| P06 | Products | `/products` | existing_functional | Product directory |
| P07 | Technology | `/technology` | existing_functional | Architecture narrative |
| P08 | Pricing | `/pricing` | existing_functional | Access framing |
| P09 | Contact / access request | `/contact` | existing_functional | Primary CTA destination |
| P10 | Status | `/status` | existing_functional | Service/status surface |

**Extra public routes (not in the 10):** `/solutions`, `/explore`, `/community`, `/roadmap`, `/docs`, `/sources`, `/science/*` explorers, `/discovery-engine`, etc. — keep; do not duplicate into the 10.

---

## 2. Researcher access and account (4)

| ID | Logical page | Route(s) | Status | Notes |
|----|--------------|----------|--------|-------|
| A01 | Sign in | `/sign-in` | existing_partial | Neon Auth reachable; credentialed E2E not verified this audit |
| A02 | Sign up | `/sign-up` | existing_partial | Account creation path present; research grant still human-gated |
| A03 | Password recovery | `/forgot-password`, `/reset-password` | existing_functional | Same-origin auth API wired |
| A04 | Research account | `/research/account` | existing_partial | Needs session; history API auth-gated |

---

## 3. Scientific research platform (12)

| ID | Logical page | Route(s) | Status | Notes |
|----|--------------|----------|--------|-------|
| R01 | Research landing | `/research` | existing_functional | Public research overview |
| R02 | Research dashboard | `/research/dashboard` | existing_partial | UI exists; `GET/POST /api/research/investigations` 401 anon; creates disabled when `writesEnabled=false` |
| R03 | Research programme | — | missing | No programme table/route; investigations hang off releases, not programmes |
| R04 | Investigation workspace | `/research/dashboard` + `/research/decision-workbench` | existing_partial | Components + interrogative APIs; not usable without session + writes |
| R05 | Evidence catalogue | `/research/evidence-readiness` | existing_partial | Catalogue UI; live retrieval not claimed for public |
| R06 | Mechanism workflow | `/research/mechanism-workflow` | existing_partial | Probes `/api/research/*`; fail-closed without auth |
| R07 | Connected knowledge graph | `/research/knowledge-graph` | existing_partial | Domain/claim graph; governed discovery 401 anon |
| R08 | Educational science graph | `/science/graph` | existing_functional | Draft educational topic map (honesty labelled) |
| R09 | Contradictions | `/science/contradictions` | existing_partial | Public explorer; not tied to live investigation id without auth |
| R10 | Evidence gaps | — (embedded in demo/workbench) | missing | No dedicated gaps workspace route |
| R11 | Hypotheses & brief | APIs + fragments; `/research/scientific-workbench` | existing_partial | Brief via `/api/research/interrogative/:id/brief`; no dedicated brief page |
| R12 | Scientific research workbench | `/research/scientific-workbench` | existing_partial | Governed SSC graph query requires session |

**Related science routes (supporting, not extra of 12):** `/science/paths`, `/science/body`, `/science/disease`, `/science/literature`, `/science/study-comparison`, `/science/review-preparation`, `/science/clinical-trials`, `/science/research-agents`, `/science/zoom`, `/science/connections`, `/research/coverage`, `/research/validation` (synthetic).

---

## 4. Connected ecosystem (4)

| ID | Logical page | Route(s) | Status | Notes |
|----|--------------|----------|--------|-------|
| E01 | Immune Super Intelligence | `/for-isi` | existing_functional | Boundary page; not ISI product host |
| E02 | Aksh Health | `/for-aksh` | existing_functional | Boundary page; CDS/PHI stay out of HSI |
| E03 | HSI Trials | `/for-trials` | existing_functional | Honesty: matching/enrolment not offered |
| E04 | Discovery centre | `/discovery` | existing_partial | Packs/fixtures; not live autonomous discovery |

---

## 5. Governance and operations (2)

| ID | Logical page | Route(s) | Status | Notes |
|----|--------------|----------|--------|-------|
| G01 | Governance dashboard | `/research/governance` | restricted | Reviewer queue; 403 without authority |
| G02 | Scientific review decision | `/research/scientific-review` | restricted | Decision API; human-gated; no Gate C auto-approve |

---

## Inventory counts (32)

| Bucket | Count |
|--------|------:|
| existing_functional | 16 |
| existing_partial | 12 |
| restricted | 2 |
| missing | 2 |
| existing_broken | 0 |

**Fully connected to working production backend services (session + writes + persistence):** **0** of the research-write spine.  
Public/static and fail-closed auth surfaces work as designed.

---

## Broken / weak navigation paths (product journey)

1. Homepage CTA → Contact/Sign-in works; **cannot** continue into writable dashboard on production.  
2. Dashboard → Create investigation disabled / denied when writes off.  
3. Investigation → Brief / graph-context / review-package require authorised interrogative id.  
4. Programme step skipped — no UI or API.  
5. Gaps / dedicated brief pages absent — users bounce between demo, science explorers, and workbench.

---

## Implementation rule

Prioritise connecting R02→R04→R11→G02 on **staging with writes** before adding new public pages. Do not merge production write enablement without staging evidence and human review.
