# 2. Synthetic real-world data specification

## Implemented generator

`src/capabilities/longitudinal.ts` accepts only an integer seed (1–4294967295) and profiles per cohort (1–250). It reads no patient file, trains on no patient population and calls no network service. `hsi-longitudinal-generator-1` uses a fixed deterministic PRNG and construction rules. Identical configuration produces identical canonical data and content hash.

Five equal-size fixture cohorts:

| Cohort | Constructed pattern | Interpretation limit |
| --- | --- | --- |
| Metabolic inflammation | Variable HbA1c/CRP trajectories, low-fibre context and recorded metformin exposure | Not evidence of a gut mechanism or drug efficacy |
| Gut–brain | IBS-like context, fatigue and variable stool/wearable signals | No neurological or psychiatric diagnosis |
| Autoimmune flare | Preset lupus-like context, artificial dsDNA/C3/CRP changes | No flare diagnosis or treatment recommendation |
| Treatment response | Preset IBD-like exposure context with response/nonresponse parameters | No single mechanism, dose advice or treatment decision |
| Healthy control | Constructed within-range core labs and no active condition in fixture | Not a definition or classifier of real health |

## Longitudinal model

Nine scheduled encounters occur every three months from January 2024 through January 2026. Symptoms may precede the first encounter by seven days. Lab observations precede the recorded baseline condition/exposure events; the condition label is a preset scenario, not a diagnosis inferred by HSI.

Events include symptoms, encounters, laboratory results, condition context, medication exposure, vital signs, lifestyle/nutrition, wearables, microbiome, immune profiles, templated notes, an artificial genomic software marker and trial context. Every patient and event has `data_class: synthetic` and `scientific_claim_allowed: false`. IDs use `SYN-CAP-...`; no name, address, phone, email, MRN/NHS number or real genomic variant is generated.

Event IDs remain stable for a fixed generator/configuration. Events are ordered by ISO timestamp and ID. Date windows refer to scheduled encounters; pre-baseline symptom context is explicitly permitted.

## Measurements and coherence

- HbA1c: `%`; fasting glucose: `mmol/L`; insulin: `mIU/L`; hs-CRP: `mg/L`; IL-6/TNF-alpha: `pg/mL`.
- HOMA-IR is a synthetic derived index using glucose × insulin / 22.5. Rounded input/output tolerance is tested. It is not a validated patient assessment.
- Reference ranges and flags are illustrative fixture rules. Flags compare the displayed rounded value to those same ranges.
- Autoimmune profiles additionally include Anti-dsDNA (`IU/mL`) and C3 (`g/L`). No clinical cutoff or disease-activity model is validated.
- Immune records use explicit counts; generated Th17/Treg subsets remain below their generated CD4 parent count. They are not a complete disjoint partition of leukocytes.
- Microbiome concentrations use a declared fixture stool context; diversity and concentration distributions are uncalibrated.
- Individual response parameters and noise allow worsening or improvement despite recorded exposure. A construction parameter does not establish a pharmacological effect.
- Missingness is modelled at both profile and visit levels for wearables, microbiome and immune streams. Missing observations are not replaced with normal values.
- Baseline age, sex, BMI and fictional ethnicity/resource-context categories vary independently as test coverage. They are not representative demographics, fairness evidence or causal determinants.
- The genetic marker `TEST_VARIANT_A` is not a real pathogenic annotation. Trial context stays `not_assessed` / `never_confirmed`; no invented NCT identifier is included.

## Research preparation

A deterministic per-profile brief cites generated event IDs and lists cohort-specific research questions, missing streams, falsification/control requirements and absent scientific evidence. It does not call an LLM, attach unrelated publications, diagnose, recommend treatment, confirm trial eligibility or publish a graph edge. Export remains synthetic-only and not submitted for review.

## Reproduce and scale

```sh
bun --no-env-file run scenarios:generate --seed 482913 --per-cohort 2 --out /tmp/hsi-scenarios-small
bun --no-env-file run scenarios:generate --seed 482913 --per-cohort 250 --out /tmp/hsi-scenarios-scale
```

The second command creates 1,250 profiles and 11,250 scheduled encounters. Output consists of a content-addressed JSON pack and manifest. The default browser workflow limits size to five profiles per cohort; CLI scale is bounded separately. Do not commit large generated payloads or overwrite the separately uploaded 200-patient dataset.

## Evaluation and privacy limits

`scenarioQuality` reports cohort/event counts, missing streams and uniqueness of a coarse age/sex/BMI/cohort tuple. Uniqueness is a diagnostic, not proof of privacy. Software tests check determinism, labels, chronology, units, flags, derived values, constructed control ranges and missingness.

Membership/linkage/attribute-inference attacks against a real training population have **not** been run; no real training population is used. Do not claim zero re-identification risk, clinical fidelity, unbiased representation or privacy certification. Future generators trained on real records require a separately approved programme and actual privacy evaluation.

Real sources must use authorised adapters and their own provenance. Changing a fixture's label is not a real-data replacement path and cannot make its findings scientific evidence.
