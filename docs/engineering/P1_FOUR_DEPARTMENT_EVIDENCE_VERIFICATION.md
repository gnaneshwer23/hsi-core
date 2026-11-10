# P1 — Evidence and Research Workflow Verification

Status: **audit contracts implemented; live verification not completed**.

## Required evidence for each department
| Department | First source checks | Required scientific verification |
| --- | --- | --- |
| Immunology | UniProt, Reactome, human immune-cell evidence | Species/tissue/cell state, provenance and human review |
| Microbiome | Curated microbial taxonomy and functional/metabolite sources | Taxon-to-function distinction, strain context, association vs mechanism |
| Neurobiology | Brain cell atlases, neural pathway literature | Brain region, neural cell type, developmental and disease context |
| Metabolism | Curated metabolic pathway and metabolomics resources | Tissue, physiological state, metabolic intervention and time context |

## Implementation sequence
1. Run live UniProt and Reactome verification with an approved network-enabled environment; store provider responses, timestamps, identifiers, version and redacted logs.
2. Verify browser network/CORS behavior and implement governed server-side adapters for production.
3. Use a test researcher account to complete authenticated search -> evidence retrieval -> graph traversal -> draft proposal -> independent review queue; record trace IDs.
4. Extend ontology and source adapters to Microbiome, Neurobiology and Metabolism without fabricating evidence or inferring causality from co-occurrence.
5. Audit cross-domain paths (gut–immune–brain–metabolic axis) with source-level context and explicit missing-edge states.
6. Perform independent scientific review; report errors and abstentions with denominators.

## Automated readiness contract
`assessDepartmentEvidenceReadiness` lists missing evidence by department. Its input flags are caller-supplied and **do not constitute trusted attestations**. The function always returns `scientificallyValidated:false`. A trusted authenticated approval service is a separate requirement.

## Release decision
Development GO; staging CONDITIONAL; scientifically validated production NO-GO until all gates have independent evidence.
