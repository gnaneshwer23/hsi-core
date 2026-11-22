# HSI production readiness phase (21 November 2026)

**Plan artifact:** [`docs/plans/HSI_PRODUCTION_READINESS_PHASE_2026-11-21.md`](../plans/HSI_PRODUCTION_READINESS_PHASE_2026-11-21.md)  
**Baseline main:** `321ae53f`  
**Companion audit:** post-merge acceptance audit (21 Nov 2026)

## Stance

HSI is **partially production-ready**: public site + synthetic Demo Universe are closest to launch; the live scientific platform is **not** ready for unrestricted researcher use.

Launch in stages:

1. **Public launch** — landings, honesty labels, Demo Universe  
2. **Restricted research preview** — authenticated continuous investigation, fail-closed writes  
3. **General availability** — clearance, isolation, durable persistence, SME evaluation, then pilot

## Release-gate policy

- **In:** HSI 1.0 acceptance matrix, owner-gates worksheet, CI + production probe, security/isolation evidence  
- **Out:** Internal business pre-mortem — useful for strategy, **not** a technical release blocker

## Next execution order

1. U1 — Register / STATUS / acceptance-doc reconcile  
2. U2 — Public launch QA packet  
3. U3 — Open PR hygiene (#371/#511/#513/#514; reconcile #512/#578/#579)  
4. U4 — Restricted-preview journey evidence soft-land  
5. U5+ — Reliability hardening and owner packets as authorised  

Do **not** enable held migrations, production research writes, or unapproved deploys from this phase alone.


## Execution progress (this branch)

| Unit | Status |
| --- | --- |
| U1 Register / STATUS / acceptance reconcile | Done on this PR |
| U2 Public launch QA packet + evidence | Done on this PR |
| U3 Open PR hygiene note | Done (owner still closes PRs) |
| U4 Continuous journey evidence soft-land | Done (owner fills staging refs) |
| U5 API reliability (Ask / live investigation envelopes) | Done — see `HSI_U5_API_RELIABILITY_HARDENING_2026-11-21.md` |
| U6 Owner packets Human #2/#3/#5 scaffold | Done — see `HSI_10_OWNER_PACKETS_U6_SOFT_LAND.md` (owner still fills refs) |
| U7 Scientific reliability / Human #4 scaffold | Done — see `HSI_10_SCIENTIFIC_RELIABILITY_U7_SOFT_LAND.md` (no gold invented) |
| U8 Pilot readiness / Human #8 scaffold | Done — see `HSI_10_PILOT_READINESS_U8_SOFT_LAND.md` (invites still blocked) |
| U9 API envelope wave 2 + Ask Retry-After UI | Done — see `HSI_U9_API_ENVELOPE_WAVE2_2026-11-21.md` |
| U10 Client Retry-After across research UIs | Done — see `HSI_U10_CLIENT_RETRY_AFTER_2026-11-21.md` |
| U11 Access-request client + L0 launch readiness | Done — see `HSI_U11_ACCESS_REQUEST_AND_L0_LAUNCH_2026-11-21.md` (owner GO still open) |
| U12 L1 restricted-preview readiness + write/health codes + PROD-QA-003 scan | Done — see `HSI_U12_RESTRICTED_PREVIEW_AND_WRITES_CODES_2026-11-21.md` (owner staging grant still open) |
| U13 Interrogative API stable codes + `scan:client-bundle` script | Done — see `HSI_U13_INTERROGATIVE_API_CODES_2026-11-21.md` |
| U14 Live evidence + scientific site API codes | Done — see `HSI_U14_LIVE_AND_SCIENTIFIC_API_CODES_2026-11-21.md` |
| U15 Gateway envelope wave 3 (onboarding / graph / router / snapshot) | Done — see `HSI_U15_GATEWAY_ENVELOPE_WAVE3_2026-11-21.md` |
| U16 Client-bundle secret scan in CI (PROD-QA-003) | Done — see `HSI_U16_CLIENT_BUNDLE_SCAN_CI_2026-11-21.md` (AppSec still open) |
| U17 Restricted-preview client envelopes (`code` + Retry-After) | Done — see `HSI_U17_RESTRICTED_PREVIEW_CLIENT_ENVELOPES_2026-11-21.md` |
| U18 Auth Retry-After + graph / researcher workspace envelopes | Done — see `HSI_U18_AUTH_AND_GRAPH_CLIENT_ENVELOPES_2026-11-21.md` |
| U19 Interrogative delivery client envelopes | Done — see `HSI_U19_INTERROGATIVE_DELIVERY_CLIENT_ENVELOPES_2026-11-21.md` |
| U20 Access-request alert + Retry-After polish | Done — see `HSI_U20_ACCESS_REQUEST_ALERT_RETRY_2026-11-21.md` |
| U21 Remaining preview client envelopes | Done — see `HSI_U21_REMAINING_PREVIEW_CLIENT_ENVELOPES_2026-11-21.md` |
| U22 Reviewer / governed client envelopes | Done — see `HSI_U22_REVIEWER_GOVERNED_CLIENT_ENVELOPES_2026-11-21.md` |
| U23 Context-audit / discovery client envelopes | Done — see `HSI_U23_AUDIT_DISCOVERY_CLIENT_ENVELOPES_2026-11-21.md` |
| U24 Agent checkpoint resume + reconciliation apply | Done — see `HSI_U24_AGENT_CHECKPOINT_RESUME_2026-11-21.md` (live agent workloads still not approved) |
| U25 Agent tool fence + orphan RUNNING refuse | Done — see `HSI_U25_AGENT_TOOL_FENCE_2026-11-21.md` (live agent workloads still not approved) |
| U26 Agent fingerprint versioning + revision-round contract | Done — see `HSI_U26_AGENT_FINGERPRINT_VERSIONING_2026-11-21.md` (no hash rewrite; DB revisions still open) |
| U27 Agent fenced tool caller host wiring | Done — see `HSI_U27_AGENT_FENCED_TOOL_CALLER_2026-11-21.md` (retrieval + mechanism stages; live agents still not approved) |
| U28 Remaining bounded-stage tool fences | Done — see `HSI_U28_REMAINING_STAGE_FENCES_2026-11-21.md` (all bounded tool stages fenced; live agents still not approved) |
| U29 Orchestration wall-clock budget | Done — see `HSI_U29_ORCHESTRATION_WALL_CLOCK_BUDGET_2026-11-21.md` (cooperative cancel; live agents still not approved) |
| U30 Orchestration cancel / termination taxonomy | Done — see `HSI_U30_ORCHESTRATION_CANCEL_TAXONOMY_2026-11-21.md` (classified stops; side effects not undone) |
| U31 Recovery decision trail + bounded termination surface | Done — see `HSI_U31_RECOVERY_DECISION_TRAIL_2026-11-21.md` (research_admin live E2E still open) |
| U32 External tool adapter cancel/idempotency audit | Done — see `HSI_U32_EXTERNAL_TOOL_ADAPTER_AUDIT_2026-11-21.md` (live multi-process adapter E2E still open) |
| U33 Exclusive checkpoint ownership race | Done — see `HSI_U33_EXCLUSIVE_CHECKPOINT_OWNERSHIP_2026-11-21.md` (OS multi-process via U38 fixture; Neon live still open) |
| U34 Crash/restart recovery soft-land | Done — see `HSI_U34_CRASH_RESTART_RECOVERY_2026-11-21.md` (OS multi-process via U38 fixture; Neon live still open) |
| U35 Owner-authorized research agent runtime | Done — see `HSI_U35_RESEARCH_AGENT_RUNTIME_2026-11-21.md` (owner approved engineering build; GA / Gate C / PHI still closed) |
| U36 Public L0 GO + clinical synthetic approvals | Done — see `HSI_U36_PUBLIC_CLINICAL_OWNER_APPROVALS_2026-11-21.md` (real PHI / ADR-0010 gates still open) |
| U37 Owner-authorized live scientific platform | Done — see `HSI_U37_LIVE_SCIENTIFIC_PLATFORM_2026-11-21.md` (L1 engineering composition; staging grant / preview GO / writes still open) |
| U38 Multi-process crash/restart E2E harness | Done — see `HSI_U38_MULTIPROCESS_CRASH_RESTART_E2E_2026-11-21.md` (fixture OS E2E green; Neon live still owner-gated) |
| U39 Expanded checkpointed research-agent roles | Done — see `HSI_U39_EXPANDED_RESEARCH_AGENT_ROLES_2026-11-21.md` (verifier / hypothesis / policy; entity/graph/interrogator closed by U44) |
| U40 Restricted-preview auth + continuous-journey evidence runners | Done — see `HSI_U40_RESTRICTED_PREVIEW_EVIDENCE_RUNNERS_2026-11-21.md` (fill U12 with owner staging refs; preview GO / checklist #1 still open) |
| U41 Scientific Companion text-first (KG/evidence) | Done — see `HSI_U41_SCIENTIFIC_COMPANION_TEXT_FIRST_2026-11-21.md` (voice/avatar/networking still Phase 3+) |
| U42 Scientific Companion live-evidence binding | Done — see `HSI_U42_COMPANION_LIVE_EVIDENCE_2026-11-22.md` (caller-supplied metadata only; companion network retrieval still closed) |
| U43 U12 evidence fill-apply from U40 proposals | Done — see `HSI_U43_U12_EVIDENCE_FILL_APPLY_2026-11-22.md` (dry-run default; preview GO / checklist #1 still false after apply) |
| U44 Remaining checkpointed research-agent roles | Done — see `HSI_U44_REMAINING_AGENT_ROLES_2026-11-22.md` (`full_ssc`: entity_resolver / graph_reasoner / interrogator; LLM / Neon live still closed) |

Verified acceptance remains **0 / 8**. Phase engineering units U1–U44 soft-landed; owner evidence still required.
