# Cursor handoff: complete the private RA evidence-review workflow

Prepared 3 November 2026. Paths below are repository-relative; locate the actual
checkouts before running commands. Read each repository's applicable `AGENTS.md`.

**Product direction**

Aksh Health and Immune Super Intelligence retain their own interfaces,
authentication and databases while reusing canonical HSI technology. HSI must
provide working shared capabilities, not merely links to the two products.
The next research milestone is a focused, measurable RA evidence-review workflow.
The broader vision remains; an Aksh feature freeze has not been authorised by the
uploaded strategy document.

**The wider vision Cursor must preserve**

Build a connected health and biomedical intelligence ecosystem that links a
person's health over time with the biology, evidence and research that help
explain disease and treatment. The experience should let a user follow a question
through connected records, graph relationships, exact sources, uncertainty and
human review, rather than stop at a disconnected dashboard or chatbot answer.

The intended roles are:

| Product / technology | Role in the vision |
| --- | --- |
| Aksh Health | The person and care-workflow layer: authorised longitudinal observations, laboratory results, CGM, medicines, symptoms, nutrition, activity, sleep and treatment experiences. Keep its interface, permissions, clinical workflows and database. |
| Immune Super Intelligence | The specialist scientific layer: immune cells, tissues, cytokines, receptors, pathways, biomarkers, diseases, interventions and source evidence. Explain context, support, counterevidence and gaps through the existing KG and scientific workspace. |
| Human Super Intelligence | The reusable intelligence foundation and wider reasoning experience: shared contracts, graph retrieval, evidence evaluation, investigation orchestration, provenance, human review and versioned learning. These capabilities must execute inside the products through their own authorised backend adapters. |
| Future HSI Clinical and HSI Trials experiences | Governed clinical-history views and explainable research/trial screening, built on validated integrations. These are intended extensions, not a claim that universal EHR access or production eligibility decisions already exist. |

Connect immunology with gut, brain and metabolic health, including diabetes, as
evidence coverage and validation permit. The original multi-condition scenarios
remain a way to test connected interactions; they do not substitute for scientific
or clinical evidence. Start by proving one bounded RA/anti-TNF research workflow,
then reuse the validated technology across indications.

The intended end-to-end experience is:

1. View an authorised health timeline or ask a defined research question.
2. Resolve relevant observations and concepts to their biological context.
3. Traverse existing graph relationships to cells, tissues, pathways, disease,
   interventions, evidence and, where available, registered studies.
4. Inspect exact source passages and their species/sample/setting; retain both
   supporting and opposing findings and make missing information visible.
5. Form a traceable research question or testable hypothesis, with its limitations.
6. Record an appropriate expert's assessment; use governed clinical/trial review
   when a later product enters those domains.
7. Feed permitted corrections and validated outcomes into versioned evidence and
   separately governed training/evaluation releases.

For example, RA/anti-TNF research should connect TNF, relevant immune/tissue
context, the existing RA/therapy graph relationships and source passages, then
help reviewers examine response heterogeneity. A serology finding must not become
an automatic treatment recommendation or a false claim about treatment efficacy.

The knowledge layer may connect references across systems while each system
retains ownership and access control. Shared technology does not require a shared
patient database. HSI's current research substrate remains PHI-free; patient
records and clinical actions stay in their authorised product/clinical plane.
Future patient-linked research must use purpose-limited, authorised interfaces
and appropriate research-safe outputs.

Build against interchangeable, versioned data adapters so engineering scenarios
can later use properly licensed or consented sources with the same provenance and
permission checks. Real-use release also requires the relevant independent
validation. Synthetic workflow success alone does not establish clinical fitness.

Keep public landing pages professional and accurate. Put protected investigation,
curation and engineering tools in the internal workspace. The larger vision is
the destination; the next task below is a concrete step toward it, not permission
to add every future capability or broaden the current data boundary at once.

**Execution-state note**

The implementation summary and task checklist below record the original handoff
at `af63ee5`. Subsequent Cursor commit `2478612` adds the RA artifact-export path,
readiness handling and annotation templates, and updates the source-import status.
Read the current [RA implementation status](RA_ANTI_TNF_EVIDENCE_RELEASE.md) and
inspect all current repository heads before treating a checklist item as missing.
Preserve that newer work; use the vision above to guide the remaining gaps.

