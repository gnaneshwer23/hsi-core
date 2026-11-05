# Human Super Intelligence: phased delivery plan

**Baseline:** [5 November build audit](../audits/HSI_BUILD_AUDIT_2026-11-05.md), revision `e022d8e`. These **Delivery phases A–H** sequence remaining work; they do not renumber or erase historical ARCH/P0/P1 milestones. This is a build plan, not a statement that proposed features have shipped.

## Delivery objective

A translational researcher can ask a bounded question, inspect source-grounded evidence and graph context, save and reopen an investigation, export a reproducible draft brief, and submit it to an independently authorized scientific reviewer. Aksh and ISI reuse shared technology through versioned contracts while keeping their own interfaces and databases.

## Operational prerequisite: protected access

**Current status: blocked and explicitly paused by the founder.** Before live protected testing, verify the configured Neon Auth endpoint and HSI database refer to the intended branch/database, confirm the verified provider user/session is visible, and provision separate researcher and reviewer grants through the trusted backend. Confirm writes remain denied unless the existing environment/branch safeguards allow them. Use an approved non-production environment for write acceptance; do not migrate or modify production as part of this plan.

**Exit evidence:** both identities authenticate; unauthenticated/ungranted access fails; researcher and reviewer receive only their permitted access; diagnostics and logs expose no tokens. A health endpoint alone does not satisfy this prerequisite. Local contract/UI work below can proceed while this task is paused; live workflow acceptance cannot.

## Build sequence and acceptance

| Phase | Build/reuse | Acceptance evidence | Dependencies |
| --- | --- | --- | --- |
| **A — Connected investigation workspace** | Add trusted create/list APIs over existing investigation services/stores. Connect question entry, evidence selection, save, reopen and a user's investigation list. Remove manual ID entry as the primary journey. | Authorized researcher creates a draft and reloads the same persisted record. Invalid inputs fail; another researcher cannot read/write it. No client-supplied roles/owners. | Local work starts now; live acceptance requires access prerequisite. |
| **B — Evidence and source readiness** | Curate one bounded RA/SSc research corpus using existing import/verification structures. Record allowed usage, canonical IDs, passages, disease/cohort/assay context and release versions. | Each included claim links to inspectable supporting evidence; unsupported or unresolved material stays explicitly draft/excluded. Rights and scientific review are recorded by accountable humans. | Can run alongside A; cleared release needed for approved outputs. |
| **C — Connected graph and mechanism reasoning** | Wire existing governed graph reads, mechanism dossier builder and RA/SSc comparison into the saved investigation. Keep context/source boundaries and explicit uncertainty. | Question → evidence → graph relationship → original source is navigable. Saved results reference a fixed release. Opposing contexts remain distinguishable; no cross-disease transfer or invented causal claim. Scope/permission failures fail closed. | A; B supplies source quality. |
| **D — Briefs and independent review** | Bind draft exports to persisted investigation, evidence IDs, release/version/hash, methods and limitations. Connect submission, reviewer queue/history and revision workflow using existing services. | Downloaded brief reproduces the saved record. A separate reviewer records a durable decision; self-review and unauthorized decisions fail. Revisions preserve prior evidence/decisions and require defined resubmission. Gate C stays separate. | A–C plus operational prerequisite and reviewer provisioning. |
| **E — Bounded AI with scientific evaluation** | Add model assistance only where it improves the evaluated deterministic baseline: question interpretation, source-grounded synthesis and candidate explanation. Reuse execution/checkpoint contracts where needed. | Versioned SME-labelled set covers supported, unsupported, conflicting, wrong-context and insufficient-evidence cases. Report citation correctness, unsupported claims, abstention, latency and cost. SMEs agree thresholds before release; no automatic scientific approval. | B–D; domain reviewers required. |
| **F — Shared technology acceptance in Aksh and ISI** | Verify/adapt the already present modules and versioned artifact contracts. Pin versions/provenance, activate only each product's authorized local schema/roles, and test consumption. | The same approved research artifact is interpreted consistently in each product; schema mismatch/stale/unsigned-as-applicable artifacts are refused according to contract. No patient database sharing or implicit role transfer. Product builds and smoke tests recorded. | Approved artifact from B–D; can audit contract parity earlier. |
| **G — Carefully broaden research coverage** | Add further indications, labs/lifestyle research context and trial-registry relevance in small validated packs. Reuse ontology/unit/context contracts. | Each pack passes the same source, graph, export, permission and scientific checks. Missing data are explicit. Trial relevance remains preliminary research screening, never confirmed eligibility. Expand toward 20 conditions only after repeatable quality is demonstrated. | D–F; new source rights and SME capacity for each pack. |
| **H — Production research pilot** | Harden the accepted workflow: observability/redaction, rate/abuse limits, deployment rollback, backup/restore drills, dependency controls, performance/accessibility and operational ownership. | A real research team completes the full workflow on the approved environment; role/tenant isolation, restore/rollback and operational response are demonstrated. Pilot data terms and approved claims are signed off. | A–F for the bounded pilot; G only for included indications. |

