# HSI vision audit and delivery plan

Audit date: 2 November 2026. Scope: local `hsi-core` at `143e82193779069a61f17a7a0800378c9cee33af`, `hsi-sources` at `6c8f8262090063d612e2f635c1c74bdbecf53ab3`, and the 16 supplied documents/prototypes. Findings describe this checkout and local checks, not production readiness or a complete security assessment.

## Decision

**Production hardening follow-up:** see `PRODUCTION_READINESS_2026-11-02.md` for current release evidence. It supersedes the original type/build blockers below: the three builds and full type checks now pass, while live database verification and clinical/scientific release evidence remain gated.

**Implementation follow-up (same day):** the initial research comparison, Aksh/ISI snapshot integrations and source-registry metadata MVP are now implemented on a review branch. See `SOURCE_REGISTRY.md`, `AKSH_PLATFORM_INTEGRATION.md` and `IMMUNECITY_PLATFORM_INTEGRATION.md`. The homepage source test was updated to inspect the rendered component's registry usage; the current core suite passes all 182 tests. Findings below retain the audit-time baseline and should not be read as updated production availability. Live retrieval, claim-passage verification and authenticated persistent investigations remain open.

Build the **research workbench for translational teams first**, confirmed by the user in this session. The first use case remains the existing rheumatoid arthritis / anti-TNF response question. Preserve SSc as a separate secondary track. The uploaded ambition is broader than the currently implemented product: HSI has a useful evidence substrate and interactive prototypes, but is not yet the governed, connected health platform described in the PRD.

Keep the long-term portfolio: ISI Research, Clinical, Aksh, Trials and Science. Deliver each through evidence and evaluation gates rather than launching all five simultaneously. Science can remain an educational surface rather than requiring a fifth commercial product card.

The smallest valuable research workflow is: scoped question → inspect evidence → compare claims and study context → challenge limitations → export a cited brief → accountable expert review. A new agent framework or graph database is not the first dependency.

## Evidence ledger

Statuses: **verified locally** means exercised in this instance; **partial** means some behavior exists but the full requirement is unmet; **mocked/stub** means synthetic or proposal-only; **missing here** means absent from the inspected active codebase; **not assessed** means another deployment, service, or product was not independently examined.

| Vision capability | Audit status | Repository evidence and practical limit |
| --- | --- | --- |
| Graded biomedical claims and typed relationships | Verified locally | `src/schema.ts`, `src/grades.ts`, `src/validate.ts`; validator checks 88 edges and 8 claim→LOINC links. Internal validation does not verify the underlying science. |
| Research evidence packs and reproducible exports | Verified locally | `src/pilotEvidencePack.ts`, `src/publishOutputs.ts`; versioned output and static Discovery copies generate successfully. The export CLI also rewrites tracked site JSON; use a disposable copy for audits. |
| Scientific graph exploration | Partial | `site/src/components/DiscoveryGraphExplorer.tsx`, `site/src/pages/DiscoveryCentre.tsx`; static graph browsing and claim/source inspection exist. This is not a live scientific retrieval service. |
| Scoped investigation | Partial | `partnerLock.ts`, `pilotEvidencePack.ts`, Discovery ASK; preset RA/TNF scope exists. No authenticated, persistent investigation service was found here. |
| Evidence comparison and cited brief | Partial; first increment built in this change | `site/src/components/ResearchComparison.tsx`, `site/src/lib/researchBrief.ts`; compare 2–4 pack claims, preserve grades/review states, download a Markdown brief with snapshot identity. Session-only; no exact-passage verification or generated synthesis. |
| Source registry, licensing and provenance | Partial | `schema.ts`, `sourceLicensingStub.ts`, `db/migrations/001_hsi_substrate.sql`; source identifiers and reviewed licensing metadata exist. No complete version-preserved source ingestion, correction/retraction monitoring or per-claim passage verifier was found. |
| Literature search and hybrid/graph retrieval | Missing here as a live workflow | `site/src/lib/discoveryData.ts` fetches local JSON. A scientific source locator is not an executed literature search. |
| Contradiction detection and causal hypotheses | Partial/stub | `pilotEvidencePack.ts`, `r2Validation.ts`, `modelProposal.ts`; curated explanations and hypotheses exist. No independently validated automated contradiction or causal inference pipeline was demonstrated. |
| Human review and review history | Partial | `curatorUx.ts`, `gateCDecisionsImport.ts`, migration review table, `/curator`; human-only patterns and imported decisions exist. Authenticated reviewer identity and tamper-evident durable audit were not demonstrated here. |
| Identity, organisations, tenant permissions, consent | Missing here as an enforced service | Vite client plus Bun library/CLI; no active application API/auth boundary in this checkout. `akshHsiGateway.ts` demonstrates a policy decision contract, not a deployed access-control gateway. |
| Clinical timeline / interoperability | Mocked/stub | `clinicalSyntheticTimeline.ts`, `clinicalSyntheticFhirNotes.ts`, `/clinical-timeline`; fictional fixtures and FHIR mapping notes. No authorised EHR connection demonstrated. |
| Aksh patient product | Not assessed | Agent catalog and HITL consumer references in this repo are not an audit of the separate Aksh application. No patient data or device connectivity was tested. |
| Trial criteria | Mocked/stub | `trialsCriteriaMvp.ts`, `/trials-criteria`; five criterion states, synthetic studies, `confirmedEligible=false`. No current registry ingestion or investigator referral workflow demonstrated. |
| Science education | Partial | `site/src/components/landing/ScienceLanding.tsx`; interactive education exists. Curriculum validation, learning outcomes and saved learner progress were not demonstrated. |
| AI agents and scientific runtimes | Mocked/stub | `akshAgents.ts`, `src/adapters/*`, `modelEvalHarness.ts`; names, proposal envelopes and offline fixture checks are not functioning clinical agents or independent model evaluation. |
| Live HSI Neon | Implemented, runtime unverified | Migration and Neon host guards exist. No database write or live connection was performed for this audit. Only HSI `red-wave` may own HSI substrate. |
| Product deployment / security / scientific efficacy | Not assessed | Local builds and smoke checks do not establish deployment, tenant isolation, source rights, safety certification, customer traction or efficacy. |
| ISI consumer product | Snapshot/reference only in scope | `hsi-sources/vendor/immunecity` is frozen. Statements in existing status docs about upstream live behavior were not independently verified. |

