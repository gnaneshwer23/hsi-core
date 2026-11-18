# Source clearance policy: draft for owner decision

**Status: DRAFT. Nothing here is approved, signed or in force.** It is a decision memo, not legal advice. Publisher and licence terms need review by someone qualified before anything is cleared. Capability register items F-03, F-11, F-12 and the rights blocker (#2) wait on it.

## What already exists (do not rebuild)
- A receipt verifier (`src/researchV2/sourceClearanceReceipt.ts`): Ed25519-signed receipt per source version and passage hash, with permitted actions `model_transmission`, `storage`, `display`, `comparison`, `export`; licence id and attribution; identity matched, rights verified, retraction clear; expiry within 24 hours; revocation check with a timeout. It verifies. It never grants rights.
- An authority adapter and operational wrapper (`operationalSourceClearance.ts`): states `cleared`, `unknown`, `expired`, `corrected`, `retracted`, `withdrawn`, `identifier_conflict`, `revoked`; flags dependent artifacts when a decision changes; fails closed when the authority is unavailable.
- A licence inventory (`site/public/discovery/hsi-source-licensing-stub.json`, rules in `docs/HOW_TO_SOURCE_LICENSING.md`).

## What is missing
No authority, no signing key, no policy that says which licence permits which action, and no named person who decides. Those are human decisions, below.

## What the inventory actually contains
57 of the graph's 63 PubMed sources are inventoried (6 are not; 12 further sources are DOI-only). Of the 57:

| Inventory status | Count | Reading |
|---|---|---|
| restricted | 32 | Cite the PMID only. No text, no figures. |
| ok_cite | 11 | Citation use only. No text reuse. |
| ok_oa | 14 | Open access, but see below. |

Of the 14 "ok_oa": 4 record `cc by`, 4 record NC variants (`cc by-nc`, `cc by-nc-sa`), and **6 record no licence string at all**. Those 6 should not stay "ok_oa" until the licence is recorded. Partner clearance is applied to 0 of 57. So today only the 4 CC BY sources are plausible candidates for reuse of text.

## Proposed licence-to-action table (for you to change)
| Class | storage | display | comparison | export | model_transmission |
|---|---|---|---|---|---|
| CC BY / CC0 | yes | yes, with attribution | yes | yes, with attribution | yes, to approved providers only |
| CC BY-NC, BY-NC-SA | yes | yes, with attribution | yes (internal) | **no** if the export is commercial or not share-alike | **no** until the NC question is decided |
| No licence recorded, or unknown | no | metadata only | no | no | no |
| Restricted, cite-only | identifiers only | title, authors, PMID | no | identifiers only | no |

The conservative default throughout: nothing is cleared until a signed receipt says so, and `model_transmission` is the most restricted action because many publisher terms bar sending text to third-party AI services.

## Decisions needed from you
1. **Authority.** Who issues receipts? A named person (you, as interim), an external adviser or a service. An interim self-issued authority must be labelled non-independent in every receipt and report, as with the other interim roles.
2. **Key custody.** Where the Ed25519 private key lives. Options: a hardware security module or cloud key service (recommended), or an encrypted key held outside the repository by the authority. Never in the repository or an environment file.
3. **First scope.** Recommended: the 4 CC BY sources only, actions `storage`, `display`, `comparison`, with attribution. Prove the full chain end to end on four sources before widening.
4. **NC sources.** Whether non-commercial licences are acceptable for a product that may be commercial. Recommended: not cleared.
5. **The 6 unlicensed "ok_oa" rows.** Re-check each against the publisher page and Crossref, then reclassify. Recommended: downgrade to unknown until checked.
6. **Model transmission.** Which providers, if any, may receive cleared text, and whether on-premises models only. Recommended: none until decision 1 and 2 are in place.
7. **Review cadence and revocation.** Who reviews, how often, and how a retraction or licence change reaches the authority. Receipts already expire within 24 hours, so revocation is checked at use.
8. **Independence.** The security reviewer and clinical safety officer remain open items. This policy does not close them.

## What engineering does after you decide
- Wire the authority adapter to the named authority and the key service (deployment work; the verifier code exists).
- Reclassify the 6 unlicensed rows and add the 6 uninventoried PubMed sources and the DOI-only sources to the inventory.
- Run the chain on the first scope and publish the result with its limits.
- Update the register (F-03, F-11, F-12) with what is then true. Not before.

## What stays blocked regardless
Scientific approval of any claim, graph promotion, real patient data, and clinical advice are not affected by this policy and stay out of scope.
