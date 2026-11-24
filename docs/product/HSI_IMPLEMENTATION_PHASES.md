# HSI implementation phases and production readiness

**Status:** Proposal for owner decision, 15 November 2026. Nothing here changes `AGENTS.md`, `docs/CDS_PHI_BOUNDARY.md` or any migration hold. Decisions the owner must make are in section 9.

**Direction taken from the owner:** no beachhead wedge. The six departments, their interconnections, and patient, clinical, translational and patient-trial intelligence are core architecture, not add-ons. Ship every phase as a thin end-to-end slice across all six, not as a depth-first vertical.

**Update 15 Nov 2026 (HSI 2.0 review):** section 10 folds in the owner's refined vision and reorders the roadmap. Where section 10 and sections 5 to 6 differ, section 10 governs.

## 1. Blockers first

| # | Blocker | Why it blocks | Who clears it |
|---|---------|---------------|---------------|
| B1 | `AGENTS.md`, `CDS_PHI_BOUNDARY.md` and `HSI_VISION.md` say "no live CDS and no PHI in HSI". Core patient intelligence contradicts that if read literally. | Any patient-data work in this repo breaks a binding rule. | Owner: approve the two-plane ADR (section 3). |
| B2 | Account storage, saved investigations and any per-user data sit behind held migrations 022 to 033. 031 to 033 have only author-run rehearsals; the independent reviewer is unnamed. | No sign-in-backed product without storage. | Owner: name the reviewer, send the packet (`docs/GRAPH_WORKSPACE_SECURITY_REVIEW_PACKET.md`). |
| B3 | Production has no model keys and the model endpoint is unauthenticated. | The "ask a question" workspace is not true on the live site. | Owner: set env vars and a provider spend cap; I add auth and a distributed limiter first (P0). |
| B4 | No regulatory position for the clinical plane: intended purpose, MHRA SaMD class, DCB0129 safety case, DPIA, lawful basis. | Patient-facing or clinician-facing outputs cannot ship, even synthetic-labelled, without a stated intended purpose. | Owner plus a named Clinical Safety Officer and DPO. |
| B5 | No real patient data source or data-sharing agreement exists. | Phase 2 can only run on synthetic or public de-identified data until one does. | Owner, via an NHS trust, SDE or TRE partner. |

## 2. What exists today (audit)

**Scientific plane, built and live:** published digest-verified graph snapshot (153 concepts, 95 candidate relationships, 0 reviewed); stateless live investigation, radar and co-occurrence APIs over Europe PMC, OpenAlex and Open Targets; two-model directional verification, ranking and hypotheses; model provider layer with budgets; light/dark app shell, Research Home, workspace, onboarding (device-only profile); landing pages with real screens; Playwright, axe, bundle budgets, `bun run check`.

**Clinical and trial assets, synthetic or contract-only:** `src/clinicalSyntheticFhirNotes.ts`, `clinicalSyntheticTimeline.ts`, `demo/{fhir,cohort,trials,phiBarrier}.ts`, `knowledgeGraph/cohortTrials.ts`, `evidence/clinicalTrialsGovLookup.ts`, `evidence/cohortTrialCriteriaResearch.ts`, `trialsCriteriaMvp.ts`, `hsiClinicalBiologyBridge.ts`, seven `*Contracts.ts` files (secure interop, reproducible cohort builder, patient-contextualised models, longitudinal evidence, population cohorts, clinical-to-biological context), `cdsPhiBoundary.ts` reject helpers, HITL schemas, and site pages (ClinicalModule, ClinicalTimeline, ForTrials, TrialsCriteria, SyntheticValidationWorkbench). Strategy docs already describe a separate clinical plane: `HSI_CLINICAL_FHIR_STRATEGY.md`, `HSI_CLINICAL_SAFETY_AND_GOVERNANCE.md` ("research plane = de-id or anonymous"), `HSI_BIOLOGY_TO_TRIALS_WORKFLOW.md`, `HSI_TRIAL_REGISTRY_STRATEGY.md`.

