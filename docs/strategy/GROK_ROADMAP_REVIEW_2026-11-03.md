# Assessment of the supplied Grok roadmap and competitor analysis

Inputs: user-supplied `HSI_ROADMAP.md` (version 1.0, 3 November 2026) and
`Competitor Analysis_ Aksh Health and Immune Super Intelligence.pdf`.
This is an assessment of those documents against the checked-out implementation,
not an independent verification of every competitor or data-access claim. Their
[V] labels describe their author's verification, not verification performed here.
The referenced `HSI_BUILD_SPEC.md` was not supplied in this upload.

## Recommendation

Prioritise a bounded ISI context-mismatch checker for RA evidence as the next
research product slice. Retain Aksh and ISI interfaces and databases, using the
shared HSI technology already extracted. Treat clinical timeline linkage, trial
screening, omics and wet-lab validation as distinct later projects with their own
access, intended-use and validation requirements.

The valuable near-term output is a reproducible evidence-review dossier: exact
source passages, context tags, reasons for mismatch/uncertainty, human corrections
and versioned evaluation results. It should support the target/biomarker review
workflow, rather than claim parity with a multimodal AI drug-discovery platform.

## Adopt as engineering priorities

1. **Context at the claim/passage level.** Record species, tissue/sample, model or
   setting, intervention, outcome and timepoint with quoted support. Distinguish
   multiple contexts within a paper. Missing information stays unknown; a mention
   of human RA does not make every experiment a human-synovium experiment.
2. **Independent labels and adjudication.** Start with the proposed 200 RA
   abstracts, stratified by context and passage-use permission. Two independent
   expert annotations plus adjudication are a useful protocol; no labels or
   inter-annotator agreement are claimed to exist yet.
3. **Frozen evaluation split.** Corrections may enter a governed training pool or
   evaluation pool, with a recorded assignment. A held-out evaluation example must
   not also train that release. Split duplicate publications/studies together and
   version the guideline, rule/model release and adjudicated gold set.
4. **Error and abstention reporting.** Report per-field precision/recall/F1,
   coverage, unknown/mixed-context outcomes and dangerous false matches. Treat
   85% accuracy and 40% time reduction as proposed targets, not observed results.
   Add uncertainty intervals and comparison to a simple baseline.
5. **Reviewer utility study.** Use a prespecified, counterbalanced comparison with
   manual triage. Measure time and error together; faster review with more false
   human-tissue matches is not a successful outcome.
6. **Correction provenance.** Keep actor, reason, source span and release history.
   Workflow acceptance remains separate from evidence curation and scientific
   support. This builds on the implemented role gates, private SQL checkpoints,
   audit rows and review/dossier service.

## Tighten or reverify

| Document statement | Treatment |
| --- | --- |
| “Nobody we found offers … context” / “the only product” | Search-bounded hypotheses. Do not publish categorical exclusivity without a defined comparison and reproducible evidence. |
| Competitor graph sizes, revenues, partnerships and UK availability | Vendor/third-party claims requiring exact URLs, retrieval dates and scope. Domain-only citations are insufficient for an audited competitive assertion. |
| Owkin, Immunai and NVIDIA classified as partners | Potential ecosystem fits, not signed partnerships. Some may also compete in particular workflows. |
| “No patient data, so no DCB0129 or MHRA burden” | Intended use and actual functionality still need assessment; data absence alone is not a universal exemption. Avoid blanket compliance badges or a generic “DTAC passed” claim. |
| UK Biobank/CPRD pricing, application windows, dataset IDs and licences | Recheck with current custodians before budgeting, downloading, redistributing or contracting. Open access is not blanket reuse permission. |
| Every correction becomes training and evaluation data | Replace with the governed split above to avoid evaluation leakage and rights problems. |
| Three pilots/LOIs, revenue and patient-count gates | Commercial planning assumptions, not engineering readiness metrics or established traction. |
| A 90-day Aksh maintenance/freeze policy | Strategic proposal only. It is not applied automatically from an attachment, and it does not cancel existing authorised Aksh work. |

## Relationship to the current step 4

The two-paper RA/anti-TNF import protocol tests source identity, passage rights,
provenance and the difference between serology-response evidence and treatment
efficacy. It is not the proposed 200-abstract context benchmark. Current pipeline
checks do not establish species/tissue-tagging accuracy, reviewer time savings,
customer demand or biological validity.

The current product corpus adapters deliberately leave unknown context fields
unset. The RA evidence release remains unavailable until primary-source import
succeeds. After that, the useful next acceptance milestone is annotation guidance,
a rights-cleared stratified benchmark and reproducible baseline results—not
invented gold labels, a new agent count or an automatic scientific approval.
