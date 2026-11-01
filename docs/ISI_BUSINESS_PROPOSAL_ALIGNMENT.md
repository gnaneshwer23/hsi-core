# ISI business proposal ↔ pilot alignment

**Source (external):** *Immune Disease Discovery and Clinical Intelligence — Business proposal for a partner-led pilot* (Dr Gnaneshwer Jadav, November 2026).  
**Repo anchors:** [`ISI_PILOT_BRIEF.md`](./ISI_PILOT_BRIEF.md), [`ISI_PILOT_PARTNER_SHORTLIST.md`](./ISI_PILOT_PARTNER_SHORTLIST.md), [`VISION_REPO_ALIGNMENT.md`](./VISION_REPO_ALIGNMENT.md).

This note maps proposal claims to what **hsi-core builds now** vs what is **deferred**. It does not edit immunecity or invent partners.

---

## Verdict

The proposal and the pilot docs are **aligned on sequencing**: Stage 1 = research intelligence only; disease/question TBD with a partner; Akeno/Aksh clinical pathways only after data access, HCP evaluation, and governance. No patient-level prediction or trial matching in the pilot.

---

## Claim → pilot / defer

| Proposal claim | Pilot (build / do now) | Defer |
|----------------|------------------------|--------|
| ISI as researcher-facing evidence workspace for one scoped question | Four outputs: evidence map, entity slice, competing explanations, expert shortlist ([brief](./ISI_PILOT_BRIEF.md)) | Full “immune science centre” product surface beyond what partners need to evaluate |
| HSI Core as evidence backbone (grades, provenance, review, versioned outputs) | Substrate + `bun run outputs` / publish bundles; Gate C human curation | Treating hsi-core as a patient-level model |
| Disease indication TBD after discovery (RA, SLE, psoriasis/PsA, Sjögren’s, GI candidates) | Outreach + shortlist; lock disease/question only with a real partner | Pre-assigning an indication or fabricating MoUs |
| Public literature first; partner data under rights/governance | Literature-only + expert critique is enough for v0 | Partner/PHI ingest before purpose, roles, DPIA as needed |
| Out of scope: individual risk, diagnosis, treatment recs, automated eligibility, patient contact, EHR write-back | Explicit non-goals in pilot brief | Any clinic CDS / recruitment feature |
| Stage 2: disease-specific expansion, curated datasets, trial landscape | Only after pilot evaluation + willingness-to-pay / data rights | Building expansion features before Stage 1 success |
| Stage 3 / Akeno clinical pathway | Decision gate in brief + vision: clinical ID / trial matching only with site partnerships | Patient-level Aksh/Akeno workflows in this pilot |
| Paid fixed-scope pilot → TA workspace licence → data integration → clinical module | Discovery conversations; commercial terms after scope is real | Broad TAM claims or enterprise clinical contracts |
| ~16-week delivery plan (discovery → prototype → evaluate → expand/stop) | Planning estimate; adjust to partner readiness | Promising clinical deployment on that calendar |
| Differentiation vs Immunai / Relation / TriNetX / Deep 6 | Hypotheses to test: evidence-to-hypothesis workflow, cross-disease context with preserved study context, traceability | Claiming competitive advantage before evaluation |
| Platform roles: ISI research / HSI Core substrate / Akeno later | Matches vision: ISI discovery consumer, hsi-core hub, Aksh HITL closed until gates | Wiring Akeno Health AI surfaces without live verification |

---

## Gaps / tensions (honest)

| Tension | How we hold it |
|---------|----------------|
| Proposal markets a **staged programme** (research → expansion → clinical); repo is **pilot-first** | Same order; do not pull Stage 2/3 work into P1 before partner proof |
| Proposal names **Akeno** clinical intelligence; vision uses **Aksh** clinician-safe HITL | Same deferred boundary: no patient-level decisions until data + HCP + governance |
| Proposal lists **candidate diseases**; brief says disease is **TBD** | Candidates are conversation starters only — not selected |
| Proposal implies **ISI workspace** UX; hsi-core ships **exports**, product UIs consume | Build substrate + reviewable artifacts here; do not edit immunecity for HSI |
| Commercial roadmap (licences, clinical module) vs research-intelligence metrics | Pilot success = time, traceability, usefulness, expert corrections — not clinical effectiveness claims |

---

## What to say in partner discovery

1. Lead with research intelligence for **one disease + one question** (proposal Stage 1 / pilot brief).  
2. State non-goals: not diagnosis, risk scores, recruitment, or CDS.  
3. Position HSI Core as the inspectable evidence backbone; ISI as the question → evidence map workflow.  
4. Keep Akeno/Aksh as a **conditional later pathway**, not a current deliverable.  
5. Ask for scientific lead, bounded question, shareable sources, and pre-agreed evaluation criteria.
