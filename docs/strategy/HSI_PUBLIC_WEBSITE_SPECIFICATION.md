# HSI Public Website Specification (§8.6–8.7)

**Document status:** Definitive public ecosystem site specification  
**PRD companion:** [`HSI_DESIGN_SYSTEM_AND_UX.md`](./HSI_DESIGN_SYSTEM_AND_UX.md) (Document 04 Spec §§3–4) is the canonical product UX companion; this file elaborates page specs.  
**Aligns:** Vision §2.1 proposition · IA [`HSI_PRODUCT_INFORMATION_ARCHITECTURE.md`](./HSI_PRODUCT_INFORMATION_ARCHITECTURE.md) · audit [`HSI_EXISTING_UX_AUDIT.md`](./HSI_EXISTING_UX_AUDIT.md)

**Scope:** Marketing / trust site for **Human Super Intelligence** as one ecosystem. Distinct from:

- **hsi-core.vercel.app** — evidence substrate / research-intelligence (preserve; do not replace with marketing-only)  
- **immune-super-intelligence.co.uk** — ISI researcher product  
- **akshhealth.com** — Aksh clinic/patient product  

**No implementation without founder approval.**

---

## §8.6 Homepage sections (1–11)

**Hero narrative (binding):**  
**Connect → Biology → Evidence → Opportunities → Decisions**  
(= Connect the patient · Understand the biology · Evaluate the evidence · Discover opportunities · Improve decisions)

### Section 1 — Hero

| Element | Spec |
|---------|------|
| Brand | Human Super Intelligence (hierarchy vs ISI / Aksh resolved per D1) |
| Headline | Ecosystem outcome, not “AI agents” or climb milestones |
| Support | One sentence: connect health information with biology, evidence and research — with provenance and human review |
| Visual | One composition; scientific credibility; **not** decorative AI theatre |
| Primary CTA | Match **real** availability (see CTAs) — e.g. “Explore ISI research workspace” and/or “See Aksh for clinics” |
| Secondary CTA | “What’s available today” · “Collaborate” |
| Avoid | Live CDS claims · hospital reconstruction · “confirmed eligibility” · fake metrics |

### Section 2 — The problem

Fragmented longitudinal records, biology without clinical context, scattered evidence, hard trial screening, invisible research gaps (Vision Problem A–F, abbreviated). One job: empathy + clarity.

### Section 3 — The proposition strip

Five verbs as a single scannable band: Connect · Biology · Evidence · Opportunities · Decisions. Each expands one line. No agent list.

### Section 4 — One ecosystem, four products

Cards (not competing heroes):

| Product | One-line | Status chip |
|---------|----------|-------------|
| Aksh Health | Patient intelligence & clinic workflows | Available (scoped) |
| HSI Clinical | Longitudinal clinical intelligence | Planned / In development |
| Immune Super Intelligence | Biological & scientific discovery | Available (research) |
| HSI Trials | Explainable trial screening | Planned |

Link each to product page (§8.7). Shared Core mentioned as “governed intelligence services” — not a fifth consumer product.

### Section 5 — Who it’s for

Role tiles: Patient · Clinician · Researcher · Trial team · Institution. Each → role landing. Job statements from Vision §2.13.

### Section 6 — How clinical context meets biology

Plain diagram: authorised clinical facts (Cat 1) ↔ mechanisms/evidence (Cats 2–5) with plane firewall. State **today:** research side Partial; wired clinical UX Missing. No “already connected to your hospital” claim.

### Section 7 — Research discovery example

Prefer **real** ISI/HSI examples (e.g. RA / anti-TNF, TNF→RA reviewed path) with grades/review labels. CTA into ISI Ask/Atlas or hsi-core Discovery — labelled research-only.

### Section 8 — Evidence & trust

Provenance · categories · uncertainty/conflict · Gate C / human review · “inspect why / missing / uncertain.” Point to Trust page. Ban fake confidence %.

### Section 9 — Available / In development / Planned

Three columns with **current audit truth** (update when founder signs a status change):

| Available | In development | Planned |
|-----------|----------------|---------|
| ISI Explore / Ask / Atlas (educational limits) | HSI Discovery consume hardening | HSI Clinical product |
| hsi-core graded packs + Gate C patterns | Workflow A reproducible brief | HSI Trials workspace |
| Aksh slot-fill + glucose (shadow/production per Aksh claims) | Cross-product handoffs | Full FHIR longitudinal reconstruction |
| Honesty labels / Methods patterns | Unified ecosystem site (this spec) | Omics runtimes, live CDS |

### Section 10 — Collaborate

Institutional / research-partner / clinic pilot CTA. Require real MoU process language — no invented partner logos.

### Section 11 — Footer

Trust · Privacy · Security · Methods · Status · Docs · Roadmap (secondary) · Product links · Legal · Contact.

---

## §8.7 Additional pages

| Page | Purpose | CTA honesty |
|------|---------|-------------|
| `/products` | Four products + Shared Core | Status chips required |
| `/products/aksh` | Patient/clinic; link out to akshhealth.com | Do not re-host PHI demos without labels |
| `/products/clinical` | HSI Clinical vision + Planned | No fake screenshots as “live” |
| `/products/isi` | Researcher workspace; link to ISI | Research ≠ CDS |
| `/products/trials` | Trials vision + five criterion states | Never “eligible” |
| `/for/patients` | Educational expectations; Aksh entry | Educational vs advice |
| `/for/clinicians` | Journey preview; Planned Clinical | Synthetic only if shown |
| `/for/researchers` | Q→Brief; ISI entry | Primary Available CTA |
| `/for/trial-teams` | Criteria → Review | Planned |
| `/for/institutions` | Governance, DPIA posture, collaborate | No overclaim |
| `/status` | Living Available / In development / Planned | Source of truth for CTAs |
| `/trust` | Safety, privacy, evidence categories, HITL | |
| `/methods` | Or deep-link ISI Methods + hsi-core docs | |
| `/collaborate` | Partner form / contact | |
| `/roadmap` | Engineering phases — **secondary** | Banner: not the product story |
| `/docs` | Technical entry | Engineers, not primary marketing |

---

## CTAs that match real availability (binding)

| Allowed primary CTA (today) | Disallowed |
|-----------------------------|------------|
| Open ISI (research workspace) | “Start clinical decision support” |
| View HSI Discovery / evidence map (research) | “Reconstruct any patient history” |
| Explore Aksh for diabetes clinics | “AI confirms trial eligibility” |
| Request collaboration / pilot conversation | “Fully evidence-grounded AI doctor” |
| Read what’s available | CTAs to Planned features as if Available |

Every CTA must resolve to: **Available surface**, **Status page**, or **Collaborate** — never a hollow mock that looks production.

---

## Relationship to existing sites

| Site | Role after ecosystem site ships |
|------|----------------------------------|
| Public HSI (new) | Ecosystem narrative + routing |
| hsi-core.vercel.app | Substrate, Discovery, curator, exports — keep research-intelligence framing |
| ISI domain | Full researcher product |
| Aksh domain | Full patient/clinic product |

Cross-link generously; do not duplicate entire product UIs on the marketing domain.

---

## Content rules

1. Prefer concrete researcher/clinician tasks over “superintelligence” hype.  
2. Separate teaching, research discovery, and clinical care in copy.  
3. Label synthetic / illustrative UI.  
4. Keep Gate C human-only messaging.  
5. Update §8.6 §9 and `/status` when maturity changes — do not leave stale “Available” chips.

**Acceptance:** Homepage can be walked with the five-verb narrative; a visitor can state what is Available vs Planned without opening engineering docs.
