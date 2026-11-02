# HSI Researcher Workspace UX (§8.9)

**Document status:** Definitive researcher experience specification  
**Product home:** Immune Super Intelligence (ISI) — **Available** with stated limits  
**Journey (binding):** Question → Graph → Mechanism → Compare → Gaps → Brief  
**Reuse:** ISI `JOURNEY_NAV`, Ask, Atlas/Graph, Mechanism, Methods, HSI Discovery consume

---

## 1. Job to be done

> Help me investigate a biological question, compare evidence and identify what remains unknown — without burying me in agent architecture or Climb milestones.

---

## 2. Journey specification

| Step | User goal | ISI surface (reuse) | Target enhancement |
|------|-----------|---------------------|--------------------|
| **1 Question** | Frame scientific intent | `/ask` (+ prefill deep links) | Structured intent / Workflow A |
| **2 Graph** | Navigate concepts & relations | `/atlas`, `/graph`, Explore hub | Layer-aware labels (LHK-G) |
| **3 Mechanism** | Follow cascades / pathways | `/mechanism`, pathway teaching | Context (subset, tissue, assay) preserved |
| **4 Compare** | Support vs conflict | Evidence explorer, Ask cites, competing frames | Explicit Compare panel |
| **5 Gaps** | What is unknown / under-covered | Research Radar `/discovery` | Scope-labelled gaps (not “worldwide absence”) |
| **6 Brief** | Save reproducible investigation | Ask summary / workbench export **Partial** | First-class Brief artifact |

**Secondary (keep):** Academy, Community — learning & discussion, not primary Workflow A chrome.

**HSI Discovery:** `/hsi/discovery` ASK→MAP→REVIEW on published packs — research/HITL; clarify vs Research Radar in copy.

---

## 3. Primary panels

### 3.1 Question (Ask)

- Graph-grounded answers; reviewed vs provisional labelled  
- Honesty: “not fully evidence-grounded AI” (current Methods language)  
- Actions: Open Atlas · Open Radar · Save to Brief · Cite Sources fold  

### 3.2 Graph / Atlas

- Progressive expansion — investigation over spectacle ([LHK-G D9](./HSI_LIVING_HEALTH_KNOWLEDGE_GRAPH.md))  
- Node card / Edge card fields per LHK-G  
- Draft vs core clearly marked  

### 3.3 Mechanism

- Step sequences with review status per hop  
- Teaching vs claim-reviewed distinction  

### 3.4 Compare

- Side-by-side support / contradict / partial  
- Population / model / assay context  
- Never collapse Cat 3 association into Cat 2 established  

### 3.5 Gaps

- Coverage-governed unknowns (ISI Radar honesty)  
- HSI grades (established / uncertain / unexplored) where pack-backed  
- Suggested validation approaches — labelled hypothesis (Cat 5)  

### 3.6 Brief

- Question · entities · claims · evidence · conflicts · gaps · limitations · export version  
- Reproducible; cite pack/graph release IDs  
- **Not** auto-published to approved graph  

---

## 4. Real progress vs fake agent theatre

| Allowed | Forbidden |
|---------|-----------|
| Progress against real stages: Retrieve → Resolve → Map → Compare → Gap → Draft brief | Infinite spinner with random agent names |
| Show tools actually invoked (retrieve literature, expand neighbourhood) with timestamps | Fake multi-agent “debate” animation |
| Empty results stated as empty | Simulated citations or invented PMIDs |
| Queue position for Gate C human review | “Auto-approved by AI” |
| Dry-run stubs labelled **not live** (omics/agents Methods pattern) | UI that looks like live predictors |

If orchestration is running (§5), expose **task progress**, not **persona theatre**.

---

## 5. Microcopy rules

| Prefer | Avoid |
|--------|-------|
| “Reviewed relationship claims: N of M” | “Fully evidence-grounded” |
| “Unreviewed — visible for teaching” | Hiding draft status |
| “Gap within ISI coverage scope” | “Science doesn’t know” (overclaim) |
| “Hypothesis — unvalidated” | Promoting Cat 5 as established |
| “Open HSI pack map” | Conflating Radar with HSI Discovery silently |

**No agent names in primary UI.** Curator/admin tools may show Gate C queue metadata.

---

## 6. Dual Discovery clarity (copy contract)

| Surface | Purpose |
|---------|---------|
| Research Radar | Coverage-governed unknowns & next questions inside ISI |
| HSI Discovery | ASK→MAP→REVIEW on **published HSI packs** |

Both are research intelligence — neither is CDS. Homepage/Research nav must not imply they are the same loop.

---

## 7. Acceptance questions (researcher)

1. Can I start from a cell or disease and reach an inspectable evidence trail?  
2. Can I see what is reviewed vs unreviewed without opening Methods?  
3. Can I tell Radar apart from HSI Discovery?  
4. Does progress UI reflect real work (or honest empty), not theatre?  
5. Can I export or save a brief I could challenge with an expert next week?
