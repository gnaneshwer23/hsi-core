/**
 * Neon isolation guards for HSI substrate writes / migrations.
 * HSI only: red-wave-06625195 / ep-restless-dew…eu-west-2.
 * Refuse ISI autumn-snow / ep-blue-salad, Akeno, DeliverX.
 */

export const HSI_NEON_PROJECT_ID = "red-wave-06625195" as const;
export const HSI_NEON_BRANCH_ID = "br-quiet-silence-zab1zvji" as const;
export const HSI_NEON_DATABASE = "neondb" as const;
/** Host prefix for the canonical HSI endpoint (no password / full URL). */
export const HSI_NEON_HOST_PREFIX = "ep-restless-dew" as const;
/** Isolated HSI migration staging endpoint, verified against Neon project and branch. */
export const HSI_STAGING_HOST_PREFIX = "ep-sweet-hill-zasb0lni" as const;

/** Detectable forbidden Neon host / project markers (never migrate here). */
export const FORBIDDEN_NEON_MARKERS = [
  // ISI / immunecity product Neon
  "ep-blue-salad",
  "autumn-snow-67879321",
  "autumn-snow",
  // Akeno
  "ep-weathered-mountain",
  "silent-violet-81283547",
  "silent-violet",
  // DeliverX
  "spring-wind-48457918",
  "spring-wind",
] as const;

export type NeonUrlCheck =
  | { ok: true; host: string; projectHint: "hsi" }
  | { ok: false; reason: string; host: string | null };

function extractHost(databaseUrl: string): string | null {
  try {
    // postgresql://… hosts are fine for URL parser after scheme normalize
    const normalized = databaseUrl.replace(/^postgres(ql)?:/i, "http:");
    const u = new URL(normalized);
    return u.hostname || null;
  } catch {
    const m = databaseUrl.match(/@([^/?]+)/);
    return m?.[1]?.split(":")[0] ?? null;
  }
}

/** True when the URL/host string matches a known non-HSI Neon. */
export function isForbiddenNeonTarget(value: string): boolean {
  const lower = value.toLowerCase();
  return FORBIDDEN_NEON_MARKERS.some((m) => lower.includes(m.toLowerCase()));
}

/** True when host looks like the canonical HSI endpoint. */
export function isHsiNeonHost(host: string | null | undefined): boolean {
  if (!host) return false;
  return /^ep-restless-dew-zas989pv(?:-pooler)?(?:\.c-\d+)?\.eu-west-2\.aws\.neon\.tech$/i.test(host);
}

/**
 * Validate DATABASE_URL for HSI migrations / Gate C local writes.
 * Refuses known ISI/Akeno/DeliverX markers. Prefers ep-restless-dew host;
 * accepts only the canonical endpoint/database; a project variable cannot override the host.
 */
export function assertHsiNeonDatabaseUrl(
  databaseUrl: string,
  opts?: { neonProjectId?: string | null },
): NeonUrlCheck {
  const trimmed = databaseUrl.trim();
  if (!trimmed) {
    return { ok: false, reason: "DATABASE_URL is empty", host: null };
  }
  let parsed: URL;
  try { parsed = new URL(trimmed); } catch { return { ok: false, host: null, reason: "DATABASE_URL is not a valid PostgreSQL URL" }; }
  if (!["postgres:", "postgresql:"].includes(parsed.protocol) || parsed.pathname !== `/${HSI_NEON_DATABASE}`) {
    return { ok: false, host: parsed.hostname, reason: "HSI requires a PostgreSQL URL for the neondb database" };
  }
  if (["disable", "allow", "prefer"].includes(parsed.searchParams.get("sslmode") ?? "")) {
    return { ok: false, host: parsed.hostname, reason: "HSI database access requires verified TLS" };
  }

  if (isForbiddenNeonTarget(trimmed)) {
    return {
      ok: false,
      reason:
        "DATABASE_URL matches a forbidden Neon (ISI autumn-snow / Akeno / DeliverX). HSI migrations refuse this target.",
      host: extractHost(trimmed),
    };
  }

  const host = extractHost(trimmed);
  if (host && isForbiddenNeonTarget(host)) {
    return {
      ok: false,
      reason: `Host ${host} is forbidden for HSI substrate.`,
      host,
    };
  }

  const projectId = (opts?.neonProjectId ?? "").trim();
  if (projectId && projectId !== HSI_NEON_PROJECT_ID) {
    return {
      ok: false,
      reason: `NEON_PROJECT_ID does not match HSI canonical ${HSI_NEON_PROJECT_ID}.`,
      host,
    };
  }

  if (isHsiNeonHost(host)) {
    return { ok: true, host: host!, projectHint: "hsi" };
  }

  return {
    ok: false,
    reason:
      "DATABASE_URL must use the canonical HSI endpoint and Neon domain. A project variable alone cannot authorise another host.",
    host,
  };
}

/** Mask password in a connection string for logs (never print secrets). */
export function maskDatabaseUrl(databaseUrl: string): string {
  try {
    const url = new URL(databaseUrl);
    if (!["postgres:", "postgresql:"].includes(url.protocol)) return "[invalid database URL]";
    url.password = "***";
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch { return "[invalid database URL]"; }
}
