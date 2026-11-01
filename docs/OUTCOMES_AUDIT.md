# HSI outcomes / results audit

**When:** 2026-11-01T22:08Z (UTC)  
**Kind:** results truth (does it work / what is true in production & data) — not a feature laundry list.  
**Canvas:** [hsi-outcomes-audit.canvas.tsx](/Users/gnaneshwerjadav/.cursor/projects/Users-gnaneshwerjadav-Projects-hsi-core/canvases/hsi-outcomes-audit.canvas.tsx)

## Executive verdict

**Stage 1 RA/TNF pilot outcomes are green with honest pending.** Named partner Apolo Pharma is locked (`lockedPilot=true`, `partnerSigned=true`, `legalBinding=true`). Licensing clearance and `partner_agreed` KPI thresholds are reflected in publish artifacts and live Discovery JSON. Product Discovery UI is live on ISI production; hsi-core production serves Discovery packs as JSON (not a full SPA loop). Neon red-wave has the HSI stub tables, but row counts lag the published pack density. Gate C still never auto-approves; not CDS.

| Plane | Result | Note |
| --- | --- | --- |
| hsi-core tests | **works** | 118 pass / 0 fail |
| Partner lock (Apolo) | **works** | `lockedPilot` + named partner in latest + live `/discovery` |
| Pack / licensing KPIs | **works** | `partnerClearedCount=48`, uncleared=0; thresholds `partner_agreed` |
| Boltz gate | **works** | `weightsPolicyAck=true`, proposals emit, no weight vendoring |
| Neon red-wave stub | **partial** | Correct project + 5 `hsi_*` tables; only 13 edges/claims seeded |
| Rubric checklist vs clearance | **partial** | Flip/acceptance say licensing pass; rubric still lists 1 `blocked_on_partner` |
| immunecity tip + tests | **works** | `309c6eb` = origin/main; 11/11 discovery tests |
| ISI Vercel production | **works** | Latest READY on `309c6eb` |
| hsi-core Vercel production | **works** | Latest READY on `7d733a0` (Boltz ack) |
| Live ISI `/hsi/discovery` | **works** | HTTP 200, ASK→MAP→REVIEW UI shell |
| Live ISI `/hsi-consume` | **works** | HTTP 200, diagnostics UI |
| Live hsi-core `/` | **works** | HTTP 200, titled shell |
| Live hsi-core `/discovery` | **partial** | HTTP 200 JSON index + packs (not product loop UI) |

---

## 1. hsi-core (substrate)

### Tests

```
118 pass · 0 fail · 23 files · ~0.8s (bun test)
```

Includes Gate C / partner lock, Boltz `WEIGHTS_POLICY_ACK`, neonGuard (red-wave only), ISI consume contract, Phase 0–8 publish path.

### Partner lock (latest publish)

Source: `dist/outputs/latest/hsi-partner-lock.json` (also live at `https://hsi-core.vercel.app/discovery/hsi-partner-lock.json`).

| Field | Value |
| --- | --- |
| partner | Apolo Pharma (`partner:apolo-pharma`) |
| `partnerSigned` | `true` |
| `lockedPilot` | `true` |
| `scopeLocked` | `true` |
| `legalBinding` | `true` |
| `agreementKind` | `legal_mou` |
| `status` | `scoping` |
| disease / activeScope | RA · `ra-tnf` |
| vertical | dual-track (`prdMvpTarget=ssc-tfh-b-il21`) |
| primary edge IDs | 14 (all present in pilot evidenceMap) |

### Pack edge / evidence counts

| Pack | Edges / evidence rows |
| --- | --- |
| RA pilot evidenceMap | **79** rows (14 primary pathway edges) |
| SSc pathway | **15** edges |
| Gut-immune | **12** edges |
| Neuroimmune | **11** edges |

Acceptance summary (`hsi-pilot-acceptance.json`): **13 pass / 0 fail / 0 pending**, `overallStage1Acceptance=green_with_pending`, `stage1FourOutputsGreen=true`.

### Licensing + KPI

| Metric | Result |
| --- | --- |
| `partnerClearedCount` | **48** / 48 PMIDs |
| clearance scopes | `oa_reuse=11`, `cite_metadata_pilot=37`, **`uncleared=0`** |
| rubric `thresholdSource` | **`partner_agreed`** |
| numeric thresholds | min edges 12 / competing 4 / LOINC 6 — **met** (`numericThresholdsMet=true`) |
| pack LOINC-linked claims | 8 |
| Gate C | pending allowed; auto-approve into KG = false |

