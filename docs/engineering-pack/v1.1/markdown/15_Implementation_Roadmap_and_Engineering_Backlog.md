---
title: "15. Implementation Roadmap and Engineering Backlog"
subtitle: "HSI Engineering Specification Pack v1.1"
---

**Version:** 1.1, 16 November 2026 · **Owner:** Dr Gnaneshwer Jadav · **Repo baseline:** `hsi-core@43da794`

# 1. Decision summary

- **24 weeks to a paid-pilot decision**, assuming one full-time engineer plus the founder as product owner and first scientific reviewer. Estimates are planning ranges, not commitments.
- **Order:** make the live product trustworthy → make it save → make the evidence reliable → prove accuracy → ship the first reviewed slice → pilot.
- **The critical path is persistence and people,** not code: an independent database reviewer and two external expert reviewers must be found by week 4.
- **This plan merges** the repo's N1 to N8 plan (6 November), the P0 to P7 plan (13 November) and the product phases (15 November) into one sequence. Where they conflicted, this plan chooses.

# 2. Phases

| Phase | Weeks | Goal | Exit criteria |
| --- | --- | --- | --- |
| **0. Trustworthy live product** | 1 to 2 | The live site and Ask are safe to show to researchers | Shared rate limits; kill switch; spend caps; error tracking and alerts; working access request; register reconciled; browser-side provider calls removed |
| **1. Persistence foundation** | 2 to 7 | A researcher's work is saved on the server and isolated | ADR-011 to 014 merged; consolidation migration reviewed independently and applied; isolation suite green on staging; ledger, gaps, topics and investigations saved server-side |
| **2. Durable, grounded runs** | 4 to 10 | Investigations run as jobs over permitted full text with independent verification | Job table and worker live; section extraction; model extraction with passage offsets; two-provider verifier; replay harness; free-text Ask with entity confirmation |
| **3. Reliable evidence for slice one** | 5 to 12 | Every source behind the first slice is clean | Rights policy signed; all sources identity-verified, rights-decided, retraction-checked; slice entities in the graph with ontology IDs; predicate list enforced |
| **4. Proof of accuracy** | 6 to 14 | Measured, published verification quality | Calibration tranche with kappa reported; ≥ 50 adjudicated cases scored against approved floors; `/benchmark` live |
| **5. First reviewed slice and brief v2** | 10 to 16 | The product's core claim becomes true | 40 to 60 cross-domain edges reviewed by 2 experts and released; brief v2; reviewed versus candidate styling; homepage worked conflict from reviewed data |
| **6. Pilot** | 16 to 24 | Real researchers use it weekly; one commercial signal | 8 researchers invited; 5 weekly active; usability findings closed; 14-day soak; blinded usefulness study run; 1 signed letter of intent |

Phases overlap because the engineer can build phase 2 while waiting for reviewers in phases 1 and 4.

# 3. Ordered backlog

Effort: S = up to 2 days, M = 3 to 5 days, L = 1 to 2 weeks. "Needs" lists blocking items or owner inputs.

## Phase 0 (weeks 1 to 2)

| Order | ID | Item | Effort | Needs |
| --- | --- | --- | --- | --- |
| 1 | SEC-02 | Kill switch; provider spend caps recorded | S | Owner sets caps |
| 2 | SEC-01 | Shared rate limiter for Ask and research routes | M | D-111 |
| 3 | OPS-01 | Error tracking and log drain | S | D-120 |
| 4 | OPS-02 | Four alerts | S | OPS-01 |
| 5 | AG-01 | Reconcile capability register and site copy | S | |
| 6 | ING-01 | Remove browser-side provider calls | M | |
| 7 | UX-02, API-06 | Working access request | M | |
| 8 | SEC-04 | CSP report review, then enforce | S | Two weeks of reports |
| 9 | D-110 | Repository visibility decision | – | Owner |

## Phase 1 (weeks 2 to 7)

| Order | ID | Item | Effort | Needs |
| --- | --- | --- | --- | --- |
| 10 | ARCH-10 | ADR-011 to ADR-017 written and signed | M | Owner |
| 11 | DB-01 | Consolidation migration (ADR-012, 013, 014) and backfill | L | ARCH-10 |
| 12 | ARCH-14 | Scope registry | M | DB-01 |
| 13 | DB-02, QA-01 | Two-account isolation suite in CI | L | DB-01 |
| 14 | DB-03 | Independent database and auth review | – | D-80, named reviewer |
| 15 | DB-04 | Apply to production behind a flag | S | DB-03 |
| 16 | API-04, DB-05, WB-01 | Ledger, gaps, topics, investigations server-side | L | DB-04 |
| 17 | SEC-05 | Promotion constraint in the database | S | DB-01 |
| 18 | SEC-08 | Privacy notice, export and deletion | M | DB-04 |
| 19 | DB-06, OPS-05 | Restore drill | S | DB-04 |

## Phase 2 (weeks 4 to 10)

| Order | ID | Item | Effort | Needs |
| --- | --- | --- | --- | --- |
| 20 | ARCH-11, OPS-03 | Job table, worker and host | L | D-10 |
| 21 | ARCH-12, API-02, WB-02 | Runs as jobs; 202 + polling; reload-safe UI | L | ARCH-11 |
| 22 | ING-04 | Open-access section extraction | M | |
| 23 | AG-03 | Model extraction with passage offsets | L | ING-04, D-40 |
| 24 | AG-04, VER-01 | Two-provider verifier with exact-quote validation | L | D-11 |
| 25 | QA-02 | Run replay harness | M | ARCH-11 |
| 26 | AG-05 | Context comparability in live path | M | |
| 27 | AG-07 | Budgets in configuration | S | |
| 28 | AG-09, QA-03 | Injection canaries | M | AG-03 |
| 29 | AG-06, WB-03 | Free-text Ask with entity confirmation | L | KG-02 |
| 30 | AG-08 | "How this was produced" trace | M | ARCH-11 |

