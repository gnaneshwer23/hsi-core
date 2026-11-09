# Owner decisions

These items are intentionally not decided in code.

| Decision | Why it is still open |
| --- | --- |
| **LICENSE** | This public repository has no `LICENSE` file. `package.json` says `UNLICENSED`, which is not a public copyright grant. The owner chooses the licence. Do not add one on an agent’s initiative. |
| **GitHub repository description** | The description still needs to say Human Super Intelligence, one product, four governed modules. Changing it is a GitHub settings action. |
| **Branch protection** | `main` should require the `verify` and `site-deployment` jobs. That is a repository setting. |
| **Neon identifier rotation** | Unique project, branch and host identifiers were removed from the tree. They remain in git history. If they are treated as sensitive, rotate or restrict them in the Neon console. Values are not repeated in this file. See `docs/security/GITLEAKS_REPORT.md`. |
| **Real endpoint configuration** | Production and staging hosts now belong in the private environment: `HSI_NEON_CANONICAL_PROJECT_ID`, `HSI_NEON_HOST_ALLOWLIST`, `HSI_NEON_STAGING_BRANCH_PIN`, `HSI_NEON_STAGING_HOST_PIN`. Tracked code keeps placeholders and fails closed for any other host. |
| **RLS migration 020** | `020_hsi_lhkg_rls_policies.sql` is held in `HELD_MIGRATION_IDS`. Apply it only after a security review of the `hsi_lhkg_reader` role. |
| **Expert reviewers, source licences, DPIA, DCB0129/0160** | Human governance. Not claimed by the software. |
