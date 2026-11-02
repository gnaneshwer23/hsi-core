# HSI Role-Based Onboarding (§8.12)

**Document status:** Definitive post-auth routing and onboarding strategy  
**Reuse:** Aksh `/onboarding/role-select` + step spine; ISI Neon Auth + `user_roles`; public ecosystem role landings  

---

## 1. Principle

After authentication, route by **authorised role** into the correct workspace. Do not dump every user into a universal dashboard or an agent picker.

---

## 2. Role catalogue (product-facing)

| Role | Primary workspace | Maturity |
|------|-------------------|----------|
| Patient | Aksh Patient | Available (scoped) |
| Clinician (GP, nurse, pharmacist, …) | Aksh clinic → future HSI Clinical | Available precursor / Clinical Planned |
| Researcher / scientific user | ISI | Available |
| Trial coordinator / investigator ops | HSI Trials | Planned |
| Curator / scientific reviewer | ISI authenticated curation + hsi-core Gate C tools | Partial |
| Admin / organisation | Aksh admin / org settings | Partial |
| Public visitor | Ecosystem site (no auth) | In development (spec) |

Provision elevated roles explicitly (ISI pattern: signup ≠ write access).

---

## 3. Post-auth routing matrix

| Account claim | First destination | If product Planned |
|---------------|-------------------|--------------------|
| `patient` | Aksh `/dashboard/patient` (or onboarding resume) | — |
| `clinician*` | Aksh role dashboard from `ROLES[].dashboardPath` | Show honesty: Clinical product Planned |
| `researcher` | ISI `/ask` or `/explore` (prefer Ask as gateway) | — |
| `trial` | Trials home when shipped | Status page + Collaborate; no fake shell |
| `curator` / `reviewer` / `moderator` | ISI curation / Gate C queue | — |
| `admin` | Org admin home | — |
| Multiple roles | Workspace switcher chooser | Remember last workspace |

**Aksh note:** `REAL_ROLES` filter already limits real workspace to working products — preserve this honesty pattern ecosystem-wide.

---

## 4. Onboarding spines by role

### 4.1 Patient

Role → Identity → Link organisation → Preferences → Consent → Tutorial → My Health  
([`HSI_PATIENT_WORKSPACE_UX.md`](./HSI_PATIENT_WORKSPACE_UX.md))

### 4.2 Clinician

Role → Identity → Organisation → Preferences → Consent → Tutorial → Clinic Today/worklist  
Emphasise: shadow mode, HITL, synthetic vs live, no PHI→LLM in production claims.

### 4.3 Researcher

ISI auth → role check (`user` default) → optional Methods tour → Ask or Explore  
Do **not** force Academy completion before Ask. Curator tools only if provisioned.

### 4.4 Trial team

When Planned→Available: Role → Org/sponsor context → Training on five states (mandatory) → Studies home  
Training gate: cannot run screening until “never confirm eligibility” acknowledgement recorded.

### 4.5 Admin

Org setup → users → integrations → baselines (Aksh go-live pattern) → audit access  

---

## 5. Cross-product first login

```text
Sign-in (IdP per product)
        │
        ├─ No role → Role select (constrained to authorised set)
        ├─ Incomplete onboarding → Resume step
        ├─ Complete → Workspace home
        └─ Ecosystem SSO (future) → Switcher with ACL
```

**Future SSO** must not merge data planes. Token audiences stay product-scoped.

---

## 6. Microcopy

| Prefer | Avoid |
|--------|-------|
| “Choose how you’ll use HSI today” | “Select your AI agents” |
| “Researchers use ISI — educational, not CDS” | “Full clinical AI unlocked” |
| “Trial workspace is in development” | Empty Trials app that looks live |

---

## 7. Acceptance

1. New patient never lands on curator or agent-ops.  
2. New ISI signup cannot write evidence.  
3. Trial role cannot skip eligibility-safety acknowledgement when product ships.  
4. Multi-role users see switcher, not a mashed dashboard.
