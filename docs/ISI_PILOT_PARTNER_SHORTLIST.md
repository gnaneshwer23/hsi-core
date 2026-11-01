# ISI pilot — research partner shortlist

**Status:** outreach candidates only — **not** confirmed partners.  
**Test fixture (path-testing only):** `test:hypothetical-isi-pilot-partner` via [`src/hypotheticalPartnerFixture.ts`](../src/hypotheticalPartnerFixture.ts) — **TEST FIXTURE — replace before real pilot.** Not a MoU.  
**Use with:** [`ISI_PILOT_BRIEF.md`](./ISI_PILOT_BRIEF.md).  
**Do not invent** personal emails, named PIs as “committed,” or fake MoUs. Contact via public department / institute channels unless a real introduction exists.

Goal of outreach: find **one** immunology / translational / clinical research team with a recurring question, accessible data (or public-literature-only willingness), and appetite to critique an evidence-map pilot.

---

## Partner types (who to talk to)

| Type | Why they matter for the pilot | What to ask |
|------|-------------------------------|-------------|
| **Immunology researchers** (basic / systems) | Own cell / pathway / mechanism questions; can stress-test evidence maps | Recurring synthesis bottlenecks; which disease/question burns time |
| **Translational scientists** | Bridge mechanism ↔ biomarker ↔ intervention; care about strength labels | Which “supported for subgroup X” claims they trust vs overclaim |
| **Clinician-scientists / clinicians** (immune disease, IO, autoimmunity) | Ground “worth testing” in real next decisions | What would change the next experiment / study plan; what they would reject |

Prefer teams already living in **one disease area** (or a tight IO/autoimmune wedge) over general “AI for immunology” collaborators.

---

## Institution categories (UK / EU / US)

Approach **categories** first; example orgs below are **illustrative outreach targets**, not endorsements or partnerships.

### United Kingdom

| Category | Example orgs to approach (public faces) | Fit notes |
|----------|-----------------------------------------|-----------|
| University immunology / inflammation departments | University of Oxford (NDORMS / Kennedy Institute), University of Cambridge (Immunology), Imperial College London, UCL / Francis Crick collaborations | Strong mechanism + clinical science density |
| Biomedical research institutes | Francis Crick Institute, Wellcome Sanger Institute (immunogenomics / cell atlases), Babraham Institute | Public data + methods literacy; good for evidence-map critique |
| NHS / academic medical centres (research arms) | Guy’s & St Thomas’ / KCL immuno, UCLH, Oxford University Hospitals research groups | Clinician-scientist partners; keep pilot research-intelligence only |
| Charity / disease-focused research networks | Versus Arthritis research network, JDRF UK research contacts, Cancer Research UK immuno-oncology groups | Disease-focused questions; introductions via programmes not cold personal emails |

### European Union / EEA

| Category | Example orgs to approach | Fit notes |
|----------|--------------------------|-----------|
| University / hospital immunology centres | Karolinska Institutet, Charité – Universitätsmedizin Berlin, Amsterdam UMC, Institut Pasteur / Inserm immuno units | Translational depth; EU data-governance awareness useful for later phases |
| Cross-border research infrastructures | EMBL-EBI (Hinxton), Elixir nodes, Human Cell Atlas contributing centres | Evidence / ontology / study indexing literacy |
| Consortia / networks (programme-level outreach) | European Federation for Immunological Societies (EFIS) member societies; IMI / IHI project teams in autoimmunity or IO | Programme managers can route to the right PI without inventing contacts |

### United States

| Category | Example orgs to approach | Fit notes |
|----------|--------------------------|-----------|
| Academic medical centre immuno / rheum / IO | NIH intramural (NIAID), Broad Institute immuno programmes, Stanford / UCSF / Harvard / Penn immunology & rheum, MD Anderson / Memorial Sloan Kettering IO research | High bar for evidence honesty; good rejection signal |
| Translational institutes | Allen Institute for Immunology, La Jolla Institute for Immunology | Mechanism + atlas-oriented partners for map critique |
| Disease foundations (research programmes) | Lupus Foundation research programmes, Crohn’s & Colitis Foundation, Arthritis Foundation | Subgroup / biomarker questions; keep recruitment out of pilot scope |

---

## Outreach framing (keep honest)

- Lead with the one-pager: research intelligence for **one disease + one question**.
- State non-goals: not patient prediction, not recruitment, not CDS.
- Offer the four pilot outputs (evidence map, entity slice, competing explanations, gap/hypothesis shortlist).
- Ask what data they can share (even “literature-only + expert critique” is enough for v0).
- Record interest, disease preference, and candidate questions — disease locks **after** conversations.

---

## Tracking (fill as outreach happens)

| Org / group | Type | Region | Status | Notes |
|-------------|------|--------|--------|-------|
| **Hypothetical ISI Pilot Partner** (`test:hypothetical-isi-pilot-partner`) | `hypothetical_test_fixture` | unspecified | test_fixture | **TEST FIXTURE — replace before real pilot.** `agreementKind=hypothetical_test_only`; `legalBinding=false`; `partnerSigned=true` for path testing only. Swap in `src/hypotheticalPartnerFixture.ts`. Production ISI ignores unless `ALLOW_HYPOTHETICAL_PARTNER=true`. |
| Versus Arthritis research network / Oxford NDORMS–Kennedy Institute (category) | disease_foundation / immunology | UK | awaiting_named_partner | **Illustrative outreach category** for Phase 2 scope-locked RA/TNF question — not a MoU or named PI. Kept as outreach target while fixture is active. |
| *(add real outreach rows here)* | | | candidate | No confirmed legal partners yet |

When a **real** partner confirms interest, set `USE_HYPOTHETICAL_PARTNER_FIXTURE=false` in `src/hypotheticalPartnerFixture.ts`, fill `REAL_PARTNER_REPLACEMENT`, update status to `interested` / `scoping` / `confirmed`, and set `legalBinding=true` so `lockedPilot` can become true — still without fabricating emails or agreements. Phase 2 already set `scopeLocked=true` for the RA/anti-TNF working question.
