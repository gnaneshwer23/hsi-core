# ISI Target-State PRD ↔ Stage alignment

**Source (external):** *ISI Target State — End-to-End Product Vision and Requirements* v1.0 (1 November 2026), local file `ISI_Target_State_End_to_End_PRD.docx`.  
**Repo anchors:** [`ISI_PILOT_BRIEF.md`](./ISI_PILOT_BRIEF.md), [`ISI_PILOT_PRD_ALIGNMENT.md`](./ISI_PILOT_PRD_ALIGNMENT.md), [`ISI_BUSINESS_PROPOSAL_ALIGNMENT.md`](./ISI_BUSINESS_PROPOSAL_ALIGNMENT.md), [`VISION_REPO_ALIGNMENT.md`](./VISION_REPO_ALIGNMENT.md).

This note maps the **full product vision** to **what we build now**. It does **not** pull target-state breadth into the current Stage 1 / P1 build. Edit target remains **hsi-core only**; immunecity and DeliverX stay out of scope.

---

## Target-state vision (one paragraph)

Immune Super Intelligence (ISI) is an immune-science and translational intelligence platform: researchers move from a scoped biological question → traceable evidence → testable hypotheses → (later) subgroup / study-design evaluation. **HSI Core** is the shared evidence backbone (claims, grades, provenance, review, versioned outputs). **Akeno** is a later, gated clinical-intelligence layer for authorised site workflows — not part of Stage 1. Scientific discovery does **not** automatically become a clinical recommendation.

---

## Product modules

| Module | Target-state role | Stage posture |
|--------|-------------------|---------------|
| **ISI Discovery Centre** | Question → evidence graph → mechanisms → hypotheses → research briefs | **Phase 6–7 done:** Target R1–R2 research surface at hsi-core `site/` `/discovery` (consumes packs; ASK→MAP→REVIEW→VALIDATE; not clinical). Concept HTML remains reference-only ([`ISI_DISCOVERY_CENTRE_SITE_ALIGNMENT.md`](./ISI_DISCOVERY_CENTRE_SITE_ALIGNMENT.md)). Phase 8 = R3–R5 / Akeno (explicit ask + Stage 3 gates). |
| **HSI Core Evidence Backbone** | Canonical entities, claims, grades, provenance, review, versioned exports | Stage 1: **active edit target** — substrate + `bun run outputs` |
| **Akeno Clinical Intelligence** | Cohort feasibility, HCP-reviewed screening, trial-site workflows | Stage 3 only — deferred until partner data + HCP eval + governance |
| **Lab / molecular integrations** | Omics, assay, chemistry, structure, simulation adapters | Stage 2+ (selected adapters after use-case justification); not Stage 1 breadth |

**Aksh Health** (diabetes HITL CDS) may share platform learnings; do **not** merge disease-specific clinical logic or patient data into ISI without explicit purpose and governance. **DeliverX** is ignored.

---

## Target PRD roadmap (R0–R5) ↔ delivery stages

| Target release | Capability focus | Maps to | Gate reminder |
|----------------|------------------|---------|---------------|
| **R0** foundation | Audit, disease/question discovery, schema/rights, threat model, reviewer process | Stage 1 prep (in flight) | Named use case + source set + evaluation plan |
| **R1** research intelligence | Question workspace, search, evidence/grade, graph nav, reviewer workflow, evidence brief | **Stage 1 pilot** | Expert review of traceability / usefulness |
| **R2** discovery workbench | Hypothesis tracking, gap analysis, research planning, selected molecular adapters | **Stage 2 expand** | Tool/data rights + reproducible validation |
| **R3** translational research | Cohort characterization, longitudinal analyses, subgroup/biomarker exploration, trial landscape | **Stage 2 → Stage 3 boundary** | Partner datasets + independent evaluation |
| **R4** clinical research pathway | Akeno site workflow: feasibility + human-reviewed protocol screening | **Stage 3 clinical** | Intended use, site access, HCP eval, regulatory/privacy |
| **R5** evaluated clinical intelligence | Narrow prospective CDS **if** justified | **Stage 3+ / out of committed scope** | Separate clinical validation + regulatory determination |

R4/R5 are **possibilities with gates**, not committed launch dates. The platform can deliver scientific value at R1/R2 without them.

---

## Capability map (do not pull breadth into Stage 1)

