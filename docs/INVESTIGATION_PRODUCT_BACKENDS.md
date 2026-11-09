# Authenticated product investigation backends

The shared service now runs through product-owned HTTP and PostgreSQL adapters.
Its code is canonical in HSI; execution, sessions, research records and database
connections stay inside the consuming product. HSI's red-wave database is not
used by either product backend.

| Product | Internal UI | API | Authentication / research access | Storage |
| --- | --- | --- | --- | --- |
| ISI | `/internal-research` | POST `/api/internal/investigations` | Neon EdDSA JWT, existing stored administrator role | ISI `public.hsi_investigations` |
| Aksh | `/internal-research` | POST `/api/platform/research-investigations` | Real NextAuth session plus explicitly provisioned research membership | Aksh `aksh.hsi_investigations` |

No public navigation or landing-page entry is added. ISI retains its existing
admin-only gate. Aksh checks its real session before rendering data. API handlers
repeat authentication and stored-role checks on every call, regardless of UI.
The Aksh endpoint deliberately does not pass requests to the test-header auth
shortcut. A signup/onboarding persona is not a scientific-review grant.

## Ownership and persistence

Each investigation is private to its authenticated creator. Even an administrator
cannot list, read, review or export someone else's investigation through these
APIs. No team-sharing permission model is invented. Product sessions supply the
owner ID; request bodies, scope cookies and practice headers cannot select it.
Every SQL query filters ownership. Row-level security repeats that boundary using
transaction-local `app.hsi_research_owner`; Aksh uses its restricted `aksh_tenant`
role. Pooled connections do not retain another request's scope.

A checkpoint, revision and audit row commit together. Updates use atomic revision
comparisons. Concurrent review has one winner; stale requests receive 409. Audit
records identify the actual session actor. Application code never updates/deletes
those audit rows. Privileged database operators remain trusted; this is not a
cryptographically immutable audit ledger.

List queries return 20 items and a keyset cursor, preserving PostgreSQL microsecond
precision across both database drivers. Budgets are database-backed: 60 requests
per owner/minute, five new investigations per ten minutes, and 200 saved
investigations per owner. There is no memory/file fallback on a database error.

## HTTP boundary

Actions: `list`, `start`, `get`, `resume`, `review`, `recover`, `export`. Start
accepts a registered `releaseId` and an optional existing `conceptId`, not a
caller-supplied bundle, free-text patient description or database selector. Review
accepts a revision, explicit decision and rationale, not a reviewer ID or role.
Unknown properties are rejected. Bodies are limited to 8 KB **before** JSON parsing.
Requests require same-origin JSON; the check uses the request authority when a
framework reconstructs an internal URL and ignores forwarded-host overrides.
Responses are private/no-store/noindex. Storage/provider errors return safe codes.

Recovery requires admin access and an idle checkpoint older than ten minutes.
Operators must establish that its worker has stopped before recovering. Resume
continues unstarted stages only; failed runs require a new investigation.

## Corpus connections and scientific limits

ISI builds a bounded view of its one existing core KG, defaulting to rheumatoid
arthritis (`D001`). Relationship IDs stay unchanged and open the existing global
Scientific Inspector. Unknown or draft-only concepts are rejected. No new KG,
source passage, organism context or evidence approval is invented.

Aksh reads its existing imported HSI research snapshot. That artifact contains
concept pointers, not subject/predicate/object edges or licensed source passages;
its adapter preserves those limits. It never queries a patient table or sends
records to an HSI server. The public read-only snapshot page is unchanged.

The pending real RA release (`ra-anti-tnf-evidence`) does not supply
rights-verified passages; product start against it returns `evidence_not_ready`
rather than an empty successful search. The separate research corpus
(`ra-anti-tnf-research`) supplies a bounded synthetic working set for
investigation workflows (`notForScientificClaim`). Bibliographic locators and KG mechanism text
are not silently promoted into licensed quotations or reviewed evidence. A human
can request revision or accept the research dossier workflow; neither action
approves scientific claims or changes care. The next scientific vertical still
needs a source-licensed RA/anti-TNF evidence release and independent review.
See [RA research path](RA_RESEARCH_PATH.md).

## Deployment activation

