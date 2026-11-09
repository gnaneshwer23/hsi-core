# HSI data flow and contracts

**Audited tip:** `864710a`  
**Companion maps:** [`HSI_PAGE_AND_ROUTE_MAP.md`](./HSI_PAGE_AND_ROUTE_MAP.md), [`HSI_BACKEND_SERVICE_MAP.md`](./HSI_BACKEND_SERVICE_MAP.md)

Reuse existing contracts; do not invent new MoU / Gate C auto-approve / production legal binding.

---

## 1. Investigation identity (spine)

```text
Release (hsi_evidence_graph_releases)
    └── Interrogative investigation (hsi_interrogative_investigations.id)
            ├── graph-context captures
            ├── review-package / brief exports
            ├── submit-review → scientific queue
            ├── decision (accept / revise / reject)
            └── outcome ledger entries
```

**Programme layer:** not modelled — target IA wants Programme → Investigation; today investigations attach to **releases** only.

Frontend must pass the same `hsi-interrogative-…` id across workbench, graph, brief, and governance views.

---

## 2. Per-page contract matrix (32)

Legend: **Data** = primary source · **API** = backend · **Persist** = durable write path.

### Public (P01–P10)

| ID | Role | Data | API | Persist | Access | Failure / loading |
|----|------|------|-----|---------|--------|-------------------|
| P01 | anon | Curated demo JSON + static copy | none required | none | public | Demo labelled illustrative |
| P02–P08,P10 | anon | Static page modules | none | none | public | Standard route 404 shell |
| P09 | anon | Contact form / CTA | optional mail/provider | none/local | public | Honest “request access” |

Acceptance: public pages HTTP 200; no fixture promotion except honesty-labelled demo.

### Access (A01–A04)

| ID | Role | Data | API | Persist | Access | Failure |
|----|------|------|-----|---------|--------|---------|
| A01 | anon→user | Neon Auth session | `/api/auth/*` | session cookie | public | Provider errors surfaced; no fake session |
| A02 | anon | Auth sign-up | `/api/auth/sign-up/email` | user row | public | Does **not** grant research write |
| A03 | anon | Reset tokens | request/reset password APIs | auth provider | public | Invalid token fail closed |
| A04 | researcher | Grants + review history | `/api/research/account`, scientific-review/history | read | session | 401/403 → explain access not confirmed |

### Research platform (R01–R12)

| ID | Role | Data | API | Persist | Access | Failure |
|----|------|------|-----|---------|--------|---------|
| R01 | anon | Static | none | none | public | — |
| R02 | researcher | Investigation list | `GET/POST /api/research/investigations` | interrogative + runs | grant | 401; create disabled if `!writesEnabled` |
| R03 | researcher | Programme | **none** | **missing** | — | Blocker for IA |
| R04 | researcher | Investigation payload | `/api/research/interrogative/:id` | append-only / state machine | grant | 404/401; no silent invent |
| R05 | researcher/anon | Catalogue JSON / readiness | mostly static + optional APIs | none/live TBD | mixed | Label curated vs live |
| R06 | researcher | Workflow probes | `/api/research/*` | optional | grant | Probe must report real status |
| R07 | mixed | Domain graph bundles | `/api/research/discovery/ssc` (auth) | versioned files | mixed | 403 → permission message |
| R08 | anon | Educational graph | static | none | public | “Draft educational” honesty |
| R09 | anon/researcher | Contradiction sets | static / investigation | optional | mixed | Don’t claim live adjudication |
| R10 | researcher | Gaps | embedded only | missing page | — | Use brief/demo until page exists |
| R11 | researcher | Brief package | `…/brief`, `…/review-package` | delivery tables | grant | 401; format query only |
| R12 | researcher | Governed SSC nodes | `/api/research/graph/ssc` | graph releases | grant | 401/403 messages in UI |

### Ecosystem (E01–E04)

| ID | Role | Data | API | Persist | Notes |
|----|------|------|-----|---------|-------|
| E01–E03 | anon | Boundary copy | none | none | No cross-Neon; no CDS |
| E04 | anon | Discovery packs | static `/discovery/*.json` | none | Not autonomous discovery |

### Governance (G01–G02)

| ID | Role | Data | API | Persist | Access |
|----|------|------|-----|---------|--------|
| G01 | reviewer | Queue pages | `/api/research/scientific-review/queue` | audit | reviewer role |
| G02 | reviewer | Decision body | `…/interrogative/:id/decision` | audit + state | reviewer; human only |

---

## 3. Agent dependencies

| Capability | Dependency | Product claim allowed? |
|------------|------------|------------------------|
| Deterministic release analysis | Local analysis modes | Yes if labelled |
| Durable agent checkpoints | migrations 009–010 | Internal / staging only until verified |
| Live scientific agent “discovery” | Not production-wired as public CTA | **No** |

---

## 4. Loading and honesty patterns (required)

1. Every fetch shows pending state.  
2. On 401/403: explain **access** or **writes disabled**, never invent empty “success” science.  
3. On illustrative data: `curated_example` / `live_backend=false` / `research_preview`.  
4. Capability chips derive from `docs/capability-status.json` where public CTAs are concerned.

---

## 5. Flagship SSc Tfh–IL-21–B-cell flow (contract)

| Step | Contract | Production |
|------|----------|------------|
| Create programme | missing | BLOCKED |
| Create investigation | POST investigations + interrogative row | BLOCKED (`writesEnabled=false`) |
| Evidence retrieval | release-bound claims / dossiers | BLOCKED live |
| Graph exploration | graph-context + SSC graph | BLOCKED anon; restricted with session |
| Contradictions / gaps | investigation payload + explorers | LIMITED public / BLOCKED live |
| Hypothesis | workbench refuses unsupervised generation without reviewed evidence | LIMITED |
| Brief export | `/brief?format=` | BLOCKED without auth+id |
| Scientific review | submit-review → decision | BLOCKED without roles |

Reuse: `docs/qa/HSI_END_TO_END_RESEARCH_ACCEPTANCE.md` (still BLOCKED for full pass).
