# 6. Real-world scenario and QA test pack

These scenarios test software with generated or registered samples. They do not prove clinical utility, privacy certification, moderation accuracy or reliable automatic scientific reasoning.

## Scenario journeys

| Scenario | Data and action | Required result |
| --- | --- | --- |
| A: metabolic inflammation | Generated metabolic profile, 24-month HbA1c/CRP series, lifestyle/wearable/microbiome context | Synthetic labels, missing streams visible, no asserted gut mechanism or diagnosis |
| B: autoimmune pattern | Generated lupus-like context, artificial dsDNA/C3/CRP trajectory | Timeline coherence and measurement units; no flare diagnosis or treatment advice |
| C: response uncertainty | Generated IBD-like exposure with variable response parameter | Multiple possible research explanations; no individual drug efficacy or dose claim |
| D: healthy control | Constructed normal-range core labs and no active fixture condition | Do not invent disease from missing streams or normal data |
| E: group boundary | Simulated beta member attempts alpha read/action | Explicit denial, no scoped export of alpha records |
| F: moderation | Create low-risk question, reply, queue causal assertion, request edit and revise | New version retained; risky unchanged text does not become visible |
| G: appeal | Hold privacy canary, author appeals, separate moderator accepts | Return to queue; no auto-publication or real privacy escalation sent |
| H: enforcement | Repeated risky fixture submissions, warning/mute, separate moderator ban | Posting stops; prior records and local audit remain |
| I: shadow all-pass | Test thresholds all pass | Independent review recommended; canary/production/graph mutation remain false |
| J: scientific failure | Synthetic, retraction, conflict and rejection controls | Block or quarantine; ordinary graph version unchanged |
| K: kill switch | Enable rehearsals, produce local results, activate kill | Panels unmount, new actions unavailable; re-enable starts empty |
| L: deployed policy | Set staging/production policy and enable every local flag | No rehearsal rollout or live patient capability becomes enabled |

The supplied “expected mechanisms” are testable research prompts, not established chains. No article, causal pathway or clinical conclusion is fabricated to make a scenario pass. The existing claim graph/source corpus remains separate from synthetic validation records.

## Automated checks

Core tests cover policy defaults/kill/deployed refusal, seed/config bounds, deterministic packs, chronological events, explicit units/rounded flags/derived indices, constructed control ranges and missingness. State-machine tests cover strict sample commands, evidence refs, group and role checks, idempotent/conflicting retries, hidden-parent behavior, revisions, appeals and restriction progression. Shadow tests verify all-pass cannot publish and negative controls quarantine/refuse.

Browser tests cover enabling/disabling, generation and downloads, labels and timeline filters, private-group errors, moderation/appeal actions, shadow states, kill/reset behavior, mobile overflow and automated accessibility. Accessibility automation is not manual WCAG certification. No live email, patient data, community database, graph write or notifications are used.

## Manual/live acceptance still required

Actual actor/tenant/group isolation, invitation/revocation, retention/deletion including backups, audited exports, abuse/load/outage controls, durable logs, operational recovery and alerts need a separately authorised backend implementation. Source/scientific trust, calibrated models and expert benchmarks need real evidence and qualified reviewers. Privacy attacks against real-data-trained generators and clinical safety review are not replaced by synthetic coherence checks.

## Build sequence and definition of done

1. **This pack:** six design documents; local default-off rehearsals; deterministic generator; explicit limitations; tests and receipt.
2. **Scientific/data validation:** review assumptions, distributions, source rights, bias and independent benchmarks before expanding claims.
3. **Community service proposal:** separately scoped trusted storage/auth/moderation/retention and operational owners before any actual private pilot.
4. **Graph operations:** existing human-review/release acceptance remains mandatory; no new auto-approval route.
5. **Clinical product design:** separate authorised plane only; current HSI live-workflow test must refuse.

The prior production-readiness gates remain open. Never set `pilotReady` or scientific approval merely because these local tests pass.
