# Methods sharing: paper versus practice

**Date:** 15 November 2026. **Status:** design for the owner, with an honest split between what can be built now and what is blocked. Nothing here is built yet.

## 1. The idea, restated
Published methods and executed methods differ. A paper says one thing; a lab that runs it changes the incubation, the antibody clone, the cell density, the software version, often for good reasons that never reach the literature. If those differences, and what they did to the result, were shared in a structured way, other researchers would save time and money and get more reliable results.

## 2. Is it needed? (research, read 15 November 2026)
- **Cost of irreproducibility.** An analysis of past studies estimated the cumulative rate of irreproducible preclinical research at over 50%, about US$28 billion a year in the United States, with published irreproducibility estimates ranging from 51% to 89% and the authors' own bounds from 18% to 88.5% (Freedman et al., PLOS Biology, 2015). Treat the dollar figure as an estimate with wide uncertainty, not a measurement. A 2026 bioRxiv preprint on inadequate antibody validation continues the theme; I read only its summary.
- **What exists.** protocols.io is free and open, with versioning, forks, step-level comments, run records, a reagent manager and a troubleshooter on higher plans. Its founders' own 2016 paper says there was no central infrastructure for sharing corrections and improvements to already-published methods; protocols.io lets anyone fork and comment. So protocol sharing is not a gap. **Do not build a protocol editor.**
- **The gap HSI can fill:** the link between a *method variant* and its *outcome under a stated context*, joined to the evidence in the graph. protocols.io records how to do it; HSI can record what happened, in which species, tissue, cell state, reagent and instrument, how it compared with the published method, and which claims it affects.

## 3. Product concept
**Core object: a method variant** (not a protocol document). Fields: technique (a standard term, e.g. an assay ontology entry), parameters as structured values, the reference method it deviates from, the deviation and the stated reason, context (species, tissue, cell type and state, reagent identifiers such as RRIDs, instrument and software versions), outcome (worked, partly, failed; sensitivity, variability, yield, time, an estimated cost), evidence class, and provenance.
**Two evidence classes, never blended:**
1. *Reported in papers.* Extracted from open-access methods sections, each value with the quoted passage, checked by two independent checks, unvalidated until a person confirms.
2. *Reported by researchers.* Entered by people who ran it, with their context and outcome; counts of independent confirmations shown, not a "best" score.
**Link to the graph.** A relationship in the graph already carries assay, tissue and model context. A method variant attaches to those claims, so a researcher looking at a conflict can see "these two studies used different stimulation times" and what a third lab found.
**Interoperate, do not replace.** Link out to protocols.io entries by DOI so a variant points to the full step-by-step protocol.

## 4. Phases and what blocks them

| Phase | What | Needs | Status |
|---|---|---|---|
| **M1 Compare methods across papers** | For a technique and topic, retrieve open-access full text (Europe PMC open-access subset, licence checked), extract parameters per paper with quoted spans, and show a comparison table highlighting where papers differ and the outcomes each reported | Public sources, existing run record and quote checks, a licence filter | **Buildable now**, no accounts |
| **M2 My methods notebook** | Private record of what I did against the paper: deviations, reasons, outcome, time, cost; export; optional protocols.io link | Device storage only | **Buildable now** |
| **M3 Share with other researchers** | Publish a variant for others, with attribution, versions, corrections and independent confirmations | Accounts and server storage (held migrations 022-033, unnamed independent reviewer), moderation, a biosafety and dual-use policy, IP and confidentiality warnings, lawful basis, abuse reporting | **Blocked** |

## 5. Risks, and how the design handles them
- **Bias toward success.** People report what worked. Show worked, partly and failed together, always with context, and prefer "independently confirmed by N labs" to a rating. Never rank a method as "best" from votes.
- **Safety and dual use.** Methods can be hazardous. M3 needs a written policy: no hazardous-agent protocols, biosafety level flags, a review path, and removal on request. This is an owner and legal decision, not a coding task.
- **Confidentiality and IP.** Researchers may paste unpublished or institution-owned material. Warn at entry, default to private, make sharing an explicit step with an attribution and licence choice.
- **Accuracy.** Extraction from papers will be wrong sometimes. Quote every value, show the passage, mark unvalidated, and let a person correct it. No accuracy claim until measured against hand-checked cases.
- **Savings claims.** Time and cost savings are self-reported and context dependent. Show them as reported by researchers, never as a platform total, until there is data.
- **Scope.** Research methods only. No patient data and no clinical protocols.

## 6. How questions reach the right capability (background, not named in the product)
A researcher asks in one box. The system recognises the intent and runs the matching capability, then shows how the answer was produced in plain steps; agent names appear only on capability pages. Examples: "How do labs stimulate Tfh cells for IL-21 readout?" goes to the methods comparison; "Why did my result differ from the paper?" opens the notebook with that paper's method and similar variants; "Is this reagent validated?" returns what the sources say about it and stops where they do. Routing is deterministic first, uses a tool allow-list, never spends model budget without a click, and says what it cannot do instead of guessing.

## 7. Decisions for the owner
1. Confirm "interoperate with protocols.io, do not build an editor".
2. Start with M1 and M2, which need no accounts.
3. Name who owns the biosafety and dual-use policy and the content-moderation process before M3.
4. Choose the attribution and licence model for shared variants (for example CC BY by default, with ORCID credit).
