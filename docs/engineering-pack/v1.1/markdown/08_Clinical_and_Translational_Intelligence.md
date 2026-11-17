---
title: "08. Clinical and Translational Intelligence"
subtitle: "HSI Engineering Specification Pack v1.1"
---

**Version:** 1.1, 16 November 2026 · **Owner:** Dr Gnaneshwer Jadav · **Repo baseline:** `hsi-core@43da794`

# 1. Decision summary

- **Two kinds of work, two rules.** *Translational* intelligence (targets, registered trials, published outcomes) uses public data and lives in the scientific plane now. *Clinical* intelligence (patients, cohorts, eligibility) lives only in a separate clinical plane, under ADR-0010, and is not built.
- **No real patient data until every gate is met.** The release gate in code refuses non-synthetic payloads (`real_data_not_enabled`). Engineering must not change that to "try it".
- **Synthetic demonstrations stay labelled and liftable.** Code under `src/clinicalPlane/` must move to its own repository unchanged.
- **Nothing here is a clinical decision.** Trial pre-screening outputs are criterion-level flags with evidence, confirmed by a human, never an eligibility decision.

# 2. Vision

A research finding in HSI can be followed into translation: which targets are being pursued, which trials test them, what results were reported and where human evidence is missing. Later, with approvals in place, a separately governed clinical plane lets an authorised site test a hypothesis against de-identified or consented cohorts and returns only aggregate, suppressed results through a gated bridge.

# 3. Where we are

| Item | Status | Location |
| --- | --- | --- |
| Two-plane architecture | Decided | ADR-0010, accepted 15 November 2026 |
| Target workflow (Open Targets profile, missing evidence stated) | Partial | Target workflow pages; `targetEvidenceHandler.ts` |
| ClinicalTrials.gov registry import | Partial | `src/evidence/n5RegistryLiveRefresh.ts`; default trials `not_queried` |
| Criterion parsing (AND/OR, negation, units, time) | Partial | `src/trialsCriteriaMvp.ts`; five criterion states |
| Synthetic cohort (5,000 profiles) and release gate | Partial (synthetic) | `src/clinicalPlane/`, `/research/cohort`; complementary suppression |
| Synthetic trial pre-screening | Partial (synthetic) | Computable versus human-review criteria; never an eligibility decision |
| Bridge contracts and hash-chained audit | Partial (synthetic) | `src/clinicalPlane/` |
| FHIR R4 boundary | Partial (synthetic) | Demonstration cohort in `bun run demo` |
| Clinical-plane repository and deployment | Not started | Gate 1 |
| Regulatory gates (DCB0129 safety case, DPIA, MHRA intended purpose, DSPT, HRA/REC) | Not started | ADR-0010 gate table |

# 4. Scope by phase

| Phase | In scope | Out of scope |
| --- | --- | --- |
| Now to pilot | Target and trial landscape from public registries and Open Targets; criterion parsing as research; synthetic demos labelled "Labs" | Any real patient record; any eligibility decision; any patient-facing output |
| After pilot | Trial landscape per gap in the brief (output 04); registry snapshot history | Clinical plane |
| Clinical plane (separate) | Consented or de-identified cohorts in a trusted research environment; phenotype definitions down, aggregates up | Live clinical decision support; EHR write-back |

# 5. What to build next (scientific plane only)

| ID | Work | Acceptance criteria |
| --- | --- | --- |
| CLN-01 | Translational section of the brief (output 04) | For a gap, list targets, registered trials and reported outcomes with registry snapshot dates and status |
| CLN-02 | Registry snapshots | Timestamped, versioned ClinicalTrials.gov snapshots; a changed trial status opens a review task on affected briefs |
| CLN-03 | Failed-translation records | Trials terminated for lack of efficacy are first-class evidence on the relevant edges |
| CLN-04 | Labs labelling | Every synthetic clinical page carries a persistent "synthetic, research demonstration" banner; Playwright test checks it |
| CLN-05 | Liftability check | A CI job proves `src/clinicalPlane/` imports nothing outside its contracts |

# 6. Gates before any real patient data (from ADR-0010)

| Gate | Status |
| --- | --- |
| Separate clinical-plane repository and UK-hosted deployment | Not started |
| Independent security review of accounts and storage | Not done |
| Clinical safety officer, hazard log and safety case (DCB0129) | Not done (interim self-appointment does not satisfy it) |
| DPIA, UK GDPR Article 9 condition and lawful basis | Not started |
| Data-sharing agreement with a controller; HRA or REC approval where research applies | Not started |
| De-identification process (current scan is pattern-based only) | Not started |
| Intended-purpose statement and MHRA software-as-a-medical-device position | Not started |

Engineering's role at this stage: keep the boundary intact and keep the synthetic code liftable. Nothing more.

# 7. Future options

- Bring code to the data: run approved phenotype queries inside an NHS secure data environment rather than moving data to HSI.
- Trial feasibility for sponsors using aggregate counts only.
- Integration with clinical-trial platforms through partners rather than building recruitment tools.

# 8. Open decisions

| ID | Decision | Recommendation |
| --- | --- | --- |
| D-70 | When to start the clinical plane | After the research pilot shows paid demand and a data partner is named; not before |
| D-71 | Independent clinical safety officer | Contract one when the clinical plane is funded |
| D-72 | Keep synthetic clinical demos public | Move them behind a "Labs" label and out of the main navigation to avoid implying clinical capability |