## Priority findings

### P0 — Product claims need an evidence boundary

`site/src/lib/productMaturity.ts` labels Aksh and ISI “Available” and lists external Ask/Atlas/M1 and clinic capabilities. This audit cannot substantiate those external deployments. Keep separate fields for local demonstration status, production availability, verification evidence and verification date. Before external publication, an accountable owner should verify each availability claim against the actual product. Do not convert static demos or internal fixture tests into clinical or commercial claims.

Existing `BUILD_STATUS_AND_NEXT.md` uses GREEN and DONE for substrate milestones and includes reports of upstream writes. Those labels are not evidence of the new master PRD's end-to-end completion. This ledger qualifies them; it does not retroactively claim to have checked external services.

### P0 — Provenance is not yet scientific verification

A PMID, grade and graph path are useful metadata. They do not prove that a passage supports the precise claim in the right species, population, tissue, intervention or time window. The current comparison contract lacks structured study design/date/population fields. Show these as unknown; build a source registry plus passage-level review before presenting verified scientific findings. Retractions, reuse rights, citation deduplication and contradictory results need explicit handling.

**Concrete data-quality finding:** `src/seed/t2dImmunoMetabolic.ts` attaches PMID `11244034` to `HSI-C-IM-002` (TNF/insulin action) and PMID `18625622` to `HSI-C-IM-003` (IL-6/T2D risk), while its own provenance notes say these sources support RA-related axes and are **not T2D proof**. The pack still displays `source-verified`. This confirms a known support limitation, not necessarily that the biological claims are false. Do not present these references as verified support for those metabolic claims. Before a real pilot, either establish exact claim support with an appropriate source or explicitly separate related-axis references from supporting evidence. The new brief conservatively labels every claim as not independently verified; it does not repair or upgrade this seed evidence. Preserve this limitation when enriching the pack contract in C1/C2.

### P0 — Research and clinical data must remain separate

The uploaded federation is a logical target, not permission to share databases or build patient workflows into this substrate. `AGENTS.md` excludes live CDS and PHI here. Keep Clinical/Aksh identifiable records in their own authorised services. Shared concept identifiers must never grant record access. This increment accepts no patient input, provisions no credentials and changes no database schema.

### P1 — The product gap is completing a research job

The code has many artifacts and demonstrations, but a translational team needs a coherent investigation, evidence comparison and brief that can be challenged by a reviewer. The new comparison/export panel is the first small step. Persistent projects, source review, structured contradictions and measured usefulness remain open.

### P1 — Evaluation must extend beyond fixture consistency

`modelEvalHarness.ts` explicitly scores frozen pack consistency, required fields and policy invariants. Those checks do not measure retrieval recall, exact citation support, scientific correctness, expert agreement, or time saved. Establish an independently reviewed benchmark before describing scientific intelligence as validated.

