# Gate C curator checklist (hsi-core)

**Active edits stay in `hsi-core` only.** Do not commit to `gnaneshwer23/immunecity` for HSI work. DeliverX / `swift-deliveries` is **ignored** (out of scope). Product apps (ISI / Aksh) consume published exports from this repo when needed.

This doc is the durable curator checklist: verified PMID ↔ REL maps for Gate C handoff.

**Neon isolation:** HSI substrate DB is **only** `red-wave-06625195` (`human super intelligence` / `ep-restless-dew…`). Gate C **approve+supports** (if performed) is a human action in the **ISI product Neon** (`autumn-snow` / `ep-blue-salad…`) — **never** run those writes from hsi-core against ISI Neon, and **never** point HSI `DATABASE_URL` at ISI/Akeno/DeliverX. No shared evidence DB. See [`NEON_PROJECT_MAP.md`](./NEON_PROJECT_MAP.md).

## Upstream artifacts (this repo)

```bash
cd ~/Projects/hsi-core
bun test
bun run outputs    # dist/outputs/ + gate-c-checklist.*; alias: bun run publish
```

Publish / sync via hsi-core commits. Consumers pull `dist/outputs/` (or legacy `exports/`), not ad-hoc edits in other repos. See [`OUTPUTS.md`](OUTPUTS.md).

## What this checklist covers — 9 evidence-linked maps

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
| ISI product Neon Gate C (`autumn-snow` only) | **not** passed in hsi-core — human approve+supports stays in immunecity’s DB if/when product runs it; HSI never shares that DB; related_axis papers support ISI REL S-P-O, not T2D invent |

## Honest unmapped gaps (unchanged)

`HSI-E-IM-001`, `IM-007`, `IM-008`, `IM-009`, `IO-002`, `IO-003`, `AU-002` — no invented RELs. Extend maps in hsi-core seeds/exports only.

## ISI product operator path (cite Approve — separate repo)

Discovery Gate C `human_approved` on autumn-snow ≠ public cite. Human Check → `claim_support` → Approve/Reject lives in immunecity:

- Operator checklist: `~/Desktop/immune-city/docs/GATE_C_CURATOR_PATH.md`
- Dry-run (no writes): `cd ~/Desktop/immune-city && bun run hsi:curator-status -- --neon`
- UI: `/curation?hsi=cite` — never invent supports; never point HSI `DATABASE_URL` at autumn-snow
- **2026-11-02 live:** 13/13 cite identifiers verified; **0** `claim_support=supports`; **0** `publicCiteApproved`. Founder authorized Approve only for already-eligible rows — human S-P-O assess still required first (no agent invent / no JSON counter edits).

## Next steps (hsi-core)

- Add further verified PMID links in seeds + `export:isi-map`
- Keep this checklist and any new curator notes under `docs/`
- Do not open immunecity PRs for HSI substrate; ISI cite wiring only under freeze-lift scope; ignore DeliverX / swift-deliveries
