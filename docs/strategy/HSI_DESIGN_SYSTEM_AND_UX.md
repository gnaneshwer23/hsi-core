# Document 04 — HSI Unified Design System and UX

**Health Super Intelligence (HSI) | Version 1.0 | 2 November 2026**  
**Status:** Proposed / pending founder approval — target-state specification; implementation and current-state claims require repository audit.  
**Canonical path:** [`docs/strategy/HSI_DESIGN_SYSTEM_AND_UX.md`](./HSI_DESIGN_SYSTEM_AND_UX.md)  
**Governing documents:** [`HSI_MASTER_PRD_v1.md`](./HSI_MASTER_PRD_v1.md) (HSI-FR-001–054), [`HSI_ARCHITECTURE_AND_DATA.md`](./HSI_ARCHITECTURE_AND_DATA.md) (Document 02), [`HSI_INTELLIGENCE_ENGINE_SPEC.md`](./HSI_INTELLIGENCE_ENGINE_SPEC.md) (Document 03).  
**Scope:** HSI public site, ISI researcher workspace, HSI Clinical, Aksh Health, HSI Trials, shared design system, onboarding and evidence interaction.  
**Decision gate:** Audit first. Design second. Implement only after explicit founder approval.

### Reconciliation (strategy pack)

**Role:** Authoritative product UX companion (Master PRD §18 Document 04). Ingested from founder source `04_HSI_DESIGN_SYSTEM_AND_UX.md` without rewriting author intent.

**How it relates to existing strategy docs:**

| Existing pack | Relation |
|---------------|----------|
| **§8** pack ([`HSI_EXISTING_UX_AUDIT.md`](./HSI_EXISTING_UX_AUDIT.md), [`HSI_PUBLIC_WEBSITE_SPECIFICATION.md`](./HSI_PUBLIC_WEBSITE_SPECIFICATION.md), [`HSI_UNIFIED_DESIGN_SYSTEM.md`](./HSI_UNIFIED_DESIGN_SYSTEM.md), [`HSI_USER_JOURNEYS.md`](./HSI_USER_JOURNEYS.md), role workspace UX docs, et al.) | Remains **detailed elaboration + Phase 0 UX audit**; this file is the **authoritative product UX companion** |
| [`HSI_PRODUCT_INFORMATION_ARCHITECTURE.md`](./HSI_PRODUCT_INFORMATION_ARCHITECTURE.md) | IA elaboration — subordinate to this Document 04 Spec where they diverge |
| Document 02 / Document 03 | Architecture, data planes, and intelligence engine; this Spec covers public site, workspaces, design system, trust UI |

Detailed §8 packs remain for route inventories, brand audits, acceptance tests, and FR evidence. **Do not** treat Spec target UX as Verified if audits mark Missing / Mocked / Partial. Conflicts vs Phase 0 UX audits: [`HSI_DOC02_03_RECONCILIATION.md`](./HSI_DOC02_03_RECONCILIATION.md) (Documents 02 / 03 / 04).

---

## 1. Executive product experience
HSI is one connected health and biomedical intelligence ecosystem, not a developer portal, internal roadmap, generic medical chatbot, decorative knowledge graph, or four disconnected applications. Design for scientific credibility, user comprehension, operational efficiency and transparent evidence. Advanced reasoning is underneath; user tasks, findings, evidence, uncertainty and appropriate next actions are on the surface.

**North star:** *Connect the patient. Understand the biology. Evaluate the evidence. Discover opportunities. Improve decisions.*

Four user workspaces share a design language and trust infrastructure, but preserve distinct permissions, workflows and data domains:
- **Immune Super Intelligence (ISI):** scientific question → graph → mechanisms → evidence comparison → gaps → cited brief.
- **HSI Clinical:** authorised patient search → identity verification → longitudinal timeline → clinical context → evidence → trial screening.
- **Aksh Health:** my health → timeline → symptoms → medications → monitoring → care team → relevant research information.
- **HSI Trials:** study criteria → candidate screening → missing evidence → investigator review → recruitment workflow.

