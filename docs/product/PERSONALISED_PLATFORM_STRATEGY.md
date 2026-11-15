# Personalised researcher platform: audit, competitor research, USP and plan

**Date:** 15 November 2026. Sources: this repository at `main`, and public web pages read on this date (listed in section 2). Competitor facts are what those vendors say about themselves unless marked otherwise.

## 1. Audit of what exists

| Area | Today | Problem |
|---|---|---|
| Landing pages | ~36 prerendered public pages; violet/ink, Host Grotesk; diagram-led after the November rebuild | 60+ CSS files across three visual systems (public editorial, app shell, dark workspace). Pages explain the product well but do not lead a researcher into an account. No page says who it is for beyond "researchers". |
| Register / sign-in | Neon Auth (Better Auth): name, email, password, email code. | Collects nothing about the researcher. After sign-up the user lands on a generic route. Access is a separate admin grant. |
| Onboarding | A 3-step card on Research Home: role, interests (six departments), goals. | Device-only, thin, skippable, no research context (no topic text, no papers, no ORCID, no cadence). |
| Dashboard | Research Home (light shell, navy sidebar), Investigation workspace (dark). | Two palettes. Too much prose per card. Little is expandable or visual. No trend, no "what changed", no gaps. |
| Personalisation | Deterministic suggestions from interests and follows over the 153-concept graph. | The graph is small and static, so suggestions repeat. No live signal at all. |
| Knowledge graph | Public explorer, published snapshot, candidate-only. | Not connected to a researcher's own area or to live literature. |
| Persistence | Browser-only. Server profile, follows and saved investigations need held migrations 022-033 and an unnamed independent reviewer. | Cannot honestly promise sync, email digests or teams yet. |

## 2. What competitors do (and where they are weak)

- **Causaly** (platform page): 648M+ relationships, two curated knowledge graphs refreshed every 2 to 4 weeks, agentic research plan, licensed full text, citation checking before display, scientific workflows, shared workspaces with notifications when new evidence changes a tracked answer, MCP/API, ISO 27001, pricing by quote. Enterprise pharma sales motion. Its comparison table claims a "breadth and depth" measure that others lack.
- **Consensus** (consensus.app): 400M works, 10M users, "Identify research gaps" and report drafting. A McGill critique found no fabricated citations in its tests but a misleading "Consensus Meter", leniency to debunked practices, and answers that varied with wording and mode.
- **Semantic Scholar**: personalised Research Feeds from library folders, "mark not relevant" feedback, email alerts for new papers and citations, author alerts after claiming an author page.
- **ResearchRabbit**: visual maps of papers and authors, recommendation that improves as you explore, used to find gaps in literature.
- **OpenEvidence**: clinical question answering with publisher partnerships (NEJM, JAMA). Clinician-facing.
- A vendor blog (EvidenceMD) reports that about one in twelve returned citations did not support its claim, and cites a Lancet audit of fabricated references. Treat both as unverified here.
- Open data we can use today without a licence: Europe PMC, OpenAlex, Open Targets, PubMed, ClinicalTrials.gov, ORCID public records.

**Gaps nobody fills well:** (1) explaining *why* findings disagree (species, tissue, method) instead of a consensus score; (2) review state on every claim with abstention built in; (3) a personal radar that joins new papers, the knowledge graph and an honest gap signal; (4) auditable, exportable, hash-stamped outputs a researcher owns; (5) academic-accessible rather than quote-only enterprise.

## 3. USP (for the website and the product)

**HSI shows what the evidence says, where it disagrees and why, and what nobody has tested yet, for your own research area, with every claim traceable and nothing promoted without review.**

Five proof points, each already true or being built: context-aware conflict analysis; review state and abstention on every relationship; two-model direction checks with quoted passages; a personal Research Radar (new papers, trend, gaps) from open sources; briefs you can export with their limits. Do not claim: customers, benchmarks, accuracy figures, coverage numbers beyond the verified snapshot, regulatory status.

## 4. Personalised onboarding (design)

Goal: from sign-up to a useful dashboard in under three minutes, with every step skippable.
1. **Create account** (existing): name, email, password, code.
2. **Your research** (new, `/welcome`): role and stage; the question or area in your own words; up to five topics or genes or diseases; optional ORCID iD (to find your papers through OpenAlex), or paste DOIs/PMIDs; what you want from HSI; update cadence (off, weekly, daily) and look (light, dark, accent).
3. **Your radar** (first value, no waiting): their topics run against Europe PMC and OpenAlex immediately: new papers, a publication trend, graph neighbours, gap signals.
4. **Dashboard** opens already personalised.

Privacy rules: ORCID and topics are sent to our server route only to query public APIs and are not stored there; the profile lives on this device until account sync is approved; no health information is requested; the page says so. Do not profile individual researchers: "how others are doing" is aggregate (institutions, journals, countries, topic trends), with recent papers shown as normal bibliographic records.

## 5. Dashboard (design)

Light by default (white canvas, one restrained accent), selectable dark and accent colours, stored in the profile. Replace paragraphs with modules that expand: **Research Radar** (new papers this week, per topic), **Trend** (publications per year sparkline), **Gap finder** (graph-recorded gaps plus an under-explored-intersection signal, labelled a heuristic), **My papers** (from ORCID/DOIs), **Investigations** (resume), **Graph neighbourhood**. Every tile shows a number or a picture first and opens to detail.

## 6. Gap finder (honest method)

For a topic T and each graph neighbour N, query Europe PMC hit counts for T, N and "T AND N". A pair with large individual counts and a small joint count is flagged "under-explored intersection". This measures literature co-mention, not scientific novelty, and the UI says so. Graph-recorded gaps (research_gap edges) are shown separately and keep their source.

## 7. Updates by email (not yet)

Daily or weekly email needs a stored subscription, a scheduler and a sender, and handles personal data under UK GDPR and PECR consent rules. It is blocked behind account storage (held migrations, reviewer) and a lawful-basis decision. Until then: an on-demand "digest" view and a downloadable weekly brief, clearly labelled as generated now.

## 8. Plan

| Phase | Scope | Status |
|---|---|---|
| A | Theme system (light default, dark, accents); onboarding v2 and `/welcome`; sign-up goes there | build now |
| B | Research Radar API and UI (new papers, trend, my papers) | build now |
| C | Gap finder and graph suggestions | next |
| D | Landing pages: researcher-first story, USP, onboarding entry, honest comparison | after A-C so the pages show real screens |
| E | Account sync, email digests, teams | blocked: held migrations 022-033, independent reviewer, lawful basis |

## 9. Decisions only the owner can make

1. Sender and consent text for email digests, and whether to start the independent security review that unlocks account storage.
2. Whether to publish a competitor comparison page (needs claims you are willing to defend).
3. Accent palette and whether HSI violet stays the brand accent in light mode.
