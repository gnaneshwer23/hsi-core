# HSI Synthetic Validation Dataset v0.1

Integrated from the founder's uploaded CSV/JSON files on 5 November 2026. The dataset is a software-validation fixture, not a scientific corpus, a calibrated clinical simulation or an evaluated model benchmark.

## Open and test

Open **/research/validation**, or follow **Open synthetic validation lab** from the scientific research workbench. The route uses labelled public fixture files and works independently of the paused research authentication/database setup. It grants no account or research permissions.

1. Select one of 20 conditions and one of its 10 generated profiles.
2. Select a visit; inspect lab values/flags and switch between all 13 lab trend markers.
3. Inspect the visit-aligned immune/microbiome, lifestyle, wearable and medication/programme records.
4. Select record categories in the context map. These are associations between stored records, not biological causal edges.
5. Page through condition-level evidence and pre-generated hypothesis fixtures.
6. Filter trials by their supplied status. Condition and biomarker field overlap remain separate from eligibility.
7. Rehearse a UI review using the separate simulated reviewer; self-review is refused. Download Markdown or JSON with the fixture input hashes and review log.

The review rehearsal is in memory and resets when the profile or page changes. It does not authenticate anyone, persist a trusted review, change the source hypothesis's pending status or authorize scientific publication. No source approval, patient measurement order, treatment inference or enrolment decision is produced.

The explorer never calls a model, the research API or a clinical database. It exercises the front-end journey and deterministic fixture adapter/export. The real saved-investigation/independent-review backend remains a separate workflow requiring current trusted access and approved source context.

## Audited inventory

| Table | Actual records |
| --- | ---: |
| Patients | 200 |
| Labs | 13,000 |
| Medications/programmes | 1,000 |
| Lifestyle | 1,000 |
| Wearables | 1,000 |
| Immune profiles | 1,000 |
| Microbiome | 1,000 |
| Trials | 300 |
| Evidence | 1,000 |
| Hypotheses | 500 |
| **Total** | **20,000** |

Each condition has 10 patients, 15 trials, 50 evidence cards and 25 hypothesis cards. Each profile has five visits, 65 lab results and five rows in each of the other patient-linked tables. All supplied patient/visit joins are valid and duplicate keys are absent.

[Original inputs](../research/validation/v0.1/input/) are preserved unchanged. [Upload receipt](../research/validation/v0.1/upload-receipt.json) records their bytes and SHA-256 digests. The duplicate trials JSON is byte-identical and is not counted twice. All nine supplied CSV/JSON pairs are equivalent; trials CSV was not uploaded. The original manifest's rules are descriptive input, not code or permission to bypass source governance.

All 20,000 rows have the synthetic data class. Only 1,500 original evidence/hypothesis records also have the explicit false scientific-claim flag; the adapter adds it to the other **18,500** normalized records. It refuses any explicit true value, real-data label, promoted evidence/hypothesis, unexpected field, invalid ID/date/number/visit, duplicate key or orphan reference.

## Material gaps in the data

- Labs have values, units and supplied flags, but no reference intervals, specimen, assay or measurement method. The flags are displayed exactly; they are not validated or reinterpreted as clinically correct.
- Sidecar profiles supply visit numbers, not dates. Only labs supply explicit observation dates. The UI labels those dates as lab dates rather than fabricating timestamps for the other profiles.
- Immune count units and Treg denominator are missing; microbiome diversity/dysbiosis methods and specimen/assay metadata are absent.
- Medication rows also contain non-drug therapies and programmes. Dose, route, frequency, start/stop times, exposure and adherence are absent. No drug ontology mapping or medication–pathway effect is inferred.
- Evidence and hypotheses are generic condition-level text, without source passages, publications, patient links, predictions, falsification criteria, experiments or controls.
- Trials have no registry IDs, inclusion/exclusion criteria, age bounds, sites or screening rules. “Recruiting” is a supplied simulation status. Topic overlap does not establish eligibility.
- No biological mechanism edges or curated pathway support are supplied. The record map cannot substantiate a gut–immune–metabolic chain.
- Values and associations are not established as physiologically plausible longitudinal trajectories or outcome ground truth.

These omissions limit scientific and clinical testing. The dataset can validate navigation, joins, rendering, filter behavior, provenance, uncertainty, rejection paths and export integrity. It cannot validate model accuracy, causal discovery, trial screening correctness or clinical safety.

## Implementation and reproducibility

