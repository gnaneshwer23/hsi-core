# HSI — next implementation phases after the 13 November 2026 audit

**Status:** Proposed execution roadmap; no runtime or scientific approval.
**Baseline:** `main` at `4166111a9b6c1cd9c97ed5957ee2e1ec5adb3e56` (13 November 2026).
**Governing doctrine:** [HSI_VISION.md](HSI_VISION.md). Four independently governed experiences: Aksh Health, HSI Clinical, ISI Scientific Discovery, HSI Trials. HSI Core is the shared evidence/AI/knowledge/governance foundation.
**Audit evidence:** [13 November production and product audit](../audits/2026-11-13/HSI_PRODUCT_LAUNCH_AUDIT.md), [capability register](../STATUS.md), [implementation-to-acceptance reconciliation](../audits/HSI_IMPLEMENTATION_TRUTH_AND_NEXT_PRS.md).
**Historical roadmaps:** [HSI_PRODUCT_ROADMAP.md](HSI_PRODUCT_ROADMAP.md) and [HSI_NEXT_BUILD_PHASES_2026-11-06.md](HSI_NEXT_BUILD_PHASES_2026-11-06.md). These contain target-state detail but should not be interpreted as live acceptance. This roadmap sequences *remaining work*, not additional unrelated agent/architecture phases.

## Non-negotiable product framing

HSI is an evidence-grounded intelligence ecosystem for interconnected human biology, scientific research, clinical context and translation. The **knowledge graph is shared infrastructure**, the **three AI research roles** (Research Orchestrator, Evidence & Context Investigator, Independent Evidence Verifier) are bounded services, and **Context-Conflict Audit is one flagship workflow**. SSc/RA/SLE are useful evaluation cases but **not the homepage default, the product boundary or the only future source packs**. Maintain a separate cross-domain exemplar such as *microbial metabolites → immunometabolic signalling → neuroinflammation*, with every proposed edge explicitly marked unvalidated until independently supported.

No live CDS, diagnosis, prescribing, automated trial eligibility, autonomous discovery or identifiable patient information in the HSI research graph. Aksh, Clinical, ISI and Trials retain separately governed storage and authority. **No Silent Promotion:** automated extraction, model agreement, an audit verdict and a reviewed brief are not automatically approved graph knowledge.

## Current implementation vs accepted outcome

