# 5. Automatic graph promotion specification — shadow only

## Current rule

HSI does not auto-approve Gate C or let an AI turn a candidate into trusted science. Existing authenticated review, source rights and versioned graph-release rules remain authoritative. A feature flag, claimed human-sampling percentage or local export cannot bypass them.

`src/capabilities/shadowPromotion.ts` implements a **local advisory shadow assessor**. It does not write a candidate store, change retrieval, create a canary audience, publish, demote or roll back a real graph. Every result explicitly denies canary, production, scientific approval and graph mutation; observations are unauthenticated test controls.

## Suggested signal targets, not measured HSI accuracy

| Signal | Shadow target |
| --- | --- |
| Entity-resolution metric | 0.95 |
| Claim-support metric | 0.90 |
| Independent sources | 2 |
| Evidence types | 2 |
| Benchmark grounding | 0.95 |
| Human-sample approval | 0.90 |

Also require valid/permitted sources, checked claim text, predicate/direction, complete context, no unresolved conflict or safety sensitivity and a rehearsed recovery path. Counts are not automatically independent evidence. Numeric test controls do not establish calibration, reviewer authority or scientific truth.

## Implemented states

Disabled → blocked or shadow assessment → recommendation for independent review. Retraction, unresolved conflict or human rejection controls produce a local `quarantined` result. All-pass signals produce **recommend_independent_review**, not canary or production. Synthetic candidates remain blocked as scientific evidence.

The UI provides missing-evidence, all-pass, synthetic-candidate, retraction, conflict and rejection controls. They are invented software inputs with no claim that a real paper was retracted or a real expert agreed. Each result preserves the simulated input signals, threshold version targets and reasons so it can be replayed. History is local and excluded from normal graph retrieval. Reset clears only this rehearsal, not any source/review/release audit.

## Future authorised lifecycle

Candidate → independently source-checked claim → shadow evaluation → qualified human adjudication → specifically authorised, versioned release candidate → explicit operational acceptance → publication under the existing trusted release process. Automation may prepare checks and publication mechanics after authority is established; it cannot decide scientific approval.

Any future canary experiment needs authenticated audience controls, a separate retrieval namespace, immutable method/source versions, adequate independent expert labels, measured error bounds and predefined stop criteria. Shadow and canary observations must never leak into ordinary trusted retrieval. Rejected, superseded and retracted assertions retain lineage and downstream invalidation evidence.

Diagnosis, treatment, drug safety, paediatric/pregnancy guidance, patient-specific conclusions, single weak sources and unresolved scientific contradictions cannot use an automatic trust path. In current HSI, clinical processing remains excluded altogether.

## Rollback and quarantine design

Before a real release: retain a verified previous release, immutable source/claim/review history, downstream dependency index and reproducible retrieval version. Quarantine should exclude an affected assertion from eligible retrieval, preserve the prior version and audit the reason; never delete history. Test controlled rollback in an approved isolated target and verify in-flight investigations retain their pinned evidence.

No such production mutation or restore is executed by the local assessor. There is no SLA, benchmark pass, canary approval, independent human sample or legal/source clearance invented in this implementation.
