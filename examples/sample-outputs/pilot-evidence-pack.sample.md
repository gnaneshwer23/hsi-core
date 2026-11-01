# ISI pilot evidence pack

Schema: `hsi-pilot-evidence-pack-2` · generated 2026-11-01T12:00:00.000Z

**Disease:** TBD  
**Research question:** TBD — lock with partner

> Evidence rows include illustrative T2D / immuno-metabolic seeds plus Discovery Centre disease-context pathway stubs (RA/SLE/PsO/IBD). None are a locked pilot indication or partner data.

## Discovery loop (metadata only)

Framing: **ASK → MAP → REVIEW → TEST → LEARN** — labels for partner decks; not an interactive Discovery Centre UI.

- **ASK** — Scoped research question for one immune-mediated disease (partner lock still TBD).
- **MAP** — Traceable evidence map: claims, grades, provenance, entity slice.
- **REVIEW** — Human Gate C / expert challenge — never auto-approve into product KG.
- **TEST** — Expert shortlist of gaps / hypotheses worth testing next.
- **LEARN** — Versioned outputs + honest rejections feed the next ASK.

### Illustrative disease contexts (not locked)

- Rheumatoid arthritis (`ra`) — illustrative_only; lockedPilot=false
- Systemic lupus erythematosus (`sle`) — illustrative_only; lockedPilot=false
- Psoriasis / psoriatic disease (`psoriasis`) — illustrative_only; lockedPilot=false
- Inflammatory bowel disease (`ibd`) — illustrative_only; lockedPilot=false

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

Rows: 31 · … · claims with LOINC present on biomarker-linked rows

Graph edges are navigational links, not proof of causality. Conflicting / uncertain grades stay visible.

- `HSI-C-T2D-001` [uncertain/source-verified] HbA1c — biomarker_of — Type 2 diabetes mellitus · ADA Standards of Care (placeholder citation label) · LOINC:4548-4
- `HSI-C-RA-001` [uncertain/source-verified] TNF-α — contributes_to — Rheumatoid arthritis · PMID:11244034
- `HSI-C-RA-002` [uncertain/source-verified] Anti-CCP antibodies — biomarker_of — Rheumatoid arthritis · LOINC:53031-9

_(Sample truncated — run `bun run outputs` for the full pack.)_
