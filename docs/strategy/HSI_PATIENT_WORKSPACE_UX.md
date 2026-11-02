# HSI Patient Workspace UX (§8.10)

**Document status:** Definitive patient experience specification  
**Product home:** Aksh Health — **Available** for scoped diabetes workflows (with synthetic / shadow / validation honesty)  
**Do not** rebuild patient UX in hsi-core or clone Aksh into ISI  
**Journey (binding):** My Health → Timeline → Symptoms → Medication → Monitoring → Care Team → Relevant Research (education-grade)

---

## 1. Job to be done

> Help me understand and organise my **available** health information between clinical encounters — without pretending the app is my doctor.

---

## 2. Journey specification

| Step | Goal | Aksh reuse | Rules |
|------|------|------------|-------|
| **My Health** | Orient | Patient dashboard | Clear “shared with clinic” vs private |
| **Timeline** | See what happened | Patient record / history views | Source + time; gaps visible |
| **Symptoms** | Report in plain language | Intake / pre-visit questions | Patient-reported ≠ verified diagnosis |
| **Medication** | Track what I take | Meds capture | No silent “adherent” inference |
| **Monitoring** | Glucose / BP / weight / CGM | Patient app share + uploads | Sufficiency rules (e.g. wear days) before relying on metrics |
| **Care Team** | Know who decides | Clinic link / invite code | Aksh never contacts patients as clinic |
| **Relevant Research** | Learn cautiously | Educational links only | No enrolment pressure; no “you are eligible” |

ISI `/patient` is a **teaching** explorer for immunology — keep labelled educational; not the Aksh patient home.

---

## 3. Progressive onboarding

Align with Aksh `/onboarding/*` spine; patient-specific:

1. **Role** — Patient  
2. **Identity** — account + verification appropriate to product  
3. **Organisation link** — invite code + DoB (existing pattern)  
4. **Preferences** — units, notifications, sharing defaults  
5. **Consent** — what is shared with clinic; revoke path  
6. **Tutorial** — first reading, first share, how review works  
7. **Complete** → My Health  

**Progressive disclosure:** Ask for CGM upload only after basic readings succeed; research education only after core monitoring works.

---

## 4. Educational vs advice (binding)

| Educational (allowed) | Advice / care decision (restricted) |
|-----------------------|-------------------------------------|
| “What time-in-range means” | “Change your insulin dose” |
| “General consensus targets — your clinician decides” | “You should start this medicine” |
| Approved / published educational ISI content | Personalised treatment selection |
| “Ask your care team about …” | Impersonating the clinician |

Any insight card must state: **educational** or **for discussion with your clinician**.

---

## 5. No fabricated measurements

| Rule | UX |
|------|-----|
| Absence → “Not recorded” | Never interpolate a number as fact |
| Patient-reported | Chip until clinician checks (Aksh pattern) |
| Synthetic demos | Persistent Synthetic banner |
| Device gaps | Show wear % / data days; disable “reliable metrics” until thresholds met |
| AI drafts | Stop at human gate for clinic-facing notes — patients see their own words + shared status |

---

## 6. Primary panels

- **Today** — next action (share reading, upload CGM, answer pre-visit)  
- **Measurements** — list + charts with source chips  
- **Shares** — what clinic can see  
- **Messages / hand-offs** — only if product supports; owner + due time (clinic side)  
- **Insights** — educational, dismissible, non-diagnostic  
- **Download my data** — preserve Aksh export affordance  

---

## 7. Microcopy rules

| Prefer | Avoid |
|--------|-------|
| “Shared with your clinic — waiting for review” | “Your doctor has diagnosed …” |
| “Not enough sensor days yet” | Filling charts with invented points |
| “Educational — not personal medical advice” | “Aksh recommends treatment X” |
| “Studies you can discuss with your team” | “You are eligible for this trial” |

---

## 8. Acceptance questions (patient)

1. Do I know what I’ve shared vs what stays private?  
2. Can I tell patient-reported from clinic-confirmed?  
3. Does the app invent readings when data is missing? (Must be no.)  
4. Is research content clearly not a care instruction?  
5. Can I complete onboarding without choosing a clinician agent?
