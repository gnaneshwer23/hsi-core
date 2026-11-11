# Neon password rotation — HSI red-wave (2026-11-09)

**No secrets in this document.** Passwords and connection strings are never recorded here.

## Scope

| Field | Value |
| --- | --- |
| Neon project name | `human super intelligence` |
| Project id | `<HSI_NEON_PROJECT_ID>` |
| Branch | `production` (`<HSI_PRODUCTION_BRANCH_ID>`) |
| Endpoint prefix | `<HSI_PRODUCTION_ENDPOINT>` |
| Role rotated | `neondb_owner` |
| Method | `neonctl roles reset-password` via OAuth |
| Rotated | **Yes** |
| When (UTC) | 2026-11-09 |
| Local connect smoke | Succeeded (`current_database=neondb`, `current_user=neondb_owner`) |
| Local secrets file | Gitignored `.env.local` updated when present on the agent host |
| Untouched | ISI `autumn-snow` / immunecity, Akeno, DeliverX, and all other Neon projects |

## Residual human steps (Vercel / production)

**Verification outstanding:** this historical record does not prove whether production Vercel secrets were subsequently updated. An authorised operator must confirm without printing secret values:

1. Open the **HSI** Vercel project → **Settings** → **Environment Variables**.
2. Update every env var that holds the HSI red-wave Postgres URL (commonly `DATABASE_URL` / `HSI_DATABASE_URL`, and any Preview/Production pair that points at `<HSI_PRODUCTION_ENDPOINT_PREFIX>…`).
3. Paste the **new** connection string obtained from Neon Console or `neonctl connection-string production --project-id <HSI_NEON_PROJECT_ID>` (do not paste it into chat, tickets, or commits).
4. Confirm the host prefix remains `<HSI_PRODUCTION_ENDPOINT_PREFIX>` / project `<HSI_NEON_PROJECT_ID>` — never autumn-snow / immunecity / Akeno.
5. Redeploy Production (and Preview if those vars were changed) so running lambdas pick up the new password.
6. Optionally revoke any leftover local shell history that printed a connection string.

## Honesty

- Rotation does not enable Gate C auto-approve, MoU invention, or live CDS/PHI.
- HSI substrate remains red-wave only.
