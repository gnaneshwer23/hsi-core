# HSI sign-in deployment checks

The static site already registers `/sign-in`, `/sign-up` and `/research/account`.
Publishing this auth patch fixes client transport and error handling; it does not
create accounts, configure Neon Auth, grant research authority or migrate a DB.

## Required public deployment configuration

In the actual Vercel deployment settings, set `VITE_HSI_AUTH_BASE_URL` to the
approved Neon Better Auth public base URL for the intended environment. Copy the
correct URL from the approved provider configuration; do not derive it from a
PostgreSQL connection string or guess an endpoint from a branch name.

This is a Vite build-time variable: rebuild/redeploy after changing it. An empty
or invalid setting deliberately leaves sign-in disabled. Only credential-free
HTTPS URLs without query strings/fragments are accepted. Never put a database
URL, API key, password or session token in a `VITE_*` variable.

Confirm the auth provider trusts the actual application origin and that the
approved cookie/same-origin proxy configuration supports the deployed research
API. A successful provider identity response does not by itself establish that
cookies reach that API or that the user has research/reviewer authority.

Keep staging/disposable testing on the confirmed non-production branches. These
instructions authorise no production database changes and provision no roles.

## Client behaviour after this patch

- HTML/static-site fallbacks and invalid JSON are rejected as auth responses.
- Stalled requests return a safe timeout rather than leaving the form pending.
- Expired, incomplete or mismatched sessions are rejected.
- Initial session-check failures appear on the sign-in/account page.
- Provider details and submitted secrets are not copied into error messages.
- Browser session metadata cannot grant scientific-review permission.

## Safe operator checks

`bun scripts/check-hsi-staging.ts` performs GET-only management and sign-in-page
checks. It requires `NEON_API_KEY` through secure configuration and a confirmed
`HSI_STAGING_APP_URL`. It never reads `DATABASE_URL` or performs PostgreSQL writes.
A reachable page is explicitly reported separately from authenticated sign-in.

Use separate verified provider identities for researcher and scientific reviewer.
Research/reviewer grants remain an approved trusted-backend operation. Do not
interpret signup, successful sign-in, an email label or a browser role string as
scientific-review authority.

## Validation scope

Focused unit tests cover client configuration, transport failures, session shape,
non-production target checks and existing independent-review guards. Local browser
checks use mocked auth responses; they are not evidence of live account login.
The live deployment and two-account staging test still require operational checks.

## Account creation troubleshooting

The signup form validates required fields explicitly and explains its 12–128
character password requirement. Validation errors focus the first invalid field;
no registration request is sent until the fields pass. Requests have an eight
second timeout and the submit button becomes usable again after a failure.

A successful registration requires a matching user identity from the provider.
The page confirms acceptance and, for an unverified email, explains verification
and email-delivery checks. It does not claim an email was delivered or grant any
research/reviewer permissions. Provider responses for disabled registration,
untrusted origins and existing accounts have specific safe messages.

If the deployed page reports disabled registration or an untrusted origin, fix
that setting in the approved authentication provider. Changing frontend code does
not enable provider registration or configure outbound email. Test locally with
mocked responses first; verify actual email delivery and login separately on the
approved non-production environment.
