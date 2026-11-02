# HSI Existing Agent Audit (§5.5)

**Document status:** Definitive intelligence audit — part of §5 Intelligence Engine pack  
**PRD companion:** [`HSI_INTELLIGENCE_ENGINE_SPEC.md`](./HSI_INTELLIGENCE_ENGINE_SPEC.md) (Document 03) — Spec §4 audit obligations; this file is Observed evidence. Honesty: [`HSI_DOC02_03_RECONCILIATION.md`](./HSI_DOC02_03_RECONCILIATION.md) (Documents 02 / 03 / 04).  
**Audit date:** 2026-11-02  
**Method:** Source inspection + prior audits (`HSI_EXISTING_SYSTEM_AUDIT.md`, Aksh `AGENT_FUNCTIONALITY_AUDIT.md`, hsi-core catalog tests). Production clinical runtime of Aksh agents was **not** re-executed end-to-end in this pass.  
**Repos:** `hsi-core`, `immunecity` (ISI), `aksh-health-redesign` (`packages/platform-uk`)  
**Classification:** **Verified** · **Partial** · **Mocked** · **Proposed** · **Missing**

**Binding rules:** Prefer reuse over recreation. Catalog in hsi-core ≠ CONDUCTOR runtime. `LIVE_ORGANISATIONS = 0`; `syntheticOnly: true`. No live CDS/PHI in hsi-core.

---

## 1. Summary

| System | What exists | Orchestration | Verdict |
|--------|-------------|---------------|---------|
| **Aksh** | 14 registered agents; CONDUCTOR clinical spine + HITL + SHIELD | Fixed-order supervisor (simulation) | **Reuse clinical agents in Aksh**; gateway later (X-H2) |
| **ISI** | Ask grounding, Discovery Intel tools, Gate C / Cite Check | Single conversational gateway — **not** a swarm | **Reuse as research tool router** |
| **hsi-core** | Aksh catalog JSON + ISI agent-adapter stubs | **No** runtime orchestrator | Catalog **Verified**; runtime **Missing** (intentional) |

**Aliases inspected (brief §5.5):** Navigator → **Missing** as named agent; Safety red-flag → **Partial** as `red_flag_escalation` human gate; Diabetes coach → **Partial** as separate diabetes/coaching path (not CONDUCTOR peer).

---

## 2. Aksh Health — register (14)

Canonical source: `packages/platform-uk/lib/agents/register.ts`. Directory: `lib/agents.ts`. Runners: `lib/agents/llm-*.ts`, `lib/clinical-proof/agent-orchestration.ts`, `lib/clinical-spine/orchestrate.ts`. APIs: `app/api/agents/*`. Audit: `docs/agents/AGENT_FUNCTIONALITY_AUDIT.md`.

