# HSI Research API on Vercel

The website and Research API deploy from the existing **hsi-core** project. No
additional API subscription or separate Bun host is needed for this deployment.
This guide does not authorise production database migrations or role grants.

## 1. Keep the existing build settings

| Vercel setting | Value |
| --- | --- |
| Framework | Vite |
| Root Directory | `site` |
| Build Command | `bun run build` |
| Output Directory | `dist` |
| Install Command | `bun install` |
| Include files outside Root Directory | Enabled |

The repository supplies `site/api/auth/[...path].ts` and
`site/api/research/[...path].ts` plus `bunVersion: "1.x"` in `site/vercel.json`.
Nested login/registration paths have explicit `site/api/auth/sign-in/email.ts`
and `sign-up/email.ts` entrypoints. Investigation reads and review writes also
have explicit nested entrypoints under `site/api/research/interrogative/`.
These avoid relying on catch-all discovery for multi-segment routes in the
deployed Vite project. They all call the same trusted handler and permission gates.
These are Bun Web-handler functions; `bun run build` still builds the frontend.
Vercel builds the API functions separately. Do not run the standalone
`research:api` listener as the Vercel build command.

The site package installs its own pinned `@types/bun` dependency. Its build runs
the dedicated `site/api/tsconfig.json` check before Vite; the CI site-deployment
job installs only site dependencies to catch missing API types without relying
on the repository root's development dependencies.

