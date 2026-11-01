# HSI outcomes / results audit

**When:** 2026-11-01T22:20Z (UTC) — re-audit after Partial fixes  
**Kind:** results truth (does it work / what is true in production & data) — not a feature laundry list.  
**Canvas:** [hsi-outcomes-audit.canvas.tsx](/Users/gnaneshwerjadav/.cursor/projects/Users-gnaneshwerjadav-Projects-hsi-core/canvases/hsi-outcomes-audit.canvas.tsx)

## Executive verdict

**Stage 1 RA/TNF pilot outcomes are green with honest pending.** Named partner Apolo Pharma is locked (`lockedPilot=true`, `partnerSigned=true`, `legalBinding=true`). Licensing clearance and `partner_agreed` KPI thresholds are reflected in publish artifacts. Product Discovery loop UI ships on hsi-core `/discovery` (SPA); machine catalogue at `/discovery.json` + `/discovery/catalogue.json`. Neon red-wave pack density now matches seed totals (79 edges/claims). Rubric `x-4` licensing aligned with clearance (`blockedOnPartner=0`). Gate C still never auto-approves; not CDS.

| Plane | Result | Note |
| --- | --- | --- |
| hsi-core tests | **works** | 118 pass / 0 fail |
| Partner lock (Apolo) | **works** | `lockedPilot` + named partner in latest + live packs |
| Pack / licensing KPIs | **works** | `partnerClearedCount=48`, uncleared=0; thresholds `partner_agreed` |
| Boltz gate | **works** | `weightsPolicyAck=true`, proposals emit, no weight vendoring |
| Neon red-wave stub | **works** | 79 claims / 79 edges / 8 markers; Gate C reviews=13 (mapped REL only — intentional) |
| Rubric checklist vs clearance | **works** | `x-4` → `ready_for_human`; `blockedOnPartner=0` |
| immunecity tip + tests | **works** | catalogue.json fallback; 11/11 discovery tests |
| ISI Vercel production | **works** | Prior READY on `309c6eb` (consume pin compatible) |
| hsi-core Vercel production | **works** | READY after `c657746` — `/discovery` serves HTML SPA |
| Live ISI `/hsi/discovery` | **works** | HTTP 200, ASK→MAP→REVIEW UI shell |
| Live ISI `/hsi-consume` | **works** | HTTP 200, diagnostics UI |
| Live hsi-core `/` | **works** | HTTP 200, titled shell |
| Live hsi-core `/discovery` | **works** | HTTP 200 `text/html` SPA; machine JSON at `/discovery.json` + `/discovery/*.json` |

---

## 1. hsi-core (substrate)

### Tests

```
118 pass · 0 fail · 23 files · ~0.3s (bun test)
```

### Neon (red-wave only) — before → after

Verified via `neonctl` OAuth → project `red-wave-06625195` / host `ep-restless-dew…eu-west-2` / database `neondb`.

| Table | Before | After |
| --- | --- | --- |
| `hsi_claims` | 13 | **79** |
| `hsi_edges` | 13 | **79** |
| `hsi_gate_c_reviews` | 13 | **13** (mapped REL pending only — intentional) |
| `hsi_markers` | 0 | **8** |
| `hsi_schema_migrations` | 1 | 1 |

**Path:** `bun run db:gate-c-local -- --from-neonctl` now upserts full `HSI_T2D_IMMUNO_SEED_*` (RA + SSc/gut/neuro) before Gate C checklist rows.

**Intentional remaining gap:** Gate C review count stays at mapped ISI REL rows (~13), not 79 — unmapped seeds are in `hsi_edges`/`hsi_claims` but do not invent REL for Gate C.

### Rubric vs licensing

| Check | Result |
| --- | --- |
| `x-4` source licensing | **`ready_for_human`** (was `blocked_on_partner`) |
| `summary.blockedOnPartner` | **0** |
| Acceptance `ac-licensing` / flip licensing | still **pass** |

### Discovery surface

| Path | Role |
| --- | --- |
| `/discovery` | **Product** ASK→MAP→REVIEW→VALIDATE→TRANSLATE SPA (Discovery Coach quality: upfront contract, MAP-majority, implication + need-payoff prompts; never Gate C auto-approve) |
| `/discovery.json` | Machine catalogue |
| `/discovery/catalogue.json` | Same catalogue under pack base |
| `/discovery/*.json` | Pack JSON (unchanged consumers) |

**Root cause of prior Partial:** `site/public/discovery/index.json` shadowed the SPA on Vercel static hosting. Renamed away; SPA rewrite via `site/vercel.json`.

### Partner lock / packs / Boltz

Unchanged green from prior audit: Apolo lock, 79-row evidenceMap, `partnerClearedCount=48`, Boltz ack.

---

## 2. immunecity (ISI product)

| Check | Result |
| --- | --- |
| Consume pin | Accepts `catalogue.json` with fallback to legacy `index.json` |
| `bun test` hsi-discovery-* | **11 pass / 0 fail** |

---

## 3. Broken vs working (results only)

### Working

- Full hsi-core and immunecity discovery test suites green.
- Apolo named lock + Stage 1 acceptance green_with_pending.
- Partner corpus cleared; rubric licensing no longer stale-blocked.
- Neon pack density aligned to 79 seed edges/claims (+ markers).
- hsi-core Discovery product loop unblocked for ship (UI + machine JSON dual path).

### Intentionally not “working” (policy)

- No live CDS, no PHI→LLM, no Gate C auto-approve, no shared HSI↔ISI Neon.
- Gate C review rows remain mapped-REL-only (~13) by design.
- Aksh health-live / clinic CDS+PHI product code stays **out of HSI**; boundary + reject helpers only (`docs/CDS_PHI_BOUNDARY.md`).

---

## 4. Commits referenced

| Repo | SHA | Note |
| --- | --- | --- |
| hsi-core | `c657746` | Neon pack sync + rubric x-4 + Discovery SPA (prod) |
| immunecity | `884261d` | catalogue.json consume fallback |
| Prior tips | `7d733a0` / `309c6eb` | Pre-fix production baselines |
| Pending | _(this change)_ | CDS/PHI boundary lift from aksh-health-redesign — SHAs filled after push |