- [Fixture adapter and brief contract](../src/syntheticValidationDataset.ts): strict fixture-only records, immutable normalization, joins, exact condition context, draft-only hypotheses, conservative trial topic context and bounded UI review/export.
- [Offline builder](../scripts/build-synthetic-validation.ts): checks upload hashes, parses/reconciles CSV against typed JSON, verifies manifest counts, normalizes and creates 200 profile shards, 20 condition shards, catalogue and audit.
- [Generated public artifacts](../site/public/research/validation/v0.1/): 222 files; profiles load on selection, not as one large application bundle.
- [Catalogue pin](../src/validation/generatedValidationIndex.ts): committed hash and byte budget. Browser requests verify bytes, SHA-256, schema, synthetic guards and correct profile/condition joins before displaying data.
- [Browser client](../site/src/lib/syntheticValidationClient.ts): same-origin fixture fetches with omitted credentials, cancellation, bounded streaming and integrity checks.
- [Validation explorer](../site/src/pages/SyntheticValidationWorkbench.tsx): lazy-loaded route, seven connected views, accessible chart/table, mobile controls and file exports.
- [Adapter tests](../test/syntheticValidationDataset.test.ts) and [browser tests](../site/e2e/synthetic-validation.spec.ts): malformed/promotion/identity/join rejection, immutable originals, guarded exports, all 20 conditions, tamper/retry, stale timer cancellation, keyboard/mobile and no-write behavior.

Regenerate deliberately:

```sh
bun --no-env-file run validation:build
bun --no-env-file run validation:check
```

The site build runs the check, not regeneration, so stale or edited fixture artifacts fail deployment checks. No migration, grant, environment variable, database seed, production auth change or dependency was introduced. The exact SPA rewrite is limited to /research/validation; JSON files remain static assets.

Hashes prove which fixture bytes were used; they do not certify science, de-identification, authorship or source rights.

## Replacement contract before launch

“Same canonical adapter” means preserving normalized concepts and provenance contracts, **not** relabelling synthetic rows or substituting a live URL. This adapter deliberately refuses real data.

| Replace / add | Required information and acceptance |
| --- | --- |
| Synthetic evidence text | Permitted PubMed/Europe PMC or partner source identities, passage text/locator/hash/version, actual support/opposition, biological context and independent scientific review |
| Placeholder mechanism edges | Reviewed, context-specific relation assertions and ontology mappings; reproducible graph/source traversal and falsification |
| Synthetic trial rows | Versioned ClinicalTrials.gov or permitted registry records, real identifiers/status/date, criteria and provenance; explicit unknown states and investigator-owned screening |
| Patient/lab timeline | Separate authorised clinical/research data plane with consent/legal basis, access/isolation, unit/specimen/assay/reference context, timestamps and privacy controls; never direct PHI ingestion into this HSI fixture route |
| Lifestyle/wearables | Source/device/method, units, timing, consent and uncertainty; reconcile provenance rather than merging conflicting sleep fields |
| Immune/microbiome profiles | Units, specimen/tissue, assay, denominator, reference/quality metadata and batch/time context |
| Medications | Canonical drug vs programme classification, dose/route/frequency/exposure/adherence and relevant permissions |
| AI hypotheses | Evaluated evidence-grounded generation, model/prompt/tool provenance, predictions, opposing evidence, falsification, experiment/control design and genuine independent review |
| UI reviewer identities | Trusted backend authentication, current roles, independent ownership checks, durable package/decision binding and audit; the demo selector is never reused as authority |

FHIR/OMOP describe possible interoperability mappings; they do not themselves establish authorization, scientific validity or privacy. Aksh and ISI keep separate interfaces/databases. Clinical records and PHI remain outside HSI under [the binding boundary](CDS_PHI_BOUNDARY.md). The [ultimate product definition](strategy/HSI_ULTIMATE_PRODUCT_FUNCTION.md), approved research-source gates and [pilot operating runbook](RESEARCH_PILOT_RUNBOOK.md) still determine release readiness.

## Record-level provenance extension

Every normalized source record now retains its original JSON filename, file SHA-256, one-based row and record key. Unknown generator version and generation date remain null. The browser binds row lineage to the source-file hashes in its pinned catalogue; exports preserve it. Original CSV/JSON uploads remain unchanged. See the [field dictionary](SYNTHETIC_VALIDATION_DATA_DICTIONARY.md). This strengthens lineage without creating scientific evidence.

## Engineering verification receipt

Local results on 5 November 2026: **754 core tests and 92 browser checks passed**. Core build, site TypeScript, API TypeScript, source/coverage consistency, fixture byte/hash/CSV parity checks and site build passed. Browser coverage exercises every condition, wrong IDs, altered catalogue/profile data, retry and idle cancellation, visit switching, guarded downloads, self-review rejection, keyboard access and 320px layout.

The validation route is lazy-loaded. The pre-existing main frontend bundle-size warning remains. No live Vercel deployment, real account/role acceptance, scientific accuracy or clinical validation was established by these checks.
