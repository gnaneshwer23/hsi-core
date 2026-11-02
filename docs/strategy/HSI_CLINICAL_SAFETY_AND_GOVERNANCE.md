# HSI Clinical Safety and Governance

**Jurisdiction focus:** UK first; international later.  
**Binding non-goal (current stage):** No live CDS and no PHI in hsi-core research substrate (`docs/CDS_PHI_BOUNDARY.md`, `src/cdsPhiBoundary.ts`).

---

## 1. Design principles

1. Separate patient-identifiable data from public biomedical knowledge.  
2. No autonomous clinical decisions; HITL / Gate C for consequential outputs.  
3. Never present AI trial match as confirmed eligibility.  
4. Label claim types: Observed → Established evidence → Association → Inference → Hypothesis.  
5. Audit every access and high-impact action.  
6. Do not claim regulatory clearance without evidence.

---

## 2. Privacy & data protection (UK)

| Topic | Expectation |
|-------|-------------|
| UK GDPR / DPA 2018 | Lawful basis, purpose limitation, DPIA for clinical planes |
| Special category health data | Explicit condition + safeguards |
| Data minimisation | Research plane = de-id or anonymous |
| Retention / deletion | Per plane policies; partner contracts |
| International transfer | SCCs / adequacy when expanding |

Clinical plane controllers/processors TBD with institutional partners — not assumed.

---

## 3. Identity, access, consent

- Verified identity before longitudinal record access (Workflow B).  
- RBAC + ABAC (role, organisation, purpose, patient panel).  
- Consent / authorisation as required by care / research context.  
- ISI already: Neon Auth + `user_roles` for curation.  
- Aksh: clinical HITL roles — map into future HSI Clinical IAM.

Record matching errors are clinical safety risks — dual-check / threshold policies required before any multi-provider merge.

---

## 4. Clinical safety management

| Framework | Applicability |
|-----------|---------------|
| DCB0129 (manufacturer) | When software is a medical device / clinical risk system |
| DCB0160 (deploying org) | NHS deploying organisations |
| DSPT | Supplier / NHS data security |
| MHRA SaMD classification | Assess before clinical claims; Aksh agents currently `in_validation` — **not** cleared products |

Safety case artifacts (hazard log, clinical risk management file) are **Phase 6 prerequisites** for live clinical intelligence claims — not website copy.

---

## 5. Research ethics & data access

- Gate C for evidence promotion.  
- Partner packs require real agreements (`lockedPilot` honesty).  
- Public citations only `curation=approved`.  
- Hypotheses remain unvalidated until promoted.  
- Microbiome: no individual causality from population associations.

---

## 6. Model & agent evaluation

- Separate eval sets for research vs clinical vs trials.  
- Red-team for PHI leakage into research prompts/logs.  
- Monitor HITL reject reasons; feed safety reviews.  
- Version models; pin for reproducible briefs.

---

## 7. Security threat modelling (initial)

Threats: prompt injection → tool misuse; confused deputy across planes; Neo4j/SQL injection on graph APIs; insider export of PHI; supply-chain on LLM providers; fake partner claims.

Controls: plane firewalls, scoped tokens, honesty asserts, no PHI in research prompts, secrets hygiene (no Neon passwords in chat/docs).

---

## 8. Human oversight map

| Output | Oversight |
|--------|-----------|
| Public KG edge | Gate C Approve |
| Clinical documentation | Aksh HITL |
| Medication suggestion | GUARDIAN + clinician |
| Trial screening | Investigator / trial team |
| Research brief (internal) | Optional peer review |
| Research brief (published) | Gate C / curator |

---

## 9. What we must not do now

- Wire Aksh PHI into hsi-core or ISI Neon.  
- EHR write-back.  
- Auto-enrolment messaging to patients.  
- Market HSI as diagnosing or treating disease.
