# HSI Existing System Audit

**Audit date:** 2026-11-02  
**Method:** Local clones, source inspection, tests/scripts, deployment configs — not README-only. Deep passes: [hsi-core audit](f5cd44ec-8ecd-4e8b-ba55-5d6d6923c38c), [ISI audit](8e658d97-e143-4d06-8efd-4833a533f441), [Aksh audit](2f88c581-40d6-42b3-8427-5132bdd7c11a).  
**Repos:**  
- `~/Projects/hsi-core` @ `fe69bc6` (github.com/gnaneshwer23/hsi-core)  
- `~/Desktop/immune-city` @ `dbacd47` (github.com/gnaneshwer23/immunecity)  
- `~/Projects/aksh-health-redesign` @ `c186893` (github.com/gnaneshwer23/aksh-health-redesign)

**Classification key:** Verified working · Implemented unverified · Partial · Mock/placeholder · Planned absent · Broken · Not assessed

---

## 1. hsi-core (evidence substrate)

### Product structure
- Bun/TS monorepo: seeds, maps, exporters, Gate C CLI, Discovery SPA (`site/`), docs under `docs/`.  
- **Verified working:** graded edge model; RA/anti-TNF + depth packs; export pipeline; honesty tests for partner fixture; CDS/PHI boundary module.  
- **Identity:** README/site frame as research-intelligence / Human Systems Intelligence — **not** live clinical product.

### Routes / journeys
- Discovery SPA: explore packs, grades, Gate C status, honesty asserts.  
- **Not** patient search, EHR timeline, or trial screening product UX.

### Backend / persistence
- Neon project **red-wave** (`human super intelligence`) only — `hsi_*` tables via migrations.  
- **Verified:** isolation docs (`docs/NEON_PROJECT_MAP.md`); forbid autumn-snow (ISI).  
- Partner MoU: `USE_HYPOTHETICAL_PARTNER_FIXTURE` → `lockedPilot=false` (honesty fix).

### Knowledge graph
- Pack-based edges (~88 Stage 1), not a full multi-layer living graph DB.  
- **Partial** Layer 4 evidence; gut/SSc/neuro depth packs = thin Layer 3/2 seeds.

### AI agents
- Catalog / stubs referencing Aksh names — **no** CONDUCTOR runtime in this repo.  
- **Mock/placeholder** for orchestration; intentional CDS refuse.

### Integrations
- Export consume contracts for ISI; PubMed-ish evidence via curation paths (human Gate C).  
- **No** FHIR hospital federation.

### Auth / safety
- Gate C human-only; cite Check ≠ supports ≠ Approve.  
- `src/cdsPhiBoundary.ts` + docs — **Verified working** as policy/tests.

### Tests / deploy
- **Verified working (this audit run):** `bun test` → **150 pass / 0 fail**; `bun run validate` → **88 edges**, **8 claim→LOINC links**.  
- Site React pages: **Implemented unverified** (no Playwright in-repo). Live `db:migrate` against red-wave: **Not assessed**.  
- P3 molecular adapters: publish path **`forceStub: true`** → **Mock/placeholder** on default publish.

### Alignment with vision
- Excellent foundation for **evidence governance**.  
- Inadequate alone for Health Super Intelligence clinical + trials ambitions.  
- Systems vision JSON / patient observation stubs = regenerable **Mock/placeholder**, not operational planes.

| Capability | Class |
|------------|-------|
| Evidence grades + provenance | Verified working |
| Gate C checklist / export / decisions dry-run | Verified working |
| Gate C live Neon upsert | Partial |
| Partner legal lock | Mock/placeholder (fixture) |
| Living multi-layer graph | Partial / Planned absent |
| Clinical longitudinal | Planned absent |
| Agent runtime | Mock/placeholder (catalog Verified) |
| Live CDS / PHI | Explicitly refused (Verified policy) |

---

## 2. immunecity / Immune Super Intelligence (ISI)

### Product structure
- TanStack Start / React product: Atlas, Ask Immune, Discovery, Academy, Community, curation/SME.  
- Brand: Immune Super Intelligence (`src/lib/brand.ts`).

### Knowledge graph — **preserve**
- `src/data/kg.json` v0.3: **260 core + 70 draft nodes**; **395 + 200 draft edges** (`graphReleaseSnapshot`).  
- `REL-*` IDs in `engine.ts` / `graphInventory.ts`; Neon holds evidence on `relationship_id`, **not** a second graph.  
- **Verified working** for Atlas/graph/Ask grounding. **Not** a six-layer HSI living graph.

### Dual discovery (preserve naming honesty)
- ISI Research Radar: `/discovery` — **Partial** (Neon-backed).  
- HSI Discovery consume: `/hsi/discovery`, `/hsi-consume`, `public/hsi-discovery/*` — **Partial** / diagnostics **Verified**; Gate C writes autumn-snow only (`assertIsiNeonHostForGateC`).

### AI / Ask
- Ask Atlas + corner FAB; grounding in `askGrounding.ts` — **Verified working** (unit tests); live LLM quality **Not assessed**.  
- Explicitly **not** a multi-agent runtime (**Planned absent** for clinical autonomy).

