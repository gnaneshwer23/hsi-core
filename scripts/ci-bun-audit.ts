/**
 * CI wrapper around `bun audit --json`.
 *
 * GHSA-fc5q-39xc-vjpf (CVE-2026-112366, picomatch <=4.0.7 ReDoS) has no published
 * patched release yet (GitHub advisory `first_patched_version: null`; upstream
 * fix PRs still open as of 17 Nov 2026). Until npm publishes a fixed picomatch,
 * allow that single advisory so verify is not permanently red on every PR.
 * Any other finding still fails the job.
 */
import { spawnSync } from "node:child_process";

const ALLOWED = new Set([
  "GHSA-fc5q-39xc-vjpf",
  "CVE-2026-112366",
  "1247710",
]);

type Finding = {
  id?: number | string;
  url?: string;
  title?: string;
  severity?: string;
  vulnerable_versions?: string;
};

function keysFor(finding: Finding): string[] {
  const out: string[] = [];
  if (finding.id != null) out.push(String(finding.id));
  if (finding.url) {
    const ghsa = finding.url.match(/GHSA-[a-z0-9-]+/i);
    if (ghsa) out.push(ghsa[0]);
    const cve = finding.url.match(/CVE-\d{4}-\d+/i);
    if (cve) out.push(cve[0].toUpperCase());
  }
  return out;
}

function isAllowed(finding: Finding): boolean {
  return keysFor(finding).some((k) => ALLOWED.has(k) || ALLOWED.has(k.toUpperCase()));
}

const proc = spawnSync("bun", ["audit", "--json"], {
  encoding: "utf8",
  cwd: process.cwd(),
});

const raw = (proc.stdout || "").trim() || "{}";
let parsed: Record<string, Finding[]>;
try {
  parsed = JSON.parse(raw) as Record<string, Finding[]>;
} catch {
  console.error("ci-bun-audit: could not parse bun audit JSON");
  console.error(raw || proc.stderr);
  process.exit(1);
}

const blocked: Array<{ pkg: string; finding: Finding }> = [];
const allowed: Array<{ pkg: string; finding: Finding }> = [];

for (const [pkg, findings] of Object.entries(parsed)) {
  for (const finding of findings ?? []) {
    if (isAllowed(finding)) allowed.push({ pkg, finding });
    else blocked.push({ pkg, finding });
  }
}

if (allowed.length > 0) {
  console.log(
    JSON.stringify(
      {
        note: "Temporarily allowed until picomatch publishes a patched release",
        allowed,
      },
      null,
      2,
    ),
  );
}

if (blocked.length > 0) {
  console.error(JSON.stringify({ blocked }, null, 2));
  process.exit(1);
}

if (Object.keys(parsed).length === 0) {
  console.log("{}");
}

process.exit(0);
