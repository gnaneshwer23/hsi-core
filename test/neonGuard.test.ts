/**
 * Phase 4 — HSI Neon URL guards (never migrate ISI / Akeno / DeliverX).
 */
import {
  FORBIDDEN_NEON_MARKERS,
  HSI_NEON_HOST_PREFIX,
  HSI_NEON_PROJECT_ID,
  assertHsiNeonDatabaseUrl,
  isForbiddenNeonTarget,
  isHsiNeonHost,
  maskDatabaseUrl,
} from "../src/db/neonGuard";

describe("neonGuard", () => {
  it("recognizes canonical HSI host prefix", () => {
    expect(isHsiNeonHost("ep-restless-dew-zas989pv.c-2.eu-west-2.aws.neon.tech")).toBe(
      true,
    );
    expect(HSI_NEON_HOST_PREFIX).toBe("ep-restless-dew");
    expect(HSI_NEON_PROJECT_ID).toBe("red-wave-06625195");
  });

  it("refuses ISI autumn-snow / ep-blue-salad markers", () => {
    expect(isForbiddenNeonTarget("ep-blue-salad-b5fk2n36.us-east-2.aws.neon.tech")).toBe(
      true,
    );
    expect(isForbiddenNeonTarget("autumn-snow-67879321")).toBe(true);
    const isi = assertHsiNeonDatabaseUrl(
      "postgresql://u:p@ep-blue-salad-b5fk2n36.us-east-2.aws.neon.tech/neondb",
    );
    expect(isi.ok).toBe(false);
    if (!isi.ok) expect(isi.reason).toMatch(/forbidden/i);
  });

  it("refuses Akeno and DeliverX markers", () => {
    for (const m of ["ep-weathered-mountain", "silent-violet", "spring-wind"]) {
      expect(FORBIDDEN_NEON_MARKERS.some((x) => x.includes(m) || m.includes(x))).toBe(true);
      expect(isForbiddenNeonTarget(m)).toBe(true);
    }
  });

  it("allows HSI red-wave URL", () => {
    const ok = assertHsiNeonDatabaseUrl(
      "postgresql://neondb_owner:x@ep-restless-dew-zas989pv.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require",
      { neonProjectId: "red-wave-06625195" },
    );
    expect(ok.ok).toBe(true);
    if (ok.ok) expect(ok.projectHint).toBe("hsi");
  });

  it("refuses ambiguous host without project pin", () => {
    const bad = assertHsiNeonDatabaseUrl(
      "postgresql://u:p@ep-other-host.aws.neon.tech/neondb",
    );
    expect(bad.ok).toBe(false);
  });

  it("masks passwords in URLs", () => {
    expect(
      maskDatabaseUrl(
        "postgresql://neondb_owner:s3cret@ep-restless-dew.aws.neon.tech/neondb",
      ),
    ).toBe("postgresql://neondb_owner:***@ep-restless-dew.aws.neon.tech/neondb");
  });
});
