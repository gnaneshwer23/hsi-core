# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Translational researchers in immunology, microbiome, neuroscience and multi-omics who judge a tool by whether evidence, biological context and uncertainty stay attached to every claim. They arrive from a paper, a collaborator or a search, ask whether HSI can be trusted with a mechanism question, and decide in the first screens. Secondary audiences (drug-discovery teams, funders, collaborators) are not the lead audience of the landing pages.

## Product Purpose
Human Super Intelligence (HSI) is one scientific intelligence technology that connects biomedical evidence, biological relationships and context across human systems, and lets a researcher see why findings conflict and what to investigate next. Success on the landing pages is a researcher inspecting the real published knowledge graph and the real status of the agents, and leaving with an accurate picture of what exists today and what does not.

## Positioning
A knowledge graph in which every relationship keeps its source, experimental context, uncertainty and review status, with no silent promotion of extracted claims to approved knowledge. A neighbouring literature-search or AI-assistant product cannot truthfully claim an inspectable, digest-verified graph whose current review count is shown as zero.

## Operating Context
Visitors read primary literature and weigh methods, species, tissue, cell state and assay. The public site is a research preview: access is provisioned separately (browser-only draft request plus an administrator grant), and the research workspace is not generally available. The published graph snapshot is read from a verified, versioned file; the 13 Intelligence Collective capabilities are described by maturity records.

## Capabilities and Constraints
- HSI is cross-domain. Systemic sclerosis is one validation example, never the product boundary.
- Public positioning is one HSI technology. It is not marketed as a portfolio, a four-product ecosystem or named product modules (explicit direction, 13 November 2026).
- All graph content is candidate-only and unreviewed; scientific approval is none. No clinical advice, no clinical decision support, no patient data on this site.
- Agents propose candidates and never approve anything. As recorded today: 13 capabilities, 0 live runs, 0 independently accepted, 1 disabled model step.
- Primary action on the landing pages: explore the live graph. "Request research access" is secondary and must stay honest about being a browser draft.
- Existing stack: React 19, Vite, TypeScript, React Router, Host Grotesk Variable; prerendered public pages, Vercel rewrites, Playwright and axe checks, bundle budgets.
- Undecided: whether a public pilot, pricing or case-study content will ever exist. None exists now.

## Brand Commitments
Name: Human Super Intelligence (HSI). Typeface family Host Grotesk Variable and the existing ink, violet and dark-panel tokens are kept. Honesty labels are part of the brand: "Research preview", "candidate-only", "unreviewed", "illustrative", "no clinical advice".

## Evidence on Hand
- A published, digest-verified graph snapshot (currently 153 concepts, 95 source-candidate relationships, 9 gaps, 75 sources, 0 reviewed), read at runtime.
- Capability maturity records for 13 agents (`site/src/lib/intelligenceCollective.ts`).
- Selected primary publications cited on the Evidence page.
- Absent, and not to be invented: customers, testimonials, benchmarks or accuracy figures, partnerships or MoUs, pricing, certifications, regulatory clearance, case studies.

## Product Principles
1. Show the real thing: the live graph and real agent status are the proof; nothing decorative stands in for them.
2. Say what exists and what does not, in the same breath, in plain words.
3. Evidence, inference and approval stay visibly separate.
4. One technology, many systems of biology; never a product catalogue.
5. Motion shows structure or sequence, never fake activity.

## Accessibility & Inclusion
WCAG 2.2 AA is the working standard (axe scans run in CI); 44px touch targets; every animation stops under prefers-reduced-motion; readable at 320px width.
