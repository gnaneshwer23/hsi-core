# LEA-02C: onboarding integration contracts

**Status:** proposal for the main HSI backend. Nothing in this document is accepted, applied or running.
**Code:** `src/onboarding/integrationContracts.ts` (types, mapping, guards, the only client) and its tests.

## Boundary

The onboarding and settings interface (LEA-02A to C) personalises what a person sees. It owns no identity, persistence,
membership, permission or memory system, and it never asserts access. Everything it stores is device-local
(`hsi-scientific-onboarding-v1` in browser storage) and parsed fail-closed. Real profile storage, identity
verification, institutional membership, access control and scientific memory belong to the main backend and are
reached only through the contracts below.

## What exists today

`GET` and `PUT /api/research/onboarding-profile` already exist (`src/server/onboardingProfileApi.ts`) with the
`hsi-researcher-profile-1` schema. They refuse writes as `SCHEMA_NOT_APPLIED` until an owner applies the additive store
under staging pins. The interface maps its answers onto that schema and does not widen it.

### Mapping to `hsi-researcher-profile-1`

| New answer | Existing field | Rule |
|---|---|---|
| Primary role | `role`, `stage` | Persona maps to the nearest existing role; role maps to the nearest stage |
| Objectives | `goals` | Only exact matches (mechanisms, targets, conflicts, hypotheses). Others are reported as not carried over, never loosely remapped |
| Interests and domains | `interests` | Names only |
| Question | `question` | Trimmed |
| ORCID iD | `orcid` | Only if format and check digit are valid. Never marked verified |
| Notifications | `cadence` | weekly or off |
| Publications | `papers` | Always empty: sample records are never sent |

Fields with no existing home (secondary roles, domain split, methods, preferences, connection interest, organisation)
travel in a **proposed** extension, `hsi-scientific-profile-extension-1`. The backend may accept, change or reject it.

## Guards

- Free text is checked with `rejectPhiPayload` and an identifier check. Either failure blocks the whole submission.
- `findAccessFields` finds any key that names an access grant, membership, scope, token or secret. The interface sends none, and a test enforces it, including for administrators who chose institutional sharing. A sharing choice is a **preference**.

## Contracts

| Contract | Needs from the backend | Fail-closed rule | Today |
|---|---|---|---|
| Profile store | Verified principal, additive store | Writes refused until applied | Exists, refuses writes; device storage |
| Identity verification | ORCID OAuth server side, ADR-013 | Unverified iD is shown as unverified | Format check only |
| Institution membership | Administrator-driven invitation and confirmation, ADR-014 | A self-selected role never confers membership | Nothing sent |
| Access decision | Evaluated server side per request | Unknown or unreachable is deny | Everything shown as Not provisioned |
| Scientific memory | The existing investigation store (ADR-012), not a new one | Off or unknown retains nothing | No memory kept |
| Sharing policy | Authorised group and membership | Effective policy is the narrower of preference and grant | Private |
| External connections | Per-provider OAuth, tokens held server side | No connection until a provider flow completes | Interest only |

## The client

`createUnconfiguredClient()` is the only client. Every call resolves to `{ok:false, code:"NOT_CONFIGURED"}` with the
contract's fail-closed rule as the detail. It cannot be mistaken for success and stores or verifies nothing. A real
client replaces it only once the backend has accepted a contract.

## Open decisions for the owner

1. Accept, change or reject the profile extension schema.
2. Apply the additive profile store (the existing gate), or keep device storage.
3. Register an ORCID OAuth client.
4. Decide how administrator-confirmed membership is recorded (scope registry, ADR-014).