### P1 — Browser startup was broken despite successful builds

The first Chromium run found a blank site: `akshHsiGateway.ts` imported constants from `akshHitl.ts`, which eagerly imports Node filesystem modules. Vite's dev browser rejected `node:fs.readFileSync`. Schema identifiers now live in `akshHitlSchemas.ts`, with the existing public exports preserved. The gateway imports the browser-safe module. Browser startup and the new workflow pass after the fix; the production build no longer reports those Node externalisation warnings.

### P1 — Public experience is partly integrated already

The eight supplied standalone HTML pages share a direction with the existing React landing components. Replacing the site wholesale would discard working integration without closing evidence gaps. Retain the shared shell and adapt useful interactions. Design notes favour restrained, readable research surfaces; existing CSS uses cobalt/glass marketing styles. Treat research workspace accessibility and density as a targeted improvement, not a full brand migration.

### P2 — Naming and requirements need reconciliation

Uploads expand HSI as **Health Super Intelligence**; the repository describes the substrate as **Human Systems Intelligence**. Preserve identifiers and package names until the product owner records a naming decision. Technical documents cite `01_HSI_MASTER_PRD.md` and HSI-FR-001–054; that numbered document was not supplied. The DOCX master PRD has narrative requirements, so the acceptance IDs below are local planning IDs, not invented official requirement mappings.

## Build sequence and acceptance gates

These are delivery stages, not a time or staffing promise.

| Stage | Deliverable | Acceptance evidence | External dependency |
| --- | --- | --- | --- |
| A: audited baseline | This ledger, known failures, source inventory, research-first choice | Each capability tied to code or an explicit unknown; prototype vs runtime separated | None for local audit; separate product access needed to extend its scope |
| B1: useful research increment | Claim comparison and portable research brief in Discovery MAP | Select 2–4 claims; identifiers, snapshot, unchanged grade/review, source links, missing context and review limits survive export; keyboard controls and mobile layout checked | None; static public pack only |
| B2: coherent researcher experience | Dedicated investigation entry, scope/coverage summary, accessible evidence drawer and shared trust labels | Researcher can complete one question→brief journey without engineering instructions; usability sessions record confusion and failures | Design partner feedback |
| C1: source registry and ingestion | Immutable/versioned source metadata, idempotent connector, licence fields, fetched-at timestamps, corrections/retractions and retry/quarantine states | Same record ingested twice has no duplicates; malformed/unavailable/retracted sources produce explicit states; no fabricated fallback citations | Choose permitted scientific metadata source and verify terms; no keys requested yet |
| C2: verified claim context | Exact source reference/passage, study context, support outcome, accountable reviewer and version | Unsupported, contradicted, unavailable and missing-context claims remain visible as such; a PMID alone never creates verified support | Scientific reviewers and lawful source access |
| C3: shared private investigations | Authenticated project API, organisation membership, server-side default-deny access, saved brief versions and review events | Cross-project access denied; unauthenticated writes denied; stale edit rejected; decisions attributable and recoverable | Identity/hosting decision and credentials through secure settings |
| D: independent research evaluation | Frozen benchmark, blinded domain review and task comparison against existing workflow | Publish denominators, sampling, errors and uncertainty for citation accuracy, exact claim traceability, reviewer agreement and task time; set thresholds with reviewers before running | Named reviewers, representative questions and baseline workflow |
| E: design-partner pilot | Narrow paid/sponsored research pilot, supported corpus and scoped claims | Real written agreement, cleared data rights, recorded failures, expert rejections, useful decisions and willingness-to-pay evidence | Real partner; fixture is not an agreement |
| F: adjacent portfolio | Independently governed Clinical/Aksh sandbox, registry discovery and Science curriculum | Separate data-access, clinical safety, interoperability and product-specific evaluation gates; no eligibility or diagnosis claims inferred from this research pilot | Clinical/product owners, lawful data access and qualified governance review |

Recommended next coding slice: **C1 metadata-only source registry** for the currently cited RA/TNF PMIDs, with a provider-neutral connector contract and explicit unavailable/retracted states. Add passage verification in C2. Do not begin with Neo4j migration, LangGraph adoption, multimodal training or new patient integrations; none is a demonstrated prerequisite for the first research job.

## First increment implementation

