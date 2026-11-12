# Benchmark curation engineering and remaining acceptance

Marketing pages are outside this change. Next-A/B approvals remain with the user. This increment implements offline/private review contracts; it neither supplies an approved workspace nor establishes that the rest of the platform is live-accepted.

## What changed

- Added a default-disabled private curation service using the canonical 120-slot/domain schema. No second benchmark platform or agent is created.
- Server identity, current consent/domain/COI grants, source permission and protected storage are trusted adapters. Clients cannot supply their role or principal. Records require a distinct author, two assessors and adjudicator.
- Case assignments are version/hash bound. Assessors see only their own submitted assessment. Adjudicator access begins after both assessments lock. Authors cannot inspect assessments through this service. Public view excludes labels, rationale and assessor identities.
- Assessment submission is immutable and idempotent for an identical request. Atomic compare-and-swap prevents lost updates. Different concurrent submissions must reload/reconcile; there is no silent overwrite. Adjudication binds both assessment commitments and is also immutable. Different labels cannot be recorded as agreement; equal labels may have different independent rationales.
- Current grant/source checks are repeated before writes. Calls are bounded. A timed-out storage write is uncertain and requires reconciliation, not automatic retry. The durable adapter must enforce authenticated tenant/record bindings, append-only history, authority checks at commit, transaction isolation and protected encryption/audit/backup controls. A service-level policy does not replace database/workspace security.
- No endpoints, identities, private storage, grants, messages or production configuration are provisioned. No actual security or scientific signer is fabricated. Returned decisions never approve science/freeze/production.
- Added a private authoring workbook validator: exactly 120 canonical slots, distinct draft questions, all 17 canonical context fields, zero fabricated gold/reviews/clearance and no holdout eligibility. The local earlier draft file had 13 combined context labels; it has been corrected to the actual 17-field contract with explicit not_extracted values. The source-free draft tasks are not source-bound final cases.
- Public artifact scanning now also rejects private authoring/review schemas and nonempty draftQuestion fields. Public allocation slots remain permitted. This structured-field tripwire supplements, not replaces, vault-derived contamination scanning of text, prompts, retrieval, tuning and all assets.

## Reproducible private authoring validation

Run `bun --no-env-file scripts/check-private-immuno-authoring.ts --private-workbook /absolute/private/path.json`. The file must be a regular owner-only file (not a symlink), bounded to 8 MB. The command outputs counts/status only and never contacts services, imports source passages into public assets or marks drafts as scientific cases. Do not put private workbook paths/content into public CI or PR comments. Only synthetic fixtures are committed here.

Local recruitment and authoring deliverables remain outside Git. They include candidate-discovery contacts, unsent invitation/COI forms, unapproved paid/voluntary planning options and 120 model-exposed draft tasks. No one is recruited and no source-backed gold cases are complete. Model-exposed candidates require independently authored replacement/revision plus exposure/family-split review, or must remain development material; they cannot silently become an unseen holdout.

## Additional gates beyond Next-A/B

1. Appoint recruitment/budget authority; approve actual recipients, participation/confidentiality/payment terms and independently verify expertise/COI. No invitations or sharing are authorized yet.
2. Select and secure the real private workspace. Test revocation, cross-assignment/tenant access, blind assessment, immutable/concurrent submission and recovery on that actual workspace before uploading source packets/gold.
3. Author permitted source/version/span/context packets and the actual separate development/final corpus. Obtain two independent expert assessments plus adjudication for each final case. Source clearance depends on Next-A operations; real account storage security depends on Next-B and workspace acceptance.
4. Preregister scientific methodology, dispute/exclusion rules, eight-dimension floors and subgroup/risk error budgets before tuning/final evaluation. Current numeric floors remain unapproved.
5. Complete the protected live SSc+RA audit journey and actual durable worker/provider/assessment composition before the locked 120-case comparison. Existing offline tests do not establish live completion.
6. Real alerts, recovery drills, soak and exact-artifact release packet remain operational acceptance prerequisites. More tests or a merged PR do not supply 14 days of telemetry or independent approval.

## Engineering checks

Synthetic tests cover disabled access, unassigned/wrong-domain/unknown sessions, consent/COI, source withdrawal, blind peer/author/adjudicator access, self-review, case-hash mismatch, immutable/idempotent/concurrent submission, agreement versus disagreement, stale authority and bounded stalled callbacks. Private draft validation rejects wrong quotas/slots/context or claimed completion. Public leakage tests reject private schemas/questions. These are engineering contracts, not effective security proof of any real workspace or scientific validation.