### Design non-negotiables
1. Show only verified capabilities as available; label evaluation, development and planned functions explicitly.
2. Never use fabricated patient records, lab values, research claims, trial matches, integration status or agent progress.
3. Distinguish **observed patient fact / established scientific evidence / statistical association / computational inference / unvalidated hypothesis**.
4. Expose source, date, provenance, uncertainty and review status for material findings.
5. Enforce permissions server-side; interface hiding is not authorisation.
6. Never imply AI output is an autonomous clinical decision or final trial eligibility determination.
7. Maintain a unified HSI experience without merging restricted clinical data into public research contexts.
8. Prioritise workflows and comprehension over visual spectacle, technical jargon and the number of agents.

## 2. Current-state audit before design or code changes
Inspect `gnaneshwer23/hsi-core`, `gnaneshwer23/immunecity`, `gnaneshwer23/aksh-health-redesign`, their deployed sites, existing components, auth, routing, feature flags, graph UI, content, responsive layouts, tests and accessibility. Do not assume sites or repos are operational based on a screenshot or README. For each route/component record: product, audience, route, purpose, repo and code path, data source, auth, states, responsive behaviour, accessibility, analytics, known issues, reuse recommendation, screenshots and test evidence. Classify **verified working / implemented unverified / partial / mocked / broken / missing / not assessed**. Identify existing brand assets and tokens before proposing changes. Produce a route inventory, UX debt register, capability matrix and a keep/refactor/replace decision log. Never destroy validated work solely to match an inspiration image.

## 3. Information architecture and product navigation
### Public HSI site
Primary navigation: **Platform | Solutions | Science & Evidence | Collaborate | About | Sign in**. Optional contextual product switcher on relevant pages. Avoid public engineering-roadmap navigation, tool inventories and agent catalogues. Use accurate CTAs such as **Explore the platform**, **Explore ISI**, **Request collaboration**, **Join an approved evaluation**; only offer **Start** where the journey is actually available.

Proposed public routes (adapt to existing routing conventions): `/`, `/platform`, `/solutions/clinical`, `/solutions/research`, `/solutions/patients`, `/solutions/trials`, `/science-evidence`, `/trust`, `/collaborate`, `/about`, `/sign-in`. Product routes must not pretend to be operational if unavailable.

### Workspace navigation
- **Research:** Research Workspace, Knowledge Graph, Mechanisms, Evidence, Comparisons, Research Gaps, Hypotheses, Saved Investigations.
- **Clinical:** Overview, Patients, Timeline, Labs, Medications, Evidence, Trial Screening, Review Queue.
- **Patient:** My Health, Timeline, Measurements, Symptoms, Medications, My Care, Learn.
- **Trials:** Studies, Eligibility Criteria, Candidate Screening, Review Queue, Recruitment, Evidence, Activity.

A user with multiple verified roles can switch workspaces, but role switching must re-evaluate access and never silently propagate sensitive context. Mobile navigation is task-focused rather than a compressed desktop menu.

## 4. Public website page-by-page specification
### Homepage
1. **Hero:** Headline: “Connecting Human Health with Biological Intelligence.” Subheading explains connected clinical context, human biology, scientific evidence and research opportunities. Two accurate CTAs. Visual shows meaningful links across patient context → clinical observations → mechanisms → evidence → trials, without implying universal patient connectivity.
2. **Fragmentation problem:** Separate clinical records, patient observations, biomedical databases and trials; describe real user consequences.
3. **How HSI works:** Connect available information → understand longitudinal context → investigate biology → assess evidence → explore opportunities → support human decisions. Provide readable text alternatives.
4. **Four products:** Aksh, HSI Clinical, ISI, HSI Trials; each card identifies user, problem, actual maturity, next action.
5. **Living Health Knowledge Graph:** Curated, explorable example with provenance and clear labels; not an unreadable animated hairball.
6. **Role-specific journeys:** One clear task story per audience; mark planned flows honestly.
7. **Scientific trust:** Provenance, review, uncertainty, data permissions and safety; no unearned certifications.
8. **Capability availability:** Verified working / limited evaluation / in development / planned, based on audit.
9. **Institutional collaboration:** Hospitals, universities, research institutes, trial centres and approved data partners.
10. **Closing CTA:** Explore the platform / Discuss collaboration.