| Surface | Implemented engineering | Remaining evidence / constraint |
| --- | --- | --- |
| Public website | Ten canonical public pages; PRs #291–#297; demonstration and research-brief components | Delivered access-request route, coherent cross-domain example handoffs, exact live deployment checks, manual UX |
| Graph | Version-pinned graph across Home/Science/workspace (#298), global/local navigation (#300) | Richer governed multi-domain source coverage; real evidence permissions and review; graph is not causal proof |
| Research audits | Five-class context/comparability tooling; immutable reference audit archive and scoped review (#299) | Approved hosted persistence; real two-researcher isolation; approved source/model execution and independent reviewers |
| AI | Bounded three-role orchestration, context investigator and verifier contracts | Approved two deployments, source rights, real receipts, locked adjudicated scientific assessment |
| Benchmark | 120 authoring slots (50 core / 30 disease / 20 cross-domain / 20 governance) and private curation scaffolding (#290) | Real source-cleared final cases, two independent experts + adjudication, accepted rubric/floors, locked gold and private vault |
| Operations | Durable local/reference worker, releases and fault-test infrastructure | Real alerts/on-call, actual restore/rollback, 14-day staging soak and exact-artifact independent release signature |
| Four-product interoperability | Logical contracts and some read-only evidence consume paths | No broad clinical or patient-data bridge; all cross-product live capabilities require separate scoped acceptance |

As of the baseline register: **13 implemented / 23 partial / 2 stub** of 38 tracked capabilities. These are code classifications, **not** readiness, scientific accuracy or a percentage of the master vision. Held migrations 022–030 remain held unless independently approved per exact scope. Do not edit generated `docs/STATUS.md` manually.

## Implementation gates and order

| Phase | Priority / state | Real deliverable | Dependency | Exit evidence (must be retained) |
| --- | --- | --- | --- | --- |
| **P0 — Honest public experience and control-boundary repair** | Now; engineering can proceed | Fix undelivered research-access promise; gate legacy literature/public source egress; preserve question/snapshot/context across public demonstrations; update truthful maturity copy | Privacy owner for delivered enquiry; independent source policy for external requests | Real delivered receipt or truthful non-submission; zero prohibited egress; route/CTA and provenance regressions; no invented scientific example |
| **P1 — Trusted staging foundation (NEXT-A + NEXT-B)** | Now; live execution blocked until approvals | Source-policy and provider composition with current receipts; separate real-account scope/isolation/migration/rollback acceptance | Approved clearance authority/owner + terms; two named *deployment references*; approved isolated staging URL; two researchers in different scopes, independent reviewer and security signer | Signed current source/provider records and redacted execution receipts; actual two-scope HTTP/RLS/identity/revocation/export/concurrency/rollback results; all held migrations still governed |
| **P2 — One authentic research journey (NEXT-C)** | After applicable P1 acceptance | Question → rights-cleared evidence → entity/context map → mechanism and five-class conflict audit → gaps and candidate hypothesis → independent AI challenge → immutable research brief → separate human review → reopen/export | Approved production-capable persistence and scoped authority; permitted scientific packs; P1 | One immutable investigation and review identity across routes, source passages/version/permissions attached to material claims; empty/failed searches visible; reviewer cannot approve own work; no graph promotion from brief approval |
| **P3 — Scientific reliability and expert evaluation (NEXT-D + NEXT-E)** | Expert planning in parallel; locked execution after P2 and gold | Appoint expert panel and restricted workspace; two blinded independent labels + adjudication on 120 final cases; preregister threshold floors; run current/one-verifier/two-verifier equal-evidence and equal-budget comparisons | Actual experts, confidentiality/COI, budget and vault; permitted source packets, approved models, P1/P2 | Signed freeze and contamination controls; eight 0–5 dimension results (retrieval, mechanism, context, conflict, explanation, uncertainty, gap, brief) + separate provenance/safety hard gates; all failures, uncertainty, subgroup denominators and abstentions retained |
| **P4 — Operational pilot gate (NEXT-F)** | After P1–P3 | Distributed durable workers, current rights/retraction invalidation, quotas, cost cap, on-call alerts, disaster recovery, controlled small researcher cohort | Named operators/security signer, approved budget/load/cohort, acceptance artifacts | Demonstrated worker restart and uncertain-operation reconciliation; real alert acknowledgement, restore/rollback/kill switch, 14-day soak, signed exact artifact + config; invitation-only pilot, no autonomous approved graph promotion |
| **P5 — Cross-domain systems biology (NEXT-G increment 1)** | After accepted pilot; preparatory ontology/tool work now | Independently permissioned microbiome–immune–metabolic–neuroimmune and molecular source packs, graph traversals, context-conditioned questions, evidence provenance and versioned re-review | P4 + a new source/domain owner, independently reviewed gold and scientific acceptance for each expansion | Demonstrated cross-domain question → source/context/uncertainty → reviewed brief, with per-domain limitations and independently scored validation; preserve association ≠ causation |
| **P6 — Governed four-product interoperability** | After scoped scientific and product-specific acceptance | Independent read-only/least-privilege contract pilots: ISI ↔ HSI evidence; Trials registry metadata → research; proposed Clinical/Aksh concept interfaces remain separate | Separate product owners, access/consent/legal/privacy/security review; no PHI bridge in `hsi-core` | Contract tests with no identifier/PHI escape, auditability, freshness, permission denials and explicit unavailable statuses; no trial eligibility or clinical advice claim |
| **P7 — Continuous evidence learning and research utility** | After P4, incremental and controlled | Versioned correction/retraction propagation, re-evaluation of dependent claims, real researcher task and usefulness studies; optional planner only after preregistered comparison | Source refresh authority, reviewer availability and observed failure ledger | Re-review on evidence changes, immutable version history, independent usefulness and failure reporting; no automatic promotion or universal intelligence claim |

**Parallelism:** P0 UI/egress hardening, P1 runner preparation, expert recruitment *materials*, ontology design and cross-domain synthetic QA may proceed together. Live source/provider requests, actual independent benchmark assessment, protected migrations and cross-product clinical activation cannot be inferred from completing these coding tasks.

### Immediate executable backlog (reviewable, smallest PRs)

| ID | Change set; avoid duplicate architecture | Tests / proof | Human-held input |
| --- | --- | --- | --- |
| **HSI-P0-01** | Replace non-delivered “Request Research Access” promise with an accurate interim action; then add a minimal privacy-reviewed, spam-controlled, idempotent intake/outbox/acknowledged notification flow | Browser confirmation/error + replay/abuse/notification failure and inbox delivery proof | Approved recipient, owner, processing terms, retention, monitored reporting channel |
| **HSI-P0-02** | Inventory and restrict legacy `scientific-pubmed`, `scientific-abstract`, `scientific-investigation-trace` and client-side Europe PMC access to explicitly approved action policies; preserve metadata-only paths only when authorised | Denial/no-egress tests, payload/redirect/time/budget bounds, current source rights and source-version handling | Source-policy owner and approved metadata/passage terms |
| **HSI-P0-03** | Preserve selected question/domain/snapshot/graph edge and example brief through Home → Science → Research; replace SSc-only global defaults with question/domain choice while keeping existing SSc/RA fixtures | Deep link, keyboard/390px, reload, context mismatch and empty-source tests | Scientific copy review; no invented linked claims |
| **HSI-P0-04** | Reconcile 34 historical open PRs cited by the 13 Nov audit against current main; close superseded only after per-PR ancestry/diff and owner review; align dated status and route documentation | Diff/evidence ledger and no accidental regression | Maintainer review; no batch merges |
| **HSI-P1-A** | Finish disabled-by-default Next-A connector/receipt smoke harness against *approved* source and two model deployments | Correct failure/withdrawal/unknown-cost behaviour on exact approved runtime | Source/provider service IDs, permissions, model IDs, terms and signed references |
| **HSI-P1-B** | Finish isolated Next-B per-scope HTTP + real Neon RLS/session/rollback evidence runner; maintain nine held-migration policy until separately accepted | Wrong owner/scope, forged setting, self-review, revoked session, cross-pool and concurrent replay denials | Approved staging URI/config and two researchers, reviewer, security signer |
| **HSI-P2-01** | Replace reference SQLite-only audit archive with a host-appropriate restricted store under independently reviewed authority; reuse existing immutable schema/receipts, no new graph source of truth | Crash/replay/concurrency/reopen/export tests and actual scoped staging proof | Approved database project/branch/role and per-scope migrations |
| **HSI-P2-02** | Integrate one governed investigation UI and output contract from evidence through human decision; include cross-domain demonstration separately | Source-to-sentence trace, context, missingness, reviewer separation, re-review/export | P1 and authorised scientist/reviewer; source packs |
| **HSI-P3-01** | Deploy protected expert case curation only when appointed; author, blind, adjudicate and freeze final corpus; retain existing 120-slot harness | No leakage, no peer-view, no label reuse, family split/contamination tests | Named expert panel, private vault, budget, COI, rubric |
| **HSI-P3-02** | Run reproducible bounded evaluation with explicit comparison arms and failure ledger | Real protected run receipts + independent signed metrics, ablations and abstention calibration | Accepted gold, providers, model/science owners |
| **HSI-P4-01** | Complete hosted worker reliability, on-call and controlled release packet | Real alert/restore/rollback/14-day soak, accepted cohort and exact artifact | Ops and security signer, approved cost/load |
| **HSI-P5-01** | Add one rights-cleared cross-domain source/context slice after pilot; do not declare all six domains covered | Domain-reviewed source assertions and cross-domain question audit | Domain SME, source policy and new evaluation cases |

### Research experience continuity: target acceptance question

> How might gut microbial metabolites influence immune signalling, metabolic dysregulation and neuroinflammatory responses?

This is the **cross-domain reference narrative**, not a claim of an established causal chain or a currently source-verified answer. Its candidate relationships must be independently evaluated. Keep SSc, RA and SLE as separately reported regression/benchmark cases rather than a platform-wide default.

For one supported question, a researcher should be able to: formulate scope → review source policy and permitted evidence → follow typed context-bound mechanisms across domains → compare apparently conflicting findings (including not comparable/unknown) → inspect sources and gaps → generate explicitly unvalidated hypotheses → obtain bounded independent AI challenge → export/reopen immutable version → request a genuinely independent human decision. A rejected/inconclusive decision stays in audit history; only separately approved publication can change the approved graph.

### Per-phase evidence envelope

Every release claim must specify **commit SHA, deployment artifact, host/branch/scope, runtime configuration reference, dataset/source version, current licence/action status, participant pseudo-identities, recorded test outcomes and denominators, independent decision/signature and observed limitations**. Keep secrets, real user identities, licensed restricted passages and blind benchmark gold in approved private stores, not Git or public screenshots. Classify separately: *code implemented*, *deployment accepted*, *source rights accepted*, *scientific quality accepted*, *operational pilot accepted*, *cross-product integration accepted*. No one status upgrades another.

### Stop/go and explicit deferrals

- **Public demonstration GO** only with truthful synthetic labels, verified navigation/CTA, responsive/accessible UI and no unapproved source egress. It may be marketed as a research preview, not a validated clinical/scientific engine.
- **Live research NO-GO** until Next-A, Next-B, production-capable persistence, scoped reviewer authority and a rights-cleared complete journey are independently accepted.
- **Scientific claims NO-GO** until protected expert-adjudicated benchmark and hard-gate results are accepted.
- **Invite-only pilot NO-GO** until operational release packet, soak and independent signatures are complete.
- **Clinical/PHI/automatic eligibility NO-GO** in `hsi-core`; any later product programme needs a separate governance decision.
- Do **not** add another agent marketplace, new universal graph database, self-approval mechanism, invented gold, unsupported accuracy score, or claim of automatic discovery.

## First change to implement

**P0-02 is the highest immediate safety/control dependency for expanding research use.** Preserve available metadata-only capabilities where authorised, but remove inconsistent external source egress before enabling new real retrieval. In parallel, ship P0-01's honest access copy immediately and appoint real service owners. After that, compose approved Next-A/B staging and a single complete source-grounded investigation. Do not open another redesign-only phase as a substitute for accepting the real scientific work.
