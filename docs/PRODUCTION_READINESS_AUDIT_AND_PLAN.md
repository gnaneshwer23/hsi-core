# HSI production-readiness audit and end-to-end plan

Audited 14 November 2026 against `main` at `4222139` (after #353 and #337). Labels: **[RAN]** I executed it today, **[LIVE]** probed read-only on the production site today, **[CODE]** read in the repository, **[DOC]** documented only, **[NV]** not verified. This replaces nothing; it updates the 13 November independent audit and the implementation-truth ledger (`operations/production-delivery/implementation-truth.v1.json`). It is not legal, clinical-safety or regulatory advice.

**Definition used here.** "Production ready" means: a named group of real researchers can use HSI on real public evidence, with their work stored safely, with every material output traceable and reviewable, with measured and published error rates, with someone on call. It does **not** mean scientifically validated, clinically usable or open to the public. The repository's honesty flags stay as they are: `scientificallyValidatedClaimed:false`, `writesEnabled:false`.

---

## 1. Audit

### 1.1 What is solid
- **[RAN]** `bun run test`: 2,209 pass, 1 skip, 0 fail across 358 files. `bun run check` passes. Playwright: 280 pass. `bun audit`: no vulnerabilities. (Plain `bun test` also collects Playwright specs and reports 41 spurious errors; use `bun run test`.)
- **[CODE]** About 135k lines in `src`, 25k in `site/src`, 32 migrations. CI runs secret scan, status-consistency, site build, type checks, audit, e2e and a post-deploy probe.
- **[LIVE]** The three legacy literature routes that returned 500 on 13 November now answer bad input with 400 and wrong method with 405; `/api/research/health` no longer exposes endpoint identifiers; protected research routes return 401; the production probe passes 9 of 9.
- **[LIVE]** Security headers present: HSTS (one year), `nosniff`, `X-Frame-Options: DENY`, referrer and permissions policies. `/api/*` is noindex. Sampled public pages contain none of the four governed product names.
- **[CODE]** Governance is real: `scientificApproval:false` and `graphPromotable:false` everywhere, ten held migrations (022 to 031), signed source-clearance receipts, append-only digest-chained records, no PHI in the repository.

### 1.2 What changed since 13 November
Landed on `main`: department projections and cross-department traversal (#344, #345); deterministic agent binding for PARALLAX, VANTAGE and HELIX with model interpretation off (#346); device-local investigation saving (#347); ontology licence audit (#348); hash-pinned import of Mondo, Uberon, Cell Ontology, GO and ECO with 23 of 153 concepts given **unreviewed** candidate mappings, plus a device-local curator page (#349, #350 via #353); held migration 031 for shared storage (#351); public name fixes (#337). Open: #352 (benchmark v1.1 proposal) and #335 (stale, conflicting; recommend closing).

### 1.3 What is still not real
| Gap | Evidence |
|---|---|
| No model runs anywhere in the product path | **[CODE]** no LLM SDK in `package.json`; entailment checker takes an injected runner and has never run against a real model; HELIX model step disabled |
| Real evidence is tiny and unreviewed | **[CODE]** 5 sources, 7 claims, 8 passages, **0 eligible claims**; 153-concept graph is `not_curated`; 0 reviewed ontology mappings |
| Benchmark has no cases | **[CODE]** 120 allocated slots, `adjudicatedCaseCount:0`, no experts, no floors |
| Nothing is stored for users | **[LIVE]** `writesEnabled:false`; **[CODE]** all saves are browser-local; shared storage is held SQL never run on any database |
| The health check does not test the database | **[LIVE]** `databaseConnectionTested:false` |
| Live retrieval has never run | **[DOC]** runbook step 0 items (signed policy, KMS key, terms, model deployments, reviewers) are all human-held |
| No monitoring or on-call evidence | **[CODE]** no error-tracking, analytics or tracing dependency; pilot monitoring is local reference code |
| Authenticated flows untested with real accounts | **[NV]** I did not sign in |

### 1.4 Findings to fix (engineering, no approvals needed)
1. **No Content-Security-Policy.** Report-only policy proposed in #355 (zero violations on 29 built routes); enforce after real-traffic observation. Also decide `includeSubDomains` and `preload` for HSTS. **[LIVE]**
2. **Tool pages share one title** (fixed in #356: 46 of 99 routes had it) ("Research Tools & Account Access"), e.g. `/research/ontology-review`. Give each a distinct title for tab, history and screen-reader users. **[LIVE]**
3. **404 is plain text.** Fixed in #356 and verified on its Vercel preview (404 status, noindex). **[LIVE]**
4. **`bun test` at the repo root collects Playwright specs.** Fixed in #357. **[RAN]**
5. **Two copies of the identifier heuristic** and a duplicated key-value store: merged in #357. **[CODE]**
6. **Stale branches and PRs**: about 60 unmerged remote branches in tiers B to D, and #335. Close or salvage (`docs/atlas/*` exists only on #335). **[DOC]**
7. **Ontology term tables are not in the repository** (gitignored cache); a new machine cannot use the mappings without a 275 MB download. Publish the hashed tables as a release asset or document the one-command rebuild in onboarding. **[CODE]**
8. ~~Mapping decisions are not checked against a changed candidate file~~ **Corrected:** the review page verifies stored decisions on load and flags a recommendation whose term is no longer a candidate. No change needed. **[CODE]**
9. **Health endpoint**: add an authenticated, internal-only database probe; keep the public one boring. **[LIVE]**

---

## 2. The plan

Ordering principle: **the long pole is people, not code.** Source policy, security signing, model deployments, reviewers and case authors are all human-held and have no dates I can invent. Start them in parallel on day one; engineering work below runs while they happen.

### Gates (what "ready" means, in order)
| Gate | Means | Signed by | Exit evidence |
|---|---|---|---|
| **G0 Hardened preview** | Public site is safe, fast, accurate, honest | Engineering | CSP enforced, titles and 404 fixed, CI green, probe green, a11y clean |
| **G1 Persistence accepted** | Researcher work is stored, isolated, recoverable | Independent security signer | Two real accounts, forged-owner, self-review, wrong-scope, export, concurrency and revocation checks executed on a disposable Neon branch; backup and restore drill; per-scope migration packet |
| **G2 Live evidence accepted** | Real public sources, cleared and traceable | Source-policy owner | Signed policy, pinned provider and KMS key, one real investigation within budget, retraction handling confirmed, redacted receipts |
| **G3 Intelligence accepted** | A model does the extraction and a different model challenges it, on real text | Scientific lead | Extraction and verification on cleared open-access passages, quote-must-be-substring enforced, failures retained, context breakdown shown per stratum |
| **G4 Benchmark published** | We know our error rate | Scientific lead plus external adjudicators | Pre-registered protocol hash, authored and adjudicated cases, equal-budget comparison, failures published |
| **G5 Operations accepted** | Someone is on call and it recovers | Named operations owner | 14-day soak, alert delivery acknowledged, restore and rollback drills, kill switch drill, RPO and RTO stated |
| **G6 Invite-only pilot** | First external users | You, with signed release | Exact-artifact release, onboarding, support route, feedback loop, per-brief human review |

### Workstream A: Hardened preview (G0). Engineering only. Size M.
1. Fix findings 1 to 9 above, each as its own small PR.
2. Add a performance budget (main bundle is 198 KB gzipped today) and Lighthouse or equivalent to CI; fail on regressions.
3. Add Playwright check that every noindex tool page has a unique title.
4. Close #335 after salvaging docs; clean stale branches (user-approved batches, as before).
5. Update the capability register and STATUS so the department, agent-binding, ontology and curator work are listed with accurate levels (implemented, device-local, unreviewed).

### Workstream B: Persistence (G1). Needs human decisions first. Size L.
1. **Decide**: whether to proceed with migration 031 and the `hsi_graph_runtime` role design (SELECT and INSERT only).
2. **Create** a disposable Neon child branch using the `HSI_NEON_STAGING_*` pins (never the production branch, never another product's project).
3. **Rehearse** 022 to 031 on it with `db/verify/*`; review rollback comments; fix the known held owner-setting weakness before any activation.
4. **Build** the verified-session server step that sets the owner identity inside the transaction; without it the policies match nothing (fails closed).
5. **Build** adapters: investigation store, curator decisions, ontology release and term loader, each against the same `KeyValueStore`-style interface so the UI does not change.
6. **Run** the real-account acceptance runner: two researchers, one independent reviewer, every access, revocation, forged-setting, self-review, wrong-scope, export and concurrency case executed and signed.
7. **Backups**: enable point-in-time recovery, run a restore drill, record RPO.
8. **Activate one scope at a time**, each with its own signed packet; keep `writesEnabled:false` until the first scope is accepted.
9. **Privacy for accounts**: researcher email and activity is personal data. Before real users: privacy notice, data-processing terms with Neon and Vercel, retention and deletion policy, and a records-of-processing entry. This needs your or counsel's sign-off, not mine.

### Workstream C: Live evidence (G2). Human-held first. Size M.
1. Appoint the **source-policy owner**; sign the clearance policy; sign off Europe PMC and Crossref terms (and confirm retraction behaviour live).
2. Appoint the **security signer**; provision the managed signing key (Ed25519, public key pinned, no private key in repo or process).
3. Run `scripts/rehearse-live.ts`, then the preflight, then **one** real investigation with a small hard budget and a human reading the output. Keep every failure and empty search.
4. Add the remaining adapters only after the first run is reviewed.

### Workstream D: Intelligence (G3). Size L. Starts after C step 3.
1. **Extraction**: a passage-to-structured-evidence step (species, tissue, cell state, assay, estimand, direction) using one approved model deployment; deterministic validators reject anything not traceable to a passage.
2. **Verification**: a second, independent deployment challenges each claim; the quote must be a substring of the passage or the claim downgrades to insufficient.
3. **Wire the context-conflict audit** into a governed API route and generalise it beyond SSc and RA (it currently hard-codes those two disease scopes). Keep the five-class output; never call polarity alone a contradiction.
4. **Break down every edge by context** in the UI and exports: species and model, tissue, patient subset, direction, replication count, contradicting count, retraction status. No blended score. (The decomposition scorer in #352 defines the objective test.)
5. **Failed translation as a first-class relationship** (preclinical result versus human outcome), coded with the `translation_pair` profile.
6. **Agents**: make HELIX model-backed interpretation optional and off by default; every model output stays a candidate; proposals still cannot publish.
7. **Ontology**: curator-reviewed mappings stored through the Workstream B adapter; only reviewed `exact` mappings enter the registry; add ChEBI subset and NCBITaxon after licence confirmation; HPO stays out unless you decide otherwise.
8. **Hypothesis ledger**: frozen, hash-chained, resolve-by-dated, scored only against pre-registered criteria; unresolved counts reported.

### Workstream E: Benchmark and claims (G4). Human-heavy. Size L.
1. Approve or amend the v1.1 proposal (#352); approve the dispute rule and quality floors **before** authoring.
2. Appoint conflict-declared expert authors and adjudicators; set up the access-controlled vault and custody.
3. Author the 120 final cases plus a separate development set, including real failed translations and pooled-claim decompositions; split by publication family.
4. Hash-lock the protocol, then run the locked equal-budget comparison (deterministic, single verifier, dual verifier). Decide separately whether to run an external-baseline arm.
5. Publish results with denominators, intervals and **failures**. Until this exists, no accuracy statement appears anywhere.

### Workstream F: Operations (G5). Size M. Needs named owners.
1. Add error tracking, uptime and alerting with a real destination; define SLOs for availability and latency; add a status page.
2. Per-user and global request and cost caps; kill switch for live retrieval and model calls; budget alarms.
3. Incident runbook, on-call rota, restore and rollback drills, secret-rotation drill.
4. Run the 14-day soak against the exact artifact and keep the evidence.
5. Dependency, secret and licence scanning stay in CI; add a scheduled re-run of the source-rights and retraction re-review.

### Workstream G: Pilot (G6). Size M.
1. Signed release of the exact artifact; invite-only cohort and cap.
2. Lead with the measured error rate and evidence-per-context, not with the name or agent count. First users: autoimmune researchers and foundations (a go-to-market choice; the substrate stays cross-domain per `HSI_VISION.md`).
3. Onboarding, support route, feedback capture; every material brief and any graph promotion gets independent human review.
4. Post-pilot review feeds the next source or domain increment (NEXT-G), one at a time.

### Regulatory and safety, in order of when they bite
- **Now**: no PHI, no clinical claims, no patient-facing use. Keep it that way in copy and code (`CDS_PHI_BOUNDARY.md`).
- **Before real accounts**: UK GDPR basics for researcher data (Workstream B step 9).
- **Before any clinical, patient-data or NHS-integrated use**: this is a different product line (Aksh Health, HSI Clinical, HSI Trials) with its own data-protection impact assessment, NHS security requirements, and a medical-device classification review. None of that is in scope for this plan.

---

## 3. Critical path and parallel tracks

```
Day 0, in parallel (people):   appoint source-policy owner, security signer, model owner,
                               scientific lead, SME authors, adjudicators, operations owner
Engineering, in parallel:      A (hardening) -> B steps 1-5 (rehearsal, adapters) -> D steps 3-4, 7-8 (no model needed)
Gated by people:               C (needs signer + policy) -> D steps 1-2, 6 (needs model deployments)
                               E (needs authors) ; B steps 6-9 (needs independent signer)
After G1 + G2 + G3:            F soak -> G pilot
After E:                       any accuracy claim
```

What I can do without anyone: all of Workstream A, B steps 2 (once you approve) to 5, D steps 3 to 5, 7 (code) and 8, and the engineering half of F. What only people can supply: the appointments, signatures, keys, model contracts, real accounts, expert labels, on-call, and the 14 days.

## 4. What to stop
More public pages, more agent names, more contract-only modules, and any new "capability" that cannot name its acceptance evidence. Each new row in the register should name the gate it advances.

## 5. Risks
- **Sequencing risk**: starting the pilot before G1 to G3 would expose unreviewed output to real users. Mitigation: gates are signed, not self-declared.
- **Self-benchmark bias**: pre-register, blind-score, external adjudicators, publish failures.
- **Vendor dependence**: provider transport is pinned and provider-agnostic; keep at least two approved deployments.
- **Scope creep across products**: keep Aksh Health, HSI Clinical and HSI Trials out of hsi-core.
- **Human bottleneck**: if the appointments slip, G2 to G5 slip; nothing in code can substitute.
- **Unverified competitor claims** behind the #352 rationale: verify before using them in any external material.

## 6. Not verified in this audit
Authenticated flows; Vercel project and environment settings; Neon state or ledger; real database connectivity; Lighthouse scores; accessibility beyond the automated axe scans; legal and regulatory positions; competitor facts.
