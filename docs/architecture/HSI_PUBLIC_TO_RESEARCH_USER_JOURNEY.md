# HSI public → research user journey

**As of:** 2026-11-09  
**Production:** https://www.humansuperintelligence.tech/  
**Contracts:** `site/src/lib/researchContext.ts`, `site/src/lib/ctaPolicy.ts`, `docs/capability-status.json`  
**Rule:** Preserve scientific context across auth without inventing live writes or disease-hardcoded product boundaries.

---

## Journey map (six intents)

```text
Explore Biology → Investigate Mechanism → Review Evidence
       → Start Research → Request Access → Research Outcomes
```

Context keys (query / session — not disease enums as product walls):

| Key | Purpose | Survives auth? |
|-----|---------|----------------|
| `scenario` | Homepage illustrative scenario id | Public only (illustrative) |
| `panel` | Demo panel: mechanism \| graph \| brief | Public only |
| `domain` | Biological domain hint (e.g. immunity) | Intended for science explorers; not yet wired on all CTAs |
| `investigation` | `hsi-interrogative-…` id | Yes — required for workbench/brief/review |
| `next` | Safe same-origin return path after sign-in | Supported by contract; SignIn/SignUp not yet reading it (**deferred**) |

---

### 1. Explore Biology

| Step | Destination | Backend | Context |
|------|-------------|---------|---------|
| Homepage ecosystem / science hub | `/`, `/science`, `/science/graph`, `/science/body` | Static / educational modules | Domain buttons local; optional `?domain=` contract available |
| Domain boundary pages | `/for-isi`, `/for-aksh`, `/for-trials` | Static | Product boundaries, not disease lists |

**Honesty:** Educational graphs are draft topic maps — not governed SSC discovery.

---

### 2. Investigate Mechanism

| Step | Destination | Backend | Context |
|------|-------------|---------|---------|
| Homepage multi-scenario demo | `/#product-demo` + `?scenario=` | Illustrative (`live_backend:false`) | Scenario + panel preserved in URL |
| Mechanism / graph panels | same | Curated demo data | `panel=mechanism\|graph` |
| Science mechanism explorers | `/science/paths`, `/science/connections` | Static | No investigation id |
| Authenticated mechanism workflow | `/research/mechanism-workflow` | Research API probe; writes parked | Session required for live probes |

**Honesty:** Homepage paths are illustrative. Cross-domain depth ≠ SSc validation depth.

---

### 3. Review Evidence

| Step | Destination | Backend | Context |
|------|-------------|---------|---------|
| Evidence & safety narrative | `/evidence-safety` | Static | — |
| Evidence catalogue | `/research/evidence-readiness` | Static catalogue UI | Live retrieval not claimed |
| Contradictions explorer | `/science/contradictions` | Static / LIMITED | Not bound to investigation without auth |
| Governed evidence on investigation | interrogative graph-context / brief APIs | Restricted | Needs `investigation` id + grant |

---

### 4. Start Research

| Step | Destination | Backend | Context |
|------|-------------|---------|---------|
| Research landing | `/research` | Static | Copy: SSc = validation case |
| How it works | `/how-it-works` | Static | Primary secondary CTA |
| Knowledge graph | `/research/knowledge-graph` | Versioned JSON; discovery auth-gated | Optional `version` / `dataset` |
| Dashboard / workspace | `/research/dashboard` | Investigations API | Session; create blocked when writes off |
| Decision workbench | `/research/decision-workbench?investigation=` | Interrogative APIs | **Must** carry investigation id |

**Shipped:** Bare “Investigation” / “Decision workbench” links now target the dashboard workspace list instead of an empty workbench.

---

### 5. Request Access

| Step | Destination | Backend | Context |
|------|-------------|---------|---------|
| Primary CTA | `/contact` | **No request persistence** | Honesty note on page |
| Create account | `/sign-up` | Neon Auth | Signup ≠ research grant |
| Sign in | `/sign-in` | Neon Auth | — |
| Check grant | `/research/account` | `GET /api/research/account` | Human-provisioned grant (migration 006) |

**BLOCKED:** Public access-request form writing to grants table — not inventing in this phase. Administrator provisions grants out-of-band.

**Deferred:** `?next=` round-trip through SignIn/SignUp so post-auth landing can restore research intent.

---

### 6. Research Outcomes

| Step | Destination | Backend | Context |
|------|-------------|---------|---------|
| Illustrative brief (public) | `/?panel=brief#product-demo` | None (curated) | Scenario preserved |
| Dashboard `?view=briefs` | `/research/dashboard?view=briefs` | Headline only | Honesty note: not a document store |
| Live brief export | `/api/research/interrogative/:id/brief` | Restricted + writes/history | Needs authorised id |
| Scientific review | `/research/scientific-review?investigation=` | Role-gated decision API | Human-gated; no Gate C auto-approve |
| Governance queue | `/research/governance` | Reviewer role | Restricted |

**Production:** Outcome persistence and brief download **not** verified end-to-end with a researcher identity on this audit (`NOT_EXECUTED` / `BLOCKED` by writes gate).

---

## Context preservation rules

1. **Public demos** may use `scenario` / `panel` only — never imply `live_backend:true`.
2. **Authenticated tools** must pass `investigation` when deep-linking into workbench, brief, or review.
3. **Do not** encode product eligibility as a closed disease list; optional `diseaseContext` remains a schema goal (see domain-independence audit).
4. **Fail closed:** missing session → 401; writes off → 403; missing investigation id → explicit UI, not empty invent.

---

## Auth boundary diagram

```text
Anonymous public shell
  └─ Explore / Investigate (illustrative) / Review (narrative)
        └─ CTA → /contact (no store) → /sign-up|/sign-in
              └─ Neon Auth session
                    └─ Admin grant (human)
                          └─ /research/account → dashboard
                                └─ investigation id → workbench / brief / review
```

Production write spine remains **parked** until staging proof (`writesEnabled=true` on staging host only).
