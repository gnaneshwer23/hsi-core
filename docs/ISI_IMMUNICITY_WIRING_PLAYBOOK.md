# ISI / immunecity wiring playbook (out of hsi-core)

**Purpose:** Maximum useful **handoff package** so a human or agent can wire immunecity / ISI product screens to HSI published artifacts.

| Binding | Rule |
|---------|------|
| HSI substrate write target | **`~/Projects/hsi-core`** ([`AGENTS.md`](../AGENTS.md)) |
| Immunecity | **Freeze lifted 2026-11-01** (user auth) for **ISI HSI-consume wiring only** — `~/Desktop/immune-city` / `github.com/gnaneshwer23/immunecity`. Still no DeliverX. |
| HSI Neon | **`red-wave-06625195` only** |
| ISI Neon | **`autumn-snow-67879321`** — product DB; Gate C approve+supports only; **never** HSI migrations / Gate C local from hsi-core |
| Shared evidence DB | **Forbidden** |

**Companion machine spec:** [`hsi-isi-wiring-spec.json`](./hsi-isi-wiring-spec.json)  
**Consume contract (regenerable):** `hsi-isi-consume-contract.*` via `bun run outputs` · also [`site/public/discovery/hsi-isi-consume-contract.json`](../site/public/discovery/hsi-isi-consume-contract.json)  
**Reference client (demo in hsi-core only):** [`examples/isi-consumer/`](../examples/isi-consumer/)  
**PMID license review:** [`HOW_TO_SOURCE_LICENSING.md`](./HOW_TO_SOURCE_LICENSING.md)

---

## What you do on your machine (hsi-core)

Keep this workspace on **hsi-core only**. Do not open immunecity for edits from this session.

```bash
cd ~/Projects/hsi-core
bun test
bun run outputs          # regenerates dist/outputs/latest + site/public/discovery/*
bun run site:dev         # http://localhost:5173/discovery
bun run examples/isi-consumer/demo.ts
```

| Goal | Do this |
|------|---------|
| Verify Stage 1 packs | Open `/discovery` → ASK / MAP / REVIEW; check `hsi-pilot-acceptance.md` is `green_with_pending` |
| Fixture partner path | Confirm `hsi-partner-lock.json` shows `agreementKind=hypothetical_test_only`, `lockedPilot=false` |
| Rubric thresholds | `hsi-pilot-review-rubric.*` — Apolo Pharma `thresholdStatus=partner_agreed` (2026-11-01); min edges 12 / competing 4 / LOINC 6 |
| Licensing review | Follow [`HOW_TO_SOURCE_LICENSING.md`](./HOW_TO_SOURCE_LICENSING.md) against `hsi-source-licensing-stub.*` |
| Swap to a real partner | Edit `src/hypotheticalPartnerFixture.ts` (`USE_HYPOTHETICAL_PARTNER_FIXTURE=false` + `REAL_PARTNER_REPLACEMENT`); never invent email/MoU |
| Wire immunecity | Apply §8 in immunecity checkout (`~/Desktop/immune-city`); freeze lifted 2026-11-01 for consume wiring only |

---

## 0. Freeze status

**Lifted 2026-11-01** for HSI Discovery consume wiring in immunecity only. This playbook + wiring spec + `examples/isi-consumer/` remain the HSI-side contract. Do **not** share Neon; do **not** touch DeliverX; do **not** auto-approve Gate C.

---

## 1. What to fetch (artifact sources)

Prefer **committed, stable URLs** on `main`. Do **not** depend on local `dist/outputs/` over GitHub — `dist/` is gitignored.

### 1.1 Preferred: Discovery static copies (committed)

Base path in repo:

```text
site/public/discovery/
```

GitHub raw pattern:

```text
https://raw.githubusercontent.com/gnaneshwer23/hsi-core/main/site/public/discovery/{fileName}
```

Start here:

