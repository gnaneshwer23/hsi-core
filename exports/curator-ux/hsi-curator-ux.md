# HSI curator UX briefing

Schema: `hsi-curator-ux-1` · generated 2026-11-02T05:36:36.228Z

Partner: Apolo Pharma (`partner:apolo-pharma`) · lockedPilot=true · partnerSigned=true

**decisions_imported** — Imported 13 human decision(s) from ISI autumn-snow shape — does not flip hsiGrade; autoApprove=false.

## Honesty

- Not CDS. autoApproveIntoKg=false. mayFlipHsiGrade=false.
- hsiGrade ≠ Gate C decision ≠ teachingStatus — never collapse axes.
- HSI Neon red-wave holds substrate + pending placeholders only; human approve/reject/defer writes stay on ISI autumn-snow (immunecity queue).
- Curator UX scaffolding does not invent completed Apolo review outcomes.
- productionApproved=false until operator asserts a live autumn-snow partner export (HSI never self-certifies).
- Model proposals and translation candidates remain pending drafts only.
- Compatible with immunecity Gate C queue (`090d7ea`) decision shape.

## Gap analysis snapshot

- Gap rows: 88
- Seed edges: 88
- ISI mapped claims: 13
- Aksh mapped claims: 22
- LOINC linked: 8

| Missing slot | Count |
|--------------|------:|
| `isi_relationship_id` | 75 |
| `aksh_node_id` | 66 |
| `durable_locator` | 13 |
| `loinc_marker` | 80 |
| `gate_c_approved` | 88 |

## Gate C queue snapshot

- Actionable pending: 0
- Human decided: 13
- Unmapped: 19
- Translation candidates: 22
- Model proposals: 20
- Neon target for decisions: **autumn-snow** (not red-wave)

### Actionable rows

| Edge | REL | PMID | Status |
|------|-----|------|--------|

### Decided rows (imported)

| Edge | Decision | Status | Reviewer |
|------|----------|--------|----------|
| `HSI-E-AU-001` | approve | **human_approved** | operator:repo-owner-authorized-2026-11-02 |
| `HSI-E-IM-002` | approve | **human_approved** | operator:repo-owner-authorized-2026-11-02 |
| `HSI-E-IM-003` | approve | **human_approved** | operator:repo-owner-authorized-2026-11-02 |
| `HSI-E-IM-004` | approve | **human_approved** | operator:repo-owner-authorized-2026-11-02 |
| `HSI-E-IM-005` | approve | **human_approved** | operator:repo-owner-authorized-2026-11-02 |
| `HSI-E-IM-006` | approve | **human_approved** | operator:repo-owner-authorized-2026-11-02 |
| `HSI-E-IM-010` | approve | **human_approved** | operator:repo-owner-authorized-2026-11-02 |
| `HSI-E-IO-001` | approve | **human_approved** | operator:repo-owner-authorized-2026-11-02 |
| `HSI-E-RA-001` | approve | **human_approved** | operator:repo-owner-authorized-2026-11-02 |
| `HSI-E-RA-004` | approve | **human_approved** | operator:repo-owner-authorized-2026-11-02 |
| `HSI-E-RA-005` | approve | **human_approved** | operator:repo-owner-authorized-2026-11-02 |
| `HSI-E-RA-006` | approve | **human_approved** | operator:repo-owner-authorized-2026-11-02 |
| `HSI-E-T2D-010` | approve | **human_approved** | operator:repo-owner-authorized-2026-11-02 |

## Next actions

- Re-check decided rows for S-P-O honesty before any product KG promote; never flip hsiGrade from checklist alone.
- Close high-leverage gap buckets (unmapped REL, missing LOINC, durable locator) without inventing maps.
- Keep Gate C human-only — refuse auto-approve and shared Neon.
- CDS stays closed until curationReview=approved AND hsiGrade=established.

## Artifacts

- `hsi-gap-report.md` / `.json` — richer gap buckets + backlog
- `gate-c-checklist.md` / `.json` — queue + translation + model proposals
- `hsi-curator-ux.md` / `.json` — this briefing
- Site: `/curator` · Discovery REVIEW · immunecity `/hsi/discovery`
