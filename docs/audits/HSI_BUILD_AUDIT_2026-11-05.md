# Human Super Intelligence: build audit

**Date:** 5 November 2026. **Audited HSI revision:** `e022d8e`.

## Verdict

HSI has a substantial tested research foundation and multiple working public interfaces. It is **not yet a verified, connected research product or a production-ready clinical platform**. The next milestone is one complete, reproducible research investigation, with a separate reviewer, rather than another broad landing-page redesign or infrastructure rewrite.

This audit distinguishes source-code implementation, local verification and live evidence. It updates the current-state interpretation of older dated audits without rewriting their historical observations. HSI means **Human Super Intelligence**.

## Scope and evidence

Read-only inspection covered HSI routes, services, stores, evidence contracts, public research data, current strategy documents, and local Aksh/ISI integration files. Aksh and ISI were not independently deployed or fully retested in this audit. Their local files establish implementation presence, not current GitHub or production parity.

The reported live access failure comes from the user's diagnostic, not a fresh authenticated production test. Vercel/Neon administrative credentials are unavailable in this runtime. The founder has paused that configuration task; no secrets, grants, migrations or production data were changed.

| Area | What exists | Remaining gap / evidence limit |
| --- | --- | --- |
| Vision and architecture | Master PRD, architecture/data, intelligence-engine and UX companions; product-direction crosswalk; current technology/deployment profile | Proposed requirements are not implementation evidence. Enterprise deployment and clinical scope require separate acceptance. |
| Public product experience | Homepage, platform, technology, products, science and how-it-works routes; graph/path/evidence exploration and account screens | A coherent research workspace, user navigation and accessibility need acceptance across the complete journey. Public demos cannot substitute for protected workflows. |
| Authentication | Sign-in/up, same-origin gateway, session diagnostics, email verification and OTP handling | User supplied evidence confirms successful sign-in and email verification; research identity still fails against the configured database. No live protected-role acceptance established. |
| Research authorization | Backend verified identity, research grants, distinct scientific-reviewer authority, owner-scoped investigation reads | Provision and test two independent identities through the trusted backend. No signup-based role grants. Broader tenancy acceptance remains separate. |
| Research lifecycle | Investigation contracts/services, authenticated save/load store, decision workbench, submit/review services and history | Current Research API exposes account/history, SSc graph/discovery, load-by-ID, submission and decision. It does not expose investigation creation or listing. The scientific workbench asks for an existing ID. |
| Knowledge graph | Typed evidence contracts, public graph explorers, bounded authenticated SSc read service, provenance and release boundaries | Governed database graph reads have not been demonstrated live here. A public draft graph is not an approved database release. Link one research question to a persisted, source-grounded graph result. |
| Mechanism reasoning | `buildImmuneMechanismDossier`, context-aware traces, supporting/opposing evidence distinctions | Dossier builder is implemented but has no application call site in the audited `src`/`site/src` search. Current workbench projects draft traces separately. Wire and evaluate the authoritative path. |
| Cross-disease comparison | `compareSscRaEvidence` preserves RA/SSc disease context and avoids transferring conclusions | Builder has no application call site in the audited source search. Connect it deliberately to UI/API; shared predicates are comparison candidates, not biological equivalence. |
| Discovery | Deterministic governed graph screening and draft candidate UI | Flags gaps/context tensions; does not establish scientific contradiction, causality or a validated novel finding. Model-assisted discovery and its scientific evaluation remain additional work. |
| Sources and quality | Source registries, passage/verification structures, RA imports, ontology hints, evidence and release validation | SSc public graph explicitly has `reviewedByHuman=false` and `rightsCleared=false`. Approved source rights, passage support and accountable review are still release gates. Metadata/PMIDs alone do not prove a claim. |
| Briefs and exports | Existing public comparison can export a cited draft; versioned publish/artifact tooling exists | A protected investigation export bound to its saved evidence, graph release, methods and independent review is not yet connected end to end. Preserve draft labels on existing exports. |
| Aksh integration | Adapted HSI contracts/services, provenance files, research import/storage helpers, `/hsi` UI, migration `056` and integration tests in the local Aksh tree | This goes beyond links. Fresh build, product-database activation, artifact parity and a live product smoke test are not established by this audit. |
| ISI integration | HSI consume contract, remote/vendor artifact loader and review-aware boundaries | Confirm pinned versions, product-local migrations/roles and end-to-end artifact consumption. Keep ISI's own interface/database. |
| Clinical/trials breadth | Scoped timeline/FHIR-note and criteria demonstrations exist | No verified 20-condition longitudinal product, live EHR workflow, clinical recommendation system, or confirmed trial eligibility. A demonstration cannot support those launch claims. |
| Operations | Bun/TypeScript library, React/Vite frontend, Vercel adapters, Neon-oriented stores and migrations | Production restore drills, operational monitoring, rate/load acceptance and real-user pilot sign-off remain unproven. No need to introduce Kubernetes or replace the stack to close the current workflow gap. |