| File | Role |
|------|------|
| `index.json` | Discovery Centre public index + file list + honesty flags |
| `hsi-isi-consume-contract.json` | Load order, grades, Gate C rules, MANIFEST key map |
| `hsi-isi-wiring-spec.json` | This playbook’s machine companion (URL patterns, route map, acceptance) |
| `hsi-partner-lock.json` | ASK scope lock; `partnerSigned=false` honesty |
| `hsi-pilot-evidence-pack.json` | Four Stage 1 outputs (ASK → MAP → REVIEW) |
| `gate-c-checklist.json` | Pending Gate C queue (+ modelProposals / translationCandidates) |
| `hsi-r2-validation.json` | VALIDATE |
| `hsi-translation-handoff.json` | TRANSLATE (not live CDS) |
| `hsi-vertical-decision.json` | Dual-track A (ASK stays RA) |
| `hsi-ssc-pathway-pack.json` / `hsi-gut-immune-pack.json` / `hsi-neuroimmune-pack.json` | Secondary axes |
| `hsi-partner-flip-readiness.json` | Flip checklist; never invent MoU |
| `hsi-source-licensing-stub.json` | PMID license stub (curator-reviewed statuses) |

Full priority list: consume contract `artifacts[]` + wiring spec `fetch.discoveryFiles`.

### 1.2 Publish bundle (local or CI artifact)

After `bun run outputs` in hsi-core:

```text
dist/outputs/latest/MANIFEST.json
dist/outputs/latest/{fileName}
dist/outputs/<bundleId>/...
```

Consumers that pin a release should copy or host the versioned bundle (or pin a git SHA and use Discovery copies from that commit). **Raw GitHub will not serve `dist/`.**

### 1.3 Docs / wiring package (this repo)

| Path | Role |
|------|------|
| `docs/ISI_IMMUNICITY_WIRING_PLAYBOOK.md` | This document |
| `docs/hsi-isi-wiring-spec.json` | Machine-readable wiring companion |
| `docs/OUTPUTS.md` | Full publish layout |
| `docs/NEON_PROJECT_MAP.md` | Neon isolation |
| `docs/IMMUNECITY_GATE_C_COMMIT_MANUAL.md` | Curator Gate C handoff |
| `examples/isi-consumer/` | Minimal TypeScript consumer (runs against local discovery fixtures) |

---

## 2. Load order (from ISI consume contract)

Mirror `loadOrderHint` in `hsi-isi-consume-contract.json`:

1. **MANIFEST** (or Discovery `index.json` honesty flags) — verify `notCds=true`, `autoApproveIntoKg=false`, `partnerSigned=false`.
2. **required_core** — `hsi-isi-export.json` (from publish bundle; may be absent from Discovery static set), `hsi-isi-rel-map.json`, `gate-c-checklist.*`.
3. **required_pilot** — partner lock, vertical decision, pilot pack/rubric/acceptance/walkthrough, flip-readiness, consume contract (+ wiring spec).
4. **recommended_secondary** — gap, R2, SSc, gut, neuro, translation, systems vision, licensing stub.
5. **optional_proposal** — embeddings, eval, genome pointers, P3 matrix, adapter proposals (Gate C drafts only; do not block Discovery core).
6. **optional_aksh** — Aksh maps/cards (not ISI Discovery core).

**Honesty:** Discovery static folder does **not** always include every MANIFEST file (e.g. full `hsi-isi-export.json`). For full ISI export + REL map, use a publish bundle (`bun run outputs`) or host those files yourself from `dist/outputs/latest/`.

---

## 3. Grade display rules

Orthogonal axes — **never merge into one score**:

| Axis | Values | UI rule |
|------|--------|---------|
| `hsiGrade` / evidence band | `established` · `uncertain` · `unexplored` | Coarse honesty label only — **not** Gate C, **not** confidence % |
| `curationReview` | `draft` → `approved` / `rejected` / … | Human Gate C lifecycle |
| `teachingStatus` | `established` · `associative` · `hypothesized` · `unknown` | Separate KG teaching label |

Display guidance (immunecity):

