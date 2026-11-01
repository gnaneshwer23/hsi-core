# ISI Pilot PRD ↔ hsi-core alignment

**Source (external):** *ISI Immune Disease Discovery Pilot — Product Requirements Document* v1.0 (1 November 2026), local file `ISI_Immune_Discovery_Pilot_PRD.docx`.  
**Repo anchors:** [`ISI_PILOT_BRIEF.md`](./ISI_PILOT_BRIEF.md), [`ISI_BUSINESS_PROPOSAL_ALIGNMENT.md`](./ISI_BUSINESS_PROPOSAL_ALIGNMENT.md), [`ISI_TARGET_STATE_PRD_ALIGNMENT.md`](./ISI_TARGET_STATE_PRD_ALIGNMENT.md), [`ISI_PILOT_PARTNER_SHORTLIST.md`](./ISI_PILOT_PARTNER_SHORTLIST.md), [`OUTPUTS.md`](./OUTPUTS.md).

This note maps **pilot** PRD requirements to what **hsi-core builds now** vs what is **deferred** (ISI product UI / M1–M3 app work / M4 clinical). For the full product destination (R0–R5), see [`ISI_TARGET_STATE_PRD_ALIGNMENT.md`](./ISI_TARGET_STATE_PRD_ALIGNMENT.md) — do **not** pull that breadth into Stage 1. It does not edit immunecity, Akeno, or invent partners. Disease + question are **Phase 2 scope-locked** RA/TNF (`scopeLocked=true`, `partnerSigned=false`, `lockedPilot=false`); named-partner lock remains **TBD**.

---

## PRD summary (hsi-core view)

| Area | Position |
|------|----------|
| **Product** | Researcher-facing immune science / discovery workspace; unit of work = one scoped research question for one immune-mediated disease. |
| **Core outcome** | Source-traceable evidence map + reviewable research brief. |
| **Evidence substrate** | HSI Core: claims, relationships, grades, provenance, review state, versioned outputs. |
| **Clinical boundary** | No individual risk, diagnosis, treatment recommendation, eligibility automation, patient outreach, or EHR write-back. Akeno patient-level CDS deferred (M4). |
| **Success metrics** | Task time, traceability rate, expert usefulness, correction burden, workflow impact — agree thresholds with partner; no clinical performance claims. |
| **Timeline / gates** | M0 discovery → M1 evidence explorer → M2 brief/export → M3 partner pilot → M4 clinical pathway discovery (future, separate approval). |

### Non-goals (PRD §2 — enforced here)

- Universal immune simulator / all-disease patient twin  
- New biological ground truth from text co-occurrence  
- Clinical prediction model training in this pilot  
- Identifiable patient records / hospital systems  
- Autonomous eligibility, enrollment, care recommendations, or drug design  
- Rebuilding HSI Core if the existing export contract already fits  

---

## Verdict

The pilot PRD, pilot brief, business-proposal alignment, and [target-state stage map](./ISI_TARGET_STATE_PRD_ALIGNMENT.md) are **consistent**: Stage 1 / M0–M3 / R0–R1 = research intelligence only; hsi-core is the evidence backbone; ISI product UI lives elsewhere and **consumes** published exports; disease/question lock with a real partner; no patient-level Akeno/Aksh CDS in this release.

**hsi-core M0 job:** ship a stable, versioned output contract + pilot evidence-pack template that covers the four brief outputs and PRD data-model minimums for claims/sources/review — not the full researcher UI (FR-01…FR-14 product surfaces).

---

## PRD → build now vs defer

| PRD item | Build now (hsi-core) | Defer |
|----------|----------------------|--------|
| **M0** — inspect HSI capabilities; map data contract; partner question/roles | This doc + exports + pack + `hsi-partner-lock.json` Phase 2 scope lock + review rubric | Named `partnerSigned=true` / `lockedPilot=true` (outreach) |
| **FR-01/02** Question workspace + scope fields | Template fields in pilot evidence pack (`questionProject`, explicit `unknown` scope) | ISI app project CRUD / tenancy UI |
| **FR-03/04** Evidence search + claim detail | Graded edges + provenance in `hsi-isi-export.json`; pack claim rows with missing-metadata labels | Full-text search UI, filters in product |
| **FR-05** Graph exploration | Edges with subject/predicate/object + grade; REL map pointers | Interactive graph product surface |
| **FR-06** Evidence grade | `established` / `uncertain` / `unexplored` + definitions in grades + pack | Product help UI only |
| **FR-07** Reviewer workflow | Gate C checklist (pending; human approve only in ISI product Neon `autumn-snow` — not HSI `red-wave`); curationReview axis | In-product annotate/accept/reject UX + role RBAC |
| **FR-08/09** Research brief + safe synthesis | Pack sections: findings / conflicting / uncertainties / gaps / hypotheses; cite claim IDs; block ungrounded clinical advice | LLM brief generation in ISI app |
| **FR-10** Export PDF/DOCX + evidence manifest | Machine-readable pack JSON + markdown + bundle `MANIFEST.json` | PDF/DOCX renderer (ISI app, P1) |
| **FR-11** Audit history | Provenance timestamps + Gate C rows; publish `generatedAt` / bundleId | Full change-log service |
| **FR-12** Source management | Provenance fields; gap report ingestion gaps | Operator ingestion dashboard |
| **FR-13** Feedback capture | Documented as product P1 | Feedback ticket UI |
| **FR-14** Trial landscape | Out of pack unless partner asks; P1 | Registry browser |
| **AC-08/09** Roles + no patient fields | Pack + exports: `notCds`, `noPatientLevelActions`; seeds `cdsSurfacable=false` | AuthZ in ISI workspace |
| **M1–M3** Evidence explorer, brief UX, partner run | Substrate artifacts for reviewers to walk through | ISI product repo implementation |
| **M4** Clinical pathway / Akeno | Explicit non-goal; decision gate only | Separate approval |