**Finding:** the design intent for a separated clinical plane already exists in strategy docs. What is missing is (a) the ADR that makes it binding, (b) running code that connects the two planes through a governed interface, and (c) the register on the site is stale (13 capabilities all "built, no live run").

**Production gaps found:**

| Area | Today | Gap |
|------|-------|-----|
| Auth | Neon Auth sign-in/sign-up wired | No account-backed data (B2); no email sender or consent text decided |
| Storage | Public APIs are stateless | Nothing persists; migrations held |
| Abuse control | Per-instance in-memory limits, same-origin check | Not distributed; resets per instance; no auth on model endpoint |
| Observability | None found (no error tracking, tracing, log drain, alerts) | Cannot detect or diagnose live failures |
| Headers | HSTS, nosniff, XFO, Referrer, Permissions-Policy; CSP is **Report-Only** | CSP not enforced; no report endpoint; HSTS lacks `includeSubDomains`/preload decision. *Updated 22 Nov 2026: the CSP is now enforced and a report endpoint (`/api/csp-report`) exists; HSTS decision still open.* |
| Functions | `maxDuration: 30` on `api/**/*.ts` | Fine for now; long model runs need Queues or background execution (platform default is now 300 s with Fluid Compute) |
| Config | `vercel.json` | Platform now recommends `vercel.ts`; optional |
| CI | `p0-repository-hygiene`, `research-foundation`, `production-probe` | No dependency/secret scanning, no load test, no restore drill, no rollback runbook |
| Data | Neon, held migrations | No backup/PITR verification, no environment separation proof beyond pins |
| Capability register | `intelligenceCollective.ts` | Stale versus reality |

## 3. Architecture: two planes, one product

HSI stays one product to the public. Internally two governed planes, joined only by an explicit interface.

```
Scientific plane (hsi-core)                  Clinical plane (separate deployable)
  Living Knowledge Graph, evidence,            Patient Intelligence, Clinical Intelligence,
  agents, synthetic fixtures, contracts        cohorts, consent, trial matching workspace
  public + researcher accounts                 own repo, DB, UK region, RBAC, audit log
        |                                              |
        |  DOWN: hypotheses, phenotype definitions,    |
        |        eligibility criteria, graph slices    |
        +--------------------------------------------->|
        |  UP: aggregate or de-identified results,     |
        |      consented findings, small-cell-suppressed
        |<---------------------------------------------+
        |      (reviewed, signed, logged; never row-level)
```

Rules the ADR would fix:

1. Patient-level data lives only in the clinical plane. It is never stored in, queried from, or embedded into the scientific graph.
2. No cloud LLM sees patient data. Clinical-plane models run on-prem or in a UK-region private deployment under a DPA; scientific-plane model calls receive only definitions and criteria.
3. Flow down is free (it is public science). Flow up needs a release gate: de-identification check, small-cell suppression, human sign-off, append-only log.
4. The clinical plane is its own regulated product boundary: own intended purpose, own clinical safety case, own release process. HSI's public site never claims its status.
5. Until the ADR is approved and a data source exists, hsi-core keeps its current rule and the clinical plane runs on synthetic data only.

**ADR to approve (owner):** amend "No live CDS and no PHI in HSI" to "No PHI or CDS in the hsi-core scientific plane; patient intelligence is delivered by a separate clinical plane connected through the governed interface in this ADR." I will not edit `AGENTS.md` without your explicit approval.

## 4. Regulatory and safety position (what must be true before real data)

Sources checked 15 November 2026; confirm with your clinical safety officer and regulatory adviser.

| Gate | What it is | Applies when |
|------|------------|--------------|
| UK GDPR Art. 9 + DPIA + lawful basis | Health data is special category; needs a condition (research, consent) and a DPIA | Any real patient data |
| DCB0129 / DCB0160 | NHS clinical risk standards: manufacturer (DCB0129: safety case report, hazard log, named Clinical Safety Officer) and deploying organisation (DCB0160). NHS England is reviewing both; a consultation ran 29 June to 11 September 2026, so expect revisions. | Any health IT used in care or recruitment workflows |
| DTAC | NHS baseline: clinical safety, data protection, technical security, interoperability, usability, accessibility | Selling to or deploying in NHS |
| MHRA software as a medical device | Software with a medical purpose (e.g. matching that influences care) may be a device; class depends on intended purpose. Intended purpose must be defined by us, not by marketing. | Anything beyond research-use-only decision support to a clinical team |
| DSPT | Data Security and Protection Toolkit | Handling NHS data |
| HRA / REC, GCP, consent | Research approvals; patient approach by the clinical team, not by the product | Real trial recruitment |
| 21 CFR Part 11 / ALCOA+ | Append-only audit, attributable records | Regulated trial data |
| Trusted Research Environment / SDE | Where NHS data may be analysed; we likely bring code to the data, not data to us | Real NHS data |

