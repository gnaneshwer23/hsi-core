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
| `HSI_DATABASE_URL` | PostgreSQL connection string copied using **Connect** on the confirmed HSI branch; verified TLS required |
| `HSI_NEON_PROJECT_ID` | `red-wave-06625195` |
| `HSI_PUBLIC_ORIGIN` | Exact HTTPS origin of the test website, for example its stable preview alias; no path |
| `HSI_AUTH_BASE_URL` | Public Better Auth base URL copied from the **same HSI branch** as `HSI_DATABASE_URL` |
| `VITE_HSI_AUTH_BASE_URL` | The same public Auth URL; retain this existing public setting |

### Auth ↔ database branch alignment (binding)

Neon’s Vercel integration may set `DATABASE_URL`, `NEON_AUTH_BASE_URL`, and
`VITE_NEON_AUTH_URL`. The research gateway **does not** read those names. Operators
must copy values from **one** red-wave branch into the `HSI_*` / `VITE_HSI_*` vars
above. Mixing a staging Auth host with a production database (or the reverse) yields
`BACKEND_DATABASE_SESSION_REQUIRED` for every signed-in user.

| Deployment | Neon branch | Database host prefix | Auth host prefix (`*.neonauth.*`) |
| --- | --- | --- | --- |
| Production (`https://www.humansuperintelligence.tech`) | `production` / `br-quiet-silence-zab1zvji` | `ep-restless-dew-zas989pv` | `ep-restless-dew-zas989pv` |
| Staging / research writes | `hsi-gateway-migrations-staging-20261104` / `br-rough-snow-zagxbvjp` | `ep-sweet-hill-zasb0lni` | `ep-sweet-hill-zasb0lni` |

Never point HSI Auth or `HSI_DATABASE_URL` at ISI `autumn-snow` / `ep-blue-salad`.
After changing Auth URLs, redeploy so the Vite-built `VITE_HSI_AUTH_BASE_URL` matches,
then sign out on that origin (branch cookies do not transfer).

**Auth branch cutover — accounts do not migrate.** Neon Auth users live in
`neon_auth."user"` / `session` / `account` on the **same** branch compute as the
Auth URL. Switching production from staging Auth (`ep-sweet-hill-zasb0lni`) to
production Auth (`ep-restless-dew-zas989pv`) leaves production `neon_auth` empty
until someone registers there. Sign-in with a password that only existed on the
old Auth returns the normal “Email address or password is incorrect” response —
that is expected, not a mis-pointed env, when `/api/research/health` already
shows matching `ep-restless-dew-zas989pv` Auth and database prefixes.

**Recovery:** create a new account on `/sign-up` against the current Auth (then
verify email). Password reset cannot move or recreate users from a previous Auth
branch; it only helps after an account already exists on the current Auth. Do
not invent passwords, grant `hsi_research_access` without a real `neon_auth`
user id, or point migrations at ISI Neon.

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
{"service":"hsi-research","status":"configuration_validated","writesEnabled":false,"authUrlsMatch":true,"endpointPrefixesMatch":true,"databaseConnectionTested":false}
```

This validates configuration only. It does not query the database, authenticate a
user, confirm migrations, verify privileges or prove scientific readiness.
The response also reports the non-secret `publicOrigin`, `requestOrigin`,
`originMatches`, `authEndpointPrefix`, `databaseEndpointPrefix` and
`endpointPrefixesMatch` fields. An origin mismatch returns 503 with `origin_mismatch`:
open the exact configured domain or correct `HSI_PUBLIC_ORIGIN` and redeploy.
`https://www.humansuperintelligence.tech` and
`https://humansuperintelligence.tech` are distinct origins. The matching origin
must also be trusted by Neon Auth; do not weaken the check to accept arbitrary hosts.
The `authUrlsMatch` field must also be true. When Neon Auth is configured, a
staging/production host-prefix mismatch fails closed as `configuration_required`
with `endpointPrefixesMatch: false` (and those two vars listed under `missing`)
instead of a misleading session 401.

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

If Neon sends a numeric code, enter it in **Verification code** and select
**Verify email**. The explicit `/api/auth/email-otp/verify-email` function proxies
Neon's email OTP verification endpoint. The account email comes from the verified
provider session, not the request body. A successful response must confirm the
same user is email-verified; provider tokens are excluded from browser JSON.
The page clears the code and refreshes session/access checks after confirmation.
Incorrect, expired and rate-limited codes have separate retry instructions.
Codes stay in the form/request memory only; never log, persist or put them in URLs.
Use a verification link instead when the provider email supplies one. Neither
verification method grants researcher or reviewer authority.

Other 401 responses distinguish a missing provider session
(`BACKEND_PROVIDER_SESSION_REQUIRED`) from a provider identity that cannot resolve
to an eligible database session (`BACKEND_DATABASE_SESSION_REQUIRED`). These checks
do not substitute for the subsequent researcher/reviewer grant check.

For the latter, a signed-in, email-verified user can open
`/api/research/session-diagnostics`. This GET-only endpoint inspects only that
provider-verified session/user pair. It returns boolean row-visibility, email,
ban, expiry, impersonation and token-format checks, plus non-secret Auth/database
endpoint prefixes. It never returns connection strings, session tokens, IDs,
emails, database roles or other users' records, and never alters the database.
Query-string identity overrides are ignored. Anonymous/unverified callers are
denied before the database query. Endpoint-prefix equality is an observation,
not proof of role grants or branch management identity.

`database_user_not_visible` and `database_session_not_visible` can mean a wrong
target, absent row or row-level visibility restriction; do not assume one cause
or disable RLS. Other status codes isolate verification, ban, expiry,
impersonation or unusable-token gates. Even `session_eligible` does not grant
researcher/reviewer authority. An operator must verify the exact failing check
on the approved target before changing configuration or privileges.

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

## Phase A workspace addition

The connected investigation workspace adds `GET/POST /api/research/investigations` and a server-only `HSI_SSC_RESEARCH_RELEASE_ID` binding. It uses the existing write/session safeguards and requires an existing published public-biomedical SSc release. Default writes remain disabled. See the [implementation and non-production acceptance procedure](PHASE_A_INVESTIGATION_WORKSPACE.md) before activation; no configuration or database changes were made by this delivery.

## Phase D delivery addition

Saved investigations now support context-bound JSON/Markdown briefs, immutable submissions and independent decisions, and linked revisions. The reviewer queue is `/research/scientific-review`. Review the [Phase D migration and two-account staging procedure](PHASE_D_BRIEFS_AND_INDEPENDENT_REVIEW.md) before activation. Migrations `014`/`015`, trusted grants and cleared published sources are prerequisites; they were not applied or provisioned by the code delivery. Existing write guards remain in force, and v1 browser decision payloads are no longer the production review contract.
