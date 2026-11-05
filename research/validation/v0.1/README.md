# Synthetic validation inputs

Founder-supplied HSI Synthetic Validation Dataset v0.1. These are generated software test records; none are scientific evidence, patient advice or enrolment data.

Original uploaded CSV/JSON files remain in input/ with unchanged content. upload-receipt.json records hashes, byte sizes, the duplicate trials upload and CSV/JSON parity. The adapter adds missing false scientific-claim guards only in normalized derivatives.

See [integration, audit and real-data replacement requirements](../../../docs/SYNTHETIC_VALIDATION_DATASET.md). Use validation:build / validation:check to generate or verify the public fixtures. Never replace these files with real patient records or promote their source evidence.
