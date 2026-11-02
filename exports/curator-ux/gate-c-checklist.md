# Gate C human checklist (curator)

Schema: `hsi-gate-c-checklist-1` · generated 2026-11-02T05:36:36.228Z

**Not CDS. autoApproveIntoKg=false. mayFlipHsiGrade=false.**
Neon approve+supports is human-only in ISI product Neon (**autumn-snow**) — never HSI red-wave.
Compatible with immunecity Gate C queue (`090d7ea`).

> Human decisions imported: **13** (autumn-snow shape). Grades are **not** flipped by this checklist. productionApproved=false unless operator asserts live export.

## Summary

- Curated/accepted with REL: 13
- Gate C publish pending: 13
- Queue actionable (pending/in_review): 0
- Queue decided (human): 13
- Unmapped (no invented REL): 19
- Rows with PMID: 21
- Translation candidates: 22
- Model proposals: 20

## Gate C queue (mapped REL)

| Edge | ISI REL | PMID | S-P-O | Publish | Effective | Decision | Reviewer |
|------|---------|------|-------|---------|-----------|----------|----------|
| `HSI-E-AU-001` | `REL-B015-predicts_eligibility_for-I013` | 31180194 | Type 1 diabetes autoimmunity — associated_with — Islet autoantibodies | pending | **human_approved** | approve | operator:repo-owner-authorized-2026-11-02 @ 2026-11-02T05:36:31.674Z |
| `HSI-E-IM-002` | `REL-M001-contributes_to-D001` | 11244034 | TNF-α — upregulates — Insulin resistance | pending | **human_approved** | approve | operator:repo-owner-authorized-2026-11-02 @ 2026-11-02T05:36:31.674Z |
| `HSI-E-IM-003` | `REL-M003-contributes_to-D001` | 18625622 | IL-6 — associated_with — Type 2 diabetes mellitus | pending | **human_approved** | approve | operator:repo-owner-authorized-2026-11-02 @ 2026-11-02T05:36:31.674Z |
| `HSI-E-IM-004` | `REL-P021-produces-B001` | 12813013 | hs-CRP — biomarker_of — Low-grade chronic inflammation | pending | **human_approved** | approve | operator:repo-owner-authorized-2026-11-02 @ 2026-11-02T05:36:31.674Z |
| `HSI-E-IM-005` | `REL-C003-produces-M001` | 2993897 | Adipose tissue macrophages — associated_with — Insulin resistance | pending | **human_approved** | approve | operator:repo-owner-authorized-2026-11-02 @ 2026-11-02T05:36:31.674Z |
| `HSI-E-IM-006` | `REL-R004-activates-P003` | 15030775 | NLRP3 inflammasome — contributes_to — Metabolic inflammation | pending | **human_approved** | approve | operator:repo-owner-authorized-2026-11-02 @ 2026-11-02T05:36:31.674Z |
| `HSI-E-IM-010` | `REL-I023-targets-M002` | 28845751 | IL-1 pathway blockade — inhibits — Metabolic inflammation | pending | **human_approved** | approve | operator:repo-owner-authorized-2026-11-02 @ 2026-11-02T05:36:31.674Z |
| `HSI-E-IO-001` | `REL-R011-drives-P015` | 16382236 | PD-1 — drives — T-cell exhaustion | pending | **human_approved** | approve | operator:repo-owner-authorized-2026-11-02 @ 2026-11-02T05:36:31.674Z |
| `HSI-E-RA-001` | `REL-M001-contributes_to-D001` | 11244034 | TNF-α — contributes_to — Rheumatoid arthritis | pending | **human_approved** | approve | operator:repo-owner-authorized-2026-11-02 @ 2026-11-02T05:36:31.674Z |
| `HSI-E-RA-004` | `REL-M003-contributes_to-D001` | 18625622 | IL-6 — contributes_to — Rheumatoid arthritis | pending | **human_approved** | approve | operator:repo-owner-authorized-2026-11-02 @ 2026-11-02T05:36:31.674Z |
| `HSI-E-RA-005` | `REL-M003-contributes_to-D001` | 18625622 | Anti-TNF refractory RA phenotype — associated_with — IL-6 pathway axis | pending | **human_approved** | approve | operator:repo-owner-authorized-2026-11-02 @ 2026-11-02T05:36:31.674Z |
| `HSI-E-RA-006` | `REL-C003-produces-M001` | 2993897 | Synovial macrophages — upregulates — TNF-α | pending | **human_approved** | approve | operator:repo-owner-authorized-2026-11-02 @ 2026-11-02T05:36:31.674Z |
| `HSI-E-T2D-010` | `REL-I010-suppresses-P001` | 7569976 | Systemic glucocorticoids — worsens — Hyperglycemia | pending | **human_approved** | approve | operator:repo-owner-authorized-2026-11-02 @ 2026-11-02T05:36:31.674Z |

