# Graph evidence preparation — engineering implementation

This is a preparation workflow, not scientific acceptance or permission to activate sources, providers, databases or graph publication. The current graph remains unreviewed.

## Work completed in code

- `graphEvidenceReadiness` measures context missingness and lists source/passage/review/evaluation blockers for the selected relationship IDs. Research gaps never count as evidence. Existing text is not treated as source clearance.
- The research inspector and investigation selection panel expose these requirements. Inspected evidence JSON and Markdown carry the version-bound report.
- `createGraphCurationPacket` verifies the snapshot content digest and produces deterministic packets for 1–12 relationships. Detailed context fields start unextracted. Source versions, clearance references and expert assessments are blank, not fabricated. Graph annotations are kept separately as unverified hints.
- `createGraphEvidencePreparationService` is server-only and disabled by default. An operator-supplied batch is checked in full before clearance-authority requests. It reuses `createSourceClearanceVerifier` and `buildPassageLinkedContext`; no alternative receipt issuer, model provider or comparison platform is introduced.
- It preserves raw spans and existing unit normalization; missing context stays insufficient, and different biological entity pairs/predicates cannot become aligned. The result contains no model execution, scientific approval or graph promotion. Every later use needs fresh clearance; preparation is not a reusable authorisation token.
- Graph-scoped PARALLAX no longer silently removes missing dose from its comparability checks. A graph annotation is not a substitute for detailed passage-linked evidence.

## Offline use

From the repository root:

```sh
bun run graph:evidence:readiness --out /tmp/hsi-readiness.json
bun run graph:evidence:packet --edges DIAB-001 --out /tmp/hsi-curation-packet.json
```

Output files use exclusive creation and private file mode; existing files are not overwritten. The commands perform no network requests, source downloads, model runs, migration or publication. Packets are authoring inputs, not a benchmark case or scientific gold.

## Controlled preparation

A trusted server operator supplies the existing independent-authority verifier, an explicitly enabled preparation service, the exact graph packet, permitted source and passage records, signed receipts and curator-authored span extractions. Do not expose this dependency configuration in HTTP/client JSON. The source authority and its approvals must actually exist before real use. All selected inputs must bind to graph source IDs and canonical publication identities. A malformed final row must prevent all authority calls.

The service prepares input context only. It does not establish search completeness, support precision, expert agreement or scientific truth. It does not write to shared storage. Existing immutable audit, saved-outcome and scoped-review services remain the integration boundary for a later authorised staging run.

## Remaining human and environment acceptance

Real source rights and independently operated authority; approved model deployments/terms; actual passage curation; independent expert assessments; 120 adjudicated benchmark cases and preregistered thresholds; authorised two-account staging isolation, persisted run/review acceptance, restore and on-call evidence. No production flags or migration holds were changed.
