# HSI production backlog — dependency ordered

**Status:** Proposed implementation backlog; no item is complete merely because it appears here.

| ID | Priority | Phase | Work | Acceptance |
|---|---|---|---|---|
| A-01 | P0 | A | Trace live researcher request across UI/API/service/data | Demonstrate non-fixture request with event IDs, provenance and failure states |
| A-02 | P0 | A | Reconcile capability register with current main and open PRs | Every claim links code, tests, deployment evidence and status |
| A-03 | P0 | A | Inventory migrations and HSI-only Neon environment | Operator-produced non-secret ledger; held migrations remain held pending approval |
| A-04 | P0 | A | Identify duplicate research workbenches and source adapters | One designated owner for question, retrieval, run and review contracts |
| A-05 | P0 | A | Remove domain-specific default routing in universal path | Unseen questions from unrelated domains follow identical execution contract |
| B-01 | P0 | B | Normalize PubMed/Europe PMC into research source/passage contracts | IDs, rights, source versions, hashes, timestamps and upstream failure tests |
| B-02 | P1 | B | Add ontology-based candidate entity mapping | Generic coverage, unmapped-state honesty and evaluated mapping precision |
| B-03 | P1 | B | Evaluate HDR Gateway metadata adapter | API terms, permitted metadata fields, custodians, access-route links; no PHI |
| B-04 | P1 | B | Retrieval reliability and quality | Pagination, deduplication, retry/rate limiting, relevance benchmarks |
| C-01 | P0 | C | Study-level claim extraction | Context, negation, sample, assay, outcome and source-offset tests |
| C-02 | P0 | C | Context-conditioned multi-study comparison | Distinguish genuine disagreement from incomparable cohorts or assays |
| C-03 | P1 | C | Evidence gap and falsifiable hypothesis generation | Source-bound proposals, alternatives, uncertainty and no false verification |
| D-01 | P0 | D | Candidate-to-review-to-approved graph transaction | Independent review, atomic promotion, rollback/supersession and audit E2E |
| D-02 | P0 | D | Source and relationship versioning | Full reverse provenance and reproducible graph snapshot |
| E-01 | P0 | E | Persistent arbitrary-question investigation UI | Full question-to-report flow with no fixture substitution |
| E-02 | P1 | E | Collaborative scientific inspection and exports | Review queues, audit visibility, reproducible JSON/Markdown dossier |
| F-01 | P0 | F | Auth, RBAC/ABAC and isolation adversarial tests | Cross-tenant, role escalation and data-leak tests pass |
| F-02 | P0 | F | Operational hardening | SLOs, alerts, load tests, backups/restore, disaster rehearsal, rollback |
| G-01 | P0 | G | Independent scientific benchmark | Blind multi-domain evaluation, error taxonomy and threshold sign-off |
| G-02 | P1 | G | External researcher pilot | Recorded utility, error, task completion and feedback evidence |
| H-01 | P0 | H | Production release approval | All critical gates in release document independently evidenced |

## Execution policy
- No speculative agent expansion until A-01–A-05 and B-01 have accepted evidence.
- Every PR must specify user outcome, changed code, tests, risk, scientific honesty and rollback.
- CI success is necessary but not sufficient for production readiness.
- Do not merge unreviewed PR #247 as part of this documentation-only audit; evaluate it independently.
- No automatic approval, restricted patient data ingestion, or HSI migration application from this backlog.