Design consequence: position the first clinical-plane product as **research-use-only pre-screening support for a clinical research team**, with a human decision on every match, and have the regulatory adviser confirm that framing before any real data.

## 5. Phases

Each phase ships all six departments in thin form. Exit criteria are what must be demonstrably true, not dates. No dates promised.

### Phase 0 — Make the live site trustworthy (now, no new science)
Goal: close what makes today's product not production-ready.
- Authenticate and distribute-limit the model endpoint; enforce per-user and global spend caps; provider limit set by owner (B3).
- Enforce CSP (move Report-Only to enforcing after a clean report period), add a report endpoint, decide HSTS preload.
- Add error tracking, structured logs with a drain, uptime and synthetic checks on `/api/research/*`, alerts to the owner.
- Dependency and secret scanning in CI; documented rollback; one tested restore of Neon.
- Reconcile `intelligenceCollective.ts` with reality; stop describing named agents on the dashboard (owner direction).
- Name the independent reviewer and send the security packet (B2).
**Exit:** model step live behind auth and a cap; alert fires in a drill; CSP enforced with no violations in a week of traffic; reviewer engaged.

### Phase 1 — Connected Research Foundation (vision phase 1)
Goal: one graph, evidence, and agents answering real questions with traceable steps.
- Accounts and saved investigations on the held migrations once reviewed (digest-chained, candidate-only).
- Routed Ask box with "How this was produced" trace (no agent names in the UI).
- Methods sharing M1 (paper method versus practised method, with provenance and conditions); gap finder and radar persisted per user.
- Ontology grounding (candidate links to pinned ontology releases).
- Onboarding: role-aware first run, sample investigation, empty states, email verification, consent text (owner decisions).
**Exit:** a new researcher signs up, runs an investigation, saves it, returns next day and finds it; independent review recorded; every claim shows source and review status.

### Phase 2 — Patient and Clinical Intelligence on synthetic data (vision phase 2)
Goal: prove the clinical plane and the governed interface before touching real data.
- ADR approved; clinical plane repo scaffolded with its own DB, RBAC (clinician, research nurse, PI, auditor), append-only audit, consent model.
- FHIR R4 UK Core ingest from a synthetic generator (extend `clinicalSyntheticFhirNotes.ts`); phenotype definitions travel down from the graph; aggregate, suppressed results travel up through the release gate.
- Clinical safety scaffolding started: Clinical Safety Officer named, hazard log, intended-purpose statement, DPIA drafted, DCB0129 safety case skeleton.
- Investor-demo workflow ("variable treatment response", 8 steps) running end to end on synthetic data, labelled synthetic and not clinically validated.
**Exit:** a synthetic cohort is defined from a graph-derived phenotype, results flow up only through the gate, the audit log reconstructs every step, and a reviewer can attempt and fail to move row-level data up.

### Phase 3 — Drug and Trial Intelligence
Goal: criteria and matching with measured, honest performance.
- Parse ClinicalTrials.gov eligibility into structured, reviewable criteria; human review of each parsed criterion.
- Patient-to-trial pre-screening on synthetic patients, criterion-level with cited evidence from the record, "not enough information" as a first-class answer, never "eligible".
- Evaluation harness with labelled data; report criterion-level and trial-level metrics separately; track exclusion criteria separately.
- Drug-target and repurposing candidates from the graph as hypotheses, never recommendations.
**Exit:** published internal evaluation with confidence intervals and failure analysis; time-saved measured with real screeners on synthetic or consented data; no output labelled eligibility without human confirmation.

