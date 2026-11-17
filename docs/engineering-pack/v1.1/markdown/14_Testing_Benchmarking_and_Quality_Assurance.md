---
title: "14. Testing, Benchmarking and Quality Assurance"
subtitle: "HSI Engineering Specification Pack v1.1"
---

**Version:** 1.1, 16 November 2026 · **Owner:** Dr Gnaneshwer Jadav · **Repo baseline:** `hsi-core@43da794`

# 1. Decision summary

- **Software tests are strong; scientific evidence is absent.** Roughly 2,400 unit test cases and 65 browser test files exist. Zero expert-adjudicated benchmark cases exist. Test counts prove nothing about scientific quality.
- **Add three test layers that are missing:** two-account isolation, replayable runs with recorded provider responses, and the scientific benchmark (document 06).
- **Release evidence is a file, not a feeling.** Each release stores test results, benchmark results, dataset versions and the release decision.

# 2. Where we are

| Layer | Status | Location |
| --- | --- | --- |
| Unit and integration tests | Built | 395 test files under `test/`, `bun test ./test` |
| Python parser tests | Built | `test/python`, `bun run ra:test-parser` |
| Browser end-to-end and accessibility | Built | 65 Playwright specs in `site/e2e`, axe checks |
| Lighthouse lab and bundle budgets | Built | CI job; `site/bundle-budget.json` |
| Generated status check | Built | `bun run status:check` fails on drift |
| Public copy check | Built | `bun run copy:check` blocks banned claims |
| Isolation (two-account) | Partial | Code exists (HSI-P4-02 runner); no accepted staging evidence |
| Replay of real runs | Not started | Fixture mode exists; recorded provider responses not stored per run |
| Prompt-injection canaries | Not started | AG-09 |
| Load tests | Not started | |
| Scientific benchmark | Not started (scaffold) | 120 slots, 0 cases |
| Usability tests | Not started | Plan drafted |

# 3. Test strategy

| Layer | What it proves | Runs when | Owner |
| --- | --- | --- | --- |
| Unit | Parsers, policies, context breakdown, scoring, rights rules | Every PR | Engineer |
| Integration | API handlers with a real Postgres branch; adapters with recorded responses | Every PR | Engineer |
| Isolation | No cross-owner or cross-scope access over HTTP and SQL | Every PR touching auth, API or DB; nightly on staging | Engineer, reviewed independently |
| Run replay | Same inputs and recorded responses produce byte-identical outputs | Every PR touching the runner | Engineer |
| End-to-end | Researcher journey, reviewer journey, public pages, axe | Every PR | Engineer |
| Adversarial AI | Injection canaries, context-shift traps, retracted sources | Every PR touching models or prompts | Engineer |
| Load | Rate limits hold; worker throughput; p95 latency | Before pilot; before each scale step | Engineer |
| Scientific benchmark | False-support, context-shift detection, citation validity, abstention | Every model or prompt change; every release | Owner + reviewers |
| Usability | Researchers complete the journey without help | Before pilot; quarterly | Owner |

# 4. Release evidence pack

Each release (`release-YYYY-MM-DD`) stores in `operations/releases/`:

- commit SHA, migration IDs applied, graph release ID
- CI run links and results
- benchmark report (cases, metrics against floors, version of labels)
- known issues and waivers, each signed by the owner
- release decision: go, go with conditions, or no-go

# 5. What to build next

| ID | Work | Acceptance criteria |
| --- | --- | --- |
| QA-01 | Isolation suite in CI against a Neon branch | Required check; all denial cases from DB-02 |
| QA-02 | Run replay harness | Recorded responses stored per run; replay test in CI |
| QA-03 | Injection canary set (AG-09) | 30 passages; zero instruction-following; zero schema escapes |
| QA-04 | Benchmark runner wired to releases | Report generated per release; release blocked if floors are not met |
| QA-05 | Load test | Ask and run endpoints at 10x expected pilot load; limits hold; no 5xx above 1% |
| QA-06 | Release evidence pack automation | `bun run release:evidence` writes the pack |
| QA-07 | Usability sessions (UX-08) | 5 sessions; findings triaged into the backlog |
| QA-08 | Flaky-test policy | Any test failing intermittently twice in a week is fixed or quarantined with an owner within 2 days |

# 6. Future options

- Mutation testing on the rights and promotion policies.
- A public status page showing benchmark history per release.
- Continuous evaluation on a sample of real runs, scored by reviewers weekly.

# 7. Open decisions

| ID | Decision | Recommendation |
| --- | --- | --- |
| D-130 | Who signs releases | The owner, with the engineer's evidence pack; an independent reviewer for releases that change auth or the database |
| D-131 | Coverage target | No global percentage; require tests for every rights, promotion, auth and scoring rule |
