# 3. Live patient workflow specification — design only

**Not implemented or enabled in HSI.** Current repository policy excludes live PHI, clinical decision support, patient stores, PHI-to-LLM and EHR write-back. Local flags cannot override it. No partner, MoU, clinician role, consent or legal basis is invented by this specification.

This is a design checklist for a separately authorised clinical product/data plane. Pseudonymised records can remain personal data; pseudonymisation does not remove access, legal-basis or residency obligations.

## Proposed controlled flow

Authorised source → controller/legal-basis and purpose validation → consent where applicable → minimum-data/pseudonymisation step → classification → scope-constrained ingestion → actor/purpose/record check → bounded research context → permitted evidence retrieval → uncertainty-preserving output → accountable professional review → immutable audit → approved retention/deletion process.

Patient identities, linkage keys, access policies and clinical records belong in their authorised plane. HSI's public literature/graph store and community must not receive them. No public-model prompt, analytics payload, exception trace, URL, screenshot, export or notification should contain restricted context without independently approved purpose and protection.

## Required authoritative records

| Record | Minimum fields |
| --- | --- |
| Purpose/consent decision | Subject reference in authorised plane, legal basis, allowed purpose/scopes, validity, withdrawal and provenance |
| Actor authority | Verified identity, tenant/partner membership, role, purpose and record scope; revocation status |
| Ingestion receipt | Controller-approved source, record class, schema/version, permitted transformation, hash and access policy |
| Context assembly | Explicit permitted fields, time window, exclusions and missing data; no implied diagnosis |
| Access/export audit | Actor, purpose, policy version, target class, action, result, minimal request correlation and timestamp |
| Retention/deletion decision | Actual approved schedule, owner, storage scope, backup policy, legal exceptions and evidence of execution |

No fixed “90 days” retention is adopted. The controller and legal/privacy owners must approve the actual policy. An administrator must not bypass purpose, consent or audit by editing a client field.

## Role design

Clinician: permitted clinical plane only; no public sharing. Researcher: approved research scope; no direct identity access by default. Curator: scientific evidence review without patient identity. Administrator: operational permissions without a blanket clinical-data bypass. Community member: no patient-record access.

These are requirements, not HSI role grants. The current HSI signup workflow must not create a clinician role, accept live records or activate CDS. Research reviewer permissions remain separately provisioned by the trusted backend.

## Acceptance tests for a future authorised plane

Expired/withdrawn consent, incorrect purpose, wrong tenant, guessed record ID, revoked actor and unapproved export must fail before context is returned. Verify encryption/keys/residency, retention including backups, redacted logs, SSRF/upload bounds, idempotent access records, incident escalation and a functioning kill switch. Establish actual partner/legal/clinical/security owners and independent review before any pilot claim.

The supplied clinician scenario may be rehearsed using generated synthetic records only. **In current HSI, the live version's expected outcome is refusal**, not conditional ingestion. No clinical-benefit or privacy/compliance certification follows from synthetic simulation.
