# Delivery Phase G — bounded research coverage

5 November 2026. **The draft protocol, research-design and registry-topic tooling is implemented. No new scientifically accepted indication pack has been activated.** Human Super Intelligence remains a research substrate.

## What is usable

Open **Research workspace → Research coverage**, or `/research/coverage`. The explicit Vercel rewrite is included; the homepage and primary marketing navigation are unchanged. The page offers three versioned protocol drafts:

| Draft | Research focus | Current evidence boundary |
| --- | --- | --- |
| Crohn’s disease | Human mucosal collection context; microbiome/Treg/Th17 questions | Three existing gut seed references are background only. Mouse and opposing Th17 frames are not combined into a human Crohn’s finding. |
| Multiple sclerosis | Human CNS-related sample, assay and peripheral/CNS context | Two existing microglia/BBB references are background only; they are not MS-specific findings. |
| Type 2 diabetes | Cohort, glycaemic collection and inflammatory context | One existing CRP background locator explicitly says it is not a T2D edge. No diabetes mechanism is established by that citation. |

Each draft has a bounded research question, unreviewed MONDO hint, explicit specimen requirement, four lab/lifestyle/medication collection variables, source-code hashes, background graph identifiers and human-review gates. The page links each actual PMID pointer to PubMed, preserves its existing caveats, and offers a reproducible JSON draft export. No full-text passages were copied, citation identities freshly verified, licences invented, or new disease-specific graph edges asserted.

The dataset is `research/coverage/protocols.v1.json`. Generated catalogue, readiness, blank review-preparation packet and immutable version copies live under `research/coverage/` and `site/public/research/coverage/`. Those paths are explicitly exempted from the generic test `coverage/` ignore rule. **There are three drafts, six background pointers, zero verified disease-specific supporting passages and zero approved claims.** The existing RA/SSc working corpus, saved-investigation planner, graphs, source releases and Phase F product artifact stay unchanged. The historical `secondIndicationPackStub` is not silently reclassified as accepted or protocol-registered.

## Research design metadata, not patient records

The interactive form records only whether collection variables are available, whether a collection method/timepoint is specified, a bounded unit token and specimen/species context. It accepts no numerical observation values, patient IDs, clinical record uploads or treatment decisions. State stays in memory; no server request or browser persistence is added for these selections.

The assessment reuses the existing five-state criterion vocabulary for **metadata completeness only**. Missing data stay unknown; incompatible units stay ambiguous; absent assay/unit definitions or method/timepoint need investigator review. A human/mouse or sample mismatch remains explicit. Even a complete design does not clear a source, scientific, graph, permission, export or product acceptance gate. The `satisfied` state never indicates participant eligibility.

HbA1c `4548-4` / `%` and fasting glucose `1558-6` / `mg/dL` are reused from existing marker definitions, with mapping review still pending in these drafts. No IFCC/NGSP, glucose unit, diagnostic threshold, effect-size or treatment-response conversion is inferred. Calprotectin, neurofilament and CSF assay units/identifiers are intentionally absent until reviewed. Lifestyle collection requires an instrument/method; medication variables concern a collection window and prior therapy class, not medication advice. These variable choices are protocol-design proposals, not evidence that every study must collect them.

Changing protocols resets context selections. Selecting an unknown pack or invalid pinned version does not substitute another disease. Downloaded **pinned draft protocols** exclude the in-memory form selections, as stated beside the download; exports include exact source/catalogue hashes and every pending release gate.

## Registry topic relevance

The shipped registry input is explicitly **not imported**, not an empty successful search. No live ClinicalTrials.gov connector, fabricated NCT record, patient-trial matching, inclusion/exclusion evaluation or recruitment claim has been added.

The read-only contract can accept an operator-supplied public metadata snapshot, limited to 50 studies. Each record contains only `nctId`, `title`, `conditions`, `status`, `lastUpdateDate` and the exact ClinicalTrials.gov study URL. The importer validates supported fields, identifier syntax, dates, unique records, bounded text and non-identifying metadata markers. It computes a content hash and fixes provenance to `operator_supplied_unverified`. Marker screening is not de-identification or proof of source authenticity, permission or completeness.

Preparation command:

```bash
bun --no-env-file run coverage:prepare-registry \
  --input /tmp/public-registry-metadata.json \
  --out /tmp/proposed-registry-input.json
```

