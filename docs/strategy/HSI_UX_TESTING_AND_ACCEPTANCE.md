# HSI UX Testing and Acceptance (§8.37)

**Document status:** Definitive usability / acceptance questions for role workspaces  
**Aligns:** ROLE 9 key question · workspace UX specs · Vision §2.16 (outcomes over feature counts)

**Key question (binding):**  
Can a clinician or researcher accomplish a meaningful task **without** understanding HSI’s internal technical architecture?

---

## 1. Test method

| Mode | Use when |
|------|----------|
| Task-based usability (moderated) | New journey or IA change |
| Honesty / claim review | Marketing or status copy |
| Accessibility pass | Per [`HSI_RESPONSIVE_ACCESSIBILITY_PLAN.md`](./HSI_RESPONSIVE_ACCESSIBILITY_PLAN.md) |
| Synthetic-only | Clinical/Trials until live release criteria |

Pass = task success + honesty checks. Fail if user relies on agent names, invents eligibility, or cannot find missing data.

---

## §8.37 Role test questions

### 8.37.1 Clinician

**Scenario:** Review a synthetic patient with incomplete labs and a draft summary.

1. Find the correct patient without guessing identity.  
2. State which data sources are present vs missing in under one minute.  
3. Open a lab result and name its source and time.  
4. Reject or edit a draft summary; confirm underlying facts remain.  
5. Attempt trial screening (if shown): confirm UI never says the patient is eligible.  
6. Complete the review without naming or selecting an internal agent.  

**Pass criteria:** Steps 1–4 and 6 succeed; step 5 has zero “eligible/confirmed” copy.

### 8.37.2 Researcher

**Scenario:** Investigate why anti-TNF response varies in RA (or equivalent pack-backed question).

1. Start from Ask or a disease/cell entry — not a blank engineering doc.  
2. Reach a graph or mechanism view with inspectable edges.  
3. Identify at least one reviewed vs unreviewed claim.  
4. Distinguish Research Radar from HSI Discovery (if both visible).  
5. Explain what is uncertain or conflicting without leaving the product.  
6. Save or export a brief-like artifact (or document gap if Partial).  
7. Confirm no fake live omics/agent results were presented as real.  

**Pass criteria:** 1–5 and 7; 6 pass or explicitly logged as known Partial.

### 8.37.3 Patient

**Scenario:** Link to clinic (or demo), add a reading, interpret an insight.

1. Complete onboarding without clinician-agent selection.  
2. Know what is shared vs private.  
3. Enter or upload a measurement; see patient-reported labelling.  
4. Encounter missing/insufficient CGM data — confirm no fabricated points.  
5. Open any research/education content — recognise “not medical advice.”  
6. Never see “you are eligible for this trial.”  

**Pass criteria:** All six.

### 8.37.4 Trial team

**Scenario:** Screen a synthetic candidate against a study criteria set.

1. Open criteria table and locate all **five** states represented in legend/UI.  
2. Find at least one `unknown` or missing attribute and its action.  
3. Confirm no control sets overall patient eligibility to confirmed.  
4. Complete investigator review decision with audit identity.  
5. See trial freshness / retrieval date before trusting matches.  
6. Export or view a screening report that preserves criterion-level states.  

**Pass criteria:** All six; automatic fail on any “Patient eligible” string in primary UI.

### 8.37.5 Public visitor (ecosystem site)

1. State HSI’s five-verb proposition after the homepage.  
2. Name the four products.  
3. Correctly classify one Available vs one Planned capability.  
4. Reach Collaborate or a real product CTA without opening engineering Climb as primary story.  

---

## 2. Cross-cutting honesty checklist

- [ ] Synthetic / demo labelled  
- [ ] Not CDS / educational labels where required  
- [ ] Categories not collapsed  
- [ ] No unexplained confidence %  
- [ ] No agent names required in primary path  
- [ ] Missing data visible  

---

## 3. Sign-off

| Role | Reviewer | Result | Date |
|------|----------|--------|------|
| Clinician tasks | | | |
| Researcher tasks | | | |
| Patient tasks | | | |
| Trial tasks | | | |
| Public visitor | | | |

**No implementation launch** without founder approval and completed applicable rows above.