## First implementation work package

**Phase E implementation update — 5 November:** [Bounded assistance and scientific evaluation](../PHASE_E_BOUNDED_AI_AND_SCIENTIFIC_EVALUATION.md) implements the verified deterministic source baseline and versioned offline comparison/label/threshold contracts. Engineering fixtures cover six categories. Rights-cleared SME labels, agreed thresholds, model improvement and activation are pending; no scientific acceptance is claimed.

**Phase D implementation update — 5 November:** [Reproducible briefs and independent review](../PHASE_D_BRIEFS_AND_INDEPENDENT_REVIEW.md) adds context-bound exports, immutable submissions/decisions, a reviewer queue and linked revision/resubmission. Staging migration `015`, real identities and cleared evidence remain live-acceptance prerequisites; no publication is authorised.

**Phase C implementation update — 5 November:** [Connected evidence graph and mechanism context](../PHASE_C_CONNECTED_EVIDENCE_GRAPH.md) adds immutable release-bound investigation views, reused mechanism/comparison builders and pinned working-catalogue links. The new staging migration and live acceptance remain pending; human evidence gates are unchanged.

**Phase B implementation update — 5 November:** [Evidence/source readiness](../PHASE_B_EVIDENCE_AND_SOURCE_READINESS.md) now includes a reproducible, source-separated real-publication corpus, a source/passage/context inspector, fail-closed readiness and a human-review preparation packet. Source-rights attestation and scientific acceptance remain human/trusted-backend gates; zero candidates have been promoted.

**5 November implementation update:** [Phase A is implemented and locally verified](../PHASE_A_INVESTIGATION_WORKSPACE.md), including create/list APIs, owned saved-investigation navigation and retry handling. Live database-backed acceptance remains pending the paused operational prerequisite; do not treat this update as a production-ready claim.

Start **Phase A**, with a narrowly scoped PR:

1. Define create/list request and response contracts and ownership rules around the existing save/load store.
2. Add same-origin authorized routes without relaxing email/session or branch-write safeguards.
3. Give the scientific workspace a question-to-draft action and saved investigations list; preserve loading, empty, denied and error states.
4. Add meaningful API/store/browser coverage for persistence and cross-user denial. Use clearly identified fixtures locally; do not invent production evidence.
5. Document the non-production smoke procedure, then run it when the paused access prerequisite is resolved.

**Definition of done:** a researcher can create, leave and reopen a persisted draft through the UI, with evidence/release references intact and unauthorized access denied. Do not call this live-complete until the database-backed smoke passes.

## Data replacement and launch boundaries

Replace fixture inputs through versioned ingestion contracts, not by overwriting UI labels: source records/passages and their usage rights; reviewed claims/relationships; ontology mappings; release manifests; authorized user/role grants; and product-local artifact configuration. Regenerate and revalidate dependent briefs/results. Replacing a fixture with real data does not itself establish scientific validity or launch approval.

Live PHI, EHR write-back, shared patient databases, diagnostic/treatment advice, and automated eligibility decisions require a separately governed clinical programme outside this hsi-core research delivery plan. Aksh retains clinical engines. Do not auto-approve Gate C or invent partnerships, licences or results. Enterprise vectors/workers/graph stores/on-prem deployments remain conditional on the [technology addition gates](HSI_TECHNOLOGY_STACK_AND_DEPLOYMENT.md).

## Verification note

Core tests (**599 passed**), both builds, seed validation (**88 edges / 8 LOINC links**) and the existing local site browser suite (**51 passed**) succeeded during this audit. Builds retain the warnings recorded in the audit. Local mocked/browser checks do not establish live authentication, persistence, scientific validity or product deployment readiness.