The input must have `schemaVersion: hsi-public-registry-input-1`, `containsPhi: false`, an actual UTC `retrievedAt` and `records`. The output path must be new; the command never overwrites the canonical catalogue or queries a registry. Have an accountable operator verify origin, permitted use, source freshness and study records. After reviewing the proposed input, deliberately replace `research/coverage/registry.snapshot.v1.json` with that wrapper and regenerate/check the catalogue. This does not grant scientific approval or make an imported record currently recruiting.

`assessRegistryTopicRelevance` compares exact normalized condition terms with the protocol’s declared terms. It has no patient attributes, similarity ranking or eligibility engine. Records remain source-separated with reported registry status and require investigator review, including completed/terminated records. Snapshot and record ages older than **30 days** are flagged. That is a visible engineering freshness window, not a scientifically agreed cutoff or proof that younger records are current. Future retrievals and inconsistent timestamps fail. A supplied empty snapshot means no records in that supplied file, never worldwide absence of trials.

Registry snapshots carry their own content hashes. The catalogue pins the supplied snapshot version, and derived views state that registry authenticity and current recruitment are not independently verified. All reports keep `liveRegistryQueried=false`, `patientEligibilityAssessed=false` and `confirmedEligible=false`.

## Reproduction and review

From repository root:

```bash
bun --no-env-file run coverage:build
bun --no-env-file run coverage:check
bun test --no-env-file test/researchCoverage.test.ts test/deploymentConfig.test.ts
```

The builder hashes the original protocol/registry inputs and existing seed files, validates all graph references and emits deterministic artifacts. `coverage:check` compares exact bytes and pinned archives; it is also part of the site build and root check command. The catalogue hash detects drift; it does not establish scientific truth, source identity or human authority. No network, database, grant, Gate C or release-promotion call is made by these commands.

The review-preparation packet has blank label stores, no assigned reviewers and no decision IDs. A local edit cannot make a draft accepted: the current schema fixes release eligibility, scientific review and publication flags to their pending/false values. Existing ontology validation checks identifier syntax; it does not verify a label-to-identifier mapping.

## Data and engineering still needed before broader release

1. Independently accept the bounded first RA/SSc workflow. The previous operational/scientific dependencies remain pending; this phase does not claim to have passed them.
2. Review each disease protocol, exact ontology bindings, variable definitions, specimen/assay/timepoint context and intended use with accountable domain SMEs.
3. Supply permitted disease-specific sources, retrieval/version receipts, exact hashed supporting passages, opposing evidence and current correction/retraction checks. These drafts’ seed pointers cannot replace direct support. Do not paste article text without appropriate rights.
4. Complete independent rights/scientific decisions, scope/ownership checks, reproducible brief/revision checks and the same product acceptance bar used in A–F. Retain human attribution and version history; do not manufacture approvals from a JSON file or a completed form.
5. Only then extend the governed investigation/release service to a new indication. **The current saved-workspace planner and Phase F source exchange remain bounded to their existing SSc/RA contracts.** A link to this draft catalogue does not create a new disease investigation or import a new indication into either product database.
6. Supply verified public registry records through the optional metadata contract when needed. Actual clinical screening, PHI, dosing and EHR integration stay outside HSI core.
7. Expand toward 20 conditions only after the evidence, source/context, graph, export, authorization, independent review and product checks are repeatable for each added pack. Merely adding 20 labels is not this acceptance evidence.

No product schema, HSI migration, database role, model activation, live account configuration or clinical integration was changed. Phase F’s independently pinned Aksh/ISI source artifact remains separate; these unreviewed protocols are not distributed as approved product evidence.

## Verification

Local verification passed: **701 core tests**, including **17 new coverage/design/registry/export checks**; **79 browser checks**, including six new research-coverage flows; core build, frontend type check and site/API build. The deployment-route test verifies the new page rewrite while preserving static JSON paths and real 404s. Existing evidence and coverage artifact checks passed.

The registry CLI passed valid empty-snapshot preparation, unsafe-input refusal and no-overwrite checks against temporary files only. No sample NCT records were installed into the shipped catalogue. Browser tests cover unit ambiguity, complete metadata remaining blocked, protocol switching/reset, pinned downloads, tampered input/retry, operator-supplied stale registry metadata, invalid pack/version and mobile layout. Engineering-only registry records remain in tests, not production artifacts.

Catalogue SHA-256: `b3625edca59d91f8da1a439201232d6011d09048350d173474cb6731e50948cd`. Six background pointers, zero direct supporting passages, zero approved claims; registry import status is `not_imported`. The existing large frontend bundle warning remains.

No new live deployment, source-rights decision, SME acceptance, patient use or database-backed workflow was verified. Local engineering checks do not establish scientific acceptance or a live clinical/research pilot.
