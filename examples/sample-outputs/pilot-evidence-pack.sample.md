# ISI pilot evidence pack

Schema: `hsi-pilot-evidence-pack-2` · generated 2026-11-01T13:00:00.000Z

**Disease:** Rheumatoid arthritis  
**Research question:** Why do some patients with rheumatoid arthritis respond differently to anti-TNF therapy, and which biomarkers or immune mechanisms are best supported for defining those subgroups?

**scopeLocked:** `true` · **partnerSigned:** `false` · **lockedPilot:** `false` · **provisionalLock:** `false` · **status:** `scope_locked`

> Phase 2 scope lock: rheumatoid arthritis + anti-TNF response heterogeneity are the working Stage 1 pilot question. scopeLocked=true; partnerSigned=false; lockedPilot=false. Full evidenceMap still includes T2D / immuno-metabolic + SLE/PsO/IBD stubs; use partnerScopedEntitySlice for the RA pathway walkthrough.

## Partner lock (honesty)

| Field | Value |
|-------|-------|
| scopeLocked | `true` |
| partnerSigned | `false` |
| lockedPilot | `false` |
| partner id | `outreach:uk-versus-arthritis-ndorms-category` |
| outreachStatus | `awaiting_named_partner` |
| seed pathway | RA · TNF / ACPA · anti-TNF response heterogeneity |

> Phase 2 = scopeLocked. scopeLocked ≠ partnerSigned. Do not claim a live pilot contract from this pack alone.

## Discovery loop (metadata only)

Framing: **ASK → MAP → REVIEW → TEST → LEARN** — labels for partner decks; not an interactive Discovery Centre UI.

### Disease contexts (RA = working Stage 1 scope; others illustrative)

- Rheumatoid arthritis (`ra`) — scope_locked_working_pilot; lockedPilot=false
- Systemic lupus erythematosus (`sle`) — illustrative_only; lockedPilot=false
- Psoriasis / psoriatic disease (`psoriasis`) — illustrative_only; lockedPilot=false
- Inflammatory bowel disease (`ibd`) — illustrative_only; lockedPilot=false

## 1. Evidence map (partner-scoped sample)

- `HSI-C-RA-001` [uncertain/source-verified] TNF-α — contributes_to — Rheumatoid arthritis · PMID:11244034
- `HSI-C-RA-002` [uncertain/source-verified] Anti-CCP antibodies — biomarker_of — Rheumatoid arthritis · PMID:10662881 · LOINC:53031-9
- `HSI-C-RA-003` [uncertain/source-verified] Anti-TNF therapy — treats — Rheumatoid arthritis · PMID:11087881
- `HSI-C-RA-005` [uncertain/source-verified] Anti-TNF refractory RA phenotype — associated_with — IL-6 pathway axis · PMID:18625622

_(Sample truncated — run `bun run outputs` for the full pack + `hsi-pilot-review-rubric.md`.)_
