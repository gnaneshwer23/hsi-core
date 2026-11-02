# HSI Agent Safety Model (§5.12–5.14)

**Document status:** Binding safety model for Intelligence Engine capabilities  
**Aligns:** [`HSI_CLINICAL_SAFETY_AND_GOVERNANCE.md`](./HSI_CLINICAL_SAFETY_AND_GOVERNANCE.md) · Aksh `PROHIBITED_FOR_ALL` · hsi-core `cdsPhiBoundary`  
**Status honesty:** Clinical agents **Verified** only in simulation (`LIVE_ORGANISATIONS=0`).

---

## 1. Risk tiers (§5.13)

| Tier | Examples | Approval / gates | Current map |
|------|----------|------------------|-------------|
| **Low** | Public entity lookup; approved graph browse; published metadata fetch | No mandatory human per query; rate limits + audit | ISI Atlas/Ask browse **Partial**/Verified |
| **Medium** | Evidence synthesis; gap analysis; hypothesis draft; research brief | Label uncertainty; **expert review before** promote to approved knowledge (Gate C) | Gate C **Verified** path; briefs **Proposed** |
| **High** | Patient-specific recommendations; medication changes; trial eligibility decisions; clinical record modification; research use of identifiable data | Authz + validation + **human oversight**; fail-closed | Aksh HITL gates **Verified** (sim); eligibility confirmation **Missing** (must stay forbidden) |

---

## 2. Explicit restrictions (non-negotiable)

| Restriction | Rationale | Enforcement today |
|-------------|-----------|-------------------|
| **No PHI to research planes** | P2 ↛ P0/P1 Neon | neonGuard / Gate C host assert / cdsPhiBoundary **Verified** |
| **No fabricated citations** | Trust substrate | Cite Check + validateAnswerCitations **Partial**/Verified |
| **No confirmed eligibility** | Human investigator owns decision | Product rule; Trials matcher **Missing** must not invent |
| **No autonomous Rx / dose change** | Clinical safety | Aksh `PROHIBITED_FOR_ALL` + GUARDIAN HITL **Verified** (sim) |
| **No finalise diagnosis / live record write** | Same | Register prohibited; BRIDGE `liveEmis:false` |
| **No auto-approve Gate C / knowledge** | Scientific integrity | `autoApprove=false` **Verified** |
| **No agent-dependent medicine** | Vision §2.11 | Prefer Type A/B/C |

Additional Aksh prohibitions apply to clinical peers: no patient message send; no competing composite risk scores; no staging unaccepted cases.

---

## 3. Approval gates catalogue

| Gate | Tier | Trigger | Owner |
|------|------|---------|-------|
| `medication_decision` | High | GUARDIAN med safety | Prescriber |
| `referral_pathway` | High | PATHWAY draft | Responsible clinician |
| `red_flag_escalation` | High | Escalation scenarios | Clinician (**Partial** as gate, not agent) |
| HITL accept/edit/reject | High/Med | SYNTHESIS, codes, risk drafts | Clinician |
| Gate C Check → supports → Approve | Medium | Evidence promotion | Curator/reviewer |
| Hypothesis expert review | Medium | Cap 15 output | Scientific reviewer |
| Trial investigator review | High | Cap 18 report | Trial team |
| Org go-live / LIVE_ORGANISATIONS | High | Clinical production | Safety officer — **currently 0** |

---

## 4. Memory categories (§5.12)

Do **not** give agents unrestricted persistent memory.

| Category | Contents | Retention / ACL | Must not |
|----------|----------|-----------------|----------|
| **Workflow state** | Ephemeral task scratch | TTL for run; role-scoped | Become clinical SoT |
| **User preferences** | UX settings | User-controlled | Override safety |
| **Clinical context** | Authorised patient pack | Purpose-bound; P2 only | Enter research tools |
| **Scientific knowledge** | Versioned KG / packs | Curator-governed | Silent LLM overwrite |
| **Research workspace** | Saved investigations, hyps | Researcher ACL | Auto-publish |

Agent-generated text must not silently become authoritative clinical or scientific knowledge.

---

## 5. Failure handling & safe degradation (§5.14)

Required behaviour for unavailable sources, failed queries, missing records, ambiguous terms, conflicts, timeouts, invalid outputs, insufficient permissions, stale trials:

1. Detect and record affected operation  
2. Preserve completed **verified** results  
3. **Never fabricate** missing info or citations  
4. Communicate limitations  
5. Retry only when idempotent and safe  
6. Escalate by risk tier  

**Special:** Failed evidence retrieval → no model-memory citations. Clinical tool failure → CONDUCTOR-style fail-closed (no partial silent accept).

---

## 6. Capability-level safety boundaries (summary)

| Caps | Bound |
|------|-------|
| 1–2 | No inferred undocumented diagnosis; missing ≠ negative |
| 3 | No autonomous prescribe |
| 4–5 | Trends ≠ validated prediction; no causation from order alone |
| 6 | No unauthorised care-plan change / patient instruction send |
| 7–11 | Association ≠ patient-active mechanism; no individual microbiome causality |
| 12–15 | No fabricated cites; no LLM voting to “resolve” science; hyps unvalidated |
| 16–20 | No confirmed eligible; preserve ambiguous criteria |

---

## 7. Proposed vs verified

| Element | Status |
|---------|--------|
| Aksh prohibited actions + HITL | **Verified** (simulation) |
| ISI Ask fail-closed clinical-personal | **Verified** (tests) |
| Shared risk-tier engine across four products | **Proposed** |
| Unified memory ACL service | **Missing** |

**Stop:** No weakening of Guardian/SHIELD/Gate C for feature speed.