### Other public pages
- **Platform:** Shared intelligence foundation, four products and data boundary explanation; explain capabilities before infrastructure.
- **Clinical:** Longitudinal clinical workflow, source fidelity, human review, integration and availability requirements.
- **Research:** Scientific questions, graph, mechanism explorer, evidence comparisons and research briefs.
- **Patients:** Aksh's monitoring, self-reported data, educational guidance and safety boundaries.
- **Trials:** Registry sources, criterion-level review, unknown data and investigator accountability.
- **Science & Evidence:** Source catalogue, terminology, claim categories, research methods and limitations.
- **Trust:** Privacy, security, clinical safety approach, intended use and honest compliance status.
- **Collaborate:** Clear enquiry form with organisation, role, interest, consent/privacy notice and confirmation; no unsolicited sensitive health details.
- **About:** Mission, product rationale, responsible development and verified team information.

## 5. Shared visual design language
### Direction
Premium, restrained, scientifically credible, spacious but information-efficient. Prefer clean light surfaces for data-heavy clinical/research tasks; optional dark mode only if all visualisations and evidence states remain accessible. Avoid neon gradients, excessive glassmorphism, generic robots, decorative neural networks, meaningless particle animations and oversized AI branding.

### Candidate palette — validate against existing assets
| Token | Candidate | Usage |
|---|---|---|
| `color.ink` | `#10243A` | Primary text |
| `color.navy` | `#102D46` | Primary brand/navigation |
| `color.teal` | `#087F8C` | Biomedical accent |
| `color.blue` | `#2563A6` | Clinical accent |
| `color.violet` | `#6758A8` | Research accent |
| `color.canvas` | `#F7F9FB` | App background |
| `color.surface` | `#FFFFFF` | Content surfaces |
| `color.muted` | `#586879` | Secondary text |
| `color.border` | `#DFE6EC` | Dividers and fields |

Do not use colour alone to encode evidence class, eligibility or safety state. Use text, icons and accessible descriptions. Use semantic tokens (`surface/default`, `text/primary`, `status/warning`, `evidence/hypothesis`) rather than direct hex values inside components. Proposed product accents: clinical blue, ISI violet/teal, Aksh teal, trials indigo; common typography and component anatomy.

### Typography and layout
Use a readable licensed/system sans-serif with clear tabular numerals for labs and timestamps; optional complementary display face for public headings. Define a responsive type scale, 4/8 px spacing system, maximum readable text width, density modes (comfortable/compact), standard page shells and sticky workspace context. Use 12-column desktop grid when useful; clinical/research split panes should have resizable widths and sensible minimums. Charts must have legends, units, ranges, missing-data handling and accessible table alternatives.

### Motion and imagery
Use motion only to clarify navigation, loading and state changes; honour `prefers-reduced-motion`. Prefer original diagrams of organs, cells, pathways, timelines and graph relations, with scientific accuracy review. Avoid imagery that implies unproven diagnostics or fabricated patient outcomes.

## 6. Component architecture
Build or adapt a shared library with documented API, variants, states, keyboard interaction, semantic roles, contrast and code examples. Required foundations: button, link, icon button, input, search, select, checkbox, radio, tabs, breadcrumbs, navigation, cards, tables, filters, drawers, modals, notifications, form validation, empty/loading/error/permission states, pagination, tooltips, confirmation dialogs and accessible charts.

Domain-specific components:
- **EvidenceCard / EvidenceDrawer:** source, publication or record identifier, date, context, claim, epistemic class, supporting/contradicting evidence, review state, source link.
- **PatientContextHeader:** verified identity, organisation, care context, record freshness, source completeness; never show unauthorised details.
- **ClinicalTimeline:** encounter events, medications, lab observations, filters, uncertainty and source inspection.
- **LabTrend:** units, reference ranges where valid, timestamps, source, method, missing points and warnings for incomparable values.
- **MedicationHistory:** prescribed vs dispensed vs administered vs patient-reported; status and chronology.
- **KnowledgeGraphCanvas:** entity search, cluster/expand, relationship typing, path highlighting, graph legend, provenance and keyboard-accessible alternative.
- **MechanismPanel:** cell/tissue/pathway/disease context, evidence and contradictory findings.
- **EvidenceComparison:** study design, organism, population, tissue, method, results, limitations and citations.
- **HypothesisCard:** hypothesis, rationale, alternative explanations, uncertainty, proposed validation and explicit unvalidated status.
- **EligibilityCriterion:** inclusion/exclusion, assessment satisfied/not satisfied/unknown/ambiguous/requires review, evidence, reviewer action.
- **ExecutionStatus:** real tool/job status; never fake progress or simulated agents.
- **ReviewDecision:** reviewer identity, timestamp, decision, rationale, immutable audit reference.

