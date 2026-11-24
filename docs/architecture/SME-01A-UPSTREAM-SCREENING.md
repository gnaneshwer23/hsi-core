# SME-01A upstream screening — 2026-11-24
Status: partial static screening; no dependency or production approval. Tracks #657 and PR #658.
All seven sources resolved. Git tree identifiers below are tree SHAs returned by recursive tree API, not commit pins. README/manifests were inspected at branch tip; exact snapshot consistency still needs verification.

| Source | Observed tree SHA | Evidence and decision |
|---|---|---|
| garrytan/gbrain | 7e5ce356337699d57508c86d4904feda906e4e03 | README and package.json: Bun/TS, Postgres, hybrid and evidence delivery exports. Evaluate native retrieval patterns; no full install. |
| akitaonrails/ai-memory | ccc7dc0db1271e94785b3e7e5a1758a89fde202d | README and SECURITY.md: single-tenant, projects open by default, hook spools and backups may contain secrets. Developer-only, isolated, synthetic data. |
| huytieu/COG-second-brain | 144c7a3a959cc99538b7dfee9c22c4b065a0e156 | README and skills/memory-hygiene/SKILL.md: worker/verifier separation, freshness checks. Adapt freshness metadata; newer evidence never automatically wins a scientific conflict. |
| smixs/agent-second-brain | 7828ed62cf76aae87bee7f2660468ab88495cf3d | README and pyproject.toml: Telegram, Deepgram, persistent CLI session. Native voice capture only; external egress off by default; review provider terms. |
| itechmeat/open-second-brain | d1d1d50644a247ed1a8c28e97c11730f9078dec6 | README and SECURITY.md: local corrections, nightly rule consolidation, configurable network egress/export policy. Proposals only; no automatic scientific or policy promotion. |
| jessepinkman9900/claude-second-brain | 599f55ad50afceb9eae4f31746aa37274087d239 | README and package.json: MIT, Node >=22 CLI scaffolding, local search and Git-backed vault. Adapt export/wiki concepts, never sync private data to public Git. |
| https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f | not pinned | Original LLM Wiki concept resolved; persistent synthesis and contradiction notes. Licence not established; design inspiration only. |

Six repositories declare MIT. Preserve notices if copying code; transitive and vendored licences unverified. No code imported.

## Required before approval
1. Pin exact commit IDs; fetch manifests, lockfiles, licence files and candidate implementation source at those IDs. Generate SBOM and scan vulnerabilities, scripts, secrets, and transitive licences.
2. Audit GBrain hybrid scoring, SQL parameterization, authorization and evidence delivery; never reuse default ACL assumptions.
3. Inspect COG verifier permissions, Open Second Brain correction and egress lifecycle, AI Memory hooks, voice bot provider data flows and scaffolder execution paths.
4. Test in disposable sandbox without real credentials/patient data: injection, cross-scope leakage, path traversal, malicious Markdown, revocation, stale/retracted evidence, unapproved rule promotion, and export redaction.
5. Record per-component approve/adapt/reject decision with reviewer and commit pin. Require HSI owner approval and ADR-012/013/014 alignment before SME-02.
No dependency install, scanner execution, runtime tests, production writes or security signoff performed in this screening.
