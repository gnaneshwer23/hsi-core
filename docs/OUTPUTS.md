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
```

## Who uses what

| Consumer | Files | Rules |
|----------|-------|--------|
| **ISI** | `hsi-isi-export.json`, `hsi-isi-rel-map.json`, `gate-c-checklist.*` | Discovery / Ask / Radar only. REL map never auto-approves into KG. Neon Gate C is human-only. |
| **Aksh** | `hsi-aksh-node-map.json`, `hsi-aksh-hitl-cards.json` | HITL map pointers. `akshNodeId` ≠ CDS. Seeds stay `cdsSurfacable=false`. |
| **Curators** | `gate-c-checklist.md`, `hsi-gap-report.md` | Pending REL list + gap backlog. Keep work in hsi-core docs/seeds. |

## Invariants

- `notCds` / `autoApproveIntoKg=false` / `autoSurfaceCds=false` on publish manifests
- Gate C checklist rows with evidence are **`pending`** until product Neon approve+supports
- No PHI; no EHR write-back; no invented PMIDs / REL ids

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
