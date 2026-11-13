# HSI — next implementation phases after the 13 November 2026 audit (revision 2)

**Status:** Proposed execution roadmap; no runtime or scientific approval.
**Baseline:** `main` at `2bce6154f690fcbbaf836291766d971f3b29e5ce` (13 November 2026, after PRs #303–#306). Revision 1 was written against `4166111`.
**Governing doctrine:** [HSI_VISION.md](HSI_VISION.md). Four independently governed experiences: Aksh Health, HSI Clinical, ISI Scientific Discovery, HSI Trials. HSI Core is the shared evidence/AI/knowledge/governance foundation. Nothing here deletes or redefines those boundaries.
**Audit evidence:** [13 November production and product audit](../audits/2026-11-13/HSI_PRODUCT_LAUNCH_AUDIT.md), [capability register](../STATUS.md), [implementation-to-acceptance reconciliation](../audits/HSI_IMPLEMENTATION_TRUTH_AND_NEXT_PRS.md).
**Historical roadmaps:** [HSI_PRODUCT_ROADMAP.md](HSI_PRODUCT_ROADMAP.md) and [HSI_NEXT_BUILD_PHASES_2026-11-06.md](HSI_NEXT_BUILD_PHASES_2026-11-06.md) hold target-state detail, not live acceptance. This roadmap sequences *remaining work*; it adds no new architecture document, agent framework or milestone matrix.

## What changed in revision 2

1. **Domain-independence is the organising principle.** The primary research experience is AI-assisted biological mechanism investigation across domains. Evidence comparison, contradiction detection, gaps, hypotheses and verification are integrated steps inside it, not separate products. SSc and RA are historical validation cases only.
2. **Cross-domain validation moves forward.** One cross-domain question (microbial metabolites, immune signalling, metabolism) runs right after the first real investigation, and the first expert tranche is the 20 cross-domain benchmark slots, instead of waiting for all 120 cases.
3. **Defects were verified rather than assumed.** The legacy literature routes were broken in production; the cause was confirmed from runtime logs, not inferred. P0-02 therefore changes from "gate egress" to "repair, then remove remaining browser egress".
4. **Several items are already delivered** (next section), and the open-PR backlog is resolved.

## Delivered since revision 1 (all merged to `main` with required CI green)

| PR | Delivered | Evidence |
| --- | --- | --- |
| #303 | Three legacy routes (`scientific-pubmed`, `scientific-abstract`, `scientific-investigation-trace`) now export `{fetch}`; public `/api/research/health` no longer returns Neon endpoint prefixes; handler-shape test; read-only `scripts/probe-deploy.ts` | Production runtime logs showed bare-function handlers invoked Node-style (`request.url` relative, `new URL` threw; non-GET timed out at 30 s). Probe against production: 9 of 9 pass after the merge |
| #304 | Scheduled production probe workflow (every 30 min, on push to main, on demand); Home example now hands a validated `?question=` to the Investigation page | Playwright `product-experience` passes, including a URL-carried-question test. One added Home sentence still needs scientific copy review |
| #305 | `lookupReactomePathwaysForUniProt`: a question that names a protein can start from pathways. Extends the existing adapter with shared helpers; output stays unreviewed, non-promotable and `listed_by_provider_not_context_specific` | Offline tests; endpoint contract checked once by hand |
| #306 | `src/investigationScope.ts`: one registry (`ssc`, `ra`, `gut-immune-metabolic`) replaces the `"ssc"\|"ra"` union and three copies of the disease mapping across the audit engine, archive, review and outcome binding. Reviewer authority is **not** widened: a scope with no accepted reviewer scope can be audited and archived but human review is denied | Existing audit and archive tests pass unchanged (hashes stable); new cross-domain runner test |

Backlog: 34 stale open PRs were closed after per-PR review (25 were already ancestors of `main`; 9 were superseded or conflicting). Findings from those reviews are carried into the phases below. Only this PR remains open.

## Non-negotiable product framing

HSI is an evidence-grounded intelligence ecosystem for interconnected human biology, scientific research, clinical context and translation. The **knowledge graph is shared infrastructure**; the **three AI research roles** (Research Orchestrator, Evidence & Context Investigator, Independent Evidence Verifier) are bounded services; **Context-Conflict Audit is an integrated analysis step, not the product**. Maintain a cross-domain exemplar such as *microbial metabolites → immunometabolic signalling → neuroinflammation*, with every proposed edge marked unvalidated until independently supported.

No live CDS, diagnosis, prescribing, automated trial eligibility, autonomous discovery or identifiable patient information in the HSI research graph. Aksh, Clinical, ISI and Trials keep separately governed storage and authority. **No Silent Promotion:** automated extraction, model agreement, an audit verdict and a reviewed brief are not approved graph knowledge. Held migrations 022–030 stay held unless approved per exact scope.

## Current implementation vs accepted outcome

| Surface | Implemented engineering | Remaining evidence / constraint |
| --- | --- | --- |
| Public website | Ten canonical public pages; demonstrations; Home hands a question to Investigate | Delivered access-request route; manual UX; copy review |
| AI | Bounded orchestrator and entailment-checker contracts. **No model executes in the product path** | Approved model deployment, real receipts, a runner that composes search, extraction and verification |
| Evidence | Metadata adapters (Europe PMC, Open Targets, ClinicalTrials.gov, UniProt, Reactome incl. entity→pathway); open-access abstract retrieval | Open-access **section** extraction, rights-cleared passages. Current real corpus is 5 sources / 7 claims / 0 release-eligible |
| Audit engine | Domain-independent at engine level (#306) | Saved review packages are still keyed by one disease; reviewer authority exists only for `ssc`, `ra` |
| Graph | Version-pinned candidate graph (153 concepts / 131 relationships, unreviewed) | Reviewed edges = 0; unreviewed edges still appear in path views |
| Persistence | Neon staging schema, RLS policy and isolation-test code are merged | Migrations 022–030 held; no accepted two-account staging evidence; writes disabled in production |
| Benchmark | 120 authoring slots (50 core / 30 disease / 20 cross-domain / 20 governance), blind-curation scaffolding | Real cases, two independent experts plus adjudication, floors, vault |
| Operations | Durable reference worker; production probe | Real alerts, restore, rollback, 14-day soak, shared rate limiter, signed release |
| Four-product interoperability | Logical contracts; read-only evidence consume paths | No clinical or patient-data bridge; each live capability needs scoped acceptance |

Register baseline: **13 implemented / 23 partial / 2 stub** of 38 capabilities; these are code classifications, not readiness, accuracy or a percentage of the vision. Do not edit generated `docs/STATUS.md` by hand.

## Implementation gates and order

| Phase | State | Real deliverable | Dependency | Exit evidence (retain) |
| --- | --- | --- | --- | --- |
| **P0 — Honest public experience and control boundary** | Mostly delivered (#303, #304) | Remaining: delivered access request; remove browser-side Europe PMC (`ScienceLiterature.tsx`) and Reactome (`BiomedicalMetadataPanel.tsx`) calls in favour of the governed route; shared rate limiter and 5xx alerting | Privacy owner for the enquiry; source-policy owner | Delivered receipt or truthful non-submission; zero prohibited egress; probe green |
| **P1 — Domain-independent core** | Engine scope delivered (#306) | Scope id in the saved review-package context (schema version bump) so audits bind to a package for any registered scope; generic `/api/research/investigations` routes with `/graph/ssc` and `/discovery/ssc` kept as aliases; question and domain choice replace SSc defaults | None for code; **human decisions** for the database items below | Same runner and routes execute two unlike scopes; SSc/RA fixtures and hashes unchanged |
| **P2 — First real investigations (two)** | Fixture mode can start now | One runner: governed retrieval, open-access section extraction, schema-validated model extraction, entailment verifier, durable job execution, single-researcher persistence. Runs (1) an SSc technical regression and (2) the cross-domain question, using the entity→pathway step | Approved source terms and model deployment for live mode; durable-job decision (a 30 s function limit rules out in-request execution) | Every material claim traced to a passage (sha256, licence); replay of recorded model output gives an identical audit hash; empty search reported as missing, not negative; failure ledger |
| **P3 — Early cross-domain validation and expert tranche** | Preparation now; scoring needs experts | Founder-authored development set (not counted in the 120); first expert tranche = the 20 cross-domain slots (gut-immune, neuroimmune, metabolic-immune, immune-fibrosis), two blinded experts plus adjudication; baselines: manual literature workflow and a frontier model given the same papers | Appointed experts, vault, confidentiality and conflict controls | Eight 0–5 dimensions plus separate provenance and safety hard gates; all failures and abstentions retained. The remaining 100 cases proceed only if the tranche discriminates |
| **P4 — Trusted multi-researcher staging (Next-A + Next-B)** | Runs in parallel with P2; **required before more than one researcher** | Source-policy and provider composition with current receipts; two real accounts in different scopes, isolation, revocation, export, concurrency, rollback; a corrected database authorization audit for the final role model (runtime role `NOLOGIN`, `EXECUTE`-only on `SECURITY DEFINER` functions, no direct table grants) | Approved isolated staging branch, two researchers, independent reviewer, security signer | Actual HTTP and RLS evidence per scope; held migrations applied only to an isolated preview branch, per exact scope |
| **P5 — Operational pilot gate** | After P2–P4 | Distributed workers, rights and retraction invalidation, quotas, cost cap, on-call, restore, kill switch, controlled small cohort | Named operators, budget, cohort | Worker restart and uncertain-operation reconciliation; real alert acknowledgement; 14-day soak; signed exact artifact; invitation-only pilot |
| **P6 — Scale domains and governed interoperability** | After an accepted pilot | More rights-cleared domain packs with domain SMEs; read-only ISI ↔ HSI and Trials registry interfaces; Clinical/Aksh remain concept interfaces | Per-domain owners and acceptance; no PHI bridge in `hsi-core` | Per-domain independently scored validation; contract tests with no identifier escape; association is not causation |
| **P7 — Continuous evidence learning** | Controlled, after P5 | Correction/retraction propagation, re-review of dependent claims, real usefulness studies, optional planner only after a preregistered comparison | Source refresh authority, reviewers, failure ledger | Immutable version history; no automatic promotion |

**Parallelism:** P1 code, P2 fixture mode, P3 preparation and P4 runner preparation can proceed together. Live source and model requests, expert scoring, protected migrations and cross-product activation are never implied by finishing code.

### Human-held decisions surfaced by the PR reviews (resolve before any held migration is applied)

| Decision | Finding | Recommendation |
| --- | --- | --- |
| Reviewer scope list | Held migration 027 rejects any review scope outside `('ssc','ra')`; `appendIndependentContradictionReview` takes `scope: "ssc"\|"ra"`; `HSI_REVIEWER_SCOPES` is `["ssc","ra"]` | Replace literal lists with a scope-registry lookup before the hold is lifted; widen reviewer authority only through separate acceptance |
| One investigation store | Six investigation-related tables: `hsi_research_investigation_runs` (004), `hsi_interrogative_investigations` (007), `hsi_investigation_graph_contexts` (014), `hsi_investigation_revision_links` (015), `hsi_scientific_investigation_records` (022, held), `hsi_live_investigations` (030, held) | Choose one canonical store before 022 or 030 is applied |
| One identity-binding model | 027 verifies the session inside `SECURITY DEFINER` functions and trusts no session setting; 030 binds the owner with a server-set `hsi.live_owner_id` | Prefer the 027 model; rework 030 to match |
| Durable job runner | In-request execution is capped at 30 s | Decide between a database job table with a consumer and a managed durable-workflow service; verify current platform documentation first |
| Model and source approvals | No model or live source call is approved | Named source-policy owner and terms; approved model deployment id and terms; public text only, no PHI |

### Immediate executable backlog (smallest PRs)

| ID | Change set (reuse existing code) | Tests / proof | Human-held input |
| --- | --- | --- | --- |
| **HSI-P0-01** | Replace the undelivered "Request Research Access" promise with an accurate interim action, then a privacy-reviewed, spam-controlled, idempotent intake with acknowledged notification | Browser confirmation and error paths, replay and abuse, delivery proof | Recipient, owner, processing terms, retention |
| **HSI-P0-02b** | Remove direct browser calls to Europe PMC and Reactome; route through one governed server path with quotas. (The legacy `scientific-*` routes are already repaired in #303) | No-egress tests; payload, redirect, time and budget bounds | Source-policy owner and metadata terms |
| **HSI-P1-B** | Add a scope id to the saved review-package context (schema version bump); bind audits to it; keep `diseaseScope` serialisation compatible for existing hashes | Existing archive and outcome tests unchanged; cross-domain package round trip | None to merge; database change waits for the held-migration decision |
| **HSI-P1-C** | Generic investigation routes with question and domain choice; keep `/graph/ssc` and `/discovery/ssc` as aliases | Route, deep-link, reload and unknown-scope tests | None |
| **HSI-P2-01** | Investigation runner CLI and library: `search`, `authorizePassage`, `extract`, `verify`, `append` wired to existing retrieval, open-access, entailment and file-store modules; **fixture mode first** | Recorded-model replay gives an identical audit hash; passage trace for every claim; substring-span rule downgrades unsupported claims | Live mode: source terms, model deployment, scientist review of the cross-domain question |
| **HSI-P2-02** | Open-access full-text **section** extraction (methods, results) replacing first-abstract-paragraph only | Bounded parser tests; unsafe XML, size and licence fail-closed tests | None |
| **HSI-P3-01** | Founder-authored development set (two questions per layer, not in the 120) and runner evaluation arms | No leakage into the vault; arms reproducible | Vault location, rubric |
| **HSI-P3-02** | Expert tranche for the 20 cross-domain slots with blinding and adjudication; baselines | Two blinded labels plus adjudication; contamination checks | Named experts, budget, conflict declarations |
| **HSI-P4-01** | Corrected database authorization audit on the shared read-only client for the final role model | Unit tests plus live evidence from an isolated preview branch | Staging branch, security signer |
| **HSI-P4-02** | Two-scope HTTP and RLS evidence runner (Next-B) | Wrong owner or scope, forged setting, self-review, revoked session, cross-pool and concurrent replay denials | Staging URI, two researchers, reviewer, signer |
| **HSI-P5-01** | Hosted worker reliability, shared rate limiter, alerts, restore, release packet | Real alert, restore and rollback; 14-day soak | Operators, budget, cohort |

### Research experience continuity: target acceptance question

> How might gut microbial metabolites influence immune signalling, metabolic dysregulation and neuroinflammatory responses?

This is the **cross-domain reference narrative**, not a claim of an established causal chain or a source-verified answer. For one supported question a researcher should be able to: formulate scope → review source policy and permitted evidence → move from entities to pathways and typed context-bound mechanisms across domains → compare apparently conflicting findings (including not comparable and unknown) → inspect sources and gaps → generate explicitly unvalidated hypotheses → obtain a bounded independent AI challenge → export or reopen an immutable version → request an independent human decision. A rejected or inconclusive decision stays in audit history; only a separate approved publication can change the approved graph. SSc and RA are reported separately as regression and benchmark cases.

### Per-phase evidence envelope

Every release claim must specify **commit SHA, deployment artifact, host, branch and scope, runtime configuration reference, dataset and source version, current licence and action status, pseudonymous participants, test outcomes with denominators, the independent decision or signature, and observed limitations**. Keep secrets, user identities, licensed passages and blind gold in approved private stores. Classify separately: *code implemented*, *deployment accepted*, *source rights accepted*, *scientific quality accepted*, *operational pilot accepted*, *cross-product integration accepted*. No one status upgrades another.

### Stop/go and explicit deferrals

- **Public demonstration GO** only with truthful synthetic labels, verified navigation and calls to action, responsive and accessible UI, no unapproved source egress, and a green production probe.
- **Live research NO-GO** until P2 live mode is approved and accepted; **multi-researcher NO-GO** until P4 evidence exists.
- **Scientific claims NO-GO** until protected expert-adjudicated results and hard gates are accepted.
- **Invite-only pilot NO-GO** until the operational release packet, soak and independent signatures are complete.
- **Clinical, PHI and automatic eligibility NO-GO** in `hsi-core`.
- Do **not** add another agent marketplace or framework, a new universal graph database, a self-approval mechanism, invented gold, an unsupported accuracy score, or a claim of automatic discovery. Do not add new architecture or milestone documents until one real investigation has run.

## First change to implement

Start **P2 fixture mode (HSI-P2-01 and HSI-P2-02)** together with **HSI-P1-B**: they need no approval, they make the engine execute end to end, and they give the cross-domain question a real path. In parallel, request the human-held inputs (source terms, model deployment, experts, staging branch), because live mode, the expert tranche and multi-researcher staging cannot start without them.