Implementation is committed in all three repositories. Live product activation
requires each product's own configured database, its additive migration and a
provisioned account. **Never** point these commands at HSI `red-wave` /
`ep-hsi-production…`. Clear inherited `DATABASE_URL`, `DATABASE_URL_UNPOOLED`,
`DATABASE`, `NEON_PROJECT_ID`, and `NEON_BRANCH_ID` before loading a product
`.env.local`.

### Phase 4 status (2026-11-03)

| Product | Neon target confirmed | Migration | Applied? | Remaining |
| --- | --- | --- | --- | --- |
| ISI | `immunecity` / `isi-neon-project` / `ep-isi-product…` (product `.env.local`) | `0029_hsi_investigations` | **Yes** — tables + FORCE RLS present | Sign in as existing ISI `admin`; hit `/internal-research` |
| Aksh | `Aksh Health Production` / `aksh-neon-project-b` branch `local-dev` / `ep-aksh-local-dev…` (platform-uk `.env.local`) | `056_hsi_investigations` | **Yes** on **local-dev only** | Provision research role for a real account; optionally apply same migration on `main` (`ep-aksh-main…`) if production UI needs it |
| HSI | `human super intelligence` / `hsi-neon-project` | n/a | **Not used** | Keep isolated |

Aksh `aksh.hsi_research_members` is still empty after apply — do **not** invent a
user id. Disposable loopback `hsi_step3_test` integration checks for both products
passed (RLS / cross-owner denial / CAS / audit / quotas).

From ISI (`~/Projects/immunecity`), using the ISI product environment (Lovable
checkout env at `~/Desktop/immune-city/.env.local` is valid when it points at
`ep-isi-product…`):

```sh
bun --env-file=<local-home>/Desktop/immune-city/.env.local scripts/apply-hsi-investigations-migration.ts
bun --env-file=<local-home>/Desktop/immune-city/.env.local scripts/apply-hsi-investigations-migration.ts --apply
```

This applies only `0029_hsi_investigations.sql` and refuses a non-ISI remote
project. Use an account already provisioned as `admin` in ISI `user_roles`.

From Aksh `packages/platform-uk`, using Aksh's deployment environment:

```sh
bun --env-file=.env.local scripts/apply-hsi-investigations-migration.ts
bun --env-file=.env.local scripts/apply-hsi-investigations-migration.ts --apply
bun --env-file=.env.local scripts/provision-hsi-research.ts EXISTING_USER_ID reviewer
```

This applies only `056_hsi_investigations.sql`, after the existing schema/tenant
role migrations. It does not apply unrelated simulation migrations. Provisioning
requires an existing Aksh account and operator database permissions. Do not expose
that script as an API. A researcher grant permits start/read/export of owned runs;
a reviewer/admin grant also permits human review. Visit `/internal-research`
after signing in. No new shared database or HSI endpoint needs configuring.

To activate production `main` (not local-dev), point `.env.local` /
`DATABASE_URL` at `tiny-river` default (`ep-aksh-main…`), re-run the dry-run
host check, then `--apply`. Simulation project `aksh-neon-project-a`
(`ep-aksh-other…`) is separate — apply there only if that environment should
expose research investigations.

## Verification

Both new migrations were applied to a disposable PostgreSQL 17 instance with a
non-owner application role. Integration checks cover RLS without application WHERE
filters, cross-owner access, CAS review races, append audit rows, request/start
limits, microsecond-safe pagination, JSONB persistence and dossier export.
ISI additionally verifies real signed/expired/wrong-issuer JWTs and rejects JWT
role spoofing against stored roles. Aksh API integration stubs only the authenticated
session boundary; its browser test uses the real NextAuth JWT-session validator.
Desktop/mobile browser tests exercise start, reload, human review and downloads;
ISI also opens the existing Scientific Inspector. These are local identity
fixtures, not live provider sign-in or production deployment verification.

Product CI provisions its own disposable local PostgreSQL service and runs its
adapter integration checks. Test bootstrap scripts accept only loopback databases
named `hsi_step3_test`, never the deployment `DATABASE_URL`. Migration scripts and
operator grants remain separate from test bootstrap. Scientific/clinical validation
and live provider connectivity are not established by these engineering tests.