## 7. Role-based onboarding
### Shared onboarding principles
Explain the value before asking for data. Collect minimum necessary information, progressively. Clearly distinguish public browsing from account creation and from institutional authorisation. Never grant clinician access on the basis of a self-selected role alone. Show integrations only if supported and approved.

### Researcher onboarding
Role/institution (where relevant) → research interest → disease/cell/tissue focus → evidence preferences → guided sample question using genuine public data → workspace. Do not require clinical data access.

### Clinician onboarding
Institutional identity and professional verification → organisation assignment → approved access scope → relevant safety/privacy notices → authorised patient search. Block clinical access until verification and partner arrangements are complete.

### Patient onboarding
Value and limitations → goals → optional self-reported context → supported data connections → permissions → personalised dashboard. Clearly distinguish self-reported observations from verified provider data.

### Trial team onboarding
Institution and approved study/project → role verification → registry/study selection → data permissions → criterion review workflow. No implicit patient outreach permissions.

### Multi-role onboarding
Explicit workspace switcher; no shared unrestricted session context; purpose-bound access checks on every sensitive operation.

## 8. ISI researcher experience — flagship initial workflow
**Entry:** A prominent scientific question box plus advanced filters (disease, species, cell type, tissue, study type, publication date, omics modality). Example questions are illustrative and must not generate invented evidence.

**Investigation screen:**
- Top: question, scope, data coverage and saved investigation status.
- Left: entities, filters, graph layers and saved paths.
- Centre: interactive graph and switchable pathway/evidence views.
- Right: selected entity, mechanism summary, claims, citations, contradictions and next actions.
- Bottom or secondary pane: actual execution steps and evidence collection status, not fictional agent activity.

**Graph UX:** progressive node expansion, typed edges, clustering, search, accessible non-graph alternative, source links, relation context, versioning and export. Never infer causal relationships from graph adjacency.

**Evidence comparison:** structured studies with model, population, tissue, methods, results, limitations, contradictory findings and access rights. Absence of a graph edge is not proof of a research gap. **Research brief:** question, mechanisms, evidence, contradictions, limitations, testable hypotheses, validation suggestions and traceable references. Hypotheses remain unvalidated.

**Research acceptance tests:** users can find an entity, traverse a meaningful path, inspect a source, compare conflicting studies, understand uncertainty, and export a cited brief; all cited claims are checked against actual source records.

## 9. HSI Clinical experience
**Entry:** authenticated and authorised clinician. Patient search results must avoid unnecessary identifiers and distinguish verified, ambiguous and unavailable matches. Never let an LLM merge identities.

**Patient overview:** verified patient header; encounter summary; longitudinal timeline; conditions; labs; medications; relevant documents; source coverage/freshness; missing data. An evidence-linked insights panel answers practical questions (what changed, what is missing, what may need review) without presenting unsupported diagnosis.

**Timeline:** chronology by event and recorded date; filter by condition/source/encounter; medication starts/stops; lab overlays; raw record links; corrected result handling; distinct patient-reported and provider-recorded information. Temporal sequence is not causality.

**Biology exploration:** contextual action “Explore related biological evidence” opens general disease/pathway evidence without sending unnecessary patient identifiers to public knowledge services. Distinguish disease-level evidence from patient-specific facts.

**Trials:** authorised, criterion-level screening with unknowns and investigator review; never display definitive AI-determined eligibility or initiate autonomous recruitment.

**Clinical acceptance tests:** correct patient matching, permissions, source fidelity, unit correctness, stale/missing data display, reviewer traceability and safe failure on unavailable integrations.

## 10. Aksh patient experience
**Dashboard:** My Health summary, longitudinal measurements, symptoms, medications, care preparation, education and connection status. Use understandable, non-alarmist language; label device and self-reported sources. Avoid meaningless health scores and fabricated trends.

**Monitoring:** time-range selection, units, measurement source, missing-data states, clinically appropriate explanations and clear limitations. **Medication:** documented list with provenance, patient confirmation workflow and no autonomous dose modification. **Symptoms:** structured logging and appropriate red-flag escalation policies. **Care:** appointment preparation and approved sharing; do not imply HSI can contact care teams unless a verified integration exists. **Research information:** general educational content, never unsolicited trial eligibility conclusions.

