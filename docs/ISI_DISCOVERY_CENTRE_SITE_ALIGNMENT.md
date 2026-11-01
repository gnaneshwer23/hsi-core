# ISI Discovery Centre site ↔ Stage 1 alignment

**Source (external):** local HTML export of the Immune Super Intelligence Discovery Centre concept page (reviewed as `index(5).html`, 2026-11-01). Intended live host was `https://isi-immune-discovery-centre.jadav1.chatgpt.site` (observed **401** / auth-walled at review time).  
**Repo anchors:** [`ISI_PILOT_BRIEF.md`](./ISI_PILOT_BRIEF.md), [`ISI_PILOT_PRD_ALIGNMENT.md`](./ISI_PILOT_PRD_ALIGNMENT.md), [`ISI_TARGET_STATE_PRD_ALIGNMENT.md`](./ISI_TARGET_STATE_PRD_ALIGNMENT.md), [`ISI_BUSINESS_PROPOSAL_ALIGNMENT.md`](./ISI_BUSINESS_PROPOSAL_ALIGNMENT.md), [`VISION_REPO_ALIGNMENT.md`](./VISION_REPO_ALIGNMENT.md), [`NEON_PROJECT_MAP.md`](./NEON_PROJECT_MAP.md).

This note **catalogues** the Discovery Centre marketing / concept surface the way Akeno Lovable URLs are catalogued: binding Stage 1 posture stays research intelligence + four pack outputs. It does **not** make the HTML an hsi-core edit target, does **not** pull R2–R5 clinical into Stage 1, and does **not** touch Neon.

---

## Verdict

The export is a **target-state product vision** page for ISI, not a live research workspace and not a clinical product. Messaging is **largely honest** relative to pilot docs: research-first, source-grounded grades, human review, explicit “not diagnostic / not for clinical use,” Akeno as **future gated** clinical intelligence. Treat it as a **reference-only claims surface** for partner discovery — Stage 1 still ships via hsi-core packs (`bun run outputs`), not by building this full Discovery Centre UX in hsi-core.

---

## Surface catalogued

| Field | Value |
|-------|--------|
| **Title** | Immune Super Intelligence — Evidence into discovery |
| **Brand / eyebrow** | ISI IMMUNE INTELLIGENCE |
| **Hero** | “IMMUNE SCIENCE, CONNECTED” / “Make the immune system legible.” |
| **Live URL** | `https://isi-immune-discovery-centre.jadav1.chatgpt.site` (auth-walled / 401 when checked) |
| **Reviewed artifact** | Local static HTML export (concept prototype) |
| **HSI status** | **reference-only** vision / partner-facing concept — not Stage 1 deliverable; not an edit target from this workspace |
| **Neon** | None. Static concept page. Do **not** invent a Discovery Centre DB; HSI substrate remains **red-wave only**; ISI product Neon stays **autumn-snow** (see [`NEON_PROJECT_MAP.md`](./NEON_PROJECT_MAP.md)) |

Footer / outbound repos (same founder portfolio; do not edit from hsi-core for HSI):

- https://github.com/gnaneshwer23/hsi-core  
- https://github.com/gnaneshwer23/hsi-sources  
- https://github.com/gnaneshwer23/akenohealth  
- https://github.com/gnaneshwer23/akeno-health-ai  

---

## Site structure (quoted labels)

| Section / id | Nav or headline | What it shows |
|--------------|-----------------|---------------|
| Header nav | **Discovery** · **Evidence model** · **Platform** · **Translation** · **PARTNER WITH ISI** | Single-page anchors + partner CTA |
| `#top` hero | **Make the immune system legible.** CTAs: **EXPLORE THE VISION** · **SEE THE PLATFORM** | Capability pills: Immune disease maps · Mechanism discovery · Evidence intelligence · Translational research |
| Hero note | “A target-state product vision for research and scientific collaboration. **Not a diagnostic or treatment tool.**” | Correct Stage 1 / non-CDS frame |
| Thesis | **01 / DISCOVER** · **02 / GROUND** · **03 / TRANSLATE** | Discover / evidence grades / gated translation |
| `#discovery` | **THE DISCOVERY LOOP** — ASK → MAP → REVIEW → TEST → LEARN | Five-step research workflow (concept) |
| `#evidence` | **THE EVIDENCE BACKBONE** — “HSI Core is the evidence and provenance backbone…” | Grades: **Established** / **Uncertain** / **Unexplored**; illustrative disease picker |
| Disease examples | Rheumatoid arthritis · Systemic lupus erythematosus · Psoriasis / psoriatic disease · Inflammatory bowel disease | **Illustrative** contexts only (“Concept view / not a validated result”) |
| `#architecture` | **A CONNECTED PRODUCT VISION** — Evidence substrate **HSI Core** → discovery centre **Immune Super Intelligence** → future **Akeno Health** | Matches vision hub/spoke + deferred clinical layer |
| `#translation` | **NOW / DISCOVERY** · **NEXT / VALIDATION** · **LATER / TRANSLATION** | Stage 1 / 2 / 3 sequencing in plain language |
| `#partners` | **BUILD WITH THE SCIENCE** — “Start with one immune-disease pathway.” CTA: **EXPLORE HSI CORE** | Partner framing; links to hsi-core |
| Footer | “Research-first vision · evidence-grounded · human reviewed” · “**Concept prototype · not for clinical use**” | Hard disclaimer retained |