## Phase 3 (weeks 5 to 12)

| Order | ID | Item | Effort | Needs |
| --- | --- | --- | --- | --- |
| 31 | ING-03 | Rights policy v1 enforced | M | D-30, owner signs |
| 32 | ING-02 | N1 verification queue | M | |
| 33 | ING-05 | Retraction checks via Crossref | M | |
| 34 | ING-06 | Study-family grouping | M | |
| 35 | KG-01 | Missing slice entities as nodes | S | D-01 |
| 36 | KG-02 | Apply reviewed ontology mappings | M | Owner reviews sheet |
| 37 | KG-04 | Controlled predicate list | M | |
| 38 | KG-06 | Graph source of truth in Postgres | L | DB-04 |
| 39 | ING-09 | Clean corpus for slice one | M | ING-02 to ING-06 |

## Phase 4 (weeks 6 to 14)

| Order | ID | Item | Effort | Needs |
| --- | --- | --- | --- | --- |
| 40 | VER-05 | Label vault | S | |
| 41 | VER-02 | Founder development set | – | Owner |
| 42 | VER-03 | Calibration tranche, kappa | – | D-50, 2 reviewers |
| 43 | D-51 | Floors approved before scoring | – | Owner |
| 44 | VER-04, QA-04 | ≥ 50 cases scored; release gate wired | M | VER-01, VER-03 |
| 45 | UX-03 | `/benchmark` and `/compare` | M | VER-04 |

## Phase 5 (weeks 10 to 16)

| Order | ID | Item | Effort | Needs |
| --- | --- | --- | --- | --- |
| 46 | VER-06, WB-06, API-05 | Reviewer queue UI and API | L | DB-04 |
| 47 | KG-05 | Context completion in the reviewer form | M | VER-06 |
| 48 | KG-07 | Graph release process | M | KG-06 |
| 49 | KG-08 | First reviewed cross-domain slice released | – | Reviewers, KG-07 |
| 50 | KG-03 | Conflict classification slices 2 and 3 | M | |
| 50a | KG-10 | Cross-disease comparison view | M | KG-03 |
| 51 | WB-04, UX-06 | Reviewed versus candidate styling | M | |
| 52 | WB-05 | Brief v2 | M | KG-08 |
| 53 | UX-01 | Homepage worked conflict from reviewed data | S | KG-08 |
| 54 | VER-07 | Server-side hypothesis ledger with outcomes | M | DB-04 |
| 55 | KG-09 | Retraction propagation | M | ING-05 |

## Phase 6 (weeks 16 to 24)

| Order | ID | Item | Effort | Needs |
| --- | --- | --- | --- | --- |
| 56 | OPS-04, OPS-08 | Staging acceptance and 14-day soak | M | |
| 57 | QA-05 | Load test | M | |
| 58 | UX-08, QA-07 | 5 usability sessions; fixes | L | Recruited researchers |
| 59 | WB-07, UX-05 | Route and legacy clean-up | M | |
| 60 | UX-04 | Token consolidation | L | |
| 61 | VER-08 | Blinded usefulness study (N6) | – | 3 experts |
| 62 | CLN-01, CLN-02 | Translational section and registry snapshots | M | |
| 63 | QA-06 | Release evidence automation | S | |

# 4. Things not to build in the next 24 weeks

Clinical plane with real data, team workspaces, payments, the community feed, HELIX mechanism chains, specialised model adapters, mobile apps, new departments at reviewed depth, more strategy documents.

# 5. Definition of done (every item)

1. Code merged to `main` with all required checks green.
2. Tests for the behaviour, including the failure path.
3. The API contract (OpenAPI) and data dictionary updated where touched.
4. Capability register updated if the item changes what HSI can do; `docs/STATUS.md` regenerated.
5. Security review recorded where the item touches auth, data access, models or rights.
6. Monitoring or a log event for anything that runs in production.
7. Release notes entry; rollback steps for migrations.
8. Product acceptance by the owner, against the item's acceptance criteria.

# 6. Owner-held inputs by week

| By week | Owner provides |
| --- | --- |
| 1 | Provider spend caps; repository visibility decision; D-01 slice boundaries confirmed |
| 2 | ADR sign-offs; model provider choice; worker host choice |
| 4 | Named independent database reviewer; named reviewers for immunology, metabolism and gut microbiome |
| 5 | Rights policy signed; ontology mapping sheet reviewed |
| 6 | Benchmark floors approved; development set authored |
| 12 | 8 pilot researchers recruited |
| 16 | Pilot terms and pricing hypothesis |

# 7. Future roadmap (after the pilot decision)

| Horizon | Theme |
| --- | --- |
| Months 7 to 9 | Autoimmune comparison slice (RA, MS, IBD); MCP server and public read API; team workspaces; email digests |
| Months 10 to 12 | SLE and neuro-immune slices; publisher full-text agreement; prospective hypothesis ledger published |
| Year 2 | Multi-omics evidence and experiment ledger; clinical plane only if a data partner and all ADR-0010 gates are in place; specialised model adapters under benchmark |