**Patient acceptance tests:** onboarding without unnecessary data, accessible trends, source distinction, safe educational responses, data permission controls and clear help/escalation paths.

## 11. HSI Trials experience
**Study discovery:** official registry ID, condition, phase, locations, recruitment status, last verified date, inclusion/exclusion and source link. **Criteria workspace:** parsed criterion text alongside original source, extracted structured condition, provenance, ambiguity and version. **Candidate screening:** only authorised attributes; satisfied/not satisfied/unknown/ambiguous/requires review; missing-evidence requests. **Review queue:** investigator decisions, rationale, timestamps, access history. **Recruitment:** separate approval-controlled workflows; no autonomous patient contact or enrolment.

**Trial acceptance tests:** correct registry freshness, criterion parsing fidelity, unknown preservation, no unsupported eligibility certainty, no unauthorised patient disclosure and full reviewer traceability.

## 12. Cross-domain evidence and trust interaction
A claim is never just a sentence. Each significant finding should have a stable claim ID and expose: text, epistemic class, source(s), contradiction(s), context (species/tissue/population/method), time, uncertainty, transformation lineage, review state and graph/record version where applicable. A citation at the bottom of a chat response alone is insufficient. Evidence drawer supports “view original”, “why shown”, “what is unknown”, “related mechanism” and “report issue”. Clinical source access remains governed by user permissions.

Use explicit labels:
- **Documented observation** — source record.
- **Established evidence** — supported within defined scientific context.
- **Association** — observed relationship; not necessarily causal.
- **Model inference** — computational output requiring validation.
- **Research hypothesis** — proposed and unvalidated.

## 13. Intelligent assistance without agent clutter
Provide one contextual assistant entry point per workspace (e.g., Ask ISI, Ask about this timeline) with clearly bounded capabilities. Do not place the internal agent roster in public navigation or require users to choose orchestration roles. Show meaningful progress only when grounded in actual task execution: resolving concepts, retrieving evidence, validating claims, generating brief. Advanced execution trace belongs in a disclosure panel for authorised technical reviewers. Display errors and tool unavailability rather than simulated success.

## 14. Interaction state contract
Every data-dependent component must support: initial, loading, populated, empty, partial data, stale data, permission denied, integration unavailable, validation error, general error, review required and success (where relevant). For long-running work, support resumable state and truthful task status. Preserve user inputs on recoverable errors. Never substitute mock data in production without unmistakable labelling and separation.

## 15. Accessibility, responsive and internationalisation
Target WCAG 2.2 AA; verify contrast, keyboard navigation, visible focus, screen-reader names, accessible error handling, reduced motion, accessible tables for graph/chart content and usable touch targets. Desktop supports dense scientific/clinical split panes; tablet collapses contextual panels; mobile prioritises patient tasks and simplified research/clinical review. Dates, units, time zones, number formats and terminology should be locale-aware. Do not assume translation equals clinical terminology validation.

## 16. Privacy and safety in the interface
Display access context and source freshness prominently. Use server-enforced role/attribute authorisation and appropriate audit trails. Avoid protected data in public routes, browser analytics, logs, screenshots and error messages. Require confirmation and approved workflows for consequential actions. Distinguish educational information, research hypotheses and clinical decision support. Do not claim regulatory approval, NHS certification or clinical readiness without documented evidence.

## 17. Analytics and product evaluation
Instrument privacy-preserving events for navigation, task starts/completions, source inspection, error states, evidence drawer use, research brief exports, onboarding completion and review decisions. Define event names and permissible properties; never put identifiable clinical content in general-purpose analytics. Evaluate with real representative tasks and authorised expert reviewers. Metrics: task completion, comprehension, time to evidence, citation accuracy, unsafe output rate, usability, accessibility failures, drop-off, user-reported trust. Establish baselines before numeric targets.

## 18. Engineering integration contracts
The design system consumes typed, permission-aware APIs; UI must not directly bypass domain services. Define common interfaces:
- `WorkspaceContext`: role, organisation, permitted scopes, purpose, session status.
- `SourceDescriptor`: source ID, type, timestamp, freshness, permissions, original-link capability.
- `EvidenceClaim`: claim ID, epistemic class, references, context, contradictions, uncertainty, review.
- `Investigation`: question, resolved entities, workflow state, evidence, graph paths, findings, version.
- `ClinicalTimelineEvent`: event type, observed/recorded timestamps, source, verified patient context, units/status.
- `EligibilityAssessment`: study ID/version, criterion ID, state, supporting evidence, reviewer decision.
- `CapabilityAvailability`: capability, environment, verified maturity, permitted audience, feature flag.

