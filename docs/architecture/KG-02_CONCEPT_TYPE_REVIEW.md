# KG-02 slice 2: proposed entity types for review

Generated from graph version 044eb4d6 by `bun run ontology:types` (rules rules-1). **Proposals only.** Nothing here is applied to the graph, the types are not calibrated, and every row needs a person to accept, change or reject it. A reviewer who is the owner is an interim reviewer, not an independent one.

114 concepts are typed only as "biological concept" in the graph. 24 need particular care: their name matches rules for more than one type, or no rule.

## Needs particular care

| Concept | Rule used | Other types that also matched |
|---|---|---|
| α7 nAChR–Jak2–STAT3 macrophage programme | R07 | receptor (R08), cell type (R09) |
| Autoimmune T-cell responses | R07 | cell type (R09) |
| BAFF (B-cell activating factor) | R10 | cell type (R09) |
| Cholinergic anti-inflammatory pathway | R06 | phenotype or state (R16) |
| Cholinergic neural signals to the spleen | none | - |
| Commensal bacterial metabolites (SCFA neighbourhood) | R11 | microorganism (R12) |
| GLP-1 receptor agonists | R05 | receptor (R08) |
| Human dendritic-cell conditioning | R07 | cell type (R09) |
| IL-1 pathway blockade | R05 | pathway (R06) |
| IL-21-dependent plasmablast differentiation | R07 | cell type (R09) |
| IL-6 pathway blockade (tocilizumab class) | R05 | pathway (R06) |
| Inflammatory bowel disease | R15 | phenotype or state (R16) |
| Inflammatory reflex | R06 | phenotype or state (R16) |
| Inflammatory reflex (cholinergic axis) | R06 | phenotype or state (R16) |
| Intestinal epithelial HIF-supported barrier function | R07 | anatomical structure (R13) |
| Intestinal macrophage HDAC activity / inflammatory tone | R07 | cell type (R09), phenotype or state (R16) |
| Microbiota tryptophan catabolites (AhR ligands) | R11 | microorganism (R12) |
| mTORC1 insulin-signalling pathway | R06 | biological process (R07) |
| Nicotinic ACh receptor α7 subunit (macrophage) | R08 | cell type (R09) |
| Pharmacologic cholinergic anti-inflammatory stimulation | R04 | phenotype or state (R16) |
| Rituximab B-cell depletion (experimental in SSc) | R05 | cell type (R09) |
| Systemic infection / peripheral inflammation | R14 | phenotype or state (R16) |
| T-cell exhaustion | R07 | cell type (R09) |
| Type 1 diabetes progression | R15 | phenotype or state (R16) |

## All proposals by type

### anatomical structure (5)

| Concept | Rule used | Other types that also matched |
|---|---|---|
| Blood–brain barrier | R13 | - |
| Blood–brain barrier (neuroimmune interface) | R13 | - |
| Intestinal epithelial barrier / tight junctions | R13 | - |
| Spleen (innate cytokine reservoir) | R13 | - |
| Splenic nerve (catecholaminergic) | R13 | - |

### autoantibody or antibody (5)

| Concept | Rule used | Other types that also matched |
|---|---|---|
| Anti-CCP antibodies | R03 | - |
| Anti-drug antibodies to anti-TNF (ADA) | R03 | - |
| Antinuclear antibodies (ANA) | R03 | - |
| Islet autoantibodies | R03 | - |
| Rheumatoid factor | R03 | - |

### biological process (16)

| Concept | Rule used | Other types that also matched |
|---|---|---|
| α7 nAChR–Jak2–STAT3 macrophage programme | R07 | receptor (R08), cell type (R09) |
| Autoimmune T-cell responses | R07 | cell type (R09) |
| Brain parenchyma immune surveillance | R07 | - |
| Human dendritic-cell conditioning | R07 | cell type (R09) |
| IL-21-dependent plasmablast differentiation | R07 | cell type (R09) |
| Intestinal epithelial HIF-supported barrier function | R07 | anatomical structure (R13) |
| Intestinal macrophage HDAC activity / inflammatory tone | R07 | cell type (R09), phenotype or state (R16) |
| Ischemia–reperfusion TNF response | R07 | - |
| Leukocyte trafficking via CD11b | R07 | - |
| Macrophage TNF release | R07 | - |
| Macrophage TNF synthesis / release | R07 | - |
| Microbial BCAA biosynthesis | R07 | - |
| Monocyte recruitment into brain | R07 | - |
| Mucosal IL-22 / reactivity balance | R07 | - |
| SSc fibroblast / TGF-β fibrotic programme | R07 | - |
| T-cell exhaustion | R07 | cell type (R09) |

