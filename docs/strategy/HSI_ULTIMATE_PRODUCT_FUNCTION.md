# Human Super Intelligence: ultimate product function

Product direction adopted from the founder's 5 November 2026 specification and accompanying “HSI End Product: Frontend, Backend, Outcomes & Competitive Edge” note.

HSI should turn a health or biological question into a transparent, evidence-linked, human-reviewable research outcome. Health context, biological knowledge, scientific evidence, AI assistance and accountable human review contribute to that outcome. This defines the target product; it does not assert that every function is already operational.

The name is **Human Super Intelligence**. Aksh and ISI retain their own interfaces, databases and permissions while consuming shared research contracts and technology. HSI does not become a shared patient database.

## Acceptance map

| Product function | Implemented foundation | What remains before the full promise is usable |
| --- | --- | --- |
| Question understanding | Saved question, fixed SSc research-question planner, competing candidates and falsification questions | Evaluated semantic scope/population/context planning; more approved indication packs. A keyword scope screen is not semantic validation. |
| Data connection | Release-bound public/cleared research source context and product-owned artifact consumption contracts | Approved research connector contracts, provenance and context normalization. Clinical records, patient labs, wearables, microbiome and omics are not connected by the outcome view. |
| Entity resolution | Canonical namespace/identity and context contracts, captured graph entities | Curated concept coverage, ontology versioning, ambiguity tests and rights clearance. Listing Cell Ontology, Uberon, MONDO, HPO, GO, ChEBI, LOINC, RxNorm or SNOMED CT in a design is not proof of integrated/licensed coverage. |
| Knowledge-graph reasoning | Inspectable release-bound relationships, source dossiers and separate RA/SSc comparison | Evaluated context-aware traversal and competing mechanism interpretation. Shared graph patterns do not prove equivalent biology or causation. |
| Evidence retrieval | Pinned passages, catalogue pointers, source permissions and source/version/hash verification | Audited fresh retrieval, hybrid search and recall evaluation. The catalogue still needs human rights/scientific clearance. |
| Contradiction analysis | Separate supporting/opposing trace contracts, preserved biological context and explicit search gaps | Completed opposing-evidence searches and SME assessment across species, tissue, assay, disease stage, dose, timepoint and cohort. Empty opposing lists do not prove consensus. |
| Hypothesis generation | Stored unvalidated candidate statements and falsification questions | Evidence-grounded predictions, actual experimental designs and controls, model comparison against SME-labelled cases. No experiments are invented from a generic question template. |
| Claim verification | Source passage integrity, claim/source/context binding and guarded exports | Semantic entailment, relevance and scientific correctness evaluated against held-out expert labels. Hash integrity is not truth verification. |
| Human review | Independent, role-checked evidence-brief submission, review, revisions and audit contracts | Live two-account backend acceptance, provisioned reviewers, accountable scientific clearance and separate publication decisions. Accepting a brief does not approve every hypothesis. |
| Research brief | Backend-composed outcome with answer, source map, evidence, question tree, candidates, gaps, next research work, trial status, human review and JSON/Markdown export | Approved scientific inputs, complete task execution and evaluation before claiming an end-to-end scientific answer. |

The first connected implementation is documented in [Unified research outcome](../UNIFIED_RESEARCH_OUTCOME.md). Existing [Delivery A–H](HSI_PHASED_BUILD_PLAN.md) remain the delivery history; this specification refines their end-product acceptance, rather than declaring those gates passed.

## What the user should receive

The outcome should provide a plain-English answer, visual mechanism map, supporting and conflicting evidence, missing data, research question/decision tree, hypotheses, next experiments or measurements, preliminary trial relevance and an exportable brief. Every component must distinguish recorded work from work not performed.

Each scientific assertion needs its source and passage, relevance to the branch, evidence classification, limiting biological context and human review. Missing context stays missing. Uncalibrated confidence stays uncalibrated. “Not curated,” “no direct evidence identified in searched sources,” “AI draft” and “synthetic demo” have different meanings and must not be collapsed into “supported.”

The founder's persistent-inflammation/glycaemic-control example illustrates the desired workflow. Its low-fibre → microbiome → SCFA → barrier → immune → insulin-resistance chain is **not** an adopted scientific finding, a source-backed default answer, a diagnostic decision tree or a patient measurement order. The current SSc source context cannot establish a diabetes answer.

## Trust and evaluation

NIST AI RMF characteristics are design and evaluation goals: validity/reliability, safety, security/resilience, accountability/transparency, explainability/interpretability, privacy and fairness with harmful bias managed. HSI does not claim NIST certification, proven fairness, 100% accuracy or guaranteed scientific reliability from adopting this vocabulary.

References provided by the founder: [NIST AI RMF overview](https://airc.nist.gov/airmf-resources/airmf/0-ai-rmf-1-0/), [AI RMF 1.0](https://nvlpubs.nist.gov/nistpubs/ai/nist.ai.100-1.pdf), [FHIR/OMOP implementation guide](https://hl7.org/fhir/uv/omop/2025Sep/). These are design references, not implementation or conformity evidence.

The attachment's numerical citation/grounding/reliability targets are proposals, not measured results or approved launch thresholds. Expert-labelled, held-out evaluation, agreed metrics and failure analysis remain required. Competitor comparison text is positioning input, not independently verified superiority.

## Technology and clinical boundary

Keep the existing modular Vite/React, Bun and PostgreSQL implementation. FHIR/OMOP, ontology expansion, pgvector/Qdrant, Neo4j/Memgraph/AGE and model orchestration are options to evaluate against a demonstrated requirement, operating cost, source rights and testable acceptance. Their names in a technology table do not require an infrastructure rewrite.

No live CDS, patient store, EHR write-back or PHI-to-LLM is introduced into HSI. Aksh clinical functionality remains in its own product and governance plane. Future authorised, research-safe context must pass a defined data contract, permission and privacy review. Synthetic records are test inputs, never scientific evidence, and are labelled in provenance.

## Next work in order

1. Complete the paused environment/authentication alignment and live role/source isolation checks on approved staging, including migrations 014/015 only after operational authorization. Do not alter production as a shortcut.
2. Obtain accountable source-rights and scientific review for the bounded RA/SSc corpus; capture the approved release and exercise the whole two-account workflow.
3. Implement audited retrieval and branch-specific evidence assignment, with visible opposing evidence/context; evaluate semantic binding before enabling generated answers.
4. Run the SME-labelled baseline/model evaluation and agree release thresholds. Then add bounded, grounded synthesis and explicit experiments/controls.
5. Attach relevant registry snapshots to the same approved question/context; keep preliminary relevance separate from eligibility.
6. Expand one reviewed disease pack at a time and complete the Phase H live research-team/restore/rollback acceptance.

No change to the ultimate promise requires inventing results to populate empty output fields.