- Show **established** under research / HITL constraints; never as CDS action.
- Show **uncertain** with explicit “partial / conflict / not claim-assessed” copy.
- Show **unexplored** as discovery-only; never actionable clinically.
- Model proposals, embeddings, MD, generative drafts **must never flip** `hsiGrade`.
- Packs (pilot / SSc / gut / neuro) remain evidence authority over proposal shelves.

Source of truth: consume contract `grades` + `src/grades.ts` `HSI_GRADE_INFO`.

---

## 4. Gate C — never auto-approve

| Rule | Binding |
|------|---------|
| Publish status | Every evidence-backed checklist row stays **`pending`** |
| `autoApprove` | **`false`** always |
| May flip `hsiGrade` from checklist | **`false`** |
| Approve+supports target | **ISI product Neon `autumn-snow` only** (human, in immunecity product) |
| HSI Neon role | `red-wave` pending placeholders only (`bun run db:gate-c-local`) |
| From hsi-core workspace | **Never** write approve into `autumn-snow` / Akeno / DeliverX |
| `modelProposals` | Typed drafts only; re-check S-P-O + PMID before any ISI approve |
| `translationCandidates` | HITL-only; `clinicalUse=not_for_clinical_use` |

Immunecity wiring must queue Gate C for humans — **no** auto-merge into product KG from HSI JSON.

---

## 5. Discovery routes mapping (HSI demo → ISI product)

HSI site reference: `site/src/pages/DiscoveryCentre.tsx` · loaders in `site/src/lib/discoveryData.ts`.

| HSI surface | Path / tab | Primary JSON | Immunecity mapping hint |
|-------------|------------|--------------|-------------------------|
| Discovery home | `/discovery` | `index.json` | Product Discovery / research home |
| ASK | tab `ask` | `hsi-partner-lock.json` + pack question | Locked RA/anti-TNF question; dual-track note |
| MAP | tab `map` | `hsi-pilot-evidence-pack.json` (`evidenceMap`, `entitySlice`) | Evidence map + entity neighbourhood |
| REVIEW | tab `review` | pack (`competingExplanations`, `expertShortlist`) + `gate-c-checklist.json` | Expert challenge + Gate C queue |
| VALIDATE | tab `validate` | `hsi-r2-validation.json` | Hypothesis / gaps / literature tests |
| TRANSLATE | tab `translate` | `hsi-translation-handoff.json` | HITL candidates only — **not CDS** |
| Secondary SSc | systems / dual-track | `hsi-ssc-pathway-pack.json` | Do **not** replace ASK |
| Secondary gut | systems | `hsi-gut-immune-pack.json` | Systems axis |
| Secondary neuro | systems | `hsi-neuroimmune-pack.json` | Systems axis; VNS–RA hypothesized only |
| Akeno HITL (HSI) | `/akeno` | translation handoff | Separate from ISI Discovery core |
| Partner readiness | docs / export | `hsi-partner-flip-readiness.json` | Internal readiness — not a public MoU |

Wire immunecity screens to the **same JSON contracts**; do not invent CDS paths.

---

## 6. Environment variables

### 6.1 hsi-core (this repo only)

See [`.env.example`](../.env.example):

| Var | Value |
|-----|--------|
| `DATABASE_URL` | HSI Neon `ep-restless-dew…` / `red-wave` only |
| `NEON_PROJECT_ID` | `red-wave-06625195` |
| `NEON_BRANCH_ID` | `br-quiet-silence-zab1zvji` |
| `NEON_DATABASE` | `neondb` |

**Forbidden** as HSI `DATABASE_URL`: `autumn-snow` / `ep-blue-salad…`, Akeno, DeliverX.

### 6.2 immunecity (apply in that repo — not here)

Suggested consumer env (names illustrative — map to immunecity conventions):