### cell type (15)

| Concept | Rule used | Other types that also matched |
|---|---|---|
| Acetylcholine-synthesizing memory T cells | R09 | - |
| Autoreactive CD8 T cells | R09 | - |
| B cell | R09 | - |
| Cerebral microglia | R09 | - |
| circulating Tfh cells | R09 | - |
| circulating Tfh1 subset | R09 | - |
| CXCL13+ Tfh-like T cells (SSc skin) | R09 | - |
| ICOS+ Tfh-like cells | R09 | - |
| ICOS+ Tfh-like cells / IL-21 | R09 | - |
| IL-10+ type-1 regulatory T cells (Tr1-like) | R09 | - |
| Plasmablast | R09 | - |
| Resting / surveying microglia | R09 | - |
| SSc circulating Tfh cells | R09 | - |
| T follicular helper (Tfh) cells | R09 | - |
| Tfh1-skewed follicular helper cells | R09 | - |

### clinical measurement (5)

| Concept | Rule used | Other types that also matched |
|---|---|---|
| Anti-TNF immunogenicity / bioavailability monitoring | R02 | - |
| CGM time-in-range | R02 | - |
| Fasting plasma glucose | R02 | - |
| HbA1c | R02 | - |
| hs-CRP | R02 | - |

### cytokine or mediator (4)

| Concept | Rule used | Other types that also matched |
|---|---|---|
| BAFF (B-cell activating factor) | R10 | cell type (R09) |
| Circulating interleukin-1α | R10 | - |
| CXCL4 (PF4) | R10 | - |
| IL-21 | R10 | - |

### disease (5)

| Concept | Rule used | Other types that also matched |
|---|---|---|
| Inflammatory bowel disease | R15 | phenotype or state (R16) |
| LADA / latent autoimmune diabetes | R15 | - |
| Psoriasis / psoriatic disease | R15 | - |
| Systemic sclerosis | R15 | - |
| Type 1 diabetes progression | R15 | phenotype or state (R16) |

### drug or therapy (11)

| Concept | Rule used | Other types that also matched |
|---|---|---|
| Anti-TNF therapy | R05 | - |
| BAFF antagonist (experimental) | R05 | - |
| GLP-1 receptor agonists | R05 | receptor (R08) |
| IL-1 pathway blockade | R05 | pathway (R06) |
| IL-6 pathway blockade (tocilizumab class) | R05 | pathway (R06) |
| Immune checkpoint therapy | R05 | - |
| Methotrexate + anti-TNF combination therapy | R05 | - |
| Rituximab B-cell depletion (experimental in SSc) | R05 | cell type (R09) |
| SGLT2 inhibitors | R05 | - |
| Systemic glucocorticoids | R05 | - |
| Teplizumab | R05 | - |

### exposure (2)

| Concept | Rule used | Other types that also matched |
|---|---|---|
| Endotoxin exposure | R14 | - |
| Systemic infection / peripheral inflammation | R14 | phenotype or state (R16) |

### intervention procedure (3)

| Concept | Rule used | Other types that also matched |
|---|---|---|
| Efferent vagus nerve stimulation | R04 | - |
| Implantable vagus nerve stimulator (experimental) | R04 | - |
| Pharmacologic cholinergic anti-inflammatory stimulation | R04 | phenotype or state (R16) |

### microbial metabolite (2)

| Concept | Rule used | Other types that also matched |
|---|---|---|
| Commensal bacterial metabolites (SCFA neighbourhood) | R11 | microorganism (R12) |
| Microbiota tryptophan catabolites (AhR ligands) | R11 | microorganism (R12) |

