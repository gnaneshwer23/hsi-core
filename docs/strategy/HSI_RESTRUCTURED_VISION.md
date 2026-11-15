# Restructured vision: researcher-first, with agents working in the background

**Date:** 15 November 2026. **Status:** proposal for the owner. It proposes how to present the existing doctrine ([`HSI_VISION.md`](./HSI_VISION.md), which still governs) and what to build next. It does not change the binding constraints: cross-domain, candidate-only, no PHI or live CDS, human review before promotion, no invented claims.

> **Update:** methods sharing is specified in [`../product/METHODS_SHARING.md`](../product/METHODS_SHARING.md).

## 1. Verdict in five lines
1. The foundations are right: evidence with provenance, context-aware conflict, review state on every claim, abstention. Keep them.
2. The structure is wrong for a researcher: thirteen named agents and four products describe how we built it, not what a scientist does. The agents should work in the background; researchers see actions, answers and an honest trace of how each result was produced.
3. The register is stale. It says 13 capabilities, **0 live runs**, while the live investigation now exercises retrieval, ranking, two-model direction checks and hypothesis proposals. Public claims and reality disagree in the cautious direction, which is safer than the reverse, but it hides real progress and breaks the story "agents that show their work".
4. The knowledge graph is a 153-concept static snapshot. "Living" is still a promise. The biggest product lever is a personal candidate layer that grows around a researcher's own topics.
5. The binding constraint is not code. Account storage (held migrations 022-033, unnamed independent reviewer) gates sync, email digests, teams, saved investigations and sign-in for any spend-bearing endpoint.

## 2. Audit: what exists against what is claimed

| Capability (register name) | What actually runs today | Honest status |
|---|---|---|
| SCOUT, evidence discovery | Europe PMC and OpenAlex search per disease context, Open Targets associations, radar, gap counts | **Live in the public preview**, public sources only, not independently accepted |
| LANTERN, extraction | Sentence-level co-mention extraction and ranking (deterministic) | Partial. No span-grounded model extraction in the live path |
| VERITAS, verification | Two models state direction and must quote the passage; both must agree | **Live when keys are set** (not in production), same provider so independent execution only |
| VANTAGE, gaps and hypotheses | Recorded graph gaps; literature intersection heuristic; model-proposed hypotheses challenged by a second model | **Live in preview**; all unvalidated |
| PARALLAX, context and contradiction | Grouping by disease context only | The deterministic comparability logic exists but is not in the live path |
| ATLAS, graph mapping | Published candidate snapshot; live-run candidates are not written to any graph | Read-only |
| HELIX, mechanism | Disabled | Disabled |
| SENTINEL, monitoring | Radar generated on request, cached on the device | On-demand, not scheduled |
| AEGIS, source integrity | Provider retraction flags shown; no clearance authority | Minimal |
| NEXUS, orchestration | A one-request orchestrator in `liveRun.ts`; the durable job journal is not used | Not the register's NEXUS |
| WARDEN, reliability | Per-run budget, rate limits, daily ceiling, usage log, config doctor | Partial, local |
| ARBITER, CALIBER | Review packet and benchmark harness exist; no reviewers, no adjudicated cases | Not live |

**Other audit findings.** Account storage blocked. The model endpoint is public and unauthenticated, protected only by curated scenarios, per-IP and daily limits, and the provider cap. No usage analytics. No benchmark, so no accuracy claim is allowed. 60+ stylesheets, three visual systems (being consolidated). Both verifier checks use one provider. The published graph has no reviewed relationships (0 reviewed).

