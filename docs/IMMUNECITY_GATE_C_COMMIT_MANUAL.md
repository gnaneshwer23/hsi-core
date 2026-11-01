# Manual commit — Gate C + PMID (immunecity)

**Do not run full `git status` until locks are cleared.** Prefer pathspecs + `GIT_OPTIONAL_LOCKS=0` + `core.fsmonitor=false`.

## Clear locks first (user action)

From `~/Desktop/immune-city`:

```bash
# Inspect only — remove locks yourself when no other git is running
ls -la .git/*.lock .git/index*
# After confirming no live git processes:
#   rm -f .git/ORIG_HEAD.lock
```

## Paths to stage (evidence sprint)

```bash
cd ~/Desktop/immune-city

GIT_OPTIONAL_LOCKS=0 git -c core.fsmonitor=false add -- \
  src/data/hsi-isi-export.json \
  src/test/hsi-phase0.test.ts \
  src/components/immune/HsiBridgeCurationPanel.tsx \
  src/lib/hsi/bridgeCurationQueue.ts \
  src/lib/hsi/index.ts
```

**Do not** `git add .` while the tree is unhealthy.

## Suggested commit

```bash
GIT_OPTIONAL_LOCKS=0 git -c core.fsmonitor=false commit -- \
  src/data/hsi-isi-export.json \
  src/test/hsi-phase0.test.ts \
  -m "$(cat <<'EOF'
Sync hsi-core evidence sprint: 9 mapped RELs with verified PMIDs (Gate C pending).

Shows evidence-linked · Gate C pending on /curation; does not Neon-approve or invent PMIDs.
EOF
)"

GIT_OPTIONAL_LOCKS=0 git -c core.fsmonitor=false push origin HEAD
```

Safer verify (path-limited, no full status):

```bash
bun test src/test/hsi-phase0.test.ts
ln -sfn ~/Projects/hsi-core node_modules/hsi-core
```

## What this ships (ISI side) — 9 evidence-linked maps

| HSI edge | ISI REL | PMID | Paper (verified) |
|----------|---------|------|------------------|
| `HSI-E-IO-001` | `REL-R011-drives-P015` | **16382236** | Barber 2006 Nature (PD-1 → exhaustion) |
| `HSI-E-IM-010` | `REL-I023-targets-M002` | **28845751** | Ridker CANTOS 2017 NEJM |
| `HSI-E-IM-006` | `REL-R004-activates-P003` | **15030775** | Agostini 2004 Immunity (NALP3) |
| `HSI-E-IM-004` | `REL-P021-produces-B001` | **12813013** | Pepys & Hirschfield 2003 JCI (CRP) |
| `HSI-E-IM-002` | `REL-M001-contributes_to-D001` | **11244034** | Feldmann & Maini 2001 (TNF→RA) |
| `HSI-E-IM-003` | `REL-M003-contributes_to-D001` | **18625622** | Emery 2008 (tocilizumab / IL-6R) |
| `HSI-E-IM-005` | `REL-C003-produces-M001` | **2993897** | Beutler 1985 Nature (macrophage→TNF) |
| `HSI-E-T2D-010` | `REL-I010-suppresses-P001` | **7569976** | Auphan 1995 Science (GC→NF-κB) |
| `HSI-E-AU-001` | `REL-B015-predicts_eligibility_for-I013` | **31180194** | Herold 2019 NEJM (teplizumab) |

| Gate C handoff | **pending** (`evidence-linked · Gate C pending`) on all nine |
| Neon Gate C | **not** passed — human approve+supports only; related_axis papers support ISI REL S-P-O, not T2D invent |

## Honest unmapped gaps (unchanged)

`HSI-E-IM-001`, `IM-007`, `IM-008`, `IM-009`, `IO-002`, `IO-003`, `AU-002` — no invented RELs.

## Upstream

`hsi-core` main — seed + map + exports + tests for this sprint.
