# SME-01A.1 — supply chain evidence
2026-11-24. Partial static verification; no external code approved. Tracks #657, PR #658.
The previous screening mislabeled the returned branch identifiers as tree SHAs. Commit API now confirms the following exact commit IDs; separate tree IDs are not used as commit pins.

| Repository | Commit | Pinned files retrieved |
|---|---|---|
| garrytan/gbrain | 7e5ce356337699d57508c86d4904feda906e4e03 | LICENSE, package.json, bun.lock, src/core/search/hybrid.ts |
| akitaonrails/ai-memory | ccc7dc0db1271e94785b3e7e5a1758a89fde202d | LICENSE, Cargo.toml, Cargo.lock, companions/ai-memory-client/src/scrub.rs |
| huytieu/COG-second-brain | 144c7a3a959cc99538b7dfee9c22c4b065a0e156 | LICENSE, skills/memory-hygiene/SKILL.md |
| smixs/agent-second-brain | 7828ed62cf76aae87bee7f2660468ab88495cf3d | LICENSE, pyproject.toml, uv.lock |
| itechmeat/open-second-brain | d1d1d50644a247ed1a8c28e97c11730f9078dec6 | LICENSE, package.json, bun.lock, src/core/egress/registry.ts |
| jessepinkman9900/claude-second-brain | 599f55ad50afceb9eae4f31746aa37274087d239 | LICENSE, package.json, package-lock.json, bin/create.js |
| Karpathy LLM Wiki | unresolved revision | gist 442a6bf555914893e9891c11519de94f; licence unresolved |

All six pinned LICENSE files contain MIT text. Transitive and vendored licences not verified. Lockfile records observed: Cargo 538, uv 38, npm 765 excluding root; two Bun locks retrieved but not enumerated. Counts include development/transitive records and are not an SBOM.
Selected source excerpts inspected: GBrain hybrid RRF and read policy imports (not proof of authorization); AI Memory local credential scrub (not proof of complete redaction); COG freshness checks; Open Second Brain egress census design; Claude scaffolder filesystem and subprocess calls. Agent Second Brain manifest includes aiogram and Deepgram SDK. No runtime tests performed.

## Decision
Prefer native HSI implementations with zero new upstream application dependencies. No copied code until notices and dependency review. Keep developer memory separate. Gist design inspiration only. Do not execute upstream installers, hooks or skills. No patient data in memory.

## Outstanding verification runbook
In disposable isolated environment, fetch exact commits without executing hooks or installers. Inventory all workspace manifests, lockfiles, vendored code, submodules and build scripts. Generate CycloneDX or SPDX SBOM per candidate using a pinned scanner; run OSV or equivalent against supported lockfiles and record scanner version, database timestamp, findings and unsupported ecosystems. Review transitive licences and secret scan. No scan result means unknown, not clean. Test only candidate components with synthetic data, no production credentials and denied network by default. Test authorization before ranking and after retrieval, cross-tenant cache leakage, injection, malicious exports, redaction bypass, stale/retracted evidence, deletion and correction promotion. Record exact commands, exit status, artifacts and reviewer. Require owner approval before SME-02; any imported dependency requires explicit clearance. No SBOM generated, vulnerability scanner run, sandbox execution or independent approval in this commit.
