# ISI pilot brief (one-pager)

> **ISI helps immune-disease research teams investigate a defined question by connecting traceable evidence across cells, pathways, biomarkers, treatments and studies—and showing what is established, uncertain and worth testing.**

**Status:** Phase 7 R2 validation live · Phase 6 Discovery Centre · Phase 5 acceptance pack · Phase 4 HSI Neon readiness · Phase 3 evidence depth on Phase 2 scope lock · outreach still open for named partner.  
**Working Stage 1 scope (scopeLocked):** rheumatoid arthritis · anti-TNF response heterogeneity — see `hsi-partner-lock.json` (`scopeLocked=true`, `partnerSigned=false`, `lockedPilot=false`).  
**Named partner (`partnerSigned`):** still **TBD after conversations** — do not treat scope lock as a MoU.  
**Immediate deliverable:** this brief + [`ISI_PILOT_PARTNER_SHORTLIST.md`](./ISI_PILOT_PARTNER_SHORTLIST.md) + published pack / review rubric / acceptance + walkthrough + **`site/` `/discovery`**. Not another general-purpose AI feature.  
**Phase 5 done:** Stage 1 acceptance checklist + partner walkthrough on scope-locked RA/TNF (`hsi-pilot-acceptance.*`, `hsi-pilot-walkthrough.md`).  
**Phase 6 done:** Target R1 Discovery Centre product surface (`/discovery`) — research intelligence only; not clinical.
**Phase 7 done:** R2 validation (`hsi-r2-validation.*` + VALIDATE tab) — hypothesis / gap depth; research only.
**Later (Phase 8):** R3–R5 / Akeno translation — **requires explicit user ask** + Stage 3 gates. Do not start unless asked.
**Neon:** HSI `red-wave` schema stub — [`HSI_NEON_MIGRATIONS.md`](./HSI_NEON_MIGRATIONS.md).  
**PRD map:** [`ISI_PILOT_PRD_ALIGNMENT.md`](./ISI_PILOT_PRD_ALIGNMENT.md) (pilot PRD → build now vs defer). **Target state:** [`ISI_TARGET_STATE_PRD_ALIGNMENT.md`](./ISI_TARGET_STATE_PRD_ALIGNMENT.md) (full vision → Stage 1/2/3 — do not pull breadth into this pilot).

---

## Purpose

Prove that ISI improves **one** immune-disease **research intelligence** workflow: a partner brings a defined question; ISI returns a traceable evidence picture (what is established, uncertain, and worth testing) that experts can challenge.

## Non-goals (pilot)

| In scope | Out of scope |
|----------|----------------|
| Research intelligence for a defined disease + question | Individual disease prediction / risk scores for patients |
| Literature- and graph-backed evidence maps with strength labels | Patient recruitment / eligibility matching |
| Expert review of gaps and hypotheses | Broad platform / agent / omics features before a working pilot |
| Honest uncertainty and competing explanations | Treating ISI as clinical decision support (CDS) |

**Aksh / Akeno:** keep out of **patient-level clinical decisions** until a specific pathway has data access, HCP evaluation, and governance. This pilot does not open clinic CDS.

---

## Pilot scope

**One disease + one question** — engineering scope locked in Phase 2; named partner still confirms wording.

| Decision | Rule |
|----------|------|
| Disease | **Scope-locked (Phase 2):** rheumatoid arthritis. **partnerSigned:** only after named partner conversations |
| Question | **Scope-locked (Phase 2):** why anti-TNF response differs + which biomarkers/mechanisms define subgroups. Partner may rewrite when signing |
| Fake partners | Do not invent confirmed partners or personal contacts; Versus Arthritis / NDORMS–Kennedy = outreach targets only ≠ MoU |

Ask partners: what recurring question costs them time or blocks decisions, and what data they could actually share?

---

## Example candidate questions

Use these as conversation starters — lock one only with a partner:

1. Why do some patients respond differently to a particular therapy?
2. Which biomarkers or immune mechanisms are supported by evidence for a defined subgroup?
3. What evidence gaps should inform the next experiment or study?

---

## Smallest useful ISI workflow outputs

For the chosen question, ISI produces:

1. **Evidence map** — source links + evidence-strength labels (`established` / `uncertain` / `unexplored`, aligned with hsi-core grades).
2. **Entity slice** — relevant immune cells, mechanisms/pathways, biomarkers, treatments, and studies.
3. **Explanations** — competing explanations and key uncertainties (not a single forced narrative).
4. **Expert shortlist** — research gaps or hypotheses for human review (never auto-approved into a product KG).

No requirement for a new product surface beyond what is needed to walk a partner through these four outputs.

---

## Role of hsi-core

[`hsi-core`](https://github.com/gnaneshwer23/hsi-core) is the evidence substrate for the pilot:

- Store **evidence**, **provenance**, and **uncertainty** (graded edges, claims, Gate C human curation).
- Publish artifacts with `bun run outputs` (alias `bun run publish`) → versioned `dist/outputs/` bundles (ISI export, REL map, gap report, Gate C checklist, **pilot evidence pack**, etc.). See [`OUTPUTS.md`](./OUTPUTS.md).
- Partner walkthrough shape: `hsi-pilot-walkthrough.md` + `hsi-pilot-evidence-pack.md` + `hsi-pilot-review-rubric.md` + `hsi-pilot-acceptance.md` (scope-locked RA/TNF; `partnerSigned=false`; no patient-level CDS).
- Durable lock record: `hsi-partner-lock.json` (Phase 2 = `scopeLocked`; flip `partnerSigned` with a real partner).
- Product UIs (immunecity / ISI site) **consume** published exports; they are not edit targets for this pilot work.

---

## Success metrics

Run the pilot on a **real** partner question. Measure:

| Metric | What to record |
|--------|----------------|
| Time saved | Hours / days vs their current lit + synthesis path |
| Useful evidence | Sources / mechanisms / biomarkers they keep |
| Better next decision | Clearer next experiment, study design, or kill/continue call |
| Expert rejections | What they reject — as carefully as what they accept |

A pilot that surfaces clean rejections is still a successful learning loop.

---

## Decision gate (after pilot)

| If… | Then… |
|-----|--------|
| Users value the **evidence workflow** | Improve that workflow; agree a second research pilot |
| Main need is **patient ID / trial matching** | Do **not** build that next in isolation — first establish clinical data access + site partnerships needed to evaluate it |

Default next build after a good evidence pilot: deepen research intelligence. Clinical ID / trial matching only with partnerships and governance — not as a speculative platform feature.
