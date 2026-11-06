# 1. Capability scope and release plan

Human Super Intelligence. This pack implements local rehearsals and design specifications, not partner agreements, clinical processing or a production launch.

| Capability | Repository state | Deployed/live acceptance | Guard |
| --- | --- | --- | --- |
| Public pages and research tools | Existing implementation | Prior QA gates remain unresolved | Actual build/deployment and scientific acceptance |
| Existing 200-profile validation explorer | Existing synthetic fixtures | Not clinical evidence | Labels and claim guard preserved |
| New longitudinal cohorts | Deterministic generator and local UI | Internal synthetic rehearsal only | Default off, numeric configuration only |
| Live patient workflow | Specification only; excluded in HSI | Not enabled or authorised | Cannot be enabled by any local flag |
| Community publishing | Sample-only local rehearsal | No live posts, private pilot or notifications | Fixed fixture identities, membership, actions and local audit |
| Graph promotion | Local shadow assessor | No canary, production write or scientific approval | Human authority and existing release gates remain separate |

## Release states

Proposed lifecycle: not built → internal prototype → synthetic validation → private pilot → flag-gated beta → limited production → general availability. State changes require evidence; an uploaded vision matrix is not a release receipt. The implemented registry uses `internal_prototype`; it does not infer a live product from passing tests.

Every live capability needs an accountable owner, approved audience, server-controlled flag, kill switch, monitoring/incident owner, rollback plan and immutable acceptance record. **All real owners remain unassigned.** No person, organisation, signed pilot, moderation SLA or scientific acceptance is invented.

## Implemented policy

`src/capabilities/governance.ts` defines four default-off flags. `/research/capabilities` permits an explicit local rehearsal switch. Reload restores default-off behavior. Selecting staging or production policy makes every rehearsal unavailable regardless of those switches. The global kill switch unmounts the panels, clears their browser-memory state and disables new actions.

These browser switches are a policy rehearsal, not an operational feature-flag service or authorisation boundary. A production release would require trusted backend configuration and identity verification. No capability here exposes a live endpoint that publishes, ingests patient files or provisions roles.

`live_patient` is denied even when its input flag is true. Graph shadow assessment always returns `productionAllowed: false`, `canaryAllowed: false`, `scientificApprovalGranted: false` and `graphMutationPerformed: false`.

## Release acceptance

1. Local correctness: deterministic fixtures, scopes, idempotency and invalid-input refusals.
2. Independent scientific and legal review: rights, model assumptions, methods and truthful product scope.
3. Separate live capability approval: actual actors, server permissions, policies, controller/processor agreements and operational owners.
4. Staging rehearsal: wrong-role, wrong-group, revoked access, timeout, retries, deletion/retention and rollback, on an authorised target only.
5. Exact candidate deployment and monitoring acceptance. Existing QA and pilot-readiness checks must remain restrictive.

No automatic advancement follows a percentage score. Live PHI/CDS and Gate C auto-approval remain excluded by the existing HSI boundary. The future clinical design in document 3 belongs to a separately authorised product plane unless that boundary is explicitly changed.
