# ISI pilot — research partner shortlist

**Status:** **Apolo Pharma** is the active named pilot partner (`partner:apolo-pharma`).  
**Active lock:** [`src/hypotheticalPartnerFixture.ts`](../src/hypotheticalPartnerFixture.ts) — `USE_HYPOTHETICAL_PARTNER_FIXTURE=false`; `type=named_partner`; `partnerSigned=true`; `legalBinding=true` → `lockedPilot=true`.  
**Honesty:** MoU / written-confirm paperwork is **operator-asserted** by workspace instruction (2026-11-01). **Do not invent** personal emails, phone numbers, or named PIs. Still **not CDS**; Gate C never auto-approves.  
**Use with:** [`ISI_PILOT_BRIEF.md`](./ISI_PILOT_BRIEF.md).

Goal of outreach / partnership: one immunology / translational / clinical research team with a recurring question, accessible data (or public-literature-only willingness), and appetite to critique an evidence-map pilot.

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
| **Apolo Pharma** (`partner:apolo-pharma`) | `named_partner` | unspecified | confirmed | **Active Stage 1 named partner.** `agreementKind=legal_mou`; `legalBinding=true`; `partnerSigned=true` → `lockedPilot=true`. MoU paperwork **operator-asserted** (2026-11-01 instruction) — no invented emails/phones. Still not CDS; Gate C human-only. RA `activeScope` unchanged; dual-track SSc/gut/neuro continues. Stage 1 KPIs `partner_agreed`; corpus licensing clearance applied (`oa_reuse` + `cite_metadata_pilot`; unknown uncleared). |
| Versus Arthritis research network / Oxford NDORMS–Kennedy Institute (category) | disease_foundation / immunology | UK | awaiting_named_partner | **Illustrative outreach category** for RA/TNF question — not a MoU. Kept as secondary outreach target. |
| Hypothetical ISI Pilot Partner (`test:hypothetical-isi-pilot-partner`) | `hypothetical_test_fixture` | unspecified | archived | Inactive template in `src/hypotheticalPartnerFixture.ts` (`USE_HYPOTHETICAL_PARTNER_FIXTURE=false`). |
| *(add further outreach rows here)* | | | candidate | No invented contacts |

When swapping partners again, edit `REAL_PARTNER_REPLACEMENT` in `src/hypotheticalPartnerFixture.ts`, update this table, and re-run `bun run outputs` — still without fabricating emails or agreements. Phase 2 already set `scopeLocked=true` for the RA/anti-TNF working question.
