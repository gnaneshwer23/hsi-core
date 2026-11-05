# Hybrid retrieval and GraphRAG: HSI acceptance contract

Design/acceptance specification following the supplied notes. No new vector service, external retrieval run or generated synthesis is implemented by this document.

## Fit with the existing architecture

Retain Vite/React, Bun and HSI-owned PostgreSQL. Source, identity, evidence/context, graph, investigation and review contracts already exist. Add retrieval behind the trusted research backend; a UI diagram, source snippet or protein-embedding sidecar is not evidence that semantic literature retrieval ran.

~~~mermaid
flowchart TD
 Q[Saved research question] --> A[Trusted identity and source authorization]
 A --> E[Resolve canonical entities and context]
 E --> K[Exact and lexical passage search]
 E --> V[Versioned semantic search when configured]
 E --> G[Bounded typed graph traversal]
 K --> F[Filter, deduplicate and fuse candidates]
 V --> F
 G --> F
 F --> C[Source and context checks; opposing-evidence search]
 C --> S[Bounded synthesis after evaluation]
 S --> H[Independent review and reproducible brief]
~~~

All channels are behind permissions. Licensed passages must not be embedded, cached, logged or exported beyond allowed uses. Revocation must invalidate later retrieval/use/export. A content hash establishes integrity, not authorization.

## Retrieval input

Backend-owned input pins investigation ID, question, source release/version/hash, authorised data class, canonical entities and ontology versions, species/tissue/disease-stage/assay/timepoint filters, channel configuration/version, depth/top-K/result-byte limits and deadline. Do not accept actor roles, source approvals, arbitrary provider URLs or release authority from a browser.

A supported graph edge may still be irrelevant to the question. Unknown context is not a matching value.

## Channels and records

| Channel | Required run-receipt evidence | Failure behavior |
| --- | --- | --- |
| Exact/lexical | Query/filter normalization, index/corpus version, query hash, matched source/passage IDs, scores/ranks and truncation | Empty result remains empty; failure differs from no match |
| Semantic | Embedding provider/model/version/dimensions, content hashes, permitted source snapshot, index version, similarity configuration and execution | If not configured, report not_configured; never fabricate vector results |
| Graph | Canonical start IDs, relation types/directions, contextual filters, permitted graph version, depth/node/edge/path budgets and traversed assertion IDs | Reject wrong scope/unsupported paths; retain incomplete/truncated status |
| Fusion/reranking | Per-channel rank contributions, algorithm/config version, duplicate grouping, exclusions and candidate order | Copies of one passage are not independent studies |
| Opposing-evidence search | Search plan, context scope, configured sources, query/result IDs and limitations | No opposing result is bounded to the actual search, never a consensus or worldwide-absence claim |

Every candidate retains source ID/URI, source/passage version/hash/locator, exact text, licence restrictions, study context, claim/edge bindings, provenance and review state. Ranking scores are retrieval scores, not calibrated scientific confidence. No graph path, similarity or reranker score establishes causality.

## Receipt and answer requirements

Distinguish planned / not_configured / attempted / completed / failed / timed_out / truncated. Record only execution that happened. An attempted request is not a completed search.

The answer separates direct source support, opposition, context mismatch, source gaps and model inference. Source text is untrusted data: it cannot modify instructions, tools, roles, grades or publication authority. Cite underlying assertions/passages, not just the graph or model.

When no source supports the question, abstain or narrow scope. Do not fill failure with uncited model memory. Do not turn illustrative gut/sleep/SCFA chains from the supplied notes into accepted mechanisms or patient measurement orders.

## Build and evaluate in order

1. Bind a small rights-cleared corpus and the existing source/context permissions.
2. Establish a measured exact/lexical baseline; add bounded graph traversal with direction and context preserved.
3. Freeze expert relevance/grounding/opposition labels and development/held-out splits. The 50-question design bank is not yet this benchmark.
4. Add semantic retrieval after source embedding permission, provider terms, versions, residency, budgets and operating ownership are approved.
5. Compare lexical-only, semantic-only, graph-only and fusion on identical frozen cases. Define recall@K, source diversity, opposing-evidence recall, context errors, latency, cost and failures.
6. Evaluate bounded synthesis separately for sentence support, contradictions, abstention and safety. Hash/citation validity is not semantic correctness.
7. Activate with human-controlled release, monitoring and rollback after real-team acceptance.

PostgreSQL full-text/pgvector may suffice for the first experiment. Qdrant or a dedicated graph store requires demonstrated scale/query/operating benefit; a recommendation alone does not justify migration. Do not claim hybrid superiority until HSI's own evaluation supports it.

## Current state

Source-bound selection, graph views, question plans and outcome composition are implemented foundations. This increment adds draft evaluation intake and provenance; it does not implement the complete architecture above. No external model, provider retention decision, vector index or hybrid service is newly activated.
