# SME PubMed XML parser acceptance gate

Status: proposed, not production approved.

Use a maintained streaming XML parser rather than a handwritten XML grammar. Candidate: saxes (MIT, subject to pinned revision, license and vulnerability verification). Do not install or activate until review of exact package and transitive lockfile is complete.

## Required implementation
- No external entity or DTD resolution, no filesystem or network access from parser.
- Reject internal subsets and entity declarations; accept only the explicitly reviewed PubMed external DOCTYPE form without resolving it.
- Enforce 2 MiB UTF-8 input, 64 depth, 50,000 nodes during parsing, not merely after allocation.
- Reject malformed XML, duplicate attributes, multiple roots, unexpected namespaces, and ambiguous record identity.
- Preserve direct text and attributes needed by scientificMemoryPubmedXml.ts; never interpret abstract text as markup or instructions.
- Fail closed on parser errors; no partial output or trusted ingestion.
- Keep external transport disabled by default.

## Acceptance matrix
Valid PubMed article with PMID, DOI, PMCID and directional notice; valid external DOCTYPE without retrieval; mismatched PMID; multiple records; truncated XML; duplicate attributes; internal entity expansion; external file and HTTP entities; parameter entities; excessive nesting; excessive node count; oversized input; malformed UTF-8 at transport; unexpected namespace; unknown entity.

Record exact parser version, lockfile integrity, SPDX license, vulnerability scan date and results, and independent security review. Run actual XML fixtures through transport, parser and projection. Live public EFetch validation remains separate. No production activation or database changes authorized.
