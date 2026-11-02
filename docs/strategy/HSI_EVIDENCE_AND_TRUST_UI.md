# HSI Evidence and Trust UI (§8.13)

**Document status:** Definitive evidence/trust interaction specification  
**Aligns:** [`HSI_EVIDENCE_CATEGORY_SPECIFICATION.md`](./HSI_EVIDENCE_CATEGORY_SPECIFICATION.md) · Gate C · ISI Methods · ADR-G6 (qualitative states first)

**Ban:** Fake confidence percentages as a substitute for evidence. Quantitative scores only with validated method + disclosure.

---

## 1. Design principle

Users must always be able to inspect:

1. **Why** an output was produced  
2. **Which evidence** supports it  
3. **What is missing**  
4. **What is uncertain / conflicting**  
5. **What needs human review**  

---

## 2. Evidence drawer (shared pattern)

**Trigger:** Claim chip, timeline event, criterion row, Ask citation, graph edge.

| Drawer section | Content |
|----------------|---------|
| Summary | Subject–predicate–object or clinical fact label |
| Category | Cat 1–5 badge (never collapsed) |
| Source | System / PMID / DOI / dataset + licence/reuse if known |
| Temporal | Observation time · recording time · retrieval time · freshness |
| Review | Review status + Gate C / curation state |
| Support | Supporting materials |
| Conflict | Contradicting / partial assessments |
| Missing | Attributes not available |
| Limitations | Applicability bounds |
| Actions | Open source · Request review · Add to Brief · Copy citation |

Mobile: full-screen sheet. Desktop: side drawer. Focus trap + Esc close (a11y).

---

## 3. Indicators (chrome)

### 3.1 Source indicators

- Chip with source type (EHR · Lab · Patient-reported · PubMed · Registry · Pack)  
- Broken link / unverified ID → explicit failure, not silent hide  

### 3.2 Temporal indicators

- Relative + absolute time on hover  
- Stale trial / stale pack banner when past freshness policy  

### 3.3 Missing indicators

- `Not on record` / `Unavailable` / `Not shared`  
- Absence ≠ negation callout near differentials and criteria  

### 3.4 Review indicators

Reuse ISI vocabulary where possible:

Draft · Unreviewed · Source linked · Partially supported · Supported · Rejected · Conflicting · Superseded  

hsi-core grades: established / uncertain / unexplored — discovery honesty, not CDS.

---

## 4. Claim categories in UI (Cats 1–5)

| Cat | Label (UI) | Chrome |
|-----|------------|--------|
| 1 | Observed / Patient-reported | Timeline; never “science says” |
| 2 | Established evidence | Mechanism/edge after review mapping |
| 3 | Statistical association | “Association — not proven causal” |
| 4 | Computational inference | “Model / inference — not validated finding” |
| 5 | Unvalidated hypothesis | Draft / hypothesis treatment |

**Never** merge categories into a single “AI confidence” meter.

---

## 5. Confidence & scores

| Allowed | Forbidden |
|---------|-----------|
| Qualitative review/grade states | Orphaned `87% confident` without method |
| Validated metric with method + cohort + date | Decorative gauges on Ask answers |
| Data sufficiency (e.g. 14d / 70% wear) | Invented risk scores |
| Empty counterevidence = empty, not agreement | “No conflicts found” implying proof |

If KG edges carry numeric `confidence` today, treat as **legacy teaching weight** until ADR-G6 method is validated — do not surface as clinical probability.

---

## 6. Product mapping

| Product | Trust UI today | Target |
|---------|----------------|--------|
| ISI | Methods coverage, Sources fold, review labels | Evidence drawer unification |
| hsi-core | Grades, Gate C mocks, Discovery MAP | Drawer on claim IDs |
| Aksh | Source chips, HITL, missing-as-missing | Cat 1 drawer; no fake scores |
| Clinical / Trials | Missing | Adopt drawer + five states |

---

## 7. Microcopy

| Prefer | Avoid |
|--------|-------|
| “Source linked — claim not yet reviewed” | “Verified by AI” |
| “Competing explanations remain visible” | Hiding conflicts |
| “Grade: uncertain (discovery)” | “Clinically proven” from uncertain pack |

---

## 8. Acceptance

1. Every primary claim/fact opens a drawer with source + time + category.  
2. No primary surface shows unexplained %.  
3. Categories remain visually distinct.  
4. Gate C / human review never implied auto-approve.