Additional disclaimers in-body: no patient records; no disease-risk / diagnosis / treatment claims; “Clinical translation is a gated future capability. No patient-level prediction or trial eligibility decision is represented here.”

---

## Stage 1 fit vs gaps

| Topic | Site says | Stage 1 / pilot docs | Rule |
|-------|-----------|----------------------|------|
| Unit of work | “Start with one immune-disease pathway”; partner CTA | One disease + one question, TBD with partner ([brief](./ISI_PILOT_BRIEF.md)) | **Fit** — keep disease unlocked until outreach |
| Four pack outputs | Implied via map / evidence / test / learn; not named as pack | Evidence map · entity slice · competing explanations · expert shortlist | **Gap** — publish packs from hsi-core; do not treat the HTML graph as the pilot artifact |
| Evidence grades | Established / Uncertain / Unexplored | Same vocabulary in substrate + pack | **Fit** |
| HSI Core role | Evidence + provenance backbone | Sole edit target; exports via `bun run outputs` | **Fit** — site consumes narrative; core ships data |
| Interactive map / disease switcher | Illustrative RA-centric concept graph | Full Discovery Centre UX deferred ([target-state](./ISI_TARGET_STATE_PRD_ALIGNMENT.md)) | **Do not build** that surface in hsi-core for Stage 1 |
| Translation / Akeno | Explicit **LATER · gated**; Akeno “after partner data, HCP workflows and validation” | Stage 3 only; Akeno Lovable catalogued separately | **Fit** — do not pull R2–R5 into Stage 1 |
| Disease list (RA, SLE, psoriasis, IBD) | Conversation / illustration | Proposal candidates; brief says TBD | **Risk** if read as selected indications — label as illustrative only |
| “SEE THE PLATFORM” / “working environment” | Product-vision tone | Pilot = four outputs + walkthrough, not platform breadth | Prefer “concept / vision” language in live partner decks |
| Confirmed partners | **PARTNER WITH ISI** CTA | Shortlist = outreach candidates only; no fake MoUs | CTA is invitation, not proof of partners |

---

## Messaging risks (keep honest)

1. **Target-state breadth in one page** — architecture + NOW/NEXT/LATER can look like a shipped platform; always lead with Stage 1 research intelligence and the four pack outputs.  
2. **Disease picker** — four named autoimmune domains can look like multi-TA product coverage; they are illustrative, not locked pilots.  
3. **“Translational research” pill + Translation section** — clinical/trial language appears early; site does gate it, but verbal pitches must not skip the gates.  
4. **Akeno footer links** — same as Lovable catalog: deferred Stage 3 marketing/engineering surfaces, not Stage 1 deliverables ([business proposal alignment](./ISI_BUSINESS_PROPOSAL_ALIGNMENT.md)).  
5. **Auth-walled live URL** — do not cite the chatgpt.site host as a public production Discovery Centre until access and disclaimers are verified live.

Compared to Akeno Lovable marketing (digital twins / quantum / RWE / CDS), this ISI page is **much better bounded**. Main risk is over-reading vision UX as Stage 1 scope, not clinical overclaim.

---

## What hsi-core should publish / do

| Do | Do not |
|----|--------|
| Keep this catalog doc as the binding posture for the Discovery Centre concept surface | Edit immunecity / chatgpt.site HTML from this workspace as HSI substrate work |
| Point partners to pilot brief + `hsi-pilot-evidence-pack` from `bun run outputs` | Promise the interactive Discovery Loop / graph as a Stage 1 product |
| Use site language that matches grades + “not diagnostic” when drafting outreach | Pre-assign RA/SLE/psoriasis/IBD as the pilot indication |
| Keep Akeno / clinical / trial matching behind Stage 3 gates | Mutate Neon (HSI **red-wave** only if/when HSI-owned schema exists; never autumn-snow / Akeno / DeliverX for HSI) |
| Cross-link from vision / proposal / target-state docs | Treat the export as evidence truth or a validated map |

---

## Cross-links

- Pilot brief: [`ISI_PILOT_BRIEF.md`](./ISI_PILOT_BRIEF.md)  
- Pilot PRD: [`ISI_PILOT_PRD_ALIGNMENT.md`](./ISI_PILOT_PRD_ALIGNMENT.md)  
- Target-state stages: [`ISI_TARGET_STATE_PRD_ALIGNMENT.md`](./ISI_TARGET_STATE_PRD_ALIGNMENT.md)  
- Business proposal + Akeno catalog: [`ISI_BUSINESS_PROPOSAL_ALIGNMENT.md`](./ISI_BUSINESS_PROPOSAL_ALIGNMENT.md)  
- Vision / portfolio: [`VISION_REPO_ALIGNMENT.md`](./VISION_REPO_ALIGNMENT.md)  
- Neon isolation: [`NEON_PROJECT_MAP.md`](./NEON_PROJECT_MAP.md)