**What had been implemented and pushed at the original handoff**

| Area | Implemented behaviour |
| --- | --- |
| Shared algorithms | ISI's existing neighbourhood function executes HSI's bounded graph traversal. Aksh's existing review queue executes HSI's prioritisation algorithm. |
| Research contracts | Strict, versioned context, source/passages, graph relationships, claim assessment, provenance and run history. |
| Investigation service | Executes supplied-corpus retrieval, bounded graph context, an explicit-assessment contradiction index, unvalidated research-question templates, human review and versioned dossier export. |
| Product backends | Neon JWT/stored-role checks in ISI; NextAuth plus explicitly provisioned research membership in Aksh. Private owner-scoped PostgreSQL persistence, RLS, revision checks, audit rows and database-backed quotas. |
| Internal UI | `/internal-research` supports start, reopen, review and JSON/Markdown download. ISI relationships open its existing Scientific Inspector. No public landing-page entry was added. |
| RA import foundation | Preregistered two-source protocol, operator-side Europe PMC/JATS importer, licence/identity/provenance checks, attribution-preserving exports and a strict release validator. |
| Strategy review | Assessed the supplied Grok roadmap/competitor PDF, separating recommendations, targets and externally unverified claims. |

The reference retrieval provider searches a supplied corpus; it does not perform
live literature search. Draft questions use deterministic templates, not a newly
trained discovery model. Workflow completion/acceptance never approves scientific
claims or changes care.

Validated code baselines before this documentation handoff:

- `hsi-core`: `3113e59` (RA foundation/review introduced in `ab285d1`).
- `immunecity`: `3048177`.
- `aksh-health-redesign`: `95fd568`, including the newer remote demo-cohort and
  compatibility changes. Preserve subsequent work too.
- `hsi-sources` is a frozen archive; do not develop there. DeliverX is unrelated.

**What remained incomplete at the original handoff**

`research/ra-anti-tnf/release.json` is explicitly unavailable:
`awaiting_verified_source_import`. Europe PMC access was denied by the cloud
network policy. Domain additions were saved in an environment draft; that did not
apply them. No real passages or fresh rights observations were invented.

Product corpus registration and passage-review UI for this RA release are not yet
implemented. The proposed 200-abstract expert benchmark, context checker accuracy,
reviewer time savings and independent scientific adjudication do not exist as
validated results. Structural test fixtures are not publication evidence.

Product database activation is also pending: ISI migration `0029`, Aksh migration
`056`, and Aksh research-role provisioning. Local PostgreSQL/browser verification
is not proof that these migrations or features are active in production.

**Read first**

1. [RA import implementation and limits](RA_ANTI_TNF_EVIDENCE_RELEASE.md).
2. [Product backend activation](INVESTIGATION_PRODUCT_BACKENDS.md).
3. [Investigation service and recovery semantics](INVESTIGATION_SERVICE.md).
4. [Shared contract](SHARED_RESEARCH_CONTRACT.md).
5. [Grok roadmap assessment](strategy/GROK_ROADMAP_REVIEW_2026-11-03.md).
6. `research/ra-anti-tnf/protocol.json`, `src/raEvidenceRelease.ts` and
   `tools/import_ra_evidence.py`.

**Original next-task checklist: complete only the items still outstanding**

1. Inspect the current branches and preserve other contributors' changes.
   Recheck source access through the permitted network path. Run the existing
   importer when access is available:

   ```sh
   bun run ra:import --cache-dir out/ra-sources --output research/ra-anti-tnf/release.json
   ```

   Verify the registered PMID/PMCID/DOI pairs against actual metadata and JATS.
   Preserve article-level rights, author attribution, exact paragraph locators,
   hashes and retrieval receipts. Keep raw caches out of published product data.
   If a candidate's identity or rights fail, report it; do not weaken the checks.

2. Implement a versioned, integrity-checked research-artifact export to the two
   product repositories. Keep this separate from executable-code distribution.
   Validate with `parseRaEvidenceRelease` and `buildRaEvidenceBundle`. A failed,
   stale or unavailable import must not overwrite a previously valid release.

