# B-04.4 — PMID–PMCID linkage and dual-model execution

## Implemented
- Live Europe PMC PMID resolution, exact PMID→PMCID mapping and bounded OA abstract passage retrieval.
- Two separately injected model runners executed concurrently, with individual failure converted to abstention and disagreement escalated by existing adjudication.
- Synthetic tests for linkage, missing PMCID, model disagreement and failure.

## Important trust boundaries
- Metadata matching is not cryptographic or publisher-level provenance attestation. Current implementation makes two separate Europe PMC requests; snapshot consistency and source change detection remain pending.
- OA XML presence and a detected licence URL do **not** establish permission. `rightsStatus=unverified` and `retractionStatus=unverified` remain blocking.
- Distinct model IDs and runner functions are configuration checks, not proof of independent model families or non-correlated errors.
- No model credentials or production model deployments are configured. Synthetic runner tests do not establish semantic accuracy.
- The dual-model function accepts a receipt; its caller must obtain that receipt through trusted passage verification. A fabricated receipt must not authorize publication.
- No trusted graph promotion, clinical advice, PHI or Neon writes.

## Next acceptance gates
1. Independent licence validation and permitted-use policy with attribution and provenance records.
2. Current authoritative correction/retraction resolution and fail-closed source snapshot consistency.
3. Wire real production model providers with distinct deployments, timeout/cost controls, structured output and auditable traces.
4. Expert-adjudicated evaluation corpus; measure entailment precision, false support, disagreement, source errors and abstention before reducing human review.
