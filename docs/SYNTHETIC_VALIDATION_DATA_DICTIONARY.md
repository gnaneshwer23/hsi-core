# Synthetic validation field semantics and quality rules

This documents the actual founder-supplied v0.1 fields and normalized lineage, without adding clinical interpretations or implying a real-data connector. The generated [field inventory](../research/validation/v0.1/data-dictionary.json) pins each source file, type and original presence count. Original files remain unchanged.

## Common fields

| Field | Meaning / rule |
| --- | --- |
| data_class | Exactly synthetic; real/public/licensed labels are refused by this adapter |
| scientific_claim_allowed | Exactly false in normalized records; added when absent from the original, never changed from true to false silently |
| patient_id | Generated SYN-P identifier; unique in patients and required to join an existing profile |
| visit | Integer 1–5 in patient-linked observation tables; joins by visit number, not inferred actual observation time |
| condition | Supplied exact condition string; not an asserted ontology mapping or diagnosis |
| validation_provenance | Normalized lineage object described below; not present in original uploads |

## Source tables

| Table | Fields and meanings |
| --- | --- |
| Patients | patient_id; condition; domain (supplied grouping); age (years, bounded integer); sex (supplied category); bmi (supplied numeric value); disease_stage (supplied category); symptoms (list of supplied labels); cohort (synthetic grouping); data_class |
| Lab results | patient_id; visit; date (explicit valid calendar date); test (supplied marker name, not LOINC); value (finite numeric observation); unit (supplied string, not verified UCUM mapping); flag (supplied high/normal/low, not recomputed); data_class |
| Medications | patient_id; visit; medication (supplied drug-class, therapy or programme label); data_class. No dose, route, frequency, exposure or adherence fields exist. |
| Lifestyle | patient_id; visit; diet_pattern; sleep_hours (supplied number); activity_level; stress_level (supplied categories); data_class |
| Wearables | patient_id; visit; sleep_hours; hrv_ms (field explicitly labels milliseconds); steps; resting_hr (supplied number, device/method/unit field absent); data_class |
| Immune profiles | patient_id; visit; cd4_count; cd8_count (count units absent); nk_activity; monocytes; th17_signature (qualitative labels); treg_fraction (denominator/unit absent); data_class |
| Microbiome | patient_id; visit; diversity; dysbiosis_score (method/scale metadata absent); scfa_production (category, not an observed SCFA concentration); data_class |
| Trials | trial_id (SYN-TRIAL identifier); condition; phase; intervention; biomarkers (labels); endpoints (labels); status (supplied recruiting/active/completed simulation state); data_class |
| Evidence | evidence_id (SYN-EVID identifier); condition; claim (generic fixture text); evidence_status (synthetic_demo only); confidence (none only); source_type (synthetic_generator label, not proof of generator identity/version); scientific_claim_allowed false; data_class |
| Hypotheses | hypothesis_id (SYN-HYP identifier); condition; hypothesis (pre-generated fixture text); evidence_status (ai_draft only); review_status (pending only); scientific_claim_allowed false; data_class |

Other than labs, the sidecar rows have no date fields. The UI associates their visit number with the lab visit without fabricating a collection timestamp. Self-reported and wearable sleep remain separate observations.

## Normalized record lineage

| Field inside validation_provenance | Meaning |
| --- | --- |
| schemaVersion | hsi-fixture-record-lineage-1 |
| datasetVersion | hsi-synthetic-validation-0.1 |
| sourceFile | Exact original JSON basename for that table |
| sourceFileSha256 | Original JSON byte digest supplied by the verified import builder; null only when a pure in-memory caller did not supply a source digest. Browser assets require the pinned non-null digest. |
| sourceRow | One-based row in the original JSON array, preserved after selecting a patient/condition shard |
| sourceRecordKey | Original patient/evidence/hypothesis/trial ID, or patient + visit + marker key for observations |
| generatorVersion | null: not supplied; adapter/import version is not the original generator version |
| generationDate | null: not supplied; import date and lab observation dates are not generation dates |
| intendedUse | build_and_test_only |
| replacementStatus | pending_real_data; requires a separate approved adapter, never relabelling these rows |

The source-file hash, row and record key allow checking an exported observation against its original fixture. They do not prove scientific accuracy, de-identification or permission to publish real data.

## Data-quality behavior

| Condition | Behavior |
| --- | --- |
| Missing required source field, invalid number/date/visit or unexpected field | Refuse the fixture/table; never fill a lab value or identifier |
| Duplicate patient, row key or orphan patient/visit | Refuse normalization; no silent merge |
| Missing original false claim flag | Add false in normalized derivatives and retain originals/audit count |
| Explicit true claim permission, non-synthetic class or promoted evidence/hypothesis | Refuse; never downgrade silently and pretend it was safe input |
| Source/hash/bytes or profile/condition mismatch | Browser denies display; retry reloads the pinned artifacts |
| Missing/invented lineage in normalized row | Refuse; preserve original row numbers and known file hashes |
| Missing reference range, assay, specimen, unit/denominator, dose or collection date | Preserve absence and show the limitation; do not interpret as normal/zero/not present |
| Implausible clinical association or trajectory | Not validated by schema checks; no diagnosis, medication recommendation or model accuracy claim |
| Unknown source or expired/unverified licence in real research | Different approved source adapter and permissions required; cannot substitute here |
| Cross-species/tissue source disagreement | Not present as scientific ground truth in these fixtures; use real reviewed context-aware evaluation |

See [integration and replacement requirements](SYNTHETIC_VALIDATION_DATASET.md) for the workflow limits.
