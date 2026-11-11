# HSI production release gates

**State:** Proposed release criteria. **All gates initially unverified** until evidence and accountable reviewers are recorded.

| Gate | Required evidence | Accountable sign-off |
|---|---|---|
| G0 Product truth | Live arbitrary-question workflow; accurate readiness labels; no fixture substitution | Product + engineering |
| G1 Evidence integrity | Citation correctness, source offsets, licences, versioned provenance and missing-data honesty | Scientific lead + data steward |
| G2 Scientific quality | Independent multi-domain benchmark, context/negation accuracy, failure taxonomy, reproducibility | Independent scientific reviewers |
| G3 Graph governance | Independent approval, immutable audit, rejection and supersession, no bypassable promotion | Scientific curator + security |
| G4 Access/privacy | Authentication, tenant/RBAC/ABAC tests, PHI exclusion, permissions and privacy review | Security + privacy lead |
| G5 Infrastructure | Verified HSI-only DB migrations, backups, restore, recovery, load, rate limits, alerts, rollback | Operations + engineering |
| G6 Product usability | Accessible end-to-end workflow, usability pilot, researcher completion and usefulness metrics | Product + pilot users |
| G7 Release | Incident runbook, owners, monitoring, limited rollout, rollback exercise and final approval | Release owner |

## Proposed scientific thresholds (not measured)
- Citation correctness >= 99% on independently adjudicated samples.
- Source-grounded extracted claim precision >= 95%; context extraction macro-F1 >= 0.85.
- Cross-study comparison accuracy >= 90% on context-comparable benchmark cases.
- Zero critical unsupported claims in approved outputs and zero bypasses of independent review.
- Successful investigation completion >= 95%; researcher-rated usefulness >= 80% positive.
- Report per-domain and per-error-type confidence intervals; define sampling and adjudication before testing.

## Stop-ship conditions
- Unreviewed candidate silently enters trusted graph.
- Restricted data or tenant records leak across access boundaries.
- Curated/synthetic outputs presented as live or independently validated research.
- Source provenance missing for purported evidence.
- No tested restoration or rollback for persistent research records.
- Any critical scientific safety or security finding without accepted mitigation.

## Release levels
1. **Research preview:** public-source retrieval and clearly unreviewed exploration only.
2. **Production research:** validated comparisons, persistence, governed graph, operational and security sign-off.
3. **Expanded clinical/institutional:** separate approvals, contracts, privacy and clinical/regulatory validation; never inferred from research launch.

## Gate evidence template
Record for each gate: gate ID, owner, environment, exact commit/deployment, test dataset/version, command/report link, observed outcome, deviations, reviewer, timestamp and explicit decision. Unfilled fields mean **not verified**.
