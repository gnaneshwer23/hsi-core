# P1.2 — Biomedical Source Bundle

**Scope:** compose validated UniProt protein and Reactome pathway metadata into two governed research draft nodes. The adapter performs no graph write, makes no claim that the protein participates in the pathway, and does not validate a mechanism.

`retrieveBiomedicalSourceBundle` uses existing upstream adapters and graph validators. It returns explicit source identifiers, canonical source URLs and retrieval timestamps, and rejects malformed provider responses.

**Implemented:** metadata-only bundle, draft graph node validation, mocked provider tests, fail-closed source mismatch.

**Not implemented:** live upstream test evidence, durable versioned provider snapshots, authenticated graph persistence, ontology-reviewed relationships, independent scientific approval, or ingestion for Microbiome/Neurobiology/Metabolism.

**Next checks:** execute the live provider CLI in a network-enabled test environment; capture response hashes, provider versions and run identifiers; test authenticated research ingestion and reviewer queue; then extend source-specific adapters to the remaining departments.

**Release decision:** development GO, research pilot conditional, scientific validation NO-GO.