Research basis (verified): TrialGPT reported 87.3% criterion-level accuracy on 1,015 expert-reviewed pairs, with a pilot showing 42.6% less screening time, on synthetic patient cohorts and a small user study; the authors state it does not justify removing human recruiters, and that longitudinal notes, labs and imaging were not evaluated. A 2025 survey lists trial-level performance as much lower in several systems (one reports F1 29.6 to 48) and weak exclusion-criteria handling. Plan for these limits rather than quoting the headline number.

### Phase 4 — Real data, one controlled site
Goal: first real-world signal under full governance.
- Partner an NHS trust or SDE/TRE (B5); run inside their environment; DPIA signed; DCB0129/0160 evidence; HRA/REC as required; clinical team approaches patients.
- Real-data pre-screening for one or two trials, human-in-the-loop, measured against manual screening.
**Exit:** governance approvals on file; measured screening-time and agreement against clinicians; zero row-level egress incidents.

### Phase 5 — Living Human Intelligence
Goal: patient evidence feeds discovery; discovery refines patient stratification, continuously.
- Aggregate outcomes update graph candidates (as new evidence with its own provenance, still unreviewed until reviewed).
- Multi-site, federated analysis where code travels to data.
- Regulatory pathway decision per output type (research-use-only versus device).
**Exit:** a closed loop that has run more than once with reviewed provenance; regulatory position documented per feature.

## 6. Production readiness checklist by layer

**Front end**
- Enforced CSP, no inline script; accessibility axe clean at 320, 768, 1280 widths; reduced-motion honoured (already CI-tested).
- Error boundaries and offline/slow-network states on every data panel; no layout shift from async data.
- Honesty labels generated from data (review count, run status), not hard-coded text.
- Performance budget kept (CSS budget raised once, with reason); route-level code splitting for the app shell.

**User onboarding**
- Sign-up with verified email; role chosen at start (researcher, clinician-researcher, trial team) driving defaults, never gating safety rules.
- First run produces a real result in under five minutes from a sample question.
- Clear consent and privacy text written with your DPO; account deletion and data export routes.
- Clinical-plane access is a separate, invitation-only, role-based flow with its own sign-in assurance (MFA), never from the public sign-up.

**Dashboard**
- Research Home shows saved investigations, radar, gaps, recent graph changes; no agent names; "How this was produced" trace for any answer.
- Clinical workspaces (phase 2 onward) live under their own origin and theme, with a persistent "synthetic data" or "research use only" banner.

**Backend**
- Distributed rate limiting and per-user quotas; request auth on every model call; idempotency keys for long runs; queue for runs beyond 30 s.
- Append-only audit tables with digest chains (already designed); backups and a rehearsed restore; separate Neon branches per environment, pins enforced.
- Secrets only in environment; rotation runbook; no PHI in logs by construction (typed log fields, tested).
- Clinical plane: separate infrastructure, UK region, network isolation, KMS-managed keys, no outbound calls to model providers.

## 7. Cross-cutting risks

| Risk | Mitigation |
|------|------------|
| Public positioning drifts into clinical claims | Keep "no clinical advice" on every public surface; clinical plane never marketed from this site until approved |
| Regulatory scope creep (a "match" reads as a recommendation) | Intended-purpose statement drives UI copy; matches are pre-screening flags with evidence, human-confirmed |
| Model errors on exclusion criteria and implicit reasoning | Criterion-level outputs, "not enough information" state, separate metrics, mandatory human review |
| Solo-founder bandwidth across six departments | Thin slices, one owner-approved gate per phase, no parallel depth |
| Independent review never happens | Treat B2 as the critical path for phase 1 |

## 8. What I can do now versus what only you can do

**I can do without approval:** Phase 0 engineering (auth, limiter, CSP, observability hooks, CI scans, register reconciliation), methods sharing, routed Ask box, synthetic-data work inside current rules, draft ADR and hazard-log templates.

**Only you can do:** approve the ADR; name the reviewer; set model keys and provider spend limit; appoint a Clinical Safety Officer and DPO; decide the email sender and consent wording; open a data-partner conversation.