**Honesty gap:** review rubric summary still reports `blockedOnPartner=1` (checklist `x-4` source licensing). Flip-readiness and acceptance treat licensing as **pass** after Stage 1 clearance. Treat checklist as stale relative to clearance data until next regenerate aligns them.

### Boltz gate

| Check | Result |
| --- | --- |
| `weightsPolicyAck` | `true` |
| `vendorsModelWeights` | `false` |
| `licenseGate.blockedUntilSignOff` | `false` (`research_ok_documented`) |
| proposals | 2 (TNF + FOXP3 stubs → Gate C pending only) |

Repo tip matches production deploy: `7d733a0` — *Enable Boltz stub under WEIGHTS_POLICY_ACK without weight vendoring.*

### Neon (red-wave only)

Verified via `neonctl` OAuth → project `red-wave-06625195` / host `ep-restless-dew…eu-west-2` / database `neondb` (not ISI `autumn-snow`).

| Table | Rows |
| --- | --- |
| `hsi_claims` | 13 |
| `hsi_edges` | 13 |
| `hsi_gate_c_reviews` | 13 |
| `hsi_markers` | 0 |
| `hsi_schema_migrations` | 1 |

**Outcome:** isolation correct; stub schema present; **counts do not yet mirror** the 79-row pilot evidenceMap / dual-track packs (publish artifacts are ahead of Neon seed density).

Local dirty tree note: `site/public/discovery/*.json` show uncommitted diffs vs `origin/main` at audit time — **not** included in this commit. Live Vercel still serves committed `7d733a0` discovery exports.

---

## 2. immunecity (ISI product)

| Check | Result |
| --- | --- |
| Git tip | `309c6eb` *Add product HSI Discovery ASK→MAP→REVIEW UI at /hsi/discovery.* |
| vs `origin/main` | **in sync** (0 ahead / 0 behind) — no push needed |
| `bun test` hsi-discovery-* | **11 pass / 0 fail** |
| Vercel latest production | **READY** · deploy `dpl_7W4eHvjm…` · sha `309c6eb` |

---

## 3. Live HTTP

| URL | HTTP | What loads |
| --- | --- | --- |
| https://hsi-core.vercel.app/ | **200** | HSI shell (`HSI — Human Systems Intelligence`) |
| https://hsi-core.vercel.app/discovery | **200** | Discovery Centre **JSON** index (`hsi-discovery-centre-public-1`, Apolo, ASK→MAP→REVIEW framing) |
| https://hsi-core.vercel.app/discovery/hsi-partner-lock.json | **200** | Live lock: Apolo · `lockedPilot=true` |
| https://www.immune-super-intelligence.co.uk/hsi/discovery | **200** | Product UI title *HSI Discovery \| Immune Super Intelligence*; ASK/MAP/REVIEW + not-CDS copy present |
| https://www.immune-super-intelligence.co.uk/hsi-consume | **200** | Diagnostics UI title *HSI Discovery diagnostics*; honesty / consume path present |

Vercel production tips: **hsi-core** `7d733a0` READY; **immunecity** `309c6eb` READY.

---

## 4. Broken vs working (results only)

### Working

- Full hsi-core and immunecity discovery test suites green.
- Apolo named lock + Stage 1 acceptance green_with_pending.
- Partner corpus cleared (`uncleared=0`) and KPI source `partner_agreed`.
- Boltz stub gate open under ack; proposals only.
- ISI production Discovery + consume routes return 200 with expected UI shells.
- Both Vercel production deploys READY on expected SHAs.
- Neon project isolation (red-wave) confirmed.

### Partial / lagging

- hsi-core `/discovery` is pack JSON, not the ISI product loop UI.
- Neon `hsi_*` row counts (13) behind published pack evidence (79 + dual-track packs).
- Rubric still shows one `blocked_on_partner` licensing item despite clearance/flip pass — regenerate/alignment debt.
- Local uncommitted discovery JSON drift under `site/public/discovery/` (workspace only).

### Intentionally not “working” (policy)

- No live CDS, no PHI→LLM, no Gate C auto-approve, no shared HSI↔ISI Neon, no production invent of alternate partners.

---

## 5. Commits referenced

| Repo | SHA | Note |
| --- | --- | --- |
| hsi-core | `7d733a0` | origin/main + Vercel production (Boltz ack) |
| immunecity | `309c6eb` | origin/main + Vercel production (Discovery UI) |
| hsi-core (this audit) | `b7ec7b6` | `docs/OUTCOMES_AUDIT.md` only |