## 3. What the research says (sources read 15 November 2026)
- **Trust is the adoption barrier.** Surveys summarised by a secondary source (Elsevier 2025, over 3,200 researchers in 113 countries; Wiley 2025, 2,430 researchers) point to citations, current literature, accuracy safeguards and human validation as what would raise confidence; 80% used mainstream AI tools against 25% using dedicated research assistants. Treat the figures as reported, not verified by us.
- **Retractions are a blind spot.** Reported studies found general chatbots do not reliably detect or flag retracted papers and sometimes rely on them (MIT Technology Review coverage; a 2026 evaluation of freely available tools). Retraction-aware answers are an open lane.
- **How agents are shown elsewhere.** Gemini Deep Research shows a proposed plan the user can edit before it runs and live progress. Causaly shows a plan with step status and a reasoning trail. Consensus Deep Search expands terms, looks for conflicting arguments and follows the citation graph. Undermind's Projects workspace makes users **choose agents and manage concurrent tabs** (still beta), with little visibility into the queries run or why papers were chosen, and limited reproducibility.
- **Weak points of well-funded tools:** the Consensus Meter was judged misleading and answers varied with wording (McGill critique); Undermind's selection is opaque; enterprise graphs (Causaly: 648M+ relationships, refreshed every 2 to 4 weeks, quote-only pricing) are not open to individual researchers.
- **Design implication:** users do not want to pick among agents. They want a plan they can see and edit, work they can inspect, and doubt stated plainly.

## 4. What we discussed: what makes sense, what does not

**Keeps making sense.** Researcher-first home; radar plus gap finder; investigation workspace with a visible trail; honesty labels; light by default with accent choices; the graph as shared memory; candidate-only writes.

**Should change.**
- *Thirteen agent names as the face of the product.* Users will not learn NEXUS, AEGIS and WARDEN. Keep the names in the capability register and pages for traceability, but present a small cast by job (section 6).
- *Whole-of-biology positioning as the first message.* The doctrine is cross-domain and should stay; the go-to-market wedge should be narrow: translational immunology researchers (SSc, RA, SLE, the validated case), expanding through gut-immune-brain. A wide vision and a narrow first user.
- *"How others are doing" as a feed of individuals.* Profiling named researchers is ethically and legally heavier than it looks. Keep it aggregate (institutions, journals, topic trends) and show recent papers as ordinary bibliographic records.
- *Daily email.* Low value, high consent burden. Weekly, opt-in, after account storage exists.
- *Claiming "living" graph.* Say "published snapshot" until the personal layer or scheduled refresh exists.
- *A public model endpoint without sign-in.* Acceptable for a capped preview, not for launch.

## 5. USP
**HSI is the sceptical research colleague: it shows what the evidence says, where it disagrees and why, and what nobody has tested, for your own area, with every claim traceable and nothing promoted without review.**

Five proof points, each testable on the live product: (1) every claim keeps source, context and review state; (2) the system abstains and shows disagreement instead of a consensus score; (3) retraction-aware by design (provider flags today; Retraction Watch-based checks are the next step and need verification of the data source before claiming); (4) a personal radar and gap view from open data, with the counts and the search shown; (5) an open record of what each assistant did, with budget, models and limits. What HSI must not claim: customers, accuracy, coverage at enterprise scale, regulatory status, independent validation.

## 6. Restructured model: three surfaces, one memory, background roles

**Surfaces.** *Home* (radar, gaps, updates, continue), *Graph* (explore, ask, expand), *Workspace* (investigate and brief).
**Memory.** The published graph (read-only, reviewed over time), plus the researcher's **personal candidate layer** and saved investigations. Assistants write only to the candidate layer; promotion is a human review decision.
**Background roles (not named in the product).** Update 15 November 2026 (owner direction): the dashboard and graph do **not** show agent names. Researchers see questions, actions and results; the roles below work in the background and are named only on the capability pages for traceability.

| Background role | Job | Register capabilities |
|---|---|---|
| Find and watch | Finds and tracks papers, trials and data for a topic | SCOUT, SENTINEL |
| Map | Turns text into candidate concepts and relationships with sources | LANTERN, ATLAS |
| Compare | Explains why findings disagree: species, tissue, method | PARALLAX |
| Verify | Checks direction and quotes; flags retractions; abstains | VERITAS, AEGIS |
| Propose | Proposes gaps, hypotheses and experiments, all unvalidated | VANTAGE, HELIX |
| Govern | Budgets, limits, evaluation, review hand-off | NEXUS, WARDEN, CALIBER, ARBITER |