Discovery → MAP now offers a claim selection and comparison panel built from `partnerScopedEvidence`. It compares claim text, relationship, disease context, pack grade/review, limitations and source locators. It exports only the selected claims, with the question, disease, bundle and generation timestamp. Structured study context missing from the pack is disclosed. The Markdown encoder preserves source text without emitting raw HTML or Markdown links from untrusted labels. Unknown selected IDs are rejected rather than silently omitted.

No live retrieval, synthesis, automated contradiction detection or source verification is claimed. Selection is session-only and resets when the panel unmounts. The brief is a review artifact, not a saved expert decision. A direct “For researchers” navigation link also restores researcher discoverability.

## Verification

- Bun 1.3.11, Node 24.19.0; frozen dependency installs retained from onboarding.
- Library build, site TypeScript check and Vite production build pass. The filesystem import crash was fixed and its externalisation warnings are gone. The production build still reports a >500 kB chunk warning; code splitting remains a follow-up.
- Four new meaningful export tests pass: real pack selection/provenance preservation, invalid/stale selection rejection, missing citation/limitation handling, and untrusted Markdown/HTML escaping.
- Full suite after this change: **174 pass, 1 fail, 175 tests**. The existing public-site source assertion is still inconsistent with the componentised homepage: it expects `ECOSYSTEM_PRODUCTS` directly in `Home.tsx`, which now renders `EcosystemGrid` (the registry consumer). This is a pre-existing test/structure mismatch uncovered after restoring the expected researcher nav label. The test also expects homepage wording that has changed. Tests were not disabled or rewritten to manufacture a pass.
- Initial onboarding validator: 88 edges and 8 claim→LOINC links; outputs generated successfully in a disposable copy. No live Neon or scientific endpoint validation is claimed.
- Chromium end-to-end checks pass: actual pack load, two-claim minimum, four-claim cap, re-enabling choices after deselection, comparison table, Markdown file download with selected claims/source links/snapshot metadata, clear selection and 390px mobile page overflow. No uncaught browser errors occurred. Desktop and mobile screenshots and a downloaded sample brief are saved under `/workspace/vision-audit/`. This is functional smoke coverage, not a WCAG certification or scientific validation.
- `hsi-sources` remains unchanged. No publication, deployment or external communication was performed.

## Source inventory

All eight `index.html` files are distinguished by their HTML title. These are supplied frontend prototypes, not a live feature inventory. Hashes are SHA-256 prefixes of the original upload, retained here to identify the audit inputs without copying binary files into Git.

| Input | SHA-256 prefix |
| --- | --- |
| Package README.md | `b45ab5568f49` |
| Landing — Health Super Intelligence — Connect health. Understand biology. | `cc729d3f24e4` |
| Platform — HSI — A Connected Intelligence Foundation | `7045ecea0a35` |
| Research — HSI Research \| From Question to Discovery | `46b5e046bfc7` |
| Clinical — HSI Clinical — Context for Better Decisions | `dcafcee9f441` |
| Aksh — Aksh Health \| Connected Health Intelligence | `9f9ee002284b` |
| Trials — HSI Trials — Find the right questions. Advance the right studies. | `647cd9174b23` |
| Science — HSI Science \| Understand Living Systems | `d308a17cd158` |
| How HSI Works — Health Super Intelligence | `0c3e1d69b882` |
| 02_HSI_ARCHITECTURE_AND_DATA.md | `4f59cfae2d58` |
| 03_HSI_INTELLIGENCE_ENGINE.md | `1eda69e6954b` |
| 04_HSI_DESIGN_SYSTEM_AND_UX.md | `a88afd26eeec` |
| HSI_Business_Proposal.docx | `1b68d5789ffb` |
| HSI_Master_Product_Requirements_Document.docx | `ff67c9b8e356` |
| HSI_Product_Vision_and_Strategy.docx | `037cd49751fe` |
| HSI_Executive_Overview.pdf | `38e0daa611d6` |

Source directives about Cursor execution or architecture approval were treated as document content. The user's request authorised this audit and first implementation; no attachment was treated as authority to deploy, contact partners, provision secrets or access patient records.

## Decisions needed before a real pilot

1. Name an actual translational team, paying buyer and accountable scientific reviewer. The existing partner is a test fixture (`lockedPilot=false`), not traction or a signed MoU.
2. Agree the corpus and source terms, one recurring RA/TNF research question, and the current workflow used as a time/quality baseline.
3. Decide the hosting and identity boundary for private investigations before implementing C3.
4. Set the pilot budget and minimum useful outcome with the partner. The uploaded revenue examples are scenarios, not forecasts; no customer or financial claim was verified here.

Continue C1 independently while customer discovery and source-rights confirmation proceed. Keep clinical and patient expansion as separate governed products.
