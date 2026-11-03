# Research source registry

The first source registry is a public-metadata workflow, independent of patient systems and database credentials. `/sources` shows the current seed corpus's 63 PubMed locators, the number with imported metadata, and version history. The initial committed registry contains locators only: no fetched metadata or verified source-support claims are invented.

`source-verified` in older pack data means a source is linked; it is not the same as exact claim support. The registry keeps `claimSupport=not_assessed` through every import. A retraction or correction does not change an HSI grade automatically. An accountable reviewer must reassess affected claims before use.

## Import public metadata

```bash
bun run sources:import /path/to/public-metadata.json
```

Input contract:

```json
{
  "schemaVersion": "hsi-source-metadata-import-1",
  "provider": "manual_metadata",
  "retrievedAt": "2026-11-02T12:00:00.000Z",
  "records": [{
    "pmid": "11244034",
    "title": "Replace with the actual source title",
    "doi": null,
    "publishedAt": null,
    "licence": null,
    "retractionStatus": "not_checked"
  }]
}
```

This example is a format illustration, not retrieved evidence. Providers may be `manual_metadata` or `europe_pmc`; the latter labels externally collected, normalised metadata and does not certify that this CLI contacted Europe PMC. This increment does not implement a live connector, automated retraction monitoring, full-text ingestion or passage verification. Keep unknown dates/licences null and retraction status `not_checked`. Only record `retracted` or `corrected` with appropriate source evidence.

The importer accepts only registered PMIDs and the listed fields. It quarantines invalid dates, DOI/PMID values, missing status and unknown fields without retaining raw rejected content. The CLI rejects a partial import as a whole and leaves the existing snapshot unchanged. Valid writes use an atomic file replacement. Identical latest metadata is idempotent even when the retrieval timestamp differs; content changes append a hash-identified revision rather than erasing history. Hashes detect accidental content tampering, not authenticity or an authorised provider signature.

The snapshot lives at `site/public/research/source-registry.json`. Browser and CLI share the same structural validator and both verify revision content hashes. Unknown fields, duplicate identities, invalid calendar dates and non-chronological histories are rejected. This is intentionally public, Git-reviewed data. Schema checks are not a PHI detector: never submit patient exports or private text. Imports do not grant reuse rights, clinical approval, or scientific support. There is no anonymous upload endpoint or browser write operation.

CLI writes use an exclusive `.lock` beside the destination, fsync and atomic replacement; failures clean up owned temporary files and locks. A lock left after a killed process requires an operator to confirm no writer is active before removing it. The tool does not automatically steal another process's lock.

`bun run sources:init` is for a missing registry and refuses to overwrite existing history. For a test registry use `bun src/cli/source-registry.ts init /tmp/test-registry.json`; import to that file with `bun src/cli/source-registry.ts import INPUT /tmp/test-registry.json`.

Tests cover real seed deduplication, idempotency, version preservation, retraction state changes, invalid-record quarantine, hash tampering and CLI rejection without data loss. Next: an allowlisted provider connector with recorded retrieval outcomes, source-rights review, and independently reviewed claim-to-passage support.
