# SME-01A.2 — automated security validation
Tracks #657 / PR #658. Script committed, execution not verified.
Run Python 3.12+ scripts/sme-upstream-audit.py /tmp/sme-upstream-audit.json in an isolated environment with outbound HTTPS only to public GitHub and OSV, no credentials. Preserve report even on nonzero exit. Current parser deliberately blocks Bun and unclassified local/workspace sources; extend classification and add parser fixtures before treating coverage as complete. The report is a partial inventory, not an SBOM or licence clearance. OSV findings require triage; no findings is not a security approval. Approval remains blocked regardless of scanner exit.
Native implementation remains preferred; no upstream packages installed. No production changes.
## Remaining executable acceptance matrix (requires SME-02 implementation for runtime tests)
- Tenant A/B: deny cross-scope reads, search, vector candidates, cache and exports; verify revocation.
- Injection: retrieved notes cannot change policy, invoke tools or promote claims.
- Corrections: repeated assertions remain proposals; scientific verification required.
- Deletion: remove derived indexes, cache and exports under documented retention policy.
- Egress: deny unauthorized destinations and redact synthetic secrets; no patient data.
- Retraction: invalidate affected evidence references without deleting audit history.
- Recovery: idempotent checkpoint resume, no duplicate writes.
- All six scientific domains: evaluate provenance and abstention.
## Outstanding
Execute audit and retain results; complete Bun and workspace parsing, full SBOM, transitive licence checks, vendored code review, sandbox tests and independent security approval. Do not mark SME-01A.2 complete or make this a required CI check until parser tests and coverage are reviewed. No scanner execution or runtime test result claimed.