| Name | Purpose | Code paths | Inputs | Outputs | Tools / models | Data | Safety | Tests | Status | Reuse |
|------|---------|------------|--------|---------|----------------|------|--------|-------|--------|-------|
| **CONDUCTOR** | Supervisor: fixed order, priority, safety route, HITL handoff | `register.ts`; `clinical-proof/agent-orchestration.ts`; `clinical-spine/orchestrate.ts`; `/api/agents/orchestrate` | patientId, optional transcript/drug, inclusion flags, timeouts | OrchestrationResult slots, queue priority, SHIELD event | **Type A** orchestrator; `modelFlag: null` | Synthetic patient view | Fail-closed timeouts; no accept on clinician behalf; `PROHIBITED_FOR_ALL` | `clinical-proof-orchestration`, `clinical-spine-phase-c` | **Verified** (simulation / `in_validation`) | **Keep** — clinical orchestration home; expose via X-H2 later; **do not** clone into hsi-core |
| **VOICE** | Dictation → transcript + confidence; `partOf: CANVAS` | Intake ASR / `/api/transcribe`; register | Dictated consultation | transcript + confidence | Deterministic / optional speech; no LLM flag | Session audio only | No ground-truth without confidence | `workflow-scenarios` | **Partial** — not on CONDUCTOR path | Improve intake; keep separate from VOICE CARE |
| **CANVAS** | Structured intake + source traces | `lib/intake-generation.ts` | ConsultationInput | Draft resources + GenerationTraceItem | Deterministic heuristics | Consultation + patient view | No inferred value without source snippet | `export-mapping`, `workflow-scenarios` | **Verified** (simulation) | Reuse for Cap 1/2 intake |
| **SYNTHESIS** | SOAP note draft | `llm-synthesis.ts`; `/api/agents/synthesis` | transcript, patient context | SynthesisDraft | Optional `ENABLE_LLM_SYNTHESIS` else deterministic | Shared patient context | HITL accept/edit/reject; no “filed to record” | Orchestration + review-decision tests | **Verified** (simulation) | Reuse documentation drafts |
| **DrASSIST** | Coding suggestions (SNOMED/ICD); `partOf: SYNTHESIS` | `llm-dr-assist.ts`; `/api/agents/dr-assist` | patientId, conditions/meds | DrAssistDraft codes | Optional `DR_ASSIST` + lexicon | Shared context | Suggestions only; no invent condition | Orchestration (opt-in) | **Verified** (simulation; often opt-in) | Terminology assist — not HSI entity resolver |
| **GUARDIAN** | Medication safety urgency | `llm-guardian.ts`; `/api/agents/guardian` | patientId, optional drug, diabetes safety notes | GuardianDraft red/amber/green | Optional `GUARDIAN` | Meds, allergies, KG stand-in | `humanGate: medication_decision`; ≠ guardian-gateway | HITL + hazard-trace | **Verified** (simulation) | **Primary reuse** for Cap 3 |
| **HORIZON** (legacy **ORACLE**) | Composite risk + factors | `llm-oracle.ts`; `/api/agents/horizon` | patientId, diabetes factors | Risk score/band | Optional `ORACLE` | Labs + patient view | No invent score; sole composite | Orchestration; eval partial on some goldens | **Verified** (simulation) | Cap 4/5 risk trends — descriptive vs validated prediction |
| **NEXUS** | Cross-signal correlation drafts | `llm-nexus.ts`; `contracts/run-nexus.ts` | patientId, authorised context | NexusDraft | Optional `NEXUS` + GraphRAG contract | Supplied signals only | Always draft; cannot trigger action | nexus-agent + orchestration | **Verified** (simulation) | Pattern for research correlation drafts — not ISI biology |
| **PATHWAY** (legacy **REFERRAL**) | Referral package after accept | `lib/referral-agent.ts`; `/api/agents/pathway` | Accepted note+codes | Referral draft / ServiceRequest draft | Rules | Accepted case | Further accept required | intervention-draft-shape | **Verified** (simulation) | Cap 6 care coordination |
| **BRIDGE** | FHIR R4 staging; never live write | `lib/bridge-staging.ts` | Accepted case | Staging record (`liveEmis: false`) | Deterministic FHIR map | Frozen evidence | No stage of rejected draft | demo-launch-d1 | **Verified** staging / **Mocked** live EHR | Cap 5/1 clinical data path — expand only with partners |
| **SHIELD** | Append-only hash-chained audit | SHIELD modules; orchestration gate | Every agent/decision event | Audit row | Deterministic | Event metadata | Immutable; fail → rollback decision | clinical-proof-shield | **Verified** (simulation) | **Lift pattern** into Intelligence Engine observability |
| **COMPASS** (legacy **EQUITY**) | Population disparity brief | `llm-equity.ts`; `/api/agents/compass` | Org/region aggregates | Population brief | Optional `EQUITY` | Aggregates only | No named patient | api-contracts | **Verified** (on_request, simulation) | Population — out of M1 scope |
| **PRISM** | Imaging scaffold | `prism-eval.ts`; `/api/agents/prism`; `contracts/run-prism.ts` | Synthetic imaging meta | Imaging-adjacent draft | Scaffold; no live PACS | Fixtures only | Not in CONDUCTOR auto loop | p4-prism-atlas-scaffold | **Mocked** / scaffold | Do not market live; Phase 2+ imaging |
| **ATLAS** (Aksh Trials Agent) | Protocol eligibility scaffold | `atlas-eval.ts`; `/api/agents/atlas` | Synthetic protocol/cohort | Eligibility draft | Scaffold | Synthetic fixtures | No recruitment approval; name collision with ISI Atlas (D8) | p4-prism-atlas-scaffold | **Mocked** / scaffold | Future Trials bridge only after rename/clarity |

