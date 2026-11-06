# 4. Community publishing and moderation specification

## Implemented scope

A local, sample-only state machine lives in `src/capabilities/communityRehearsal.ts` and `/research/capabilities`. This is separate from existing local discussion drafts and is not a live community service. No external free text, document upload, real member identity, public post, notification or escalation message is accepted/sent.

Fixed simulated actors have predefined membership in alpha/beta groups. The UI's identity selector is a test persona switch, never an HSI authorisation grant. Scoping checks are useful model tests, not proof of server-side group isolation: the complete fixture state exists in the tester's browser memory.

## Local workflow and policies

Registered sample → declared fixture rule → visible locally / queued / held → independent simulated moderator → edit, hold, removal or escalation record → author revision or appeal → re-review. Source references must be one of the registered bibliographic fixtures; attaching a reference does not prove it supports a statement.

| Sample | Result |
| --- | --- |
| Research question / methodological reply | Visible in the private local rehearsal |
| Unsupported causal certainty | Queued for review |
| Personal medical-advice example | Held; local clinical-safety escalation reason |
| Privacy or harassment canary | Held; local privacy/conduct reason |

The canaries contain no real identifier or harassment target. This lookup is not a general PII detector, medical-safety model, spam classifier or copyright scanner. Arbitrary text and extra command fields are refused rather than pretending to classify them safely.

## Model actions

Members create samples, reply to visible records, report visible records, revise their own queued/held/needs-edit samples into a new record, and appeal eligible holds/removals. The original record remains in history. Hidden parents prevent unrelated members from reading descendant replies. Authors may inspect their own local drafts; moderators see their scoped local queue.

Independent simulated moderators may allow low-risk unchanged samples, request edits, hide, remove, escalate, warn, mute, ban, accept/reject appeals or prepare a curation handoff. An unchanged high-risk sample cannot be allowed. Accepted appeals return to the queue rather than auto-publishing. Curation handoff does not create a graph edge or approve evidence.

Three risky sample submissions cause a simulated warning; five cause a mute. A moderator can explicitly ban. Restrictions cannot be silently downgraded through warn/mute actions. These are test rules, not an actual account-enforcement policy.

Each command has a bounded ID and exact allowed fields. Replaying the same ID and body is idempotent; conflicting reuse is refused. Local audit entries retain the action, actor, group, local-clock timestamp, policy version, reason codes and outcome. Scoped export excludes other groups and other members' private audit entries. Export explicitly marks `livePublishing: false` and `operationalAudit: false`.

## Requirements before an actual private pilot

- Trusted authentication, invitation and group membership verified on every backend read/write/export; RLS and revocation tests.
- Durable post versions, replies, reports, moderation decisions, policy versions, appeals and tamper-resistant operational audit.
- Input/file bounds, actual PII/spam/safety/copyright controls with measured error rates and human review for uncertainty.
- Source reuse/attribution policies; no diagnosis, treatment instructions, patient-identifiable content, harassment or promotion of unproven interventions.
- Real moderation/privacy/security/clinical-safety owners, incident intake and tested notifications. Proposed response windows from the suggestion are **not agreed SLAs**.
- Appeals and enforcement policy, reviewer independence, account restriction expiry/unban controls, retention and deletion policy.
- Evidence-linked curation queue remains independent from scientific graph publication.
- Server feature flags, rollout audience and kill/rollback procedures. Invite counts do not substitute for vetting or signed partner/processing agreements.

Real production moderation must not rely on this browser state, persona selector or canned outcome table. No private pilot or public community is declared available by this pack.
