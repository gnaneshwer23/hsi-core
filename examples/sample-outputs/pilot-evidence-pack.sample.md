# ISI pilot evidence pack

Schema: `hsi-pilot-evidence-pack-1` · generated 2026-11-01T12:00:00.000Z

**Disease:** TBD  
**Research question:** TBD — lock with partner

> Evidence rows below come from illustrative T2D / immuno-metabolic placeholder seeds. They are not a locked pilot indication and are not partner data.

## Clinical boundary

- No individual risk prediction
- No diagnosis or treatment recommendation
- No automated eligibility or enrollment
- No patient outreach or EHR write-back
- No Akeno/Aksh patient-level CDS in this pack

## Question project (template)

| Field | Value |
|-------|-------|
| projectId | pilot-q-template |
| disease | TBD |
| question | TBD — lock with partner |
| population | unknown |
| tissue | unknown |
| cellType | unknown |
| focus | unknown |
| timeWindow | unknown |
| status | template |
| evidence snapshot | dist/outputs/latest/hsi-isi-export.json |

## Grade definitions

- **Established** (`established`): Human-supported claim with durable provenance; safe to surface under HITL / discovery constraints.
- **Uncertain** (`uncertain`): Partial support, conflict, or source-linked but not claim-assessed — label honesty required.
- **Unexplored** (`unexplored`): Draft, unreviewed, or no mapped source — discovery only; never CDS-actionable.

## 1. Evidence map (sample)

Rows: 25 · established=0, uncertain=17, unexplored=8 · rows with missing source fields: 16

Graph edges are navigational links, not proof of causality. Conflicting / uncertain grades stay visible.

- `HSI-C-T2D-001` [uncertain/source-verified] HbA1c — biomarker_of — Type 2 diabetes mellitus · ADA Standards of Care (placeholder citation label) · missing: pmid, doi, sourceUrl

_(Sample truncated — run `bun run outputs` for the full pack.)_