## 7. How help appears without naming agents (the concrete UX)
1. **One Ask box, routed in the background.** A question goes to whichever capability fits: an entity opens its graph card; "what is new" opens the radar; "are A and B linked" returns a graph path with evidence; "why do these disagree" opens the conflict view; "which method" opens the methods comparison; "what is untested" opens gaps; an open scientific question becomes a bounded investigation. Routing is deterministic first (patterns and the graph), with a model only as a fallback, over an allow-list of tools, and it fails closed: an unrecognised request says what HSI can do instead of guessing.
2. **Actions, not agents.** On a graph node: *What is new*, *Expand around this*. On a claim: *Check this claim*. On a gap card: *Suggest a testable hypothesis*. On a topic: *Follow*. Each starts a bounded run on click, never silently.
3. **"How this was produced" on every result.** Plain steps from the real run record, e.g. *Searched 3 sources · read 12 methods sections · compared 5 parameters · checked quotes with 2 independent checks · could not determine: tissue for 3 studies*. No agent names, no simulated progress. A *Details* link opens the capability page and its maturity record.
4. **Plan before run.** For anything that spends model budget, show the steps, sources and budget first; the researcher can edit or cancel.
5. **Autonomy stays with the researcher:** *suggest only* (default), *run when I click*, later *run on a schedule* (needs account storage). Nothing is ever promoted without human review.
6. **Activity on Home:** what ran, what it produced as candidates, what awaits review. Honest empty state otherwise.
7. **Trust strip on every result:** status labels (live in preview, heuristic, unvalidated), budget used, link to the maturity record.

## 8. Knowledge graph: basics to advanced, and personal suggestions
**Search ladder.** (1) Entity search with identifiers. (2) Neighbourhood: what is recorded around it, with source and review state. (3) Path: how is A connected to B, with every hop's evidence. (4) Disagreement: where findings conflict and the context that differs. (5) Absence: what is not recorded, with the literature signal and the search shown. (6) Natural-language questions that a model translates into these queries and answers only from returned records.
**Personal candidate layer ("Build my graph").** From a researcher's topics, assemble a device-local layer from open sources (Open Targets, UniProt, Reactome, MONDO/EFO, Europe PMC co-mentions, ORCID-linked papers). Show it beside the published graph with a clear visual difference and review state "candidate". This is what turns "suggestions from your profile" into something real.
**Aggregate field view.** Institutions, journals, countries and topic trends from OpenAlex for the researcher's area; recent papers as normal records. No ranking of named people.

## 9. Roadmap
**Now (small, honest, mostly front-end):** reconcile the register with reality using the table in section 2 and a new maturity level "live in preview, not independently accepted"; build the routed Ask box, the "How this was produced" trace and the activity panel on the existing run record; add the in-context actions on graph nodes and gap cards.
**Next:** personal candidate layer; retraction-aware verification (verify the data source and licence first); aggregate field view; the narrow immunology wedge on the homepage.
**Gated:** account storage, sign-in for spend-bearing routes, scheduled runs, weekly email, teams. Unblock by naming the independent reviewer for migrations 031-033 and deciding lawful basis for email.
**Earn the right to claim:** the 120-case benchmark with adjudicated cases, and a second provider for verification.

## 10. Decisions for the owner
1. Confirm background roles with no agent names in the product (the thirteen names stay on the capability pages as the traceable layer).
2. Choose the first user: confirm translational immunology as the wedge.
3. Name the independent security reviewer and the email sender and consent text.
4. Approve spend for model checks in production (see `docs/research/LIVE_MODEL_STEP_PRODUCTION.md`).
5. Decide whether to publish a competitor comparison naming products (needs claims you will defend).
