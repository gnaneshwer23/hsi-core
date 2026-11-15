# ADR-0010: Two-plane architecture for patient and clinical intelligence

**Status:** Accepted by the owner, Dr Gnaneshwer Jadav, 15 November 2026.
**Supersedes:** the single-plane reading of "no live CDS and no PHI in HSI" in `AGENTS.md`, `docs/CDS_PHI_BOUNDARY.md` and `docs/strategy/HSI_VISION.md`. Those rules are kept for the scientific plane and are restated below.
**Proposed in:** [`docs/product/HSI_IMPLEMENTATION_PHASES.md`](../product/HSI_IMPLEMENTATION_PHASES.md) section 3.

## Decision
HSI is one product with two governed planes joined by one explicit interface.

1. **Scientific plane (this repository, `hsi-core`).** Living Knowledge Graph, evidence, investigations, gaps, hypotheses, target and trial knowledge. Public and researcher-account data only. **No PHI and no live clinical decision support, ever, in this plane.**
2. **Clinical plane.** Patient and clinical intelligence: cohorts, phenotypes, consent, longitudinal records, trial pre-screening. Delivered as a **separate deployable with its own database, UK region or on-premises hosting, access control and audit**. Real patient data lives only here. It is built in a separate private repository before any real data is held.
3. **Governed bridge.** Phenotype definitions, hypotheses, eligibility criteria and graph slices flow **down** (public science). Only aggregate, de-identified or consented results flow **up**, through a release gate: row-level and identifying payloads refused, small-group suppression, a different authorised human approves, and every outcome (including refusals) is written to an append-only hash-chained audit log. No cloud language model sees patient data.

## What this permits in `hsi-core`
- Synthetic-data clinical-plane code under `src/clinicalPlane/`, the synthetic cohort and pre-screening pages, and the bridge contracts. This code is written to be lifted out unchanged.
- Synthetic profiles and illustrative trials only. The release gate refuses any non-synthetic payload in code (`real_data_not_enabled`).

## What this does not permit
- Real patient data, identifiers or records in this repository, its database, logs, tests, prompts or tooling.
- Live clinical decision support, EHR write-back, or any output presented as a diagnosis, treatment recommendation or eligibility decision.
- Enabling real data by editing the gate. Enabling it is a separate decision that needs every gate below.

## Gates before any real patient data (all still open)
| Gate | Status |
|---|---|
| Clinical-plane repository and deployment created, UK region or on-prem | Not started |
| Independent security review of the account and storage design (migrations 031 to 033 stay on hold) | Not done: no independent reviewer. See roles below. |
| Clinical safety officer who meets DCB0129 expectations, hazard log and clinical safety case | Not done. See roles below. |
| Data protection impact assessment, UK GDPR Article 9 condition and lawful basis | Not started |
| Data-sharing agreement with a data controller; HRA or REC approval where research applies | Not started |
| De-identification process (the current identifier scan is pattern-based, not a de-identification engine) | Not started |
| Intended-purpose statement and MHRA software-as-a-medical-device position | Not started |

## Roles (interim, recorded 15 November 2026)
The owner named himself, Dr Gnaneshwer Jadav, for both roles for the prototype stage. These entries are **interim and self-appointed** and do not satisfy the gates above.

| Role | Named | Counts as satisfying the gate? |
|---|---|---|
| Decision owner (this ADR) | Dr Gnaneshwer Jadav | Yes |
| Security reviewer for migrations 031 to 033 | Dr Gnaneshwer Jadav (interim) | **No.** The review packet requires a reviewer with no part in writing or running the work and no financial interest in the outcome. A founder who commissioned the work does not meet that. 031 to 033 stay on hold. |
| Clinical safety officer | Dr Gnaneshwer Jadav (interim) | **To be confirmed.** DCB0129 expects a suitably qualified and experienced senior clinician registered with a UK professional body and trained in clinical risk management. If that does not describe the owner, a qualified person is still needed before any use in or alongside NHS care or with real patient data. |

Neither interim entry changes what the prototype may do. It remains synthetic, research-use-only and not clinical advice.

## Consequences
- The previous binding non-goal now reads as a rule about the scientific plane; see the amended section in `AGENTS.md`.
- Clinical-plane work in this repository stays small, synthetic and lift-ready. Real-data work moves to the private repository once the gates are closed.
- A change to this ADR, or enabling real data, needs the owner's explicit written approval and an update to the gate table.
