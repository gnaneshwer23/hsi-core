# HSI publishable outputs

Consumers (Aksh Health, ISI / Immune Super Intelligence) pull **versioned artifacts** from this repo — not live edits in product apps.

## Produce

```bash
cd ~/Projects/hsi-core
bun install
bun test
bun run outputs    # alias: bun run publish
```

Writes regenerable bundles under **`dist/outputs/`** (gitignored). Also refreshes legacy `exports/*.json` for local CLI convenience.

Committed **small samples** (not full dumps): [`examples/sample-outputs/`](../examples/sample-outputs/).

## Layout

```
dist/outputs/
  LATEST.json                         # pointer to newest bundle
  latest/                             # copy of newest bundle files
  hsi-core-<version>-<timestamp>/
    MANIFEST.json
    hsi-isi-export.json               # ISI discovery export (hsi-isi-export-1)
    hsi-isi-rel-map.json              # REL-* curation pointers (not Gate C)
    hsi-aksh-node-map.json            # durable aksh: map (hsi-aksh-node-map-2)
    hsi-aksh-hitl-cards.json          # HITL card snapshot (cdsSurfacable=false on seeds)
    hsi-gap-report.json               # schema / mapping gaps
    hsi-gap-report.md                 # short human summary
    gate-c-checklist.json             # curated REL + PMID + S-P-O + status pending
    gate-c-checklist.md
    hsi-pilot-evidence-pack.json      # pilot pack (hsi-pilot-evidence-pack-2)
    hsi-pilot-evidence-pack.md        # human walkthrough / brief shell
    hsi-pilot-review-rubric.json      # Stage 1 four-output review checklist
    hsi-pilot-review-rubric.md
    hsi-partner-lock.json             # durable provisional / future signed lock
```

## Who uses what

| Consumer | Files | Rules |
|----------|-------|--------|
| **ISI** | `hsi-isi-export.json`, `hsi-isi-rel-map.json`, `gate-c-checklist.*`, `hsi-pilot-evidence-pack.*`, `hsi-pilot-review-rubric.*`, `hsi-partner-lock.json` | Discovery / Ask / Radar only. REL map never auto-approves into KG. Gate C approve (if any) is human-only in **ISI Neon `autumn-snow`**, not HSI `red-wave`. Pack may show a **provisional** RA/TNF disease+question (`provisionalLock=true`, `lockedPilot=false`) — not partner-signed. Discovery Centre vocabulary is **metadata only**. |
| **Aksh** | `hsi-aksh-node-map.json`, `hsi-aksh-hitl-cards.json` | HITL map pointers. `akshNodeId` ≠ CDS. Seeds stay `cdsSurfacable=false`. |
| **Curators** | `gate-c-checklist.md`, `hsi-gap-report.md`, `hsi-pilot-evidence-pack.md`, `hsi-pilot-review-rubric.md` | Pending REL list + gap backlog + provisional brief + human review checklist. |

PRD / brief four outputs (evidence map, entity slice, competing explanations, expert shortlist) are assembled in `hsi-pilot-evidence-pack.*`. See [`ISI_PILOT_PRD_ALIGNMENT.md`](./ISI_PILOT_PRD_ALIGNMENT.md).

## Invariants

- `notCds` / `autoApproveIntoKg=false` / `autoSurfaceCds=false` on publish manifests
- Gate C checklist rows with evidence are **`pending`** until a human approve+supports in the **ISI product Neon** (`autumn-snow` / `ep-blue-salad…`) — that DB is **not** HSI’s; HSI Neon is `red-wave` only ([`NEON_PROJECT_MAP.md`](./NEON_PROJECT_MAP.md))
- No PHI; no EHR write-back; no invented PMIDs / REL ids; no HSI writes into ISI/Akeno/DeliverX Neon
- `provisionalLock=true` **never** implies a signed partner; `lockedPilot` stays false until flip requirements in `hsi-partner-lock.json` are met
- SLE/PsO/IBD contexts remain **illustrative only**

## Stage 1 / R0–R1 implementation checklist

| Item | Status |
|------|--------|
| Graded edges + provenance + dual axes (`hsiGrade` / `curationReview` / `teachingStatus`) | **Done** |
| Claim → marker → LOINC links (T2D + illustrative autoimmunity markers) | **Done** |
| ISI export + REL suggestion map (`autoApproveIntoKg=false`) | **Done** |
| Aksh node map + HITL stub (`cdsSurfacable=false` on seeds) | **Done** |
| Gap report + Gate C checklist (pending only) | **Done** |
| Pilot evidence pack — four workflow outputs + brief shell | **Done** (`hsi-pilot-evidence-pack-2`) |
| Versioned `bun run outputs` bundle + MANIFEST | **Done** |
| Discovery Centre vocabulary in exports (ASK→MAP→REVIEW + illustrative diseases) | **Done** (metadata only) |
| Illustrative RA/SLE/PsO/IBD pathway seed stubs | **Done** (RA elevated to provisional scaffold) |
| Typed entity slice + LOINC on pack evidence rows | **Done** |
| Partner disease + question **provisional** lock scaffold (`lockedPilot=false`) | **Done** (RA / anti-TNF response heterogeneity) |
| Partner-scoped literature seed slice (provisional RA/TNF pathway) | **Done** (public PMIDs; licensing still open with partner) |
| Scientific review rubric export (Stage 1 four outputs) | **Done** (thresholds TBD with partner) |
| Partner-signed `lockedPilot=true` | **Remaining** (outreach — named partner confirms disease + question) |
| Source licensing / attribution for agreed partner corpus | **Remaining** (after signed lock) |
| Success-metric numeric thresholds with partner | **Remaining** |
| Interactive Discovery Centre / graph UI | **Deferred** (ISI product — not hsi-core Stage 1) |
| PDF/DOCX brief renderer | **Deferred** (ISI product P1) |
| HSI Neon `red-wave` schema migrations | **Deferred** (local JSON/exports suffice for Stage 1) |
| Stage 2 molecular adapters / Stage 3 Akeno clinical | **Out of Stage 1** |

## Individual CLIs (still available)

```bash
bun run validate
bun run export:isi
bun run export:isi-map
bun run export:aksh-map
bun run gap-report
bun run build
```

Prefer `bun run outputs` when handing artifacts to product teams.