**Environment honesty:** All registered agents `status: in_validation`, `environment: simulation` (scaffolds on_request). Clinical release: **`LIVE_ORGANISATIONS = 0`**.

---

## 3. Aksh — out-of-register / aliases

| Name / alias | Purpose | Code | Status | Reuse |
|--------------|---------|------|--------|-------|
| **Navigator** | Brief candidate name | No matching `AgentId` or directory peer | **Missing** | Do not invent; if needed, map to CONDUCTOR/PATHWAY UX later |
| **Safety red-flag** | Escalation gate | `HumanGateId = "red_flag_escalation"` in `lib/types.ts`; `lib/human-gates.ts`; workflow scenario tests | **Partial** (gate, not agent) | Preserve as high-risk HITL gate |
| **Diabetes coach / coaching** | Sleep/nutrition/exercise/mental-health + diabetes coaching API | `lib/precision-health/coaching.ts`; `/api/agents/{sleep,nutrition,...}`; `app/api/patients/[id]/diabetes-coaching` | **Partial** (deterministic coaching; synthetic) | Stay in Aksh; Cap 4 metabolic — **do not** clone to hsi-core |
| **Diabetes agent-intel** | `runAgentOrchestration` name collision | `lib/diabetes-intelligence/agent-intel-assemble.ts`; `connected-journey-orchestrate.ts` | **Partial** — parallel track ≠ CONDUCTOR | Preserve as diabetes vertical; fixture for future clinical workflows |
| **VOICE CARE** | Synthetic outbound escalation | `lib/agents/voice-care.ts` | **Partial** / synthetic | Not VOICE agent; do not conflate |
| **Guardian Gateway** | PASS/REVIEW/BLOCK pre-enqueue | `lib/guardian-gateway/` | **Verified** (policy gate) | Pattern for Cap 3 + clinical safety checks |
| **Causal AI** | Hypothesis stub | `lib/precision-health/causal-ai.ts` | **Mocked** | Not research Cap 15 |

---

## 4. ISI (immunecity) — research intelligence

| Name | Purpose | Code paths | Inputs | Outputs | Tools / models | Data | Safety | Tests | Status | Reuse |
|------|---------|------------|--------|---------|----------------|------|--------|-------|--------|-------|
| **Ask Immune / AskAtlas** | Single research conversational gateway | `src/components/immune/AskAtlas.tsx`; corner FAB | User question + graph context | Grounded answer / refuse | `prepareAsk` + optional LLM | `kg.json` + approved cites | Fail-closed clinical-personal; citation validate | `askGrounding` unit suites | **Verified** grounding; live LLM quality **Not assessed** | **Primary research gateway** for Workflow B (M1) |
| **askGrounding** | Intent, guardrails, retrieval prep, rate limits | `src/lib/askGrounding.ts` | Question text | AskGrounding package | Deterministic classes + graphContext | Browser-safe KG | Prompt injection / override locks | Multiple ask-* tests | **Verified** | Type A/B foundation under orchestrator |
| **Discovery Intel** | Bounded cross-examine / intel attach | `src/lib/discovery/intel4.ts`, `intel4Attach.ts` | Discovery items | Typed intel actions | Tool scaffolding | HSI consume / Neon queue | Not multi-agent autonomy | hsi-phase0 / discovery tests | **Partial** | Improve as **tools**, not swarm |
| **Gate C queue / curation** | Human evidence gate | `gateCQueue.ts`; curation route `?hsi=cite` | Candidates + REL maps | human_approved / reject; never auto | Human + Check | autumn-snow ISI Neon | `autoApprove=false`; cdsSurfacable=false | hsi-phase0 cite-ready tests | **Verified** honesty path; **Partial** end-to-end public cite | Cap verification / Layer 5 |
| **Cite Check** | Identifier verification PMID/DOI | `check-cite-candidates-from-gate-c.ts` | Gate C rows | verified / not_found… | PubMed/Crossref server-side | External APIs | Check ≠ supports ≠ Approve | 13/13 identifiers cited in audits | **Verified** Check; supports **Partial** (human) | Evidence verification service |
| **Trial Intelligence** | Melanoma-oriented trial UI | `TrialIntelligence.tsx` | Disease/trial fixtures | Educational trial surface | Flag-off by default | Static/registry fragments | No confirmed eligibility | Flag-gated | **Partial** / flag-off | Seed for Caps 16–20 — not HSI Trials product |
| **Graph engine** | Neighbours, paths, REL-* | `src/lib/immune/engine.ts` | Concept ids | Subgraph slices | Deterministic Type B | `kg.json` + drafts | Draft flagged | graph connectivity tests | **Verified** | Cap 7–11 / Workflow B–C tools |
| **Multi-agent swarm** | Named investigator fleet | — | — | — | — | — | — | — | **Missing** (intentional) | Build pipelines first |