### microorganism (5)

| Concept | Rule used | Other types that also matched |
|---|---|---|
| Clostridium clusters IV / XIVa (gut) | R12 | - |
| Epstein-Barr virus (EBV) | R12 | - |
| Fibre-responsive gut bacteria | R12 | - |
| Human microbiota Clostridia mix (17-strain class) | R12 | - |
| Segmented filamentous bacteria (SFB) | R12 | - |

### pathway (10)

| Concept | Rule used | Other types that also matched |
|---|---|---|
| Cholinergic anti-inflammatory pathway | R06 | phenotype or state (R16) |
| IL-17 pathway | R06 | - |
| IL-23 pathway | R06 | - |
| IL-6 pathway axis | R06 | - |
| Inflammatory reflex | R06 | phenotype or state (R16) |
| Inflammatory reflex (cholinergic axis) | R06 | phenotype or state (R16) |
| mTORC1 insulin-signalling pathway | R06 | biological process (R07) |
| Peripheral immune ↔ CNS communication axis | R06 | - |
| TGF-β pathway activation in dermal fibroblasts | R06 | - |
| Type I interferon pathway | R06 | - |

### phenotype or state (20)

| Concept | Rule used | Other types that also matched |
|---|---|---|
| Anti-TNF refractory RA phenotype | R16 | - |
| Anti-TNF response heterogeneity | R16 | - |
| Anti-TNF treatment response | R16 | - |
| Autoimmune–metabolic comorbidity | R16 | - |
| Beta-cell injury | R16 | - |
| CNS inflammatory / neurodegenerative tone | R16 | - |
| Colonic inflammation tone | R16 | - |
| dermal fibrosis | R16 | - |
| Hyperglycemia | R16 | - |
| Immune-related adverse events | R16 | - |
| Infection susceptibility | R16 | - |
| Innate immune dysfunction | R16 | - |
| Low-grade chronic inflammation | R16 | - |
| Metabolic inflammation | R16 | - |
| Pancreatic β-cell dysfunction | R16 | - |
| Peripheral / systemic TNF inflammatory tone | R16 | - |
| RF/ACPA seropositive RA phenotype | R16 | - |
| Skin fibrosis | R16 | - |
| SSc dermal fibrosis | R16 | - |
| SSc vasculopathy / endothelial injury | R16 | - |

### receptor (3)

| Concept | Rule used | Other types that also matched |
|---|---|---|
| GPR109A (HCAR2) — butyrate / niacin receptor | R08 | - |
| Nicotinic ACh receptor α7 subunit (macrophage) | R08 | cell type (R09) |
| PD-1 | R08 | - |

### study context (2)

| Concept | Rule used | Other types that also matched |
|---|---|---|
| SSc cohort | R01 | - |
| SSc cohort versus healthy controls | R01 | - |

### unclassified (1)

| Concept | Rule used | Other types that also matched |
|---|---|---|
| Cholinergic neural signals to the spleen | none | - |

## Rules (first match decides)

| Rule | Type | Meaning |
|---|---|---|
| R01 | study context | Names a study cohort, not a biological entity |
| R02 | clinical measurement | Names a laboratory or monitoring measurement |
| R03 | autoantibody or antibody | Names an antibody or autoantibody |
| R04 | intervention procedure | Names a stimulation intervention |
| R05 | drug or therapy | Names a drug, drug class or therapy |
| R06 | pathway | Names a signalling pathway, reflex or axis |
| R07 | biological process | Names a process rather than an entity |
| R08 | receptor | Names a receptor |
| R10 | cytokine or mediator | Names a cytokine, chemokine or soluble mediator |
| R09 | cell type | Names a cell population |
| R11 | microbial metabolite | Names microbial metabolites |
| R12 | microorganism | Names a microorganism or microbial community |
| R13 | anatomical structure | Names an anatomical structure |
| R14 | exposure | Names an exposure |
| R15 | disease | Names a disease |
| R16 | phenotype or state | Names a phenotype, clinical state or response |

