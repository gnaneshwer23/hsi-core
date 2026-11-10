# HSI Knowledge Graph — flagship surface

**Status:** Active design + implementation plan  
**Entry:** `/science/graph` (public educational explorer)  
**Deeper research:** `/research/knowledge-graph` (domain candidates + RA/SSc corpus)  
**Vision:** [`../strategy/HSI_VISION.md`](../strategy/HSI_VISION.md) · LHKG: [`../strategy/HSI_LIVING_HEALTH_KNOWLEDGE_GRAPH.md`](../strategy/HSI_LIVING_HEALTH_KNOWLEDGE_GRAPH.md)  
**Public chrome:** [`HSI_PUBLIC_SITE_IA_AND_PAGE_SYSTEM.md`](./HSI_PUBLIC_SITE_IA_AND_PAGE_SYSTEM.md) · tokens ivory / burgundy / Host Grotesk  
**Reference craft:** Immune Super Intelligence (`immunecity`) atlas + `/graph` — patterns only; not branding, not single-disease content, not shared Neon.

## Why this is flagship

The Living Health Knowledge Graph is HSI’s distinctive scientific product surface. Marketing pages (#167–#172) established premium chrome; the graph must feel like the same instrument — clear, credible, and cross-domain — while matching or exceeding ISI’s interaction craft.

SSc remains a **validation case** only. Immunology is one domain among microbiome, neuro, metabolic, omics, and others. No live CDS/PHI. No Gate C auto-approve. No invented edges.

---

## What makes ISI feel flawless

Studied in `immunecity` (read-only): `src/data/kg.json` (260 nodes / 395 relationships / 92 `relation_semantics`), `GraphView.tsx` (d3 + `ClientOnly`), `GraphNodeDetail` / `GraphEdgeDetail`, `engine.ts`, `concepts.ts`, `atlas.css` / `biotech.css` / `isi.css`.

### Layout

1. **Height-locked three-zone workspace** — filter rail | dark stage | detail under/beside the canvas so inspection shrinks the stage instead of floating over it.
2. **Graph ↔ list dual surface** — same selection model; narrow viewports default to list; canvas stays mounted (`display: none`) so layout state survives.
3. **Dismissible how-to guide** — three steps, then gone (localStorage).
4. **Starting points** — real highest-degree curated concepts per family, not decorative placeholders.

### Typography & visual system

5. **Token-driven type colours** — `--t-cell`, `--t-molecule`, … with light/dark pairs; stage uses navy/teal paper, not generic dashboard greys.
6. **Display + body discipline** — Chillax / General Sans in ISI; HSI maps this craft onto Host Grotesk + ivory/burgundy/instrument tokens.
7. **Label restraint** — labels for high-degree or focused nodes; halo stroke for readability on dark canvas.

### Node / edge semantics

8. **Degree-scaled marks** — radius grows with connectivity; draft nodes get dashed warn stroke.
9. **Selection fog** — selected 1.0, 1-hop 0.7, rest ~0.15 so the neighbourhood reads first.
10. **Polarity stroke** — relation_semantics (`+` / `-` / `r+`) colour unselected edges; selection overrides with one accent so the path wins.
11. **Fat invisible hit targets** (stroke-width ~16) for edges; keyboard Enter/Space on nodes and edges.

### Panels & provenance

12. **Direction-split neighbours** — “Acts on” / “Acted on by” with mechanism + edge-scoped cites.
13. **Edge sheet with explicit absence** — tissue, mechanism, source, reviewer, decision, version; missing fields say “Not recorded”, never invent.
14. **Three axes stay separate** — teaching/evidence status ≠ curated cite ≠ confidence; concept-level cites never inflate link support.
15. **Honesty-typed empty states** — search miss, zero types, evidence filter, empty neighbourhood, propagation below threshold — each says “filter/gap, not a scientific negative.”

### Interaction & performance

16. **Live force + drag pin** with ResizeObserver re-centering when the detail slot changes height.
17. **Search → enable type → centre camera** at a fixed scale after ticks settle.
18. **SSR safety** — GraphView lazy + `ClientOnly` with a shell Fallback that preserves layout (CWV).
19. **Text table** as a11y parallel — show-more paging, concept hand-off to the same focus function.
20. **Signed walk (`propagate`) separate from layout** — Block/Activate is a semantic BFS, not the force simulation.

---

## HSI current state (audit)

| Surface | Route | Data (honest) | Maturity |
|---------|-------|---------------|----------|
| Public educational explorer | `/science/graph` | 10 organs/tissues, ~18 `RELATED_TOPIC` navigation edges from `biologyCatalogue.ts`; `reviewed: false` | Interaction scaffold exists (ISI-inspired filters, URL state, force layout, exports, SSc panel) — visual system still teal/sage, not premium ivory/burgundy |
| Typed schema overlay | same page | Schema v2 predicates; edges remain unreviewed RELATED_TOPIC | Good honesty; weak visual narrative |
| SSc research draft | accordion on same page | Versioned JSON; fail-closed if `graphPromotable` / reviewed flags flip | Correct governance; visually secondary |
| Cross-domain research KG | `/research/knowledge-graph` | Domain snapshot ~153 nodes / 131 edges (candidates + gaps); claim corpus separate | Strong research depth; not yet “flagship home” |
| Governed LHKG / Neon | server + migrations | Red-wave HSI Neon only; approved vs unreviewed separation | Backend ownership; not the public flagship canvas |
| Homepage demos | `/` instrument previews | Illustrative; must not claim live governed graph | Keep linked into `/science/graph` |

### Gaps vs ISI craft

| Gap | Detail |
|-----|--------|
| Visual system drift | Graph CSS uses sage greens / Arial on SVG; public site uses Host Grotesk + ivory/burgundy/instrument |
| Data depth (public) | 10 nodes vs ISI 260 — must not invent edges; grow via curation / approved publish later |
| Starting points | Missing curated “enter here” by domain family |
| Neighbour grouping | Flat connection list; no kind/direction grouping |
| Graph/list dual mode | Canvas-only; mobile stacks but lacks list-first mode |
| Type chips | Selects only; no counted checkbox list with colour dots |
| Edge polarity story | Domain research graph has negated/contextual strokes; educational explorer barely narrates direction |
| Provenance sheet | Dossier exists but inspector hierarchy is dense; absence labeling uneven |
| Guide | Static numbered strip; not dismissible |
| SSR shell | Lazy route exists; no dedicated explorer skeleton matching stage height |
| Cross-link to depth | Research KG linked in nav but not framed as “deeper corpus under the same honesty rules” |

---

## Target UX (flagship contract)

### One story, three honesty layers

1. **Educational topic map** (`SCIENCE_GRAPH`) — public default; clearly labelled draft / not causal / not approved.
2. **Research candidates & gaps** (`/research/knowledge-graph`) — source-linked; not scientific approval.
3. **Governed LHKG** — authenticated / Neon red-wave; approved edges only leave Gate C with human review.

Never blend layers visually without a kicker. Never promote educational navigation edges into “mechanisms.”

### Interaction model (lift from ISI, HSI tokens)

```
Find / start → filter types & domains → select node or edge → inspect neighbours + provenance → deepen into research corpus or body/paths
```

- URL owns: `q`, `type`, `domain`, `review`, `evidence`, `view`, `depth`, `node`, optional `surface=list|graph`.
- Empty filters explain dataset scope; recovery clears to a visible concept.
- Layout distance never asserts biology.
- Exports remain scoped `public_educational_draft` with `scientificApproval: false`.

### Visual system

- Page chrome: `--hsi-ivory` / `--hsi-ink` / Host Grotesk (match marketing).
- Stage: `--hsi-instrument` dark canvas; selection accent `--hsi-burgundy` or scientific teal for links; kind colours stay distinct from brand red.
- Evidence status chips reuse `--hsi-status-*` tokens already on the public site.
- Focus-visible: burgundy outline (matches site focus).

### Cross-domain (not Immune City clone)

Domain filter and starting points use HSI systems already in catalogue: nervous, respiratory, cardiovascular, digestive, endocrine/metabolic, immune, urinary — expandable as curated entities land. SSc dataset stays an accordion / research link, never the hero title.

---

## Phased plan

### Phase 0 — Now (this PR)

Ship on `/science/graph` without inventing science:

- Flagship design doc (this file).
- Visual alignment to HSI tokens + Host Grotesk on explorer + canvas labels.
- Dismissible guide; honesty banner (educational vs research vs governed).
- Starting points from real highest-degree nodes per system.
- Counted type chips; direction + kind grouped neighbours.
- Graph / list surface toggle (list default ≤900px).
- Clearer provenance / absence copy; deep-link framing to research KG.
- Unit + e2e honesty/filter regressions; `site` tsc.

### Phase 1 — Next PR(s)

- Shared explorer shell component used by educational + domain research pages (one craft language).
- Atlas-style concept pages for educational entities (`/science/concept/:id`) with neighbour groups.
- Parallel text table with show-more (a11y), without requiring d3.
- Domain-graph legend + educational explorer share selection-fog / label rules.
- Homepage instrument → deep-link with `node` + honesty chip.

### Phase 2 — Curated depth (human-gated)

- Expand educational catalogue only with curator-approved entities/edges (or publish packs from governed graph).
- Mechanism predicates only when evidence + review status allow; keep RELATED_TOPIC for navigation.
- Optional signed educational walks **only** on curated polarity tables — never on draft associations.
- Performance: virtualise list mode; keep 500-node layout budget.

### Phase 3 — Governed flagship read

- Public read of **approved** LHKG slices (red-wave Neon), fail-closed, honesty labels.
- Still no PHI/CDS; still no Gate C auto-approve.
- ISI consume remains Discovery JSON only (immunecity freeze-lift scope).

---

## Non-goals

- Cloning ISI branding, Chillax, or single-disease atlas domains.
- Pointing HSI migrations at immunecity Neon (autumn-snow).
- Inventing edges, mechanisms, or “ESTABLISHED” statuses to look larger.
- Live CDS, PHI, EHR write-back, or Gate C automation.
- DeliverX / unrelated products.

## Verification checklist

- [ ] Honesty: educational draft ≠ SSc research draft ≠ governed approved.
- [ ] Filters never invent nodes/edges; unsupported evidence → empty with recovery.
- [ ] Layout deterministic / bounded; no mutation of catalogue records.
- [ ] e2e: URL restore, neighbour nav, zoom/drag, keyboard edge inspect, 320px, SSc accordion.
- [ ] `site` TypeScript clean; graphExplorer unit tests green.
- [ ] Neon still red-wave placeholders only in tracked files.

## Ownership

| Concern | Owner |
|---------|--------|
| Public explorer UX | `site/src/pages/ScienceGraph.tsx`, `GraphVisual.tsx`, `graph-explorer.css` |
| Educational data | `biologyCatalogue.ts` / typed overlay — curator edits only |
| Research domain snapshot | `research/domain-graph/` + DomainKnowledgeGraph |
| Governed LHKG | `src/livingHealthKnowledgeGraph.ts`, Neon migrations 011+ |
| ISI consume wiring | immunecity freeze-lift playbook only |
