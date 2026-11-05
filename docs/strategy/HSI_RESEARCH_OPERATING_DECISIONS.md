# Research operating decisions and unresolved acceptance

Scoped to HSI research, not a new clinical processing programme. Reuse [clinical safety/governance](HSI_CLINICAL_SAFETY_AND_GOVERNANCE.md), the [no-CDS/no-PHI boundary](../CDS_PHI_BOUNDARY.md), [Phase H controls](../PHASE_H_RESEARCH_PILOT_OPERATIONS.md) and [pilot runbook](../RESEARCH_PILOT_RUNBOOK.md). This is an open-decision record; no named owner or legal approval is invented.

## Decisions before a live research pilot

| Decision | Status / owner | Evidence required |
| --- | --- | --- |
| Pilot scope and permitted source uses | Pending accountable scientific/data owner | Bounded question/indication, actual source rights, passage/embedding/export permissions |
| Participant/interview consent and contact retention | Pending founder/privacy owner | Purpose, note/recording consent, access, retention/deletion and withdrawal process |
| Account/research-role provisioning | Trusted backend exists; live alignment/provisioning pending ops owner | Verified separate accounts, current roles, source scopes and revocation tests |
| Data controller/processor responsibilities | Pending privacy/legal owner | Source/partner terms and responsibilities for each processing flow |
| Hosting and provider residency | Pending documented end-to-end review | Hosting, DB, backups, logs, subprocessors and any future model region/retention terms |
| Retention/deletion and audit preservation | Pending policy/operating owner | Distinguish contact/account information, licensed source caches, immutable research decisions and operational logs |
| Model/provider data use | No new provider configured | No training/retention assumptions; approve actual provider terms and minimisation before sending any data |
| Cost/latency budgets | Candidate budget and owner unset | Per-run token/tool/result budgets, price snapshot, retry ceiling, failure policy and measured cost |
| Support and incident response | Runbook exists; real owners/contact route pending | Tested intake/triage, protected incident records, escalation and maintenance/recovery rehearsal |
| Scientific quality/thresholds | Expert labels and approved thresholds pending | Independent labelling/adjudication, held-out evaluation and accountable release decision |
| Pilot adoption and business analytics | Measurement design only | Participant agreement, event definitions, denominators, retention and privacy controls |

UK/EU preference or a database endpoint region does not establish all processing locations or compliance. Patient-identifiable data are outside this HSI pilot. Any future clinical programme needs its own authorised product/data plane and privacy/legal assessment; a consent checkbox or FHIR mapping alone does not authorize it.

## Retrieval and investigation threat scenarios

| Threat | Existing control / required next control | Acceptance demonstration |
| --- | --- | --- |
| Retrieved source contains hostile instructions | Treat source text as data; narrow outputs/tool permissions; bounded execution | Retrieved text cannot alter roles, source grades, instructions or invoke arbitrary tools; red-team fixtures plus real held-out testing |
| Licensed passages leak into embeddings/cache/exports | Current source-scope checks; new retrieval indexes/caches must preserve ACL/use terms and revocation | Revoke access and show retrieval, cached reuse and later export deny it |
| Cross-owner record access or forged reviewer role | Backend session/role/ownership/independent reviewer checks | Two real identities; no browser-selected authority; self-review and foreign record reads denied |
| Graph/entity context drifts across species/tissue | Typed assertions/context and source-bound dossiers; explicit retrieval metadata filters | Wrong-context evidence excluded or clearly quarantined, never used as matching support |
| Copied passages inflate apparent evidence | Source/passage hashes; future fusion needs duplicate grouping | Multiple chunks/copies of one study do not count as independent evidence |
| Provider key or partner credential leaks | No keys in code/chat/export; maintain secret bindings and incident process | Revoke/rotate through the authorised service, assess impact and confirm cleanup without logging secrets |
| Compromised upstream/partner artifact | Independent pins/signature policy where applicable; exact contract verification | Altered/stale/wrong-scope artifact refused while prior verified snapshot remains |
| Long-running agent/query exhausts budget | Existing request bounds; future retrieval needs depth/path/result/token/retry budgets | Timeout/cancel/truncation are visible and do not fabricate success or trigger unbounded retries |
| Partial source outage appears as consensus | Channel-level completion/failure receipts and explicit search scope | Failed search and no-result search remain distinct; opposing-evidence completeness not invented |
| Feedback/telemetry leaks question or patient text | Existing allowlisted operational events; proposed product metrics must exclude prose | No raw questions, passages, emails, tokens, review rationale or clinical records in general analytics |
| Friendly UI hides uncalibrated confidence | Explicit evidence/review states; calibrated confidence unset | Source approval, brief approval, retrieval score and scientific probability stay separate |
| Model/prompt changes silently reach production | Versioned instructions/configuration, evaluation, human-controlled release and rollback | Pin changes, rerun frozen regression/safety cases and record actual release approval |

These controls are not proof of comprehensive security, de-identification, fairness or legal conformity.

## Product feedback and measurement: proposed, not collected

Suggested correction categories: helpful/not helpful, missing evidence, wrong biological context, irrelevant source and scientific inaccuracy. Bind future claim feedback to an opaque investigation/package/claim version and current authorised actor. Feedback is not a scientific review or an automatic training/graph update. Do not launch training or retain feedback for another purpose without approved terms and versioned evaluation.

Suggested events: activation, investigation saved, evidence inspected, brief exported, independent review recorded and repeated research use. Capture bounded codes/counts/timings instead of content. Do not report active users, retention, conversion or time savings until actual event collection/definitions and participant agreement exist.

Clinical questions should receive a clear research boundary and safe redirection. No supported/contested classification should be styled as a measured confidence level. Empty-source states should identify the searched scope, permissions/configuration failures and whether review was performed.

## First operating task

Assign real owners and permitted processing/source terms, complete the paused staging authentication/role acceptance, and run the existing two-account workflow before a real design-partner study. This document does not authorize production database changes, migrations, outreach, paid providers or live patient ingestion.