The runtime/export format follows Vercel's official
[Bun function fixture](https://github.com/vercel/vercel/tree/main/packages/node/test/fixtures/64-bun-runtime).
Local Bun bundling and handler tests do not substitute for a successful Vercel
function deployment.

## 2. Configure one intended test deployment

Select the Vercel **Preview** environment used by the intended staging deployment.
Keep its Neon Auth endpoint and database connection on the same confirmed HSI
staging branch. The database connection is a secret: paste it directly into
Vercel, never into chat or a `VITE_*` variable. Do not use the production branch as
an automatic fallback.

In **Settings → Environment Variables**:

| Name | Value/source |
| --- | --- |
| `HSI_DATABASE_URL` | PostgreSQL connection string copied using **Connect** on the confirmed HSI staging branch; verified TLS required |
| `HSI_NEON_PROJECT_ID` | `red-wave-06625195` |
| `HSI_PUBLIC_ORIGIN` | Exact HTTPS origin of the test website, for example its stable preview alias; no path |
| `HSI_AUTH_BASE_URL` | Public Better Auth base URL copied from the **same staging branch** |
| `VITE_HSI_AUTH_BASE_URL` | The same public Auth URL; retain this existing public setting |

The server can fall back from `HSI_AUTH_BASE_URL` to the existing public
`VITE_HSI_AUTH_BASE_URL`, but an explicit matching server setting is clearer.
There is deliberately **no fallback** from `HSI_DATABASE_URL` to `DATABASE_URL`.
When both Auth URL variables are present, they must match after URL normalisation.
For managed HSI Neon Auth, the endpoint path is `/neondb/auth`, with no trailing
full stop. A copied `/auth.` or `/auth.` followed by whitespace is rejected by
configuration checks instead of sending credentials to a nonexistent endpoint.

Add the exact test-site origin to Neon Auth's trusted origins. An automatically
changing preview URL must not be guessed or trusted with a blanket wildcard;
use the actual deployment URL and matching environment, or a stable staging
alias. A custom production domain is a different origin and environment.

Redeploy that environment. In Vercel's deployment details, confirm the API
functions built successfully. Open:

```text
https://YOUR-TEST-SITE/api/research/health
```

Expected after configuration:

```json
{"service":"hsi-research","status":"configuration_validated","writesEnabled":false,"databaseConnectionTested":false}
```

This validates configuration only. It does not query the database, authenticate a
user, confirm migrations, verify privileges or prove scientific readiness.
The response also reports the non-secret `publicOrigin`, `requestOrigin` and
`originMatches` fields. An origin mismatch returns 503 with `origin_mismatch`:
open the exact configured domain or correct `HSI_PUBLIC_ORIGIN` and redeploy.
`https://www.humansuperintelligence.tech` and
`https://humansuperintelligence.tech` are distinct origins. The matching origin
must also be trusted by Neon Auth; do not weaken the check to accept arbitrary hosts.
The `authUrlsMatch` field must also be true.

If the route is missing/404, check the deployment commit, root directory,
function build logs and external-file inclusion. If it returns 503 with
`configuration_required`, the `missing` field names invalid/missing settings
without exposing their values.
An anonymous browser GET to `/api/auth/sign-in/email` or `/api/auth/sign-up/email`
should return JSON `METHOD_NOT_ALLOWED` (405), without calling the provider or
submitting credentials. A Vercel `404 NOT_FOUND` at those paths means their
explicit function entrypoints did not deploy; a successful diagnostics route
alone does not prove the nested credential routes exist.

For a read-only provider connectivity check, open `/api/auth/diagnostics` on the
same configured origin. This performs only an anonymous provider `GET /get-session`;
it never forwards browser cookies, submits credentials, creates accounts or
queries the database. `provider_reachable` confirms the session endpoint answered
with the expected signed-out shape, not that login or signup is enabled. Other
responses report a safe provider HTTP status and recognised error code without
returning arbitrary upstream messages or session data. The gateway sends Neon's
`x-neon-auth-middleware: true` proxy marker, matching its published server SDK.

## 3. Switch login to the same-origin gateway

After the functions deploy and health configuration passes, set this **public
routing flag** in the same Vercel test environment:

```text
VITE_HSI_USE_AUTH_GATEWAY=true
```

Redeploy. Sign in again on that same test website. The old external-provider
cookie does not automatically become a website cookie. This flag defaults to
false to preserve the old login path during rollout; it does not grant roles.

Browser auth requests now go to `/api/auth/*`. The gateway forwards only
email/password sign-in, signup, sign-out and get-session to the configured Neon
provider. It enforces the application origin for writes, strips browser-supplied
roles/callback destinations, and scopes recognised Better Auth cookies to the
website with Secure, HttpOnly and SameSite=Lax attributes. JSON returned to the
browser excludes provider tokens and role metadata.

Research requests revalidate the provider cookie server-side. Only a
provider-verified session/user ID pair can resolve a live token in the configured
HSI database. The existing permission checks then enforce email verification,
expiry, bans, impersonation restrictions and active backend grants. A provider
session from another branch must fail rather than use a different database.

## 4. Verify identity before provisioning access

Open `/research/account` after email verification:

- A verified account without grants should show **Research access requires approval**.
- A 401 indicates the provider session could not establish a usable verified
  backend identity; check email verification and matching Auth/database branches.
- A 503 indicates configuration, provider or database availability requires an
  operator check. Inspect logs without logging secrets, cookies or credentials.

An unverified email receives the explicit `EMAIL_NOT_VERIFIED` response and a
**Send verification email** button. The button makes a user-initiated request;
opening the page never sends email automatically. The gateway resolves the
account from its provider-verified cookie and requests verification only for that
account's email, with a fixed same-origin callback. Browser-supplied email and
callback overrides are ignored. After using the verification link, select
**Refresh access**. A provider acknowledgement does not prove email delivery; if
no message arrives, an operator must check the provider's verification/email
configuration. Never flip `emailVerified` in SQL to bypass this step.

Other 401 responses distinguish a missing provider session
(`BACKEND_PROVIDER_SESSION_REQUIRED`) from a provider identity that cannot resolve
to an eligible database session (`BACKEND_DATABASE_SESSION_REQUIRED`). These checks
do not substitute for the subsequent researcher/reviewer grant check.

An approved identity administrator must provision only the authorised researcher
role for the verified immutable user ID in the staging `hsi_research_access`
table, recording the real grantor identity and time. Signup and the gateway do
not perform this grant. Do not grant reviewer authority to the investigation's
author or infer it from an email address.

Use **Refresh access**. Existing accessible release-bound investigations should
appear. An empty workspace is not an error and does not justify invented
scientific evidence. Other researchers' drafts must remain inaccessible.

## 5. Review writes remain explicitly gated

Vercel research writes are disabled by default. To exercise already approved
staging review submission/decision code only, configure both:

```text
HSI_RESEARCH_WRITES_ENABLED=true
HSI_NEON_BRANCH_ID=br-rough-snow-zagxbvjp
```

The server additionally requires the confirmed staging endpoint
`ep-sweet-hill-zasb0lni` (pooled variant accepted). A production endpoint cannot
enable writes with those flags. No migrations are run on startup. Independent
review authority and all evidence/release gates still apply.

Before activation, complete two-account staging checks including expired sessions,
revoked grants, wrong-branch sessions, author self-review rejection and record
ownership. A deployment or green health response does not approve science, publish
knowledge graph relationships, enable live clinical decision support or permit PHI.