| Suggested var | Purpose |
|---------------|---------|
| `HSI_ARTIFACT_BASE_URL` | e.g. raw GitHub discovery base or CDN mirror of publish bundle |
| `HSI_BUNDLE_ID` or `HSI_GIT_SHA` | Pin version |
| `HSI_CONSUME_CONTRACT_URL` | URL to `hsi-isi-consume-contract.json` |
| `HSI_WIRING_SPEC_URL` | URL to `hsi-isi-wiring-spec.json` |
| ISI product `DATABASE_URL` | **autumn-snow only** for Gate C approve — never shared with HSI red-wave |

Do not point immunecity Gate C approve at red-wave. Do not point hsi-core migrations at autumn-snow.

---

## 7. Neon isolation (acceptance)

| Project | ID | Role |
|---------|-----|------|
| HSI | `red-wave-06625195` | Substrate / pending Gate C placeholders |
| ISI / immunecity | `autumn-snow-67879321` | Product evidence + human Gate C approve |
| Akeno / DeliverX | — | Out of scope / ignore for HSI |

See [`NEON_PROJECT_MAP.md`](./NEON_PROJECT_MAP.md). **No shared evidence DB.**

---

## 8. How to apply in immunecity (manual steps)

Run these in an **immunecity** checkout / agent session (not hsi-core):

1. **Pin source** — choose git SHA or `main` tip of `gnaneshwer23/hsi-core`; record in immunecity config.
2. **Fetch wiring package** — pull `docs/hsi-isi-wiring-spec.json` + `hsi-isi-consume-contract.json` (Discovery raw or vendored copies).
3. **Implement a thin client** — mirror [`examples/isi-consumer/`](../examples/isi-consumer/) (`loadContract` → load order → typed JSON). Prefer fetch-over-HTTP or vendored fixtures; do not import hsi-core as a runtime dependency unless you publish an intentional package.
4. **Map screens** — ASK/MAP/REVIEW/VALIDATE/TRANSLATE ↔ files in §5; show `notCds` banners; grade chips per §3.
5. **Gate C queue** — render `gate-c-checklist.json` as **pending**; wire approve UI exclusively to ISI Neon autumn-snow human flow; `autoApprove=false`.
6. **Env** — set `HSI_ARTIFACT_BASE_URL` (+ pin); keep ISI DB URL separate from any HSI Neon.
7. **Acceptance** — run immunecity tests against the checklist in §9 / wiring spec `acceptanceTests`.
8. **Do not** invent `partnerSigned=true`, MoUs, PHI, or CDS from these packs.

---

## 9. Acceptance tests (consumer-side)

Minimum checks (also encoded in `hsi-isi-wiring-spec.json` → `acceptanceTests`):

1. Consume contract / index: `notCds === true`, `autoApproveIntoKg === false`, `partnerSigned === false`.
2. Every artifact row: `autoApproveIntoKg === false`.
3. Gate C: `statusOnPublish === "pending"`, `autoApprove === false`, `mayFlipHsiGradeFromChecklist === false`.
4. Grades: only `established` | `uncertain` | `unexplored` for `hsiGrade` display band.
5. ASK stays RA: vertical `activeScope === "ra-tnf"`; SSc/gut/neuro packs do not replace ASK question.
6. Neon: consumer config must not use HSI red-wave for ISI Gate C approve.
7. Demo client in hsi-core: `bun test test/isiConsumerWiring.test.ts` and `bun run examples/isi-consumer/demo.ts`.

---

## 10. Reproduce HSI side (optional)

```bash
cd ~/Projects/hsi-core
bun test
bun run outputs
bun run site:dev   # http://localhost:5173/discovery
bun run examples/isi-consumer/demo.ts
```

---

## Cross-links

- [`OUTPUTS.md`](./OUTPUTS.md) · [`BUILD_STATUS_AND_NEXT.md`](./BUILD_STATUS_AND_NEXT.md)  
- [`NEON_PROJECT_MAP.md`](./NEON_PROJECT_MAP.md) · [`IMMUNECITY_GATE_C_COMMIT_MANUAL.md`](./IMMUNECITY_GATE_C_COMMIT_MANUAL.md)  
- Consume contract source: `src/isiConsumeContract.ts`
