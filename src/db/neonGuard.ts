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
  | { ok: true; host: string; projectHint: "hsi" | "unknown_allowed" }
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
  return host.toLowerCase().includes(HSI_NEON_HOST_PREFIX);
}

/**
 * Validate DATABASE_URL for HSI migrations / Gate C local writes.
 * Refuses known ISI/Akeno/DeliverX markers. Prefers ep-restless-dew host;
 * allows unknown hosts only when NEON_PROJECT_ID is explicitly red-wave.
 */
export function assertHsiNeonDatabaseUrl(
  databaseUrl: string,
  opts?: { neonProjectId?: string | null },
): NeonUrlCheck {
  const trimmed = databaseUrl.trim();
  if (!trimmed) {
    return { ok: false, reason: "DATABASE_URL is empty", host: null };
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
      reason: `NEON_PROJECT_ID=${projectId} is not HSI canonical ${HSI_NEON_PROJECT_ID}.`,
      host,
    };
  }

  if (isHsiNeonHost(host)) {
    return { ok: true, host: host!, projectHint: "hsi" };
  }

  if (projectId === HSI_NEON_PROJECT_ID) {
    // Explicit project pin without matching host prefix (e.g. pooled host rename).
    return { ok: true, host: host ?? "(unknown)", projectHint: "unknown_allowed" };
  }

  return {
    ok: false,
    reason:
      `DATABASE_URL host must include ${HSI_NEON_HOST_PREFIX} (HSI red-wave), ` +
      `or set NEON_PROJECT_ID=${HSI_NEON_PROJECT_ID}. Refusing ambiguous target.`,
    host,
  };
}

/** Mask password in a connection string for logs (never print secrets). */
export function maskDatabaseUrl(databaseUrl: string): string {
  return databaseUrl.replace(/:([^:@/]+)@/, ":***@");
}