## Prioritized findings

1. **Release blocker — live research identity is unresolved (configuration work paused).** The last supplied diagnostic says `database_user_not_visible`, with Auth prefix `ep-hsi-staging` and database prefix `ep-hsi-production`. This is strong evidence to inspect branch/database alignment; prefix differences alone are not a universal proof of different branches. Do not weaken session checks or switch production credentials blindly. Confirm actual branch mapping and eligible session visibility before protected acceptance.
2. **High — researcher cannot start the protected lifecycle through the current API/UI.** Reuse `saveAuthenticatedInterrogativeInvestigation`; add authorized create/list and connect the UI. Tests of the save helper do not prove a usable product flow.
3. **High — scientific data acceptance is incomplete.** Current SSc public material is explicitly draft and rights-unconfirmed. Retain RA proof-point code, but require cleared sources, traceable passages and human review before approving a release or claiming scientific readiness.
4. **High — modules do not yet form one authoritative evidence journey.** Mechanism dossiers, source-separated comparison, persisted investigations and reproducible exports need integration. Existing public comparison exports are a different path.
5. **High — independent review is implemented but not proven live end to end.** Demonstrate researcher submission, a separately authorized reviewer, rejection of self-review, immutable decisions and revision behavior. Scientific approval must not silently grant publication/Gate C approval.
6. **Medium — shipping status is spread across dated documents.** Older GREEN/DONE labels describe narrower fixture/code milestones. Use this audit and the delivery plan for current product readiness; retain older reports as history.
7. **Medium — frontend build warnings need investigation.** The production build externalizes `node:crypto` imported from `src/interrogativeContracts.ts`; establish that browser paths do not invoke server-only hashing. Main JS is about 803 kB minified / 217 kB gzip, with a chunk-size warning. These are investigation items, not demonstrated runtime failures.

## Verification performed

- Core suite: **599 passed, 0 failed**, 120 files, 5,795 assertions.
- Core TypeScript build: passed.
- Site build, including Vercel API TypeScript check: passed, with the warnings above.
- Seed validation: passed for **88 edges and 8 claim-to-LOINC links**. These counts cover this validator's seed set, not all platform data.
- Existing site browser suite: **51 passed** using local Chromium and the production frontend build. Coverage includes public research/science UI and validation; it does not exercise real provider credentials or a live protected database lifecycle.

Checks ran locally without loading database credentials. No live database, production roles, provider login, partner licence clearance or production deployment was certified by these results.

## Next decision

Follow [the phased delivery plan](../strategy/HSI_PHASED_BUILD_PLAN.md). Start with connected investigation creation and persistence while the operational access task remains paused. Keep the existing RA proof point and use the current SSc workbench as a bounded workflow slice; expand disease coverage after the same acceptance contract succeeds.
