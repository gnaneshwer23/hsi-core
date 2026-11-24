# HSI Business Pre-Mortem

**Human Super Intelligence | Strategic failure analysis | November 2026**  
**Status:** Binding execution doctrine for prioritisation (ambition unchanged).  
**Interactive summary:** Cursor canvas [HSI Business Pre-Mortem](https://cursor.com/canvas/store-2ec1f609-fdee-48c1-a62f-5a7c4e7d2171/193165e5-f082-4b5c-acdd-3588f204ce88) (risk register explorer).  
**Honesty:** Likelihoods below are **qualitative planning judgments**, not measured probabilities. This document does **not** claim scientific validation, pilot readiness, paid demand, or production acceptance.

Imagine it is November 2029. HSI has failed.

Three years have passed. HSI has an impressive website, a sophisticated biomedical knowledge graph, multiple AI agents, institutional research workspaces, multi-omics integrations and a collaboration network.

But the business is struggling.

Researchers occasionally use the platform, but few return regularly. Universities praise the vision but hesitate to purchase. Pharmaceutical companies ask for scientific validation that HSI cannot convincingly demonstrate. Some researchers distrust the AI-generated hypotheses, while others refuse to connect unpublished research data.

The team has spent significant effort building infrastructure, yet there is no repeatable customer acquisition process, no proven scientific advantage and no predictable revenue.

The failure wasn’t that the vision was too ambitious. It was that HSI tried to realise the entire vision before proving why someone would repeatedly use and pay for its scientific intelligence.

This pre-mortem works backward from that hypothetical failure to identify what we should prevent now.

---

## 1. The 12 ways HSI could fail

These are scenario-based risk assessments, not measured probabilities.

| # | Risk | Severity |
| --- | --- | --- |
| 01 | Building everything before validating one valuable workflow | Critical |
| 02 | Scientific results are not sufficiently trustworthy | Critical |
| 03 | No clear paying customer | Critical |
| 04 | Cross-omics integration produces misleading connections | Critical |
| 05 | Institutional data access is blocked | High |
| 06 | Researchers do not change their workflow | High |
| 07 | The collaboration network has no liquidity | High |
| 08 | Competition commoditises generic AI research features | High |
| 09 | Security or research confidentiality incident | Critical |
| 10 | Technical complexity exceeds execution capacity | High |
| 11 | Economics do not support the service | High |
| 12 | No defensible evidence of impact | Critical |

### Risk 2 detail — Scientific results are not sufficiently trustworthy (Critical)

| Lens | Content |
| --- | --- |
| Why it could happen | Unsupported claims, false research gaps or misleading hypotheses undermine the platform’s core differentiation. |
| Early warning signal | Experts repeatedly correct mechanisms, references or conclusions. |
| Preventive action | Independent benchmark, claim-level provenance, uncertainty calibration, abstention and error tracking. |
| Estimated likelihood | High — qualitative planning judgment, not empirical probability. |

---

## 2. The biggest strategic risk: HSI tries to serve everyone

Our long-term ecosystem includes professors, immunologists, neuroscientists, bioinformaticians, clinicians, biotech scientists, pharmaceutical companies, universities and students.

That breadth makes sense for the vision. It is dangerous as an initial go-to-market strategy.

| Customer | Potential value | Business challenge |
| --- | --- | --- |
| Academic researchers | Faster evidence synthesis, mechanism investigation, research gaps | Limited discretionary budgets |
| Principal investigators and research groups | Private data intelligence and reproducible investigations | Need credible scientific results and data protection |
| Universities | Shared research infrastructure and collaboration | Slow procurement and security reviews |
| Biotech companies | Target validation, mechanism intelligence, translational decisions | High evidence standards and competition |
| Pharmaceutical R&D | Scientific due diligence, portfolio and biomarker intelligence | Long sales cycles and demanding validation |
| Students | Research learning, mentorship and opportunities | Often low willingness to pay |

**Proposed initial commercial customer (hypothesis to test, not settled):** a small biotech R&D team or funded translational research group, with academic scientists as early design partners.

We should preserve all six scientific domains, while initially selling one concrete outcome: a **reproducible, evidence-grounded investigation that helps a team make a better research decision**.

---

## 3. What would actually differentiate HSI?

Individually valuable but possibly not defensible alone:

- AI literature summarisation
- Scientific chatbots
- Biomedical knowledge graph visualisation
- Researcher profile discovery
- Multi-omics dashboards
- AI-generated hypotheses

The stronger opportunity is their integration into a **trustworthy decision workflow**.

### Proposed differentiation

**From fragmented evidence to defensible scientific decisions**

| Stage | Meaning |
| --- | --- |
| Connect | Research data, literature and biological context |
| Verify | Evidence quality, provenance and disagreement |
| Reason | Mechanisms, knowledge gaps and hypotheses |
| Collaborate | Find complementary expertise with permission |

This remains only a *potential* advantage until HSI demonstrates that its findings are more useful, reliable or reproducible than alternatives.

---

## 4. What we must prove before expanding

Five gates (thresholds are starting hypotheses — agree before evaluating; do not move the goalposts after seeing results).

| Gate | Question | Test (hypothesis) | Proposed passing threshold (hypothesis) |
| --- | --- | --- | --- |
| Scientific reliability | Are outputs trustworthy enough to act on? | Independent benchmark + expert review of abstention/provenance | No silent approval; provenance intact; agreed floors not invented |
| Researcher retention | Will someone return? | 5–10 design partners complete a useful investigation and reopen | Repeat use without invented conversion rates |
| Commercial demand | Will someone pay? | Paid-pilot discovery with biotech / translational groups | Explicit Y/N/maybe willingness; no fake MoUs |
| Collaboration value | Does matching help before a marketplace? | Curated opt-in matching with a small group | Permission-based only; no invented network liquidity |
| Operational readiness | Can we deliver securely and repeatedly? | Two-tenant isolation, reproducible runs, monitoring, failure recovery | No unresolved critical security findings; core workflow without manual engineering intervention |

---

## 5. What to change in current execution

**Not** the vision. **Not** the six domains. **Not** the established scientific architecture.

Change the **order** in which we demonstrate value.

| Priority | Action | Reason |
| --- | --- | --- |
| P0 | Audit the current repository and deployed application | Stop treating planned or merged features as proven functionality |
| P0 | Complete authentication, persistence and tenant-isolation security gates | Essential before private institutional data |
| P0 | Run one complete multi-omics investigation using clearly labelled synthetic data and genuine external evidence | Demonstrate the integrated experience |
| P1 | Benchmark scientific accuracy against expert research and existing tools | Establish credibility |
| P1 | Test personalised onboarding and dashboards with actual researchers | Validate usability and retention |
| P1 | Run permission-based collaborator matching with a curated researcher group | Test network value before building a marketplace |
| P1 | Conduct paid-pilot discovery with biotech and research teams | Establish commercial demand |
| P2 | Expand institutional connectors, federated deployment and additional ecosystem services | Scale only after the core workflow is validated |

Synthetic data is useful for testing integration, interfaces and permissions. It is **not** sufficient to validate scientific discovery quality. That requires independent real-world benchmarks and expert assessment.

---

## 6. The 90-day pre-mortem response plan

| Window | Focus |
| --- | --- |
| Days 1–15 | **Establish implementation truth** — Cursor audits `hsi-core` and produces a verified inventory of what works, what is simulated, what is broken and what remains unbuilt. Resolve critical CI and security blockers. |
| Days 16–40 | **Prove the scientific engine** — One reproducible end-to-end investigation connecting real public evidence and appropriately labelled synthetic multi-omics records. Independently evaluate findings. |
| Days 41–65 | **Prove researcher value** — Test with 5–10 researchers across relevant scientific backgrounds. Observe independent completion and understanding of evidence limitations. |
| Days 66–90 | **Prove collaboration and willingness to pay** — Pilot opt-in matching, interview buyers, seek paid commitments, measure delivery costs. |

Concrete engineering mapping: [`../engineering/PREMORTEM_90_DAY_RESPONSE_PLAN.md`](../engineering/PREMORTEM_90_DAY_RESPONSE_PLAN.md).

---

## 7. Hard decision framework (end of 90 days)

| Result | Decision |
| --- | --- |
| Strong science + repeat usage + paid demand | Expand the pilot and begin institutional partnerships |
| Strong science + repeat usage, but no paid demand | Revisit buyer, packaging and pricing |
| Strong science, but researchers rarely return | Improve workflow integration and usability |
| Weak scientific reliability | Stop expanding features and strengthen verification |
| Good collaboration interest, weak scientific intelligence | Do not pivot into a networking platform; validate the core engine first |
| Persistent security failures | Do not onboard confidential institutional or patient data |

The goal is not to prove that every HSI feature works in 90 days. It is to gather enough evidence to justify the next investment.

---

## 8. The question that could determine HSI’s future

Imagine a professor or biotech scientist says:

> “I already have PubMed, bioinformatics pipelines, ChatGPT, specialist databases and my own research collaborators. Why should I use HSI?”

Eventual answer (must be **proven**, not merely marketed):

> “Because HSI connects your research context with global biomedical evidence, verifies competing scientific claims, identifies what remains uncertain, and helps you decide which experiments or collaborations are worth pursuing next—with a traceable explanation of how it reached those conclusions.”

---

## Final assessment

Do not reduce HSI’s ambition. The connected scientific intelligence ecosystem is a coherent long-term vision.

The main existential risk is building a technologically impressive platform before establishing a scientifically credible, commercially valuable workflow.

Best protection: make the prototype answer one demanding question —

**Can HSI take a real biomedical research problem, connect the relevant evidence and data, identify a defensible next research decision, and demonstrate that this is valuable enough for someone to use again and pay for?**

If that can be demonstrated repeatedly, institutional network, collaboration ecosystem, multi-omics intelligence and translational capabilities have a much stronger foundation.

---

## Related doctrine in this repo

- Vision: [`HSI_VISION.md`](./HSI_VISION.md)
- Prior execution audit: [`HSI_BUSINESS_VISION_EXECUTION_AUDIT_2026-11-19.md`](./HSI_BUSINESS_VISION_EXECUTION_AUDIT_2026-11-19.md)
- Capability register / honesty: [`../STATUS.md`](../STATUS.md)
- Implementation truth audit: [`../audits/HSI_IMPLEMENTATION_TRUTH_AND_NEXT_PRS.md`](../audits/HSI_IMPLEMENTATION_TRUTH_AND_NEXT_PRS.md)
- CDS / PHI boundary: [`../CDS_PHI_BOUNDARY.md`](../CDS_PHI_BOUNDARY.md)
