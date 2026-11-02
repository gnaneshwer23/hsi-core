# HSI schema gap report (curator)

Schema: `hsi-gap-report-1` · generated 2026-11-02T05:36:36.228Z

**Not CDS.** Mapping / schema gaps only — never invent REL-* / aksh: ids / LOINC binds.

## Summary

- Seed edges: 88
- Bridge candidates: 22
- Claims mapped to ISI REL: 13
- Claims mapped to Aksh node: 22
- Claims with durable locator: 75
- Gap rows: 88
- Grades: established=0, uncertain=77, unexplored=11
- LOINC linked claims: 8
- Domains in use: autoimmunity, immuno_metabolic, io, t2d
- Edge types in use: 16

## Gap buckets (by missing slot)

| Missing | Count | Sample edges |
|---------|------:|--------------|
| `isi_relationship_id` | 75 | `HSI-E-T2D-001`, `HSI-E-T2D-002`, `HSI-E-T2D-003`, `HSI-E-T2D-004`, `HSI-E-T2D-005`, `HSI-E-T2D-006` |
| `aksh_node_id` | 66 | `HSI-E-IM-010`, `HSI-E-IO-001`, `HSI-E-IO-002`, `HSI-E-RA-001`, `HSI-E-RA-002`, `HSI-E-RA-003` |
| `durable_locator` | 13 | `HSI-E-T2D-003`, `HSI-E-T2D-004`, `HSI-E-T2D-007`, `HSI-E-T2D-009`, `HSI-E-IM-001`, `HSI-E-IM-007` |
| `loinc_marker` | 80 | `HSI-E-T2D-003`, `HSI-E-T2D-004`, `HSI-E-T2D-005`, `HSI-E-T2D-006`, `HSI-E-T2D-007`, `HSI-E-T2D-008` |
| `gate_c_approved` | 88 | `HSI-E-T2D-001`, `HSI-E-T2D-002`, `HSI-E-T2D-003`, `HSI-E-T2D-004`, `HSI-E-T2D-005`, `HSI-E-T2D-006` |

## ISI REL mapping

- Suggestions: 32
- With REL id: 13
- Unmapped: 19
- Curated (HSI-side): 13
- autoApproveIntoKg: false

## Aksh node mapping

- T2D mapped: 10/10
- autoApplyToEhr: false
- anyCdsSurfacableOnSeedEdges: false

## Bridge shortlist

- `HSI-E-IM-001` → unmapped (none): Low-grade chronic inflammation → Insulin resistance
- `HSI-E-IM-002` → REL-M001-contributes_to-D001 (related_axis): TNF-α → Insulin resistance
- `HSI-E-IM-003` → REL-M003-contributes_to-D001 (related_axis): IL-6 → Type 2 diabetes mellitus
- `HSI-E-IM-004` → REL-P021-produces-B001 (related_axis): hs-CRP → Low-grade chronic inflammation
- `HSI-E-IM-005` → REL-C003-produces-M001 (related_axis): Adipose tissue macrophages → Insulin resistance
- `HSI-E-IM-006` → REL-R004-activates-P003 (related_axis): NLRP3 inflammasome → Metabolic inflammation
- `HSI-E-IM-007` → unmapped (none): Type 2 diabetes mellitus → Infection susceptibility
- `HSI-E-IM-008` → unmapped (none): Hyperglycemia → Innate immune dysfunction
- `HSI-E-IM-009` → unmapped (none): Autoimmune–metabolic comorbidity → Type 2 diabetes mellitus
- `HSI-E-IM-010` → REL-I023-targets-M002 (related_axis): IL-1 pathway blockade → Metabolic inflammation
- `HSI-E-IO-003` → unmapped (none): Immune-related adverse events → Hyperglycemia
- `HSI-E-AU-002` → unmapped (none): LADA / latent autoimmune diabetes → Type 2 diabetes mellitus
- `HSI-E-GUT-003` → unmapped (unspecified): Butyrate (SCFA) → Colonic / mucosal Foxp3+ Treg
- `HSI-E-GUT-004` → unmapped (unspecified): Short-chain fatty acids (class) → Colonic / mucosal Foxp3+ Treg
- `HSI-E-GUT-014` → unmapped (unspecified): Microbiota tryptophan catabolites (AhR ligands) → Mucosal IL-22 / reactivity balance
- `HSI-E-NI-001` → unmapped (unspecified): Efferent vagus nerve stimulation → Peripheral / systemic TNF inflammatory tone
- `HSI-E-NI-002` → unmapped (unspecified): Inflammatory reflex (cholinergic axis) → Peripheral / systemic TNF inflammatory tone
- `HSI-E-NI-003` → unmapped (unspecified): Nicotinic ACh receptor α7 subunit (macrophage) → Macrophage TNF synthesis / release
- `HSI-E-NI-005` → unmapped (unspecified): Acetylcholine-synthesizing memory T cells → Macrophage TNF synthesis / release
- `HSI-E-NI-012` → unmapped (unspecified): Resting / surveying microglia → Brain parenchyma immune surveillance
- `HSI-E-NI-013` → unmapped (unspecified): Systemic infection / peripheral inflammation → CNS inflammatory / neurodegenerative tone
- `HSI-E-NI-014` → unmapped (unspecified): Blood–brain barrier (neuroimmune interface) → Peripheral immune ↔ CNS communication axis