| Capability (§4 / §6) | Stage 1 pilot | Stage 2 expand | Stage 3 clinical | Out of scope (now / forever unless gated) |
|----------------------|---------------|----------------|------------------|-------------------------------------------|
| Immune evidence graph (entities + typed edges) | **Yes** — graded edges, export, pack entity slice | Richer typing / ontology depth | — | Competing canonical graph outside hsi-core |
| Evidence intelligence (search, grade, synthesize, conflict) | **Yes** — grades + pack findings/conflicts/gaps; search UI deferred to ISI product | Deeper synthesis / filters | — | Evidence grades as model probabilities |
| Research copilot (briefs, gap maps) | **Partial** — pack brief shell + claim citations; no ungrounded LLM clinical prose | In-product copilot with grounding | — | Ungrounded generative “answers” |
| Question orchestration (ISI-01) | Template fields in evidence pack (`questionProject`, unknowns) | Live workspace / tenancy | — | Assuming disease/question without partner |
| Unified search (ISI-02) | Substrate provenance only | Product search + synonym/ontology UX | — | — |
| Interactive knowledge graph (ISI-03) | Edge export + REL map pointers | Interactive graph surface | — | — |
| Evidence synthesis (ISI-04) | Pack sections + source-linked claims | Stronger synthesis UX | — | Clinical advice in research surface |
| Hypothesis workspace (ISI-05) | Expert shortlist / competing explanations slots | Versioned hypothesis tracking | — | Auto-approving hypotheses into KG |
| Research planning (ISI-06) | Gap / next-experiment shortlist only | Linked assay/dataset plans | — | — |
| Molecular tool adapters (ISI-07) | **No** | Selected adapters after use-case + license | — | Broad omics/chem stack “for completeness” |
| Longitudinal disease research | **No** | Approved datasets only | May inform clinical pathway | Decision support without validation |
| Patient subgroup research | **No** (conversation-level only) | Exploratory endotypes with partners | Independent validation before any clinical use | Presenting subgroups as clinical strata |
| Cohort analytics (ISI-08) | **No** | Partner-governed cohorts | Site workflows via Akeno | PHI / identifiable hospital systems in pilot |
| Clinical trial intelligence / landscape (ISI-09) | Out of pack unless partner asks (P1) | Registry browser / landscape | Feasibility support only | Automated eligibility or enrolment promises |
| Protocol-to-cohort / matching (ISI-10) | **No** | — | Human-reviewed criterion map; investigator override | Autonomous eligibility / participant selection |
| Clinical workflow support / Akeno (ISI-11) | **No** | — | **Yes** after gates | Patient outreach automation; EHR write-back |
| Evidence curation (ISI-12) | Gate C + curation review axis | Richer curator UX in-core / product | Clinical audit separate | Silent evidence mutation |
| Longitudinal learning (ISI-13) | Versioned bundles / `generatedAt` | Drift / freshness review tooling | Clinical monitoring if live | Silently rewriting past conclusions |
| Exports and APIs (ISI-14) | **Yes** — `bun run outputs`, MANIFEST, pack | Broader APIs / consumers | Purpose-compatible Akeno consume only | Duplicate evidence stores |
| User feedback (ISI-15) | Documented P1 | Product feedback tickets | Safety / post-market feedback | Mixing opinion into curated evidence without labelling |
| Community / knowledge sharing | **No** | Licensed/public collections if justified | — | Ignoring licenses / attribution |
| Patient / participant products | **No** | — | Optional consent-based info via approved channels only | Automated clinical decision or outreach |

---

## End-to-end workflows vs pilot

| Target workflow | Stage 1 | Later |
|-----------------|---------|-------|
| **A. Scientific discovery** (question → evidence → hypothesis → brief) | **In scope** — four outputs + Gate C; product UI consumes exports | Full interactive workspace (ISI product) |
| **B. Translational / laboratory** | Out of Stage 1 | Stage 2 — selected adapters + experimental return-as-evidence |
| **C. Patient subgroup / clinical research** | Explicit non-goal | Stage 3 — Akeno + steward + investigator review |

---

## vs Pilot PRD (what stays true)

| Topic | Pilot PRD / brief | Target-state PRD | Rule for hsi-core |
|-------|-------------------|------------------|-------------------|
| Unit of work | One disease + one question (TBD with partner) | Full question-to-trial path | Keep pilot unit; do not expand disease surface |
| Outcome | Traceable evidence map + reviewable brief | Same plus lab, cohort, trial, clinical | Ship Stage 1 outcome only |
| Substrate | HSI Core claims / grades / provenance | Same — system of record | Continue exports; no competing graph |
| Clinical boundary | No patient CDS, eligibility automation, outreach | R4/R5 gated Akeno | Defer Akeno/Aksh clinical |
| Timeline | M0–M3 research; M4 future | R0–R5 with gates | Stage 1 ≈ R0/R1; ignore R2–R5 build pressure |
| Success | Time, traceability, usefulness, corrections | Plus clinical readiness metrics later | No clinical performance claims in pilot |

**Verdict:** Target-state documents the **destination**. Pilot PRD + brief define the **current build**. They are compatible if sequencing is respected. Do **not** start molecular adapters, cohort analytics, trial matching, or Akeno workflows from the target PRD while Stage 1 is open.

---

## What hsi-core does / does not do from this PRD

**Do now (Stage 1):**

1. Maintain graded evidence substrate + provenance + Gate C path.  
2. Publish versioned ISI / pack / gap / Gate C artifacts for partner walkthroughs.  
3. Keep disease + question **TBD** until a real partner locks them.  
4. Use this map + pilot PRD alignment in discovery conversations.

**Do not pull into the current build (post–Phase 7):**

- Phase 8 clinical R3–R5 / Akeno translation without an **explicit user ask** + Stage 3 gates  
- Lab/molecular adapter breadth  
- Cohort / longitudinal / subgroup analytics  
- Trial matching or Akeno site workflows  
- R5 clinical decision support  
- immunecity product-app edits or DeliverX wiring  
- Vendoring ChatGPT/Unkapped Discovery Centre HTML  

---

## Cross-links

- Pilot brief: [`ISI_PILOT_BRIEF.md`](./ISI_PILOT_BRIEF.md)  
- Pilot PRD map: [`ISI_PILOT_PRD_ALIGNMENT.md`](./ISI_PILOT_PRD_ALIGNMENT.md)  
- Business proposal stages: [`ISI_BUSINESS_PROPOSAL_ALIGNMENT.md`](./ISI_BUSINESS_PROPOSAL_ALIGNMENT.md)  
- Discovery Centre concept site: [`ISI_DISCOVERY_CENTRE_SITE_ALIGNMENT.md`](./ISI_DISCOVERY_CENTRE_SITE_ALIGNMENT.md)  
- Vision / repo map: [`VISION_REPO_ALIGNMENT.md`](./VISION_REPO_ALIGNMENT.md)  
- Outputs: [`OUTPUTS.md`](./OUTPUTS.md)
