# Phase 3 Remediation — Increment A (2026-11-04)
Scope: close deterministic SQL revision-selection defect identified in the pre-advancement audit.

## Changed
- Scientific graph repository now selects one revision per relationship ID using numeric major/minor/patch sorting, not lexicographic version sorting.
- Graph node retrieval uses the same numeric revision ordering.
- Evidence dossier reader selects one revision per relationship ID using numeric revision ordering.
- Snapshot regression tests reject a dossier whose version or relationship endpoint differs from the selected graph relationship.

## Remaining blocking work
- Selecting the independently latest graph edge and dossier is NOT an atomic version-pinned join. When latest versions differ, the coordinator rejects the mismatch; this is a safe failure, not a working snapshot guarantee.
- Both readers open independent connections. No consistent cross-table transaction, RLS, verified session-to-database principal or real persisted evidence was tested.
- The SQL assumes all persisted versions are valid numeric major.minor.patch. Migration 011/012 do not enforce this at database level; review and add constraints before migration.
- The UI remains disconnected from a trusted research HTTP endpoint. Existing editorial IDs have not been mapped to canonical research IDs.
- No migrations were applied, no live Neon query was run, and no production or clinical system was changed.

## Next remediation gate
Design a single authorised, version-pinned, read-only database transaction returning both graph and evidence dossier rows; verify RLS and reviewer/source authority in an approved isolated Neon branch. Only then expose the existing ISI panel through a trusted session-backed endpoint.