## Gap rows (curator backlog)

| Edge | Domain | Grade | Missing | Assertion (short) |
|------|--------|-------|---------|-------------------|
| `HSI-E-T2D-001` | t2d | uncertain | isi_relationship_id, gate_c_approved | Elevated HbA1c is used to diagnose and monitor type 2 diabetes. |
| `HSI-E-T2D-002` | t2d | uncertain | isi_relationship_id, gate_c_approved | Fasting plasma glucose above diagnostic thresholds indicates T2D. |
| `HSI-E-T2D-003` | t2d | unexplored | isi_relationship_id, durable_locator, loinc_marker, gate_c_approved | Insulin resistance is a core pathophysiologic feature of T2D. |
| `HSI-E-T2D-004` | t2d | unexplored | isi_relationship_id, durable_locator, loinc_marker, gate_c_approved | Progressive β-cell dysfunction contributes to hyperglycemia in T2D. |
| `HSI-E-T2D-005` | t2d | uncertain | isi_relationship_id, loinc_marker, gate_c_approved | Metformin is first-line pharmacotherapy for many adults with T2D. |
| `HSI-E-T2D-006` | t2d | uncertain | isi_relationship_id, loinc_marker, gate_c_approved | SGLT2 inhibitors lower glucose and reduce cardiorenal risk in selecte… |
| `HSI-E-T2D-007` | t2d | uncertain | isi_relationship_id, durable_locator, loinc_marker, gate_c_approved | GLP-1 receptor agonists improve glycemic control and weight in T2D. |
| `HSI-E-T2D-008` | t2d | uncertain | isi_relationship_id, loinc_marker, gate_c_approved | Obesity is a major modifiable risk factor for incident T2D. |
| `HSI-E-T2D-009` | t2d | unexplored | isi_relationship_id, durable_locator, loinc_marker, gate_c_approved | CGM time-in-range complements HbA1c for glycemic assessment in T2D. |
| `HSI-E-T2D-010` | t2d | uncertain | loinc_marker, gate_c_approved | Systemic glucocorticoids can worsen hyperglycemia and unmask diabetes. |
| `HSI-E-IM-001` | immuno_metabolic | unexplored | isi_relationship_id, durable_locator, loinc_marker, gate_c_approved | Low-grade chronic inflammation is linked to insulin resistance (immun… |
| `HSI-E-IM-002` | immuno_metabolic | uncertain | loinc_marker, gate_c_approved | TNF-α signalling can impair insulin action in metabolic tissues. |
| `HSI-E-IM-003` | immuno_metabolic | uncertain | gate_c_approved | Circulating IL-6 is associated with T2D risk and inflammatory tone. |
| `HSI-E-IM-004` | immuno_metabolic | uncertain | gate_c_approved | hs-CRP is a clinical marker of systemic inflammatory burden. |
| `HSI-E-IM-005` | immuno_metabolic | uncertain | loinc_marker, gate_c_approved | Adipose tissue macrophage infiltration associates with insulin resist… |
| `HSI-E-IM-006` | immuno_metabolic | uncertain | loinc_marker, gate_c_approved | NLRP3 inflammasome activation contributes to metabolic inflammation. |
| `HSI-E-IM-007` | immuno_metabolic | uncertain | isi_relationship_id, durable_locator, loinc_marker, gate_c_approved | T2D is associated with increased susceptibility to certain infections. |
| `HSI-E-IM-008` | immuno_metabolic | unexplored | isi_relationship_id, durable_locator, loinc_marker, gate_c_approved | Sustained hyperglycemia can impair aspects of innate immune function. |
| `HSI-E-IM-009` | autoimmunity | unexplored | isi_relationship_id, durable_locator, loinc_marker, gate_c_approved | Some autoimmune conditions co-occur with higher T2D risk (bridge shor… |
| `HSI-E-IM-010` | immuno_metabolic | uncertain | aksh_node_id, loinc_marker, gate_c_approved | IL-1 pathway blockade has been studied for metabolic inflammation (re… |
| `HSI-E-IO-001` | io | uncertain | aksh_node_id, loinc_marker, gate_c_approved | PD-1 signalling contributes to T-cell exhaustion phenotypes (educatio… |
| `HSI-E-IO-002` | io | uncertain | isi_relationship_id, aksh_node_id, loinc_marker, gate_c_approved | Immune checkpoint therapy is associated with immune-related adverse e… |
| `HSI-E-IO-003` | immuno_metabolic | unexplored | isi_relationship_id, durable_locator, loinc_marker, gate_c_approved | Some irAEs and steroid treatment can present with hyperglycemia (brid… |
| `HSI-E-AU-001` | autoimmunity | uncertain | loinc_marker, gate_c_approved | Islet autoantibodies mark autoimmune β-cell targeting in T1D (contras… |
| `HSI-E-AU-002` | autoimmunity | unexplored | isi_relationship_id, durable_locator, loinc_marker, gate_c_approved | LADA can present with adult-onset diabetes phenotypes overlapping T2D… |
| `HSI-E-RA-001` | autoimmunity | uncertain | aksh_node_id, loinc_marker, gate_c_approved | TNF-α contributes to synovial inflammation in rheumatoid arthritis (s… |
| `HSI-E-RA-002` | autoimmunity | uncertain | isi_relationship_id, aksh_node_id, gate_c_approved | Anti-CCP (ACPA) antibodies are a serologic biomarker used in rheumato… |
| `HSI-E-RA-003` | autoimmunity | uncertain | isi_relationship_id, aksh_node_id, loinc_marker, gate_c_approved | Anti-TNF therapy (e.g. infliximab class) improves clinical outcomes i… |
| `HSI-E-RA-004` | autoimmunity | uncertain | aksh_node_id, gate_c_approved | IL-6 pathway signalling contributes to rheumatoid arthritis inflammat… |
| `HSI-E-RA-005` | autoimmunity | uncertain | aksh_node_id, loinc_marker, gate_c_approved | Some patients with inadequate anti-TNF response still show benefit fr… |
| `HSI-E-RA-006` | autoimmunity | uncertain | aksh_node_id, loinc_marker, gate_c_approved | Macrophages are a cellular source of TNF-α — relevant to synovial TNF… |
| `HSI-E-RA-007` | autoimmunity | uncertain | isi_relationship_id, aksh_node_id, loinc_marker, gate_c_approved | Development of anti-infliximab antibodies is associated with reduced … |
| `HSI-E-RA-008` | autoimmunity | uncertain | isi_relationship_id, aksh_node_id, loinc_marker, gate_c_approved | Low early trough infliximab levels and subsequent anti-infliximab ant… |
| `HSI-E-RA-009` | autoimmunity | uncertain | isi_relationship_id, aksh_node_id, loinc_marker, gate_c_approved | RF and/or anti-CCP positivity has been associated with differential m… |
| `HSI-E-RA-010` | autoimmunity | uncertain | isi_relationship_id, aksh_node_id, loinc_marker, gate_c_approved | Pooled evidence does not support RF or anti-CCP status as a reliable … |
| `HSI-E-RA-011` | autoimmunity | uncertain | isi_relationship_id, aksh_node_id, gate_c_approved | Rheumatoid factor is a serologic biomarker used in rheumatoid arthrit… |
| `HSI-E-RA-012` | autoimmunity | uncertain | isi_relationship_id, aksh_node_id, loinc_marker, gate_c_approved | Infliximab plus methotrexate improves clinical and radiographic outco… |
| `HSI-E-SLE-001` | autoimmunity | unexplored | isi_relationship_id, aksh_node_id, durable_locator, loinc_marker, gate_c_approved | Type I interferon pathway activation associates with SLE pathophysiol… |
| `HSI-E-SLE-002` | autoimmunity | uncertain | isi_relationship_id, aksh_node_id, gate_c_approved | ANA testing is used in the serologic workup of SLE (illustrative biom… |
| `HSI-E-PSO-001` | autoimmunity | unexplored | isi_relationship_id, aksh_node_id, durable_locator, loinc_marker, gate_c_approved | IL-17 pathway signalling drives psoriatic skin inflammation (illustra… |

_… 48 more gap rows in JSON._

## Next actions

- Keep ISI REL-* curator checklists as markdown in hsi-core (`docs/`); never auto-approve into a product KG.
- Phase 4 HSI Neon red-wave readiness shipped; Phase 5 acceptance pack regenerable via bun run outputs (hsi-pilot-acceptance.* / walkthrough) — never write ISI autumn-snow / Akeno / DeliverX from this workspace.
- Fill remaining unmapped immuno-metabolic bridges (inflammation↔IR, T2D infection, LADA, irAE hyperglycemia) in hsi-core seeds/maps.
- Aksh durable `aksh:` ids + HITL read-only stub shipped (hsi-aksh-node-map-2 / hsi-aksh-hitl-stub-1); bind live clinic KG when Aksh publishes canonical nodes.
- Document human Gate C approve+supports checklist in hsi-core docs; product apps consume published export only — never edit immunecity for HSI; ignore DeliverX/swift-deliveries.
- Map durable ISI REL-* for Phase 3 unmapped RA edges (ADA, serology, RF, MTX combo) only when curator-confirmed — do not invent.
- Do not mark CDS-surfacable until curationReview=approved and hsiGrade=established (akshNodeId alone never unlocks CDS).