---

## Workflow outputs ↔ artifacts

PRD / brief four outputs mapped to what `bun run outputs` produces:

| Workflow output | Covered by | Gap / next implementation task |
|-----------------|------------|--------------------------------|
| **1. Evidence map** (sources + grades) | `hsi-isi-export.json`, pack evidenceMap (+ LOINC), Gate C checklist; scope-locked RA pathway PMIDs | Partner-signed corpus + licensing; search UI elsewhere |
| **2. Entity slice** (cells, pathways, biomarkers, treatments, studies) | Pack `entitySlice` + `partnerScopedEntitySlice` typed refs | External ontology IDs when partner source set known |
| **3. Competing explanations + uncertainties** | Pack TNF-centric vs IL-6 / ACPA frames + uncertain grades | Partner-rewritten narratives after partnerSigned |
| **4. Expert shortlist** (gaps / hypotheses) | Pack `expertShortlist` + gap report + Gate C pending + **review rubric** | Numeric success thresholds with partner |
| **Research brief shell** | Pack markdown with citations/caveats + Discovery Loop framing | PDF/DOCX + in-app assembly (ISI) |
| **Question / scope** | Pack `questionProject` + `hsi-partner-lock.json` (**Phase 2** RA/TNF; `scopeLocked=true`; `partnerSigned=false`) | Live workspace after partnerSigned |
| **Discovery Centre vocabulary** | Pack + ISI export `discoveryCentre` + Phase 6–8 site `/discovery` (ASK→MAP→REVIEW→VALIDATE→TRANSLATE on real packs + `hsi-r2-validation.*` + `hsi-translation-handoff.*`; RA scope-locked + SLE/PsO/IBD illustrative) | Akeno clinical **product** integration — outside hsi-core |

Substrate includes T2D / immuno-metabolic seeds **plus** a **scope-locked** RA/TNF response-heterogeneity slice and illustrative SLE/PsO/IBD stubs. Exports must keep `partnerSigned=false` / `lockedPilot=false` until a named partner confirms.

---

## Acceptance criteria (AC) — substrate coverage

| AC | hsi-core status |
|----|-----------------|
| AC-01 Scope reopen | Template fields only — product persistence deferred |
| AC-02 Claim → source | Seed provenance + pack claim rows; missing labelled |
| AC-03 Filter grade/review | Data present in export; UI filter deferred |
| AC-04 Unmapped / missing visible | Grades + gap report + pack missing labels |
| AC-05 Reviewer attribution | Gate C pending path; product timestamps deferred |
| AC-06 Brief citations | Pack requires claim IDs; no ungrounded clinical prose |
| AC-07 Export versioning | Bundle id + `generatedAt` + pack + MANIFEST |
| AC-08 Role separation | Documented limitation — manual review if no RBAC yet |
| AC-09 No patient-level fields | Enforced in pack flags + Aksh CDS closed |
| AC-10 Feedback flag | Deferred to ISI product (P1) |

---

## Open decisions (PRD §11 — still open)

1. **Named** partner confirmation of disease + exact question wording (Phase 2 scope lock exists; `partnerSigned` / `lockedPilot` still false)  
2. Source licensing / attribution for the agreed source set  
3. Auth, workspace tenancy, export formats for the ISI deploy  
4. Success-metric **numeric thresholds** with partner (rubric checklist exported; thresholds TBD)  
5. Trial-registry context in first release vs P1  

Critical path remains **outreach** to flip `partnerSigned` — Phase 4–8 HSI substrate are done (Neon readiness, acceptance pack, Discovery Centre `/discovery`, R2 validation, translation handoff scaffolding). Live Akeno clinical product integration remains **outside hsi-core**.

---

## What to say / do next

1. Use the pilot brief + this PRD map + scope-locked pack + **acceptance / walkthrough** in partner discovery.  
2. Run `bun run outputs` and share `hsi-pilot-walkthrough.md` + `hsi-pilot-acceptance.md` + `hsi-pilot-evidence-pack.md` + `hsi-pilot-review-rubric.md`.  
3. Do **not** start patient-level or immunecity feature work from this PRD.  
4. When a partner signs disease + question, flip `hsi-partner-lock.json` (`partnerSigned=true`, `lockedPilot=true`), refresh seeds if needed — still no fake partners or PHI. Phase 3 = evidence depth on this scope; Phase 5 = acceptance honesty (`partnerSigned` still pending until then).