3. Register the RA corpus in both authenticated product corpus loaders. Expose
   explicit readiness metadata and an evidence-not-ready error when import has
   not succeeded. An unavailable corpus must not masquerade as an empty successful
   search or as a stale-review conflict. Keep existing registered corpora usable.

4. Add passage review to the existing private investigation UI: two source cards,
   exact passages, authors/title, article and licence links, source versions and
   limitations. Preserve original ISI KG identifiers and the shared Inspector.
   Aksh consumes a bounded research working set; do not create another global KG
   or involve patient records.

5. Preserve the distinction between serology-response prediction and anti-TNF
   efficacy. The existing three KG relationships provide context, not exact
   serology-response support. Keep claims unassessed unless a separately
   authorised human scientific-review action establishes support. Retain both
   candidate study frames without automatic contradiction voting or approval.

6. Supply a versioned annotation guideline/review worksheet for the next context
   benchmark: species, tissue/sample, setting/model, intervention, outcome and
   timepoint, each grounded in a source passage. Missing/mixed context remains
   explicit. Prepare independent labelling and adjudication; do not fabricate
   expert labels. Keep training corrections separate from frozen evaluation data.
   The 200-abstract set and 85%/40% targets remain proposed milestones.

**Files to extend**

- Canonical HSI: `src/raEvidenceRelease.ts`, `src/investigationBackend.ts`,
  `src/investigationService.ts`, `research/ra-anti-tnf/`.
- ISI: `src/lib/hsi/investigation-corpus.server.ts`,
  `src/lib/hsi/investigation.api.server.ts`,
  `src/components/immune/InvestigationPanel.tsx`.
- Aksh, relative to `packages/platform-uk`: `lib/hsi/investigation-corpus.server.ts`,
  `app/api/platform/research-investigations/route.ts`,
  `components/hsi/InvestigationPanel.tsx`.

Edit shared implementation in HSI, commit it, then run
`bun scripts/sync-shared-technology.ts isi aksh`. Do not hand-edit vendored modules
or make their provenance claim a canonical commit containing different bytes.
Keep the ES2020-compatible `hasOwnProperty.call` fix needed by Aksh's test build.

**Acceptance and verification**

- Authenticated start → source retrieval → existing KG context → human review →
  export → reopen works in both products when a valid release is installed.
- Missing rights, mismatched identities, altered passages, stale versions,
  unsupported claims and unknown corpus IDs fail safely. Unavailable-source cases
  remain covered without being labelled scientific validation.
- Cross-owner access is denied; reviewer identity is server-derived; concurrent
  decisions have one winner. No public marketing changes or automatic KG writes.
- Exported passages retain attribution, licence and source provenance.
- Relevant tests, type checks and builds pass; show concrete failures/blockers.

Most recent verified checks: HSI 229 Bun tests plus 9 Python parser tests; ISI
367 Bun tests, type check and build; Aksh consumer checks, main/test TypeScript
checks and Next build. Earlier product integration/browser checks used disposable
PostgreSQL and local identity fixtures, not live provider sign-in.

Run the HSI build/tests/parser tests, the ISI relevant Bun/type/build checks and
the Aksh consumer/main/test-type/build checks appropriate to the change. Exercise
new persistence/actions with the existing disposable test database harnesses.
Use the local browser harnesses for changed UI behaviour. Do not claim a passing
clinical/scientific benchmark from these engineering tests.

The cloud's global `DATABASE_URL` is HSI-only. Never use it for Aksh/ISI queries
or migrations. Clear inherited `DATABASE`, `DATABASE_URL`,
`DATABASE_URL_UNPOOLED`, `NEON_PROJECT_ID` and `NEON_BRANCH_ID` in product builds,
or supply each product's correctly isolated connection. No raw patient data,
PHI-to-LLM pipeline, EHR writeback or automatic trial eligibility belongs here.

Commit and push the verified work, preserving published history and concurrent
changes. If source access remains blocked, keep the release unavailable, finish
and push the independently testable code, and report the precise blocker. Do not
delay a reviewable code commit merely because external scientific verification
is still pending. Report exact commit SHAs and what is implemented versus active.