---

## 5. hsi-core — catalog and stubs

| Name | Purpose | Code paths | Status | Reuse |
|------|---------|------------|--------|-------|
| **Aksh agent catalog** | Inventory only; `notCds`, `clinicalActive: false` | `src/akshAgents.ts`; `aksh/agent-catalog.json`; site `/aksh-agents`; `docs/AKSH_AGENTS_IN_HSI.md` | **Verified** catalog | X-H1 reference; not runtime |
| **ISI agents adapter proposals** | P3 stub proposals → Gate C pending | `src/adapters/isiAgentsAdapter.ts`; `src/cli/isi-agents-adapter.ts`; publish artifact JSON | **Mocked** / proposal stubs | Stay proposals until eval |
| **CDS/PHI boundary** | Refuse live CDS/PHI | `src/cdsPhiBoundary.ts` + docs | **Verified** policy/tests | Orchestrator hard rule |
| **CONDUCTOR runtime** | Clinical spine in this repo | — | **Missing** (by design) | Never add |

---

## 6. Cross-repo duplication and disposition

| Concern | Finding | Decision |
|---------|---------|----------|
| Duplicate CONDUCTOR | Catalog vs Aksh runtime | Runtime stays Aksh; hsi-core catalog only |
| ATLAS naming | Aksh ATLAS vs ISI Atlas | D8 rename before marketing |
| Discovery naming | ISI Discovery vs hsi-core Discovery SPA | D7 clarify |
| Diabetes orchestration | Separate from CONDUCTOR | Keep parallel; document honestly |
| Research investigators | Vision names vs code | **Proposed** as Type B pipelines behind Ask/briefs |

---

## 7. Reuse recommendations (founder-facing)

1. **Clinical Caps 1–6:** Prefer Aksh CONDUCTOR peers + diabetes/coaching modules; Integration Gateway (X-H2) before any second clinical orchestrator.  
2. **Research Caps 7–15:** Prefer ISI Ask + engine + Gate C + hsi-core grades; promote named investigators only after eval bars.  
3. **Trials Caps 16–20:** Prefer rules + registry tools; Aksh ATLAS scaffold is **not** production matching.  
4. **Verification:** Independent services (Cite Check, Gate C, SHIELD patterns) — not a second LLM.  
5. **Do not build:** Navigator agent; CONDUCTOR-in-hsi-core; agent-per-marketing-noun.

---

## 8. Limitations

- Aksh production org behaviour not re-run (`LIVE_ORGANISATIONS=0` already forbids live clinical claim).  
- ISI live LLM answer quality not scored in this pack.  
- Partner EHR / Medplum live paths absent (`liveEmis: false`).

**Stop:** This audit feeds architecture and catalogue — no agent implementation from this document alone.
