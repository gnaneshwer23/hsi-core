# Unified research outcome

Implemented 5 November 2026 as an additive composition over the saved investigation and verified evidence brief. This is the first connected outcome view for the [ultimate product function](strategy/HSI_ULTIMATE_PRODUCT_FUNCTION.md), not a completed autonomous scientific reasoning system.

## Use

Open **Research → saved investigation**, capture a permitted release-bound evidence context, then refresh the evidence brief. The **Unified research outcome** section provides five selectable views:

- Overview: saved answer, assessment, uncalibrated confidence, recorded/completed-stage distinctions and limitations.
- Mechanism & evidence: selected primary-source relationship, source human review, exact passage, source link/version/hash, biological context and branch bindings.
- Questions & hypotheses: saved question tree, candidate statements, uncertainty and falsification questions.
- Next research & trials: missing evidence, research-planning tasks and explicit absence of an attached registry search.
- Review & provenance: actual independently recorded brief decision, method and immutable source/package/outcome hashes.

Download the outcome as cited Markdown or JSON. The original complete evidence-package exports and source-grounded baseline remain available for inspection. No separate page or public marketing claim was added.

## Backend contract

Authenticated read-only route:

`GET /api/research/interrogative/:id/outcome`

No format returns the structured outcome. A single `?format=json` or `?format=markdown` produces an attachment. Other formats/queries, identity/release overrides and mutations are refused.

The trusted delivery service rechecks the backend session, roles, ownership or independent reviewer entitlement, current source permissions, saved package integrity and current decision before composition. Source revocation denies subsequent reads/exports. This endpoint does not require or enable writes; it creates no migrations, grants, source approvals or stored outcome cache.

The compiler checks exact evidence-brief scope and submission/decision bindings, source passage hashes and primary-release claim references. Branch evidence must use matching source IDs, source review decision, epistemic type, recorded biological context and primary graph paths. Optional paths must be connected and include the referenced claim relationship. RA comparison context is not automatically primary branch support.

`hsi-research-outcome-1` is built using `hsi-bound-outcome-projection-1`. It includes exact saved conclusions/candidates, source metadata/passages, contexts, branch traces, gaps, research questions, review and methods. It invokes no model or external search, draws no new causal conclusions and supplies no calibrated probability. Predictions, experimental protocols and controls remain null when not specified by the saved record. Trials remain `not_queried`; this is not trial absence or patient eligibility.

A conservative keyword screen identifies several patient-specific/out-of-scope questions and suppresses an implied scientific answer from the pinned SSc context. It explicitly reports `semanticScopeValidated:false`; it is not a comprehensive clinical or semantic classifier.

## Integrity and rendering

The outcome hash covers canonical DTO content including source, investigation, submission and decision bindings. Download responses include content/package/outcome SHA-256 headers and no-store, Cookie variation and nosniff headers. Serialized and rendered exports are capped at 2 MB.

The browser loads the backend outcome and checks it against its independently verified current delivery package and decision. It never accepts only a self-declared outcome hash. Downloads must match that exact verified DTO, rendered format and response hashes. JSON/Markdown exports carry review scope and limitations. Markdown escapes inline markup; source text is rendered as inert text in React.

The projection omits technical actor principals, reviewer references, raw tool-call arguments and session payloads. This is **not anonymization**: researcher-entered question/rationale and source prose still require appropriate permissions. Exports are not authorised for public publication merely because their hashes match.

## Verification and operating limits

Local test coverage includes deterministic composition and exports; source/context/claim/decision tampering; wrong owner, ungranted role, lost reviewer entitlement and source revocation; read-only operation with disabled writes; legacy/unbound refusal; independent acceptance without scientific upgrade; scope abstention; browser source navigation, keyboard/mobile layout and rejected downloads.

Browser checks use test-only records and in-memory trusted services. They certify neither real scientific approval nor live Neon/Vercel configuration. No production database or authentication configuration was changed. Live access alignment, approved corpus, migrations 014/015 and the Phase H operating acceptance remain pending. The existing frontend bundle-size warning remains.

Verification receipt: 735 core tests passed; the full browser suite passed 84 checks; the 10 investigation/delivery browser checks passed again after the final layout refinement. Core build, site TypeScript, API TypeScript, site build and source/coverage consistency checks passed. These are local engineering results, not scientific validation.