### HSI consume / Gate C / cite
- Wiring per playbook: Discovery JSON consume, honesty asserts, `/hsi-consume`, curation `?hsi=cite`.  
- Cite Check script (`check-cite-candidates-from-gate-c.ts`): **13/13 identifiers verified**; claim_support still **unassessed** (human).  
- **Verified working:** Check path without inventing supports.  
- **Partial:** end-to-end Approve → public citation.

### Trials
- `TrialIntelligence` / melanoma-oriented trial surface — **Partial**; feature/flagged research aid, not HSI Trials product with full eligibility state machine.

### Auth / DB
- Neon Auth + `user_roles` (user/moderator/reviewer/admin).  
- Evidence curation on **autumn-snow** ISI Neon — **must not** merge with hsi-core red-wave.

### Safety
- Public pages only approved citations; admin-gated writes.  
- No live PHI clinical CDS claimed as product core.

### Alignment
- Best existing realisation of **Workflow A** (scientific discovery).  
- Strategic asset for Layers 4 (+ fragments of 2/3/5).

| Capability | Class |
|------------|-------|
| Curated immune KG | Verified working |
| Ask / Atlas journeys | Verified working (product QA ongoing) |
| HSI Gate C consume | Verified working (honesty) |
| Cite Check | Verified working; supports Partial |
| Full Trials matching | Partial / Planned absent |
| Cross-domain clinical link | Planned absent |

---

## 3. aksh-health-redesign (Aksh Health)

### Product structure
- Multi-package UK platform; live `www.akshhealth.com`.  
- Clinical spine, HITL review queue, Medplum staging, agent directory.

### Agents (register + directory)

Canonical register: `packages/platform-uk/lib/agents/register.ts` (**14** `AgentId`s). Directory: `lib/agents.ts`. Audit: `docs/agents/AGENT_FUNCTIONALITY_AUDIT.md`.

| Agent | Role | Maturity |
|-------|------|----------|
| CONDUCTOR | Orchestrator | Functional (simulation / in_validation) |
| CANVAS, SYNTHESIS, DrASSIST, GUARDIAN, HORIZON, NEXUS, PATHWAY, BRIDGE, SHIELD, COMPASS | Clinical loop peers | Functional (simulation) |
| VOICE | Intake sub-path | Partial (not on CONDUCTOR path) |
| PRISM, ATLAS | Imaging / research | **Mock/scaffold** (`trigger: never` / Phase 2) |

All registered agents: `status: in_validation`, `environment: simulation` (except PRISM/ATLAS planned).  
**Parallel tracks:** CONDUCTOR ≠ connected-diabetes ≠ Front Desk — not one continuous clinic journey.

**Diabetes Phases 0–6:** deepest vertical — all `synthetic_demo` on P002; clinical release **`LIVE_ORGANISATIONS = 0`** / diabetes pack **NO-GO**. CVD/CKD/obesity = registry **planned** only.

**Audit conclusion:** Reuse **governance patterns** (HITL, honesty, register discipline, PHI refuse) — already partially lifted into hsi-core `CDS_PHI_BOUNDARY`. Do **not** duplicate UK app, patient spine, Medplum/EMIS, or CDS runtime into HSI.

### FHIR / clinical
- BRIDGE + simulated EHR + optional Medplum sync — **rehearsal**; `liveEmis:false`; external EHR adapters **disabled**.  
- **No** verified universal record discovery; `syntheticOnly: true` / `realPatientData: false` in system contracts.

### Alignment
- Primary home for **patient + clinician HITL** (Product A) as **synthetic clinical proof**, not live longitudinal product.  
- Workflow B building blocks only after governance + authorised/synthetic fixtures.

| Capability | Class |
|------------|-------|
| Agent register + CONDUCTOR (synthetic) | Functional / in_validation |
| HITL review queue | Verified working (simulation product) |
| Live org / EMIS production | Planned absent (`LIVE_ORGANISATIONS=0`) |
| Diabetes Phases 0–6 | Synthetic demo |
| HSI evidence consume in Aksh | Planned absent |
| MHRA device claim | Planned absent (must stay honest) |

---

## 4. Cross-repo duplicates and gaps

| Concern | Finding |
|---------|---------|
| Duplicate agents | Aksh runtime vs hsi-core catalog — do not duplicate CONDUCTOR in hsi-core |
| Duplicate Neon | Strictly separated — preserve |
| Duplicate “Discovery” | ISI product Discovery ≠ hsi-core Discovery SPA — clarify naming (D7) |
| Graph | Three models; no unified logical schema yet |
| Trials | Melanoma UI ≠ HSI Trials Graph |

## 5. Limitations of this audit

- Production runtime behaviour of Aksh agents not re-executed end-to-end in this pass (rely on source + AGENT_FUNCTIONALITY_AUDIT).  
- Hospital partner systems inaccessible — correctly reported as absent.  
- Licensing of SNOMED/LOINC etc. not contracted — flagged for data strategy.

## 6. Bottom line

**Preserve:** ISI KG, hsi-core evidence/Gate C, Aksh agent/HITL platform.  
**Do not claim:** HSI Clinical or HSI Trials as shipped products.  
**Correct architecture first:** logical multi-plane graph + four-product taxonomy + Workflow A hardening before clinical expansion.