## 9. Decisions requested

1. Approve, amend or reject the two-plane ADR (section 3).
2. Name the independent security reviewer for 031 to 033.
3. Authorise Phase 0 as the next engineering block.
4. Choose where the clinical plane is built: new private repo (recommended) versus a protected subdirectory here.
5. Confirm "research-use-only pre-screening for a clinical research team" as the first clinical intended purpose, for adviser review.

## 10. HSI 2.0 refinement: what changes and what I would hold

**Adopted.**
- Positioning centre: autonomous gap discovery plus biology-to-patient translation, with the feedback loop as the defining capability. Stated as a hypothesis to prove, not a market lead.
- Phase order becomes P0 secure and connect, P1 autonomous scientific discovery (Gap Register, hypothesis ledger, verifier), P2 patient-to-biology on synthetic FHIR through the governed bridge, P3 drug, biomarker, stratification and trial workflows as distinct journeys, P4 living reassessment, P5 validated real deployment. Sections 5 and 6 map onto these; P3 splits into four workflows rather than one.
- **Gap Register as a first-class object** (missing knowledge, context, supporting and opposing evidence, relevance, candidate experiments, uncertainty, priority, status, history). Starts from the existing gap finder and the nine snapshot gaps.
- The knowledge graph is a connected model over separate evidence, investigation, clinical and governance stores, not one database. Consistent with the two-plane ADR.
- Three separate approvals: engineering, scientific review, clinical/regulatory. Scientific promotion stays human-only (Gate C); routine investigation steps may become more autonomous.
- One connected eight-step demo journey (investigate, biology, gaps, synthetic cohort, hypotheses, therapeutics, trial pre-screening, close the loop), built from real connected records and labelled synthetic where it is.
- Measurement table (gap relevance, claim-to-source accuracy, hypothesis plausibility, criterion-level trial accuracy, workload, cost per investigation) becomes the P1 to P3 evaluation plan. No superiority claim until measured.

**Held or changed, with reasons.**
1. **Four "environments" stay internal lenses, not public product names.** `PRODUCT.md` and your 13 November correction say one technology, never a catalogue. In the app they are workspace modes inside one shell. Public pages keep one HSI.
2. **The ten named capabilities stay behind the scenes.** You decided agents are not named in the dashboard. The table is an internal design of tools behind three coordinating roles; the UI shows capabilities as questions answered and a "How this was produced" trace.
3. **The 30-day plan depends on owner-held blockers.** Week 1 persistence needs the named independent reviewer (B2); live execution needs keys and a spend cap (B3). Without them, weeks 1 to 2 can only run on stateless APIs and a clearly labelled demo environment. Week 4 "investor-ready" means a functional synthetic demonstration, not validated performance.
4. **Parallel investor workstream is acceptable only if isolated and honest.** Separate environment, synthetic data labelled on every screen, no clinical-effectiveness claims, no regulatory language, and it must run on real records from the connected workflows, not mocked outputs.
5. **Patient-outcome feedback into the graph passes the release gate** (de-identification, small-cell suppression, human sign-off, append-only log). "Closing the loop" in the demo records gaps, hypotheses and opportunities; it does not auto-promote anything.
6. **The clinical-plane decisions are still open:** ADR approval, clinical safety officer, DPIA, intended purpose (section 9).

**Revised 30-day targets (subject to the blockers above).**

| Week | Focus | Outcome | Depends on |
|------|-------|---------|------------|
| 1 | Auth and limits on model endpoint, observability, CSP enforcement, capability register reconciliation, persistence design | Reliable, authenticated investigation run | B3 keys and cap; B2 reviewer for saving |
| 2 | Gap Register, hypothesis ledger, verifier over evidence and graph | Question to brief plus Gap Register | Week 1 |
| 3 | Synthetic clinical plane (own scaffold), phenotype definitions down, aggregate results up through the gate | Synthetic cohort explored against a hypothesis | ADR approval |
| 4 | Target and biomarker workflow, synthetic trial pre-screening, connected workspace, browser and a11y tests | End-to-end demo with every record traceable | Weeks 2 to 3 |
