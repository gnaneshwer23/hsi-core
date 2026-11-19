# Stage 4 — five research dashboards (content map)

**Date:** 19 November 2026 (Europe/London)  
**Status:** Proposed Stage 4 interfaces — **not** the current build centre  
**Doctrine:** [`HSI_BUSINESS_VISION_EXECUTION_AUDIT_2026-11-19.md`](./HSI_BUSINESS_VISION_EXECUTION_AUDIT_2026-11-19.md) · journey over dashboards · one scientific engine · many shells  
**Related:** Architecture §7 (multi-stakeholder workspaces) on open [#513](https://github.com/gnaneshwer23/hsi-core/pull/513); demo shells [#513](https://github.com/gnaneshwer23/hsi-core/pull/513) / [#514](https://github.com/gnaneshwer23/hsi-core/pull/514)

---

## Binding constraints

| Rule | Meaning |
| --- | --- |
| One engine | Knowledge graph, evidence/verification, disagreement, cross-domain, gaps/hypotheses, briefs, investigations stay **shared** |
| Shells vary | Navigation, widgets, permissions and workflows differ by audience — **do not** fork science services |
| Not next build | Stage 2 journey + pilot gates remain priority until usefulness is proven |
| Clinical ≠ CDS | Clinical Research Dashboard is **research** for authorised teams — **not** a clinical decision-making tool · **no PHI** in this repo |
| Demo honesty | Any shell before grants/writes must label demonstration / synthetic data |
| No invented MoU / Gate C / production writes | Fail-closed; held migrations 022–033 stay held |

---

## Shared scientific engine (reuse, do not duplicate)

| Shared capability | Primary surfaces / modules today | Consumed by |
| --- | --- | --- |
| Live / curated investigation trail | `/research/workspace`, USP A/B/C trails | All five dashboards (deep-link, not rebuild) |
| Evidence + Context Passport | Passport UI, passport columns, brief limitations | Academic · Biotech · Clinical · Lab |
| Structured disagreement / comparison | USP A panel, curated pack | Academic · Biotech · Community reviews |
| Cross-domain paths | USP B panel, domain graph | Academic · Biotech · Lab |
| Gaps + testable next questions | Gaps fold, Gap Register | Academic · Biotech · Lab · Community challenges |
| Hypothesis ledger (demoted AI) | Ledger + workspace hypotheses | Biotech · Lab · Academic |
| Researcher profile / handoff | Welcome → Home → workspace | Academic · Community discovery |
| Device-local §H metrics | Home `#rh-metrics` | Individual continuity (not org KPIs) |
| Auth / research grants | Neon Auth + access grants | All org shells (server-side) |
| Synthetic clinical plane only | `src/clinicalPlane/` | Clinical Research shell **demo only** |

```text
┌─────────────────────────────────────────────────────────────┐
│                 Shared scientific intelligence               │
│  KG · evidence · passport · disagreement · cross-domain ·   │
│  gaps · hypotheses · briefs · investigation versions         │
└───────────────────────────┬─────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
   Academic            Biotech/Pharma        Clinical*
        ▼                   ▼                   ▼
   Laboratory/Omics              Research Community
                            │
                    * research cohorts only — not CDS; no PHI
```

---

## 1. Academic Research Dashboard

**Audience:** Professors, postdocs, PhD students, academic institutions  

| Must contain | Maps to shared / existing | Notes |
| --- | --- | --- |
| Researcher profiles | Welcome / onboarding profile · handoff card | Org-scoped when 023+ grants exist |
| Group intelligence trees | Enterprise professor shell (demo) · org tenant contracts | Hierarchy = supervision, not science fork |
| Cross-domain discoveries | USP B paths · domain KG | Candidate / unreviewed honesty |
| Evidence gaps | Gaps register · testable questions | SME ranking still blocked |
| Publications | Evidence catalogue · related works · brief citations | No invented papers / impact metrics |
| Funding and supervision | **Proposed** org widgets | Demo-labelled until durable org store |

**Visual reference pattern (founder-supplied):** group lab / feed / projects / pinned resources (community-lab style) — adapt as **academic group** chrome over shared investigation links.

**Status:** Soft-land Academic shells on `/academic` · `/enterprise/professor` · `/enterprise/student` (demo-labelled; deep-links to live investigation).

---

## 2. Biotech and Pharma Dashboard

**Audience:** Discovery, translational, pharmaceutical R&D teams  

| Must contain | Maps to shared / existing | Notes |
| --- | --- | --- |
| Target intelligence | KG entities · investigation focus · passport | Not a separate target DB |
| Mechanism validation | Dual-model verification · passport fields | Fail-closed; not scientific gold |
| Therapeutic landscape | Cross-domain + disagreement packs | Competitor programmes = **proposed** metadata layer |
| Competitor programmes | **Proposed** (external registries / curated) | No invented pipelines or success rates |
| Biomarkers | Evidence claims · omics-linked entities | Label source + verification state |
| Translational gaps | Gaps + testable questions | Bridge discovery ↔ clinical **research** only |
| Research portfolio decisions | Brief + usefulness + WTP (personal) → later org portfolio | Org portfolio needs grants + writes |

**Visual reference pattern:** target-centric graph + drug/trial side rails (biotech intelligence UIs) — compose from KG + brief + gaps, not a new science stack.

**Status:** Soft-land Biotech/Pharma shell on `/enterprise/biotech` (demo-labelled; deep-links to live investigation, targets, KG, gaps). Public marketing page `/biotech` unchanged. Full multi-workspace hub remains under [#514](https://github.com/gnaneshwer23/hsi-core/pull/514).

---

## 3. Clinical Research Dashboard

**Audience:** Authorised clinical research teams  

**Hard boundary:** Not a clinical decision-making tool · no live CDS · no PHI in `hsi-core` · synthetic / approved research cohorts only.

| Must contain | Maps to shared / existing | Notes |
| --- | --- | --- |
| Approved research cohorts | Synthetic clinical plane · future governed store | Disabled until owner gates |
| Disease phenotypes | Context passport · phenotype metadata | Research phenotypes, not chart write-back |
| Longitudinal laboratory observations | **Proposed** research observations | Synthetic demo series only in this repo |
| Trial eligibility research | Trials surfaces · SCOUT / eligibility research | Research planning — not bedside eligibility CDS |
| Molecular-clinical associations | Cross-domain + evidence links | Association ≠ causation honesty |

**Visual reference pattern:** enrollment / site / status charts are **ops analytics** for trials research — if shown, use synthetic labelled data; never invent conversion or safety claims.

**Status:** Soft-land Clinical Research shell on `/enterprise/clinical` (synthetic demo-labelled; deep-links to cohort / pre-screen / workspace). PHI/CDS remain blocked by [`CDS_PHI_BOUNDARY.md`](../CDS_PHI_BOUNDARY.md) and ADR-0010 — real cohorts stay disabled.

---

## 4. Laboratory and Omics Dashboard

**Audience:** Experimental scientists, core facilities, bioinformaticians  

| Must contain | Maps to shared / existing | Notes |
| --- | --- | --- |
| Assay metadata | Passport experimental fields · methods honesty | Missing fields stay explicit |
| Experiment comparisons | Structured comparison · study comparison science pages | Verification-bound |
| Multi-omics interpretation | Domain KG · cross-domain candidates | Candidate / unreviewed |
| Reproducibility checks | Verification status · dual-model · retraction flags | No fake QC scores |
| Pathway mapping | Science paths / GSEA-style **research** views | Demo or source-linked only |
| Biological evidence integration | Workspace evidence → brief | Deep-link to Stage 2 trail |

**Visual reference pattern:** UMAP / heatmap / gene tables / multi-omics widgets are **lab chrome**; integration quality % and invented feature counts are forbidden unless measured and labelled.

**Status:** Soft-land Laboratory & Omics shell on `/enterprise/lab` (demo-labelled; deep-links to methods, study comparison, pathways, workspace, KG). No fake QC scores or invented feature counts.

---

## 5. Research Community Dashboard

**Audience:** Societies, consortia, interdisciplinary networks  

| Must contain | Maps to shared / existing | Notes |
| --- | --- | --- |
| Research Circles | Community feed demos · held org models | Permission-aware; no automatic IP bleed |
| Collaborative evidence reviews | Dual-reviewer / curator paths · disagreement packs | Human Gate C only |
| Expert discussions | **Proposed** discussion threads | Not a social vanity feed |
| Shared scientific challenges | Gaps + challenges · testable questions | Shared ≠ public by default |
| Researcher discovery | Profiles · handoff · network pages | Opt-in / grant-scoped |

**Visual reference pattern:** feed + projects + events + pinned resources — collaboration shell over shared evidence reviews, not a second graph.

**Status:** Proposed · feed demos only; Circles durable store held.

---

## Shared UI component kit (shell-level)

Reuse across dashboards; swap widget **content**, not engines:

| Component family | Examples | Used in |
| --- | --- | --- |
| App chrome | Sidebar sections, breadcrumbs, search, role picker | All |
| Investigation deep-links | Open workspace / brief / passport | All |
| Honesty banners | Demo · synthetic · not CDS · not journey complete | All |
| Evidence widgets | Claim list, passport sheet, comparison cards | Academic · Biotech · Lab · Clinical |
| Graph widgets | Relationship map, cross-domain path viewer | Biotech · Lab · Academic |
| Gap / challenge lists | Gaps fold, register, testable Qs | Academic · Biotech · Community |
| Org / people | Profile cards, group tree, Circles list | Academic · Community |
| Ops charts (demo only) | Enrollment / site bars | Clinical research **demo** |
| Omics viz (demo or measured) | Heatmap, UMAP, gene table | Laboratory |

---

## Delivery sequence (unchanged priority)

1. **Now:** Stage 2 journey + §H honesty on `main` (landed #538/#539+)  
2. **Owner-gated:** staging grants, write packet, source clearance, SME gold, soft-lands (#511/#512)  
3. **Then Stage 4 shells:** flesh Academic (beyond demo) → Biotech → Lab → Community → Clinical research last (PHI gates)

Do **not** treat founder UI references as permission to invent metrics, patients, competitor pipelines or scientific approval.

---

## Gates checklist for any dashboard PR

- [ ] Demo / synthetic labelled when not backed by grants + stores  
- [ ] Deep-links to `/research/workspace` rather than re-implementing investigation  
- [ ] No PHI · no live CDS language · clinical shell says “not a clinical decision-making tool”  
- [ ] No invented conversion, enrollment %, accuracy or competitor status  
- [ ] No held-migration lifts · no production write enablement  
- [ ] Shared types/services imported from investigation / KG modules — no forked science engine  
