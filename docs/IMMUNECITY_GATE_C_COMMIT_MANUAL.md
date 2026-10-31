# Manual commit — Gate C + PMID (immunecity)

**Do not run `git status` until locks are cleared.** Prior agent sessions left git hung/ABORTING on this tree.

## Clear locks first (user action)

From `~/Desktop/immune-city`:

```bash
# Inspect only — remove locks yourself when no other git is running
ls -la .git/*.lock .git/index*
# Likely culprits observed 2026-10-31:
#   .git/ORIG_HEAD.lock   (stale; no index.lock at last check)
#   .git/index 2          (duplicate index file — unusual)
#   .git/index 3          (duplicate index file — unusual)
#
# After confirming no live git processes:
#   rm -f .git/ORIG_HEAD.lock
#   # Only remove "index 2" / "index 3" if they are accidental copies,
#   # not the active .git/index. Prefer moving them aside:
#   mkdir -p /tmp/immunecity-git-backup && mv ".git/index 2" ".git/index 3" /tmp/immunecity-git-backup/
```

`node_modules` is correctly gitignored (`.gitignore:10`). `.git` size (~7MB) is not the root cause — hung/aborted status is more consistent with **stale locks / concurrent git / duplicate index files**.

## Paths to stage (Gate C + PMID work already on disk)

```bash
cd ~/Desktop/immune-city

git add -- \
  COMMIT_MANUAL.md \
  docs/CURATOR_EVIDENCE_QUEUE.md \
  src/components/immune/HsiBridgeCurationPanel.tsx \
  src/data/hsi-isi-export.json \
  src/lib/hsi/bridgeCurationQueue.ts \
  src/lib/hsi/index.ts \
  src/test/hsi-phase0.test.ts
```

Optional (only if you also changed it this sprint — it already cites PMID 16382236 for expresses-R011):

```bash
git add -- src/data/relationship-evidence-queue.json
```

**Do not** `git add .` while the tree is unhealthy.

## Suggested commit

```bash
git commit -- \
  docs/CURATOR_EVIDENCE_QUEUE.md \
  src/components/immune/HsiBridgeCurationPanel.tsx \
  src/data/hsi-isi-export.json \
  src/lib/hsi/bridgeCurationQueue.ts \
  src/lib/hsi/index.ts \
  src/test/hsi-phase0.test.ts \
  -m "$(cat <<'EOF'
Surface HSI PMID 16382236 on Gate C bridge handoff for REL-R011-drives-P015.

Shows evidence-linked · Gate C pending on /curation; does not Neon-approve or invent PMIDs.
EOF
)"

git push origin HEAD
```

Safer verify after locks clear (path-limited, no full status):

```bash
git diff --cached --stat
bun test src/test/hsi-phase0.test.ts
# Avoid bun run hsi:check until git is healthy if that script touches git
```

## What this ships (ISI side)

| Item | Value |
|------|--------|
| Map | `REL-R011-drives-P015` (PD-1 → T-cell exhaustion) |
| PMID | **16382236** (Barber DL et al., Nature 2006) |
| HSI review | `source-verified` (not approved) |
| Gate C handoff | **pending** (`evidence-linked · Gate C pending`) |
| Neon Gate C | **not** passed — curator must re-assess S-P-O before approve+supports |

## Upstream already shipped

`hsi-core` commit `915b09d` on `main` (pushed): seed + map + `hsiEvidenceHandoff` + tests.
https://github.com/gnaneshwer23/hsi-core/commit/915b09d1a0098b17ad04957e9142ec40bc5e0e1a
