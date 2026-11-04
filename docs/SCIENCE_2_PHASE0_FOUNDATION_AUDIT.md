# HSI Science 2.0 — Phase 0 Foundation Audit
Date: 2026-11-04
Scope: repository-level audit of the public Science experience. This is not a production deployment, clinical validation, or full repository-wide security audit.

## Verified implementation inventory
- `site/src/pages/Science.tsx` renders `ScienceLanding`.
- `site/src/components/landing/ScienceLanding.tsx` contains three educational system views (immune, metabolic, microbiome), conceptual maps, keyboard-operated radio selections, and mechanism paths (seven immune teaching stages; four overview stages for the other systems).
- `site/src/pages/ScienceBody.tsx` contains ten hard-coded organ/tissue records, a conceptual SVG human outline, searchable list, system filter, organ detail, connections, and external reference links.
- `site/src/styles/science.css`, `site/src/styles/science-body.css`, and `site/src/styles/hsi-editorial.css` style the experience.
- `site/src/App.tsx` registers `/science` and `/science/body`; `site/vercel.json` declares SPA rewrites for both.
- `site/e2e/science-body.spec.ts` covers responsive widths, selection, search, navigation, and horizontal overflow.
- The Phase 1 PR #34 validation workflow completed successfully before merge.

## Findings and priorities

### P0 — content provenance and review
1. ScienceBody organ explanations and connection lists are embedded in TSX and have one broad external reference per organ. No per-claim provenance, source-version, scientific reviewer, review timestamp, or review state is represented in this module.
2. The organ `connections` list is an educational navigation association; it has no typed biological predicate or evidence strength. Do not present it as a validated biological knowledge graph.
3. No content ingestion or scientific approval workflow is implemented in these inspected Science files.
**Action:** Define a reviewed content record with stable entity ID, aliases, ontology mappings where verified, claim-level evidence, relationship type, species/tissue/context, author, reviewer, review status, and timestamps. Keep unreviewed claims out of approved public graph output.

### P0 — architecture boundaries
4. The Body Explorer's organ data, presentation coordinates, navigation and source URLs are coupled inside one page component. The Science landing has a separate, hard-coded systems model. They cannot yet share entity state or a canonical biology model.
5. No evidence of a public Science API, 3D anatomy asset pipeline, graph query service, or grounded Ask Science service exists in these inspected entry points. Their existence elsewhere in the repository has not been ruled out; verify before building new services.
6. Public Science must not receive patient-identifiable data or private ISI research material by default.
**Action:** Extract typed canonical biology entities and relationships into a versioned, public-approved content package. Use explicit interfaces for Science→NEXUS and Science→ISI transitions, with access checks and separate provenance.

### P1 — product completeness
7. The first Body Explorer is an interactive 2D schematic, **not** a rotatable 3D anatomical model; SVG markers are not directly clickable. Searchable buttons provide keyboard access.
8. The organ-to-cell Biology Zoom path is a future-state description, not an implemented route or deep biological dataset.
9. The pancreas-to-diabetes vertical slice stops at introductory organ context. It lacks reviewed islet/beta-cell content, pathway relationships, simulation, and disease mechanism navigation.
**Action:** Finish Phase 1 against explicit acceptance criteria before describing the full 3D or pancreas journey as complete. Deliver a licensed 3D model with a reliable 2D fallback, or explicitly revise the scope to a high-quality interactive 2D atlas.

### P1 — UX, accessibility and QA
10. The SVG has an accessible description and an adjacent keyboard-operable list, but does not provide point-based organ selection. Validate focus order, screen-reader announcements, colour contrast, zoom, reduced-motion and touch target sizes manually.
11. Existing Playwright tests check a limited happy path and four viewport widths. They do not validate evidence links, filtering edge cases, screen readers, keyboard-only journeys, model loading failures or performance budgets.
12. Successful GitHub CI does not establish that Vercel deployed the new commit. Verify production deployment and deep-link reload independently.
**Action:** Add interaction and accessibility tests, performance budgets, deployment smoke tests, and scientific content review checks.

### P1 — scientific framing
13. The existing Science landing clearly states that its diagrams are educational and not a live knowledge graph, clinical advice or research workspace. Preserve this distinction.
14. The seven immune stages are explicitly presented as overlapping teaching concepts, not a rigid biological timetable. Preserve this nuance.
15. Metabolic and microbiome views correctly remain overview depth rather than copying the immune sequence.
**Action:** Keep uncertainty, causal/associative distinctions and educational boundaries visible as Science expands.

## Proposed canonical data contract (design, not implemented)
```ts
type ReviewState = "draft" | "in_review" | "approved" | "retired";
type BiologyEntity = {
  id: string; kind: "organ"|"tissue"|"cell"|"molecule"|"pathway"|"process"|"disease";
  preferredLabel: string; aliases: string[];
  definition: string; reviewState: ReviewState; reviewedAt?: string;
  sourceRefs: string[]; version: string;
};
type BiologyRelation = {
  id: string; subjectId: string; predicate: string; objectId: string;
  context?: { tissue?: string; species?: string; experimentalSetting?: string };
  evidenceRefs: string[]; reviewState: ReviewState;
  assertionType: "established_mechanism"|"reported_association"|"inference"|"hypothesis";
};
```

## Delivery gates
- **Gate A (foundation):** canonical entity IDs, reviewed content schema, citation validation, data-access boundary, and clear current/future capability labels.
- **Gate B (Phase 1 completion):** organ interaction, documented asset licences, usable 2D fallback, mobile/keyboard coverage, reviewed pancreas content, reliable deep links.
- **Gate C (Phase 2 readiness):** approved organ→tissue→cell→molecule sample, typed and cited relationships, preserved URL context, repeatable tests.
- **Gate D (research integration):** explicit review state, no hypothesis promotion to established fact, authenticated access when required, auditable transitions.

## Suggested implementation sequence
1. Create shared `BiologyEntity` and `BiologyRelation` schemas and content validation tests.
2. Extract the ten organ records from the page into a versioned reviewed-content module; keep the existing UI working.
3. Add claim-level evidence metadata and scientific review workflow.
4. Complete the 3D-versus-2D scope decision, anatomical asset licensing and accessible interaction contract.
5. Expand the pancreas→islet→beta cell→insulin pathway slice using approved sources.
6. Add QA coverage and independently verify production deployment before announcing completion.

## Explicitly unverified
- Entire repository service inventory and whether suitable graph/agent services exist elsewhere.
- Scientific accuracy of every text claim and suitability/licensing of every linked source.
- Live Vercel production state, security posture, assistive technology testing, and real-device performance.
These require additional technical/scientific review and must not be inferred from CI success.
