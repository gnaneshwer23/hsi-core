# HSI Clinician Workspace UX (§8.8)

**Document status:** Definitive clinician experience specification  
**Product home:** HSI Clinical (**Planned**) — Aksh clinic dashboards are **precursor patterns**, not the full Clinical product  
**Journey (binding):** Search → Identity → Timeline → Context → Evidence → Trials (optional)

---

## 1. Job to be done

> Help me understand this patient's **available** history, relevant changes and unresolved information — without implying universal hospital access.

---

## 2. Journey specification

| Step | User goal | UI | Must show | Must not |
|------|-----------|-----|-----------|----------|
| **1 Search** | Find the right person | Search by authorised identifiers | Match confidence / ambiguity | Silent auto-pick on weak match |
| **2 Identity** | Verify person | Identity panel + org context | Verification status, source of ID | LLM-guessed identity |
| **3 Timeline** | Reconstruct available encounters | Longitudinal timeline | Source system, event time, recording time | Fake completeness |
| **4 Context** | Grasp current picture | Context summary panel | Problems, meds, labs, trends, **missing** | Ungrounded narrative as fact |
| **5 Evidence** | Link to biology/evidence | Evidence entry points | Cat badges; de-id concepts | PHI dumped into ISI |
| **6 Trials** | Optional screening | Handoff to Trials packet | Five criterion states | “Eligible” / auto-enrol |

---

## 3. Primary panels

### 3.1 Identity header (persistent)

- Display name / initials per policy  
- Date of birth / identifiers as authorised  
- Verification state  
- Organisation / access purpose  
- “Records available from: …” with gaps listed  

### 3.2 Timeline

- Group by encounter / day  
- Event types: visit, lab, med change, procedure, note summary (acl)  
- Filters: type, source, time range  
- Click → provenance drawer  

### 3.3 Clinical context

- Structured sections: Active problems · Medications · Recent labs · Allergies · Care plan notes  
- **Missing information** list (Cap 9) — absence ≠ negative finding  
- Draft AI summary only behind HumanGateBar (Aksh HITL reuse)  

### 3.4 Labs & meds

- Trends with units, reference ranges, source  
- Reconciliation **support** — clinician decides discrepancies  

### 3.5 Evidence (cross-domain)

- “Related biology / evidence” uses Exchange B / X-B1 concepts — **In development**  
- Opens Evidence drawer or ISI in new workspace without PHI query params  

### 3.6 Trial screening (optional)

- “Assess possible studies” → Trials workspace with packet  
- Clinician remains accountable for referral decisions  

---

## 4. Microcopy rules

| Prefer | Avoid |
|--------|-------|
| “Based on available records from …” | “Complete medical history” |
| “Not on record” / “Unavailable” | Invented values |
| “Draft — needs your review” | “AI diagnosed” |
| “Possibly relevant studies — investigator decides” | “Patient eligible” |
| “Educational biology context” | “Clinical decision support recommendation” (unless separately regulated) |
| Task names: “Draft summary”, “Check interactions” | Agent codenames in primary UI |

**No agent names in primary UI.** Map internal agents to verbs: Draft note · Check medicines · Rank slot · Flag urgent. Advanced “agent ops” stays admin-only.

---

## 5. Relationship to Aksh today

| Aksh pattern | Clinician workspace reuse |
|--------------|---------------------------|
| Review queue Accept/Edit/Reject | Context draft gate |
| Glucose worklist prioritisation | Task triage model |
| Patient 360 / timeline fragments | Timeline panel precursor |
| Slot-fill ranking with reasons | Explainability pattern |
| Multi-dashboard GP/nurse/pharmacist | Role **filters**, not separate products |

**Do not** ship HSI Clinical as a copy of `/dashboard/gp/agent-intelligence`. Collapse to the six-step journey.

---

## 6. States & honesty

| State | UX |
|-------|-----|
| No integration | Empty timeline + connect guidance |
| Partial sources | Explicit source chips; missing list |
| Synthetic demo | Persistent Synthetic banner |
| In validation | Amber “not for real care” |
| Live care | Only after safety release — **not claimed today** |

---

## 7. Acceptance questions (clinician)

See also [`HSI_UX_TESTING_AND_ACCEPTANCE.md`](./HSI_UX_TESTING_AND_ACCEPTANCE.md) §8.37.

1. Can I tell which records are present vs missing in under 30 seconds?  
2. Can I see source and time for a lab without leaving the timeline?  
3. Can I reject a draft summary without losing the underlying facts?  
4. Am I ever told a patient is “eligible” for a trial by the UI? (Must be no.)  
5. Do I need to know agent names to finish a review? (Must be no.)
