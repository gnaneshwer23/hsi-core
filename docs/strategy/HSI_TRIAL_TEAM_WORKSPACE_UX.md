# HSI Trial Team Workspace UX (§8.11)

**Document status:** Definitive trial-team experience specification  
**Product home:** HSI Trials (**Planned**)  
**Precursor:** ISI Trial Intelligence melanoma educational UI — **Partial**, flag-gated, **not** this workspace  
**Journey (binding):** Study Criteria → Candidate Screening → Missing Evidence → Review → Recruitment Workflow  

**Safety (non-negotiable):** Never declare confirmed eligibility. No UI string “Patient eligible” / “AI confirmed eligible.” Investigator owns enrolment ([`HSI_BIOLOGY_TO_TRIALS_WORKFLOW.md`](./HSI_BIOLOGY_TO_TRIALS_WORKFLOW.md)).

---

## 1. Job to be done

> Help me identify potentially relevant candidates and understand which eligibility criteria need verification.

---

## 2. Five criterion states (binding table UX)

| State | Meaning | Visual |
|-------|---------|--------|
| `satisfied` | Available evidence supports criterion | Green / clear positive — still not “eligible overall” |
| `not_satisfied` | Available evidence fails criterion | Red / clear negative |
| `unknown` | Required attribute missing / inaccessible | Grey + Missing chip |
| `ambiguous` | Criterion or evidence unclear | Amber |
| `requires_investigator_review` | Human must decide | Accent + Review queue |

**Forbidden sixth product state:** `eligible` / `confirmed_eligible`.

**Row requirements:** state · patient attribute source (Cat 1) · criterion text provenance · evaluation method · timestamp · freshness of trial record.

---

## 3. Journey panels

### 3.1 Studies

- Registry-backed study list with freshness stamps  
- Protocol / criteria version  
- Disease–mechanism links (educational vs screening mode labelled)  

### 3.2 Criteria

- Full criteria table for selected study  
- Extract confidence separate from match state  
- Unstructured criteria → force `ambiguous` or `requires_investigator_review`  

### 3.3 Screening

- Candidate list with **per-criterion** rollups — not a single green “pass”  
- Summary: counts per state; explicit “no overall eligibility determination” banner  

### 3.4 Missing evidence

- Checklist of attributes to obtain  
- Owner + due date (Aksh hand-off pattern reuse)  

### 3.5 Review

- Investigator decision panel: Proceed to consent discussion · Do not proceed · Need more data  
- HumanGateBar; audit under signed-in account  
- Decision note required for Proceed  

### 3.6 Recruitment workflow

- Post-decision operational steps (contact via **clinic channels**, scheduling)  
- HSI does not auto-contact or auto-enrol  

### 3.7 Evidence

- Mechanistic rationale for why study appeared (Cats 2–4 honesty)  
- Separate from criterion match table  

---

## 4. Review workflow (happy path)

1. Open study → lock criteria version + freshness check  
2. Select authorised candidate cohort / referral packet  
3. Run assessment → criteria table populated  
4. Resolve unknowns (request data) or mark blocked  
5. Investigator reviews `requires_investigator_review` + overall packet  
6. Record decision + rationale  
7. Export screening report (§6.20 shape)  
8. Hand off to recruitment ops if appropriate  

---

## 5. Microcopy rules

| Prefer | Avoid |
|--------|-------|
| “Criterion satisfied based on available evidence” | “Patient eligible” |
| “Needs investigator review” | “AI approved for enrolment” |
| “Trial data as of {retrieval date}” | Stale lists without dates |
| “Educational comparison only” (ISI melanoma mode) | Head-to-head superiority claims |
| “Not for patient self-enrolment pressure” | Patient push notifications of “you match” |

Patient educational surfaces (X-E1) may mention research opportunities **without** criterion-level eligibility UX.

---

## 6. Relationship to ISI Trial Intelligence

| ISI today | Trials product |
|-----------|----------------|
| Arm-level educational outcomes | Screening workspace |
| Feature-flagged | Purpose-built P3 plane |
| Non-causal warnings | Five-state matcher + review |
| No candidate matching product | Candidate screening |

Do not “flip the flag” and call it HSI Trials.

---

## 7. Acceptance questions (trial team)

1. Can I see all five states in the criteria table?  
2. Is there any control that sets overall “eligible”? (Must be no.)  
3. Can I find missing attributes as an actionable list?  
4. Is investigator decision mandatory before recruitment steps?  
5. Is trial freshness visible before screening?