The backend is authoritative for permissions, evidence status, identity, clinical data and eligibility. Use stable IDs and versioned contracts. Prefer existing technology and component patterns where validated; document changes through architecture decision records.

## 19. Design-to-engineering handoff
For every page: route, user, objective, journey entry/exit, information hierarchy, components, API dependencies, role permissions, copy, all UI states, accessibility annotations, responsive behaviour, analytics events, evidence requirements, test cases and screenshot references. Produce high-fidelity screens and a clickable flow prototype before broad refactoring. Maintain storybook/component examples where compatible with the existing stack. No static mock should be mistaken for a production-integrated experience.

## 20. Delivery plan and gates
**Phase 0:** Existing UX/technical audit and screenshots; keep/refactor/replace matrix. **Phase 1:** Information architecture, role journeys, design principles and founder review. **Phase 2:** Shared tokens, components, accessibility and evidence patterns. **Phase 3:** Public site content and product availability truthfulness. **Phase 4:** ISI researcher flagship journey (real graph/evidence). **Phase 5:** Aksh patient alignment. **Phase 6:** HSI Clinical authorised evaluation workspace. **Phase 7:** HSI Trials review workspace. **Phase 8:** Cross-product navigation and contextual interoperability. **Phase 9:** Accessibility, user testing, security/safety verification and staged release. Sequence can change based on audited dependencies; no high-risk workflow bypasses approval gates.

## 21. Acceptance criteria mapped to PRD
- **HSI-FR-001–006:** coherent ecosystem, role-specific workspace and enforced permissions.
- **HSI-FR-007–014:** meaningful graph exploration with source-backed relationships and context.
- **HSI-FR-015–022:** real execution states, orchestrated investigation and verified claims.
- **HSI-FR-023–030:** temporal context, explicit epistemic classes and claim-level provenance.
- **HSI-FR-031–038:** truthful source/integration state, lineage and freshness.
- **HSI-FR-039–046:** public site, researcher, clinician, patient and trial workflows, evidence drawer.
- **HSI-FR-047–054:** privacy, identity, access, safety, auditing and safe failure.

No requirement is “complete” based solely on a design screenshot. Completion needs code evidence, functional testing and, where relevant, expert or institutional approval.

## 22. Required deliverables
1. `HSI_EXISTING_UX_AUDIT.md`
2. `HSI_INFORMATION_ARCHITECTURE.md`
3. `HSI_PUBLIC_WEBSITE_PAGE_SPECS.md`
4. `HSI_DESIGN_TOKENS_AND_COMPONENTS.md`
5. `HSI_ROLE_BASED_ONBOARDING.md`
6. `HSI_RESEARCHER_WORKSPACE_UX.md`
7. `HSI_CLINICIAN_WORKSPACE_UX.md`
8. `HSI_AKSH_PATIENT_WORKSPACE_UX.md`
9. `HSI_TRIALS_WORKSPACE_UX.md`
10. `HSI_EVIDENCE_AND_TRUST_INTERACTIONS.md`
11. `HSI_RESPONSIVE_ACCESSIBILITY_QA.md`
12. `HSI_UX_ANALYTICS_AND_EVALUATION.md`
13. `HSI_UX_IMPLEMENTATION_PLAN.md`
14. `HSI_REQUIREMENT_TO_SCREEN_TRACEABILITY.csv`

## 23. Cursor execution directive
**Audit first. Design second. Implement only after explicit founder approval.** Examine all three repositories and live sites; verify what actually exists; preserve validated functionality and existing brand assets. Prepare an annotated route inventory, cross-product IA, shared tokens, role-specific wireframes, component specifications, evidence UI contracts, accessibility plan and dependency-aware implementation roadmap. Explain what is current versus proposed. Do not build a developer portal, publish internal milestones as primary product navigation, fabricate patient data or scientific findings, expose agent architecture to ordinary users, invent integrations, or claim medical regulatory approval. Do not commit, merge, push, deploy or alter production databases without approval.

**Final product experience:** HSI should feel like one advanced, trustworthy intelligence system that connects human health with biological knowledge while letting each user accomplish a concrete, evidence-grounded task.
