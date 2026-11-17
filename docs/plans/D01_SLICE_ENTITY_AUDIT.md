# D-01 slice entity audit (A2.3 / KG-01)

Audit of first-reviewed-slice entities against the published domain graph. Slice boundaries: gut microbial metabolites → immune signalling → insulin resistance in type 2 diabetes, with a type 1 diabetes comparison track and anti-TNF in RA versus MS (PRD D-01; SSc excluded).

Honesty: every node below stays an **unreviewed candidate**. Adding a node is not scientific approval, ontology equivalence, or graph promotion. Approved ontology IDs remain a KG-02 review step (`research/ontology/mappings.v1.json` is still empty).

## Required examples from KG-01

| Entity | Role | Graph status | Notes |
| --- | --- | --- | --- |
| Butyrate | SCFA metabolite | Present (`concept:butyrate-ec227cb`) | No approved ontology ID yet (CHEBI not in current import set) |
| Short-chain fatty acids | Metabolite class | Present | Alias covers acetate / propionate / butyrate class wording |
| Acetate | SCFA metabolite | **Added** (A2.3 entity seed) | Distinct from `Microbial acetate and butyrate` mixture |
| Propionate | SCFA metabolite | **Added** (A2.3 entity seed) | Distinct from imidazole propionate |
| Peripheral / mucosal Foxp3+ Treg | Regulatory T cells | Present | Colonic and peripheral Foxp3+ nodes; no single umbrella “regulatory T cells” node |
| Adipose tissue | Tissue | **Added** (A2.3 entity seed) | Was only present as adipose tissue macrophages |
| Liver | Tissue | **Added** (A2.3 entity seed) | Was a domain tag only |
| TNF-α | Cytokine | Present | Anti-TNF neighbourhood also present |
| Multiple sclerosis | Disease | Present | Candidate MONDO match in unreviewed label table |
| Type 2 diabetes | Disease | Present | Candidate MONDO match |
| Type 1 diabetes | Disease | Present | Comparison track |
| Rheumatoid arthritis | Disease | Present | Anti-TNF comparison track |
| Insulin resistance | Phenotype | Present | Core D-01 sink |

## Explicitly deferred (not added in A2.3)

| Entity | Why deferred |
| --- | --- |
| FFAR2 / GPR43, FFAR3 / GPR41 | Useful SCFA receptors, not named in the KG-01 example list; add after curator agreement |
| Generic “regulatory T cells” umbrella | Foxp3+ and Tr1-like nodes already cover the slice language without collapsing subtypes |
| CHEBI / UBERON exact IDs on new nodes | Needs ontology cache import + human review (KG-02); candidate label matches only |

## How nodes were added

`research/domain-graph/expansion.v1.json` now carries an `entities[]` seed. `buildDomainGraph` registers those names as candidate concepts with kinds and domains and does **not** invent mechanism edges for them.

## Done when

- [x] Checklist exists for D-01 vs published graph
- [x] Missing KG-01 example tissues and distinct SCFA metabolites exist as candidate nodes
- [ ] Ontology IDs reviewed and written to `mappings.v1.json` (KG-02; out of this PR)