## Honest unmapped gaps

| Edge | Reason |
|------|--------|
| `HSI-E-IM-001` | Chronic inflammation ↔ insulin resistance bridge has no ISI relationship yet.… |
| `HSI-E-IM-007` | T2D → infection susceptibility — no T2D node / infection-susceptibility edge … |
| `HSI-E-IM-008` | Hyperglycemia → innate dysfunction — neither endpoint is an ISI relationship … |
| `HSI-E-IM-009` | Autoimmune–metabolic comorbidity ↔ T2D — no ISI edge; keep on bridge shortlis… |
| `HSI-E-IO-002` | Checkpoint therapy ↔ irAE — irAE is not a modelled ISI disease/event node yet. |
| `HSI-E-IO-003` | irAE / steroid → hyperglycemia bridge — no ISI relationship; Aksh-facing later. |
| `HSI-E-AU-002` | LADA ↔ T2D phenotype overlap — no LADA / T2D nodes in ISI KG. |
| `HSI-E-RA-002` | Anti-CCP → RA biomarker — LOINC-linked (53031-9); PMID 10662881; no durable I… |
| `HSI-E-RA-003` | Anti-TNF therapy → treats → RA (PMID 11087881). No durable ISI REL-* invented… |
| `HSI-E-RA-007` | Phase 3 ADA → anti-TNF refractory (PMID 16508927). No durable ISI REL-* inven… |
| `HSI-E-RA-008` | Phase 3 ADA ↔ immunogenicity/bioavailability monitoring (PMID 17133559). No i… |
| `HSI-E-RA-009` | Phase 3 seropositive phenotype ↔ anti-TNF response heterogeneity (PMID 183755… |
| `HSI-E-RA-010` | Phase 3 meta-analysis: RF/ACPA not associated with anti-TNF effect (PMID 2458… |
| `HSI-E-RA-011` | Phase 3 RF → RA biomarker — LOINC-linked (11572-5); PMID 20699241; no durable… |
| `HSI-E-RA-012` | Phase 3 MTX + anti-TNF combination treats RA (PMID 10622295 ATTRACT). No dura… |
| `HSI-E-SLE-001` | Type I IFN → SLE illustrative pathway — no curated ISI REL-* yet. |
| `HSI-E-SLE-002` | ANA → SLE illustrative biomarker — LOINC-linked in HSI; no durable ISI REL-* … |
| `HSI-E-PSO-001` | IL-17 → psoriasis illustrative pathway — no curated ISI REL-* yet. |
| `HSI-E-IBD-001` | IL-23 → IBD illustrative pathway — no curated ISI REL-* yet. |

## Phase 8 translation candidates (HITL · not for clinical use)

Candidates: 22 · hitlRequired=22 · cdsSurfacable=0

| Candidate | Clinic | LOINC | Grade | Teaching | Status | autoApprove |
|-----------|--------|-------|-------|----------|--------|-------------|
| `xlat-HSI-C-T2D-001` | HbA1c (`aksh:finding:hba1c`) | 4548-4 | uncertain | established | **deferred_until_hitl** | `false` |
| `xlat-HSI-C-T2D-002` | Fasting plasma glucose (`aksh:finding:fpg`) | 1558-6 | uncertain | established | **deferred_until_hitl** | `false` |
| `xlat-HSI-C-T2D-003` | Insulin resistance (`aksh:pathway:insulin-resistance`) | — | unexplored | associative | **deferred_until_hitl** | `false` |
| `xlat-HSI-C-T2D-004` | β-cell dysfunction (`aksh:pathway:beta-cell-dysfunction`) | — | unexplored | associative | **deferred_until_hitl** | `false` |
| `xlat-HSI-C-T2D-005` | Metformin (`aksh:medicine:metformin`) | — | uncertain | established | **deferred_until_hitl** | `false` |
| `xlat-HSI-C-T2D-006` | SGLT2 inhibitor class (`aksh:medicine:sglt2i`) | — | uncertain | associative | **deferred_until_hitl** | `false` |
| `xlat-HSI-C-T2D-007` | GLP-1 receptor agonist class (`aksh:medicine:glp1ra`) | — | uncertain | associative | **deferred_until_hitl** | `false` |
| `xlat-HSI-C-T2D-008` | Obesity (`aksh:condition:obesity`) | — | uncertain | established | **deferred_until_hitl** | `false` |
| `xlat-HSI-C-T2D-009` | CGM time-in-range (`aksh:finding:cgm-tir`) | — | unexplored | hypothesized | **deferred_until_hitl** | `false` |
| `xlat-HSI-C-T2D-010` | Systemic glucocorticoids → hyperglycaemia (`aksh:interaction:glucocorticoid-hyperglycemia`) | — | uncertain | associative | **deferred_until_hitl** | `false` |
| `xlat-HSI-C-IM-001` | Chronic inflammation ↔ insulin resistance (`aksh:interaction:inflammation-insulin-resistance`) | — | unexplored | hypothesized | **deferred_until_hitl** | `false` |
| `xlat-HSI-C-IM-002` | TNF-α ↔ insulin resistance (`aksh:interaction:tnf-insulin-resistance`) | — | uncertain | hypothesized | **deferred_until_hitl** | `false` |
| `xlat-HSI-C-IM-003` | IL-6 ↔ T2D association (`aksh:interaction:il6-t2dm`) | 26881-3 | uncertain | associative | **deferred_until_hitl** | `false` |
| `xlat-HSI-C-IM-004` | High-sensitivity C-reactive protein (`aksh:finding:hscrp`) | 30522-7 | uncertain | associative | **deferred_until_hitl** | `false` |
| `xlat-HSI-C-IM-005` | Adipose macrophage ↔ insulin resistance (`aksh:interaction:adipose-macrophage-ir`) | — | uncertain | hypothesized | **deferred_until_hitl** | `false` |
| `xlat-HSI-C-IM-006` | NLRP3 → metabolic inflammation (`aksh:interaction:nlrp3-metabolic-inflammation`) | — | uncertain | hypothesized | **deferred_until_hitl** | `false` |
| `xlat-HSI-C-IM-007` | Infection susceptibility (T2D context) (`aksh:risk:infection-susceptibility`) | — | uncertain | associative | **deferred_until_hitl** | `false` |
| `xlat-HSI-C-IM-008` | Hyperglycaemia → innate dysfunction (`aksh:interaction:hyperglycemia-innate`) | — | unexplored | hypothesized | **deferred_until_hitl** | `false` |
| `xlat-HSI-C-IM-009` | Autoimmune–metabolic comorbidity ↔ T2D (`aksh:interaction:autoimmune-metabolic-comorbidity`) | — | unexplored | unknown | **deferred_until_hitl** | `false` |
| `xlat-HSI-C-IO-003` | irAE / steroid → hyperglycaemia (`aksh:watch:irae-hyperglycemia`) | — | unexplored | hypothesized | **deferred_until_hitl** | `false` |
| `xlat-HSI-C-AU-001` | Islet autoantibodies (`aksh:finding:islet-autoantibodies`) | — | uncertain | associative | **deferred_until_hitl** | `false` |
| `xlat-HSI-C-AU-002` | Latent autoimmune diabetes in adults (`aksh:condition:lada`) | — | unexplored | associative | **deferred_until_hitl** | `false` |

## Model proposals (pending · never auto-approve)

Proposals: 20 · pending=20 · autoApprove=0

| Proposal | S — P — O | Teaching (suggested) | Evidence hints | Status | autoApprove |
|----------|-----------|----------------------|----------------|--------|-------------|
| `HSI-MP-SSC-001` | T follicular helper (Tfh) cells — associated_with — Systemic sclerosis | associative | PMID:30760472; pack:hsi-ssc-pathway-pack | **pending** | `false` |
| `HSI-MP-SSC-002` | IL-21 — associated_with — joint involvement in systemic sclerosis (B-cell neighbourhood) | hypothesized | PMID:37763102; card:HSI-CARD-SSC-B; card:HSI-CARD-SSC-IL21 | **pending** | `false` |
| `HSI-MP-GUT-STUB-001` | SCFA (butyrate neighbourhood) — associated_with — mucosal Treg / Th17 balance | hypothesized | pack:hsi-gut-immune-pack; PMID:24226770; PMID:23828891 | **pending** | `false` |
| `HSI-MP-NEURO-STUB-001` | Vagus / cholinergic anti-inflammatory reflex — associated_with — peripheral TNF inflammatory tone | hypothesized | pack:hsi-neuroimmune-pack; PMID:10839541; PMID:12508119 | **pending** | `false` |
| `HSI-MP-RDKIT-MTX-001` | Methotrexate (public SMILES) — associated_with — research cheminformatics property profile (MW/LogP/TPSA) in anti-TNF + MTX neighbourhood | hypothesized | pack:hsi-pilot-evidence-pack; edge:HSI-E-RA-012; smiles:CN(Cc1cnc2nc(N)nc(N)c2n1)c1ccc(C(=O)N[C@@H](CCC(=O)O)C(=O)O)cc1 | **pending** | `false` |
| `HSI-MP-RDKIT-BUTYRATE-001` | Butyrate (butyric acid) (public SMILES) — associated_with — SCFA chemotype descriptor profile for mucosal SCFA↔Treg research framing | hypothesized | pack:hsi-gut-immune-pack; edge:HSI-E-GUT-003; smiles:CCCC(=O)O | **pending** | `false` |
| `HSI-MP-OPENMM-ACH-001` | Acetylcholine (public SMILES) — associated_with — research MD energy/stability profile near α7 nAChR cholinergic anti-inflammatory neighbourhood | hypothesized | pack:hsi-neuroimmune-pack; edge:HSI-E-NI-003; smiles:CC(=O)OCC[N+](C)(C)C | **pending** | `false` |
| `HSI-MP-OPENMM-BUTYRATE-001` | Butyrate (butyric acid) (public SMILES) — associated_with — research MD energy/stability profile for SCFA chemotype in mucosal SCFA↔Treg framing | hypothesized | pack:hsi-gut-immune-pack; edge:HSI-E-GUT-003; smiles:CCCC(=O)O | **pending** | `false` |
| `HSI-MP-REINVENT4-MTX-001` | Methotrexate seed → sandbox analogue (public seed SMILES) — associated_with — research generative design sandbox candidate near ATTRACT/MTX chemotype neighbourhood (not dosing, not CDS) | hypothesized | pack:hsi-pilot-evidence-pack; edge:HSI-E-RA-012; seedSmiles:CN(Cc1cnc2nc(N)nc(N)c2n1)c1ccc(C(=O)N[C@@H](CCC(=O)O)C(=O)O)cc1 | **pending** | `false` |
| `HSI-MP-REINVENT4-BUTYRATE-001` | Butyrate seed → SCFA neighbour sandbox (public seed SMILES) — associated_with — research generative sandbox SCFA neighbour chemotype for mucosal SCFA↔Treg framing (hypothesized only) | hypothesized | pack:hsi-gut-immune-pack; edge:HSI-E-GUT-003; seedSmiles:CCCC(=O)O | **pending** | `false` |
| `HSI-MP-ESM2-TNF-001` | TNF-α public fragment → RA pathway embedding (public UniProt fragment) — associated_with — research FAIR ESM-2 embedding sidecar slot for TNF pathway neighbourhood (hash/ref only; not a grade; not CDS) | hypothesized | pack:hsi-pilot-evidence-pack; edge:HSI-E-RA-001; uniprot:P01375 | **pending** | `false` |
| `HSI-MP-ESM2-FOXP3-001` | FOXP3 public fragment → mucosal Treg embedding (public UniProt fragment) — associated_with — research FAIR ESM-2 embedding sidecar slot for FOXP3/Treg neighbourhood near SCFA↔Treg framing (hypothesized only) | hypothesized | pack:hsi-gut-immune-pack; edge:HSI-E-GUT-003; uniprot:Q9BZS1 | **pending** | `false` |
| `HSI-MP-AF3-TNF-001` | TNF-α (public UniProt) structure hypothesis (P01375) — associated_with — research AF3 stub structure-confidence draft for TNF pathway neighbourhood (not a grade; not CDS) | hypothesized | pack:hsi-pilot-evidence-pack; edge:HSI-E-RA-001; uniprot:P01375 | **pending** | `false` |
| `HSI-MP-AF3-IL21-001` | IL-21 (public UniProt) structure hypothesis (Q9HBE4) — associated_with — research AF3 stub structure draft for IL-21 / Tfh neighbourhood (hypothesized; dual-track SSc) | hypothesized | pack:hsi-ssc-pathway-pack; edge:HSI-E-SSC-002; uniprot:Q9HBE4 | **pending** | `false` |
| `HSI-MP-TDC-ADMET-001` | TDC ADMET stub benchmark frame — associated_with — research TDC stub offline-eval draft vs MTX neighbourhood claim (not seed authority) | hypothesized | pack:hsi-pilot-evidence-pack; edge:HSI-E-RA-012; tdcTask:ADMET_Prediction | **pending** | `false` |
| `HSI-MP-TDC-DTI-001` | TDC DTI stub benchmark frame — associated_with — research TDC stub offline-eval draft near SCFA↔Treg neighbourhood (hypothesized) | hypothesized | pack:hsi-gut-immune-pack; edge:HSI-E-GUT-003; tdcTask:DTI_DG | **pending** | `false` |
| `HSI-MP-BOLTZ-TNF-001` | TNF-α Boltz stub structure hypothesis (P01375) — associated_with — research Boltz stub complex/structure draft for TNF neighbourhood (hash/ref only; no weights vendored) | hypothesized | pack:hsi-pilot-evidence-pack; edge:HSI-E-RA-001; uniprot:P01375 | **pending** | `false` |
| `HSI-MP-BOLTZ-FOXP3-001` | FOXP3 Boltz stub structure hypothesis (Q9BZS1) — associated_with — research Boltz stub structure draft near mucosal Treg neighbourhood (hypothesized) | hypothesized | pack:hsi-gut-immune-pack; edge:HSI-E-GUT-003; uniprot:Q9BZS1 | **pending** | `false` |
| `HSI-MP-ISI-AGENTS-LITERATURE-001` | ISI literature specialist stub — associated_with — research agent stub draft citing RA TNF edge (supervised; not auto Gate C) | hypothesized | pack:hsi-pilot-evidence-pack; edge:HSI-E-RA-001; agentRole:literature_specialist | **pending** | `false` |
| `HSI-MP-ISI-AGENTS-PATHWAY-001` | ISI pathway specialist stub — associated_with — research agent stub draft citing SSc Tfh edge (dual-track secondary; not ASK replace) | hypothesized | pack:hsi-ssc-pathway-pack; edge:HSI-E-SSC-001; agentRole:pathway_specialist | **pending** | `false` |

## Instructions

- Human-only Neon path: Check → claim_support=supports → Approve on the REL.
- Do not auto-approve from this checklist into any product KG.
- Re-check S-P-O: HSI spoNote is a curator hint; ISI REL endpoints may differ on related_axis maps.
- Unmapped rows must not receive invented REL-* ids.
- CDS stays closed until curationReview=approved AND hsiGrade=established.
- Phase 8 translationCandidates: human HITL only (autoApprove=false); clinicalUse=not_for_clinical_use; Akeno = future consumer — not live CDS.
- teachingStatus ≠ hsiGrade ≠ CDS — never collapse axes when reviewing translation candidates.
- P1.5 modelProposals: typed ModelProposalArtifact drafts only (autoApprove=false; mayFlipEvidenceGrade=false). Never write hsiGrade/curationReview from a model. Not Neon auto-approve — human Gate C only.
- P2.2 embedding sidecars (hsi-embedding-sidecars.json): hash/ref metadata only; doesNotSetHsiGrade=true; autoApprove=false — never treat similarity as Gate C pass or grade flip.
- P2.3 offline eval harness (hsi-model-eval-harness.*): scores proposals/sidecars against frozen packs only; mayUseLivePhi=false; never flips grades; never auto-approves into KG.
- P2.4 ClinVar/TCGA pointers (hsi-external-genome-pointers.json): citation/ref only (accession + URL + disease/gene context + optional edgeIds); reviewRequired=true; doesNotSetHsiGrade; no bulk genome dump / PHI — Gate C still required.
- P2.5 P3 adapters (docs/P3_ADAPTER_RFC.md + hsi-p3-adapter-license-matrix.json): emit ModelProposalArtifacts only; license gate before run (blockedUntilSignOff); mayFlipEvidenceGrade=false; vendorsModelWeights=false; never claim commercial signed without evidence.
- P3.0 RDKit thin adapter spike (hsi-rdkit-adapter-proposals.*): sourceAdapterOrAgent=adapter-rdkit; runtime stub|rdkit; ModelProposalArtifacts only → pending; autoApprove=false; does not set hsiGrade; refuse blockedUntilSignOff adapters.
- P3.1 OpenMM thin adapter spike (hsi-openmm-adapter-proposals.*): sourceAdapterOrAgent=adapter-openmm; runtime stub|openmm; ModelProposalArtifacts only → pending; autoApprove=false; does not set hsiGrade; MD ≠ Gate C evidence alone; refuse blockedUntilSignOff adapters.
- P3.2 REINVENT4 thin adapter spike (hsi-reinvent4-adapter-proposals.*): sourceAdapterOrAgent=adapter-reinvent4; runtime stub|reinvent; ModelProposalArtifacts only → pending; autoApprove=false; does not set hsiGrade; never clinic recommendation path; no multi-GB weights; refuse blockedUntilSignOff adapters.
- P3.3 FAIR ESM-2 thin embedding stub (hsi-esm-adapter-proposals.*): sourceAdapterOrAgent=adapter-esm; runtime stub|esm; ModelProposalArtifacts + embedding sidecar refs → pending; autoApprove=false; does not set hsiGrade; no weight vendoring / PHI sequences.
- AF3/TDC/ISI research sign-off fixtures + Boltz weights policy: stub proposals → pending; AF3 notCommercial / NOT commercial rights; Boltz requires WEIGHTS_POLICY_ACK; never vendor multi-GB weights (docs/P3_WEIGHTS_AND_LICENSE_POLICY.md).
