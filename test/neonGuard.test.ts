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
    expect(isHsiNeonHost("ep-hsi-production.c-2.eu-west-2.aws.neon.tech")).toBe(
      true,
    );
    expect(HSI_NEON_HOST_PREFIX).toBe("ep-hsi-production");
    expect(HSI_NEON_PROJECT_ID).toBe("hsi-neon-project");
  });

  it("refuses ISI autumn-snow / ep-isi-product markers", () => {
    expect(isForbiddenNeonTarget("ep-isi-product.us-east-2.aws.neon.tech")).toBe(
      true,
    );
    expect(isForbiddenNeonTarget("isi-neon-project")).toBe(true);
    const isi = assertHsiNeonDatabaseUrl(
      "postgresql://u:p@ep-isi-product.us-east-2.aws.neon.tech/neondb",
    );
    expect(isi.ok).toBe(false);
    if (!isi.ok) expect(isi.reason).toMatch(/forbidden/i);
  });

  it("refuses Akeno and DeliverX markers", () => {
    for (const m of ["ep-akeno-product", "silent-violet", "spring-wind"]) {
      expect(FORBIDDEN_NEON_MARKERS.some((x) => x.includes(m) || m.includes(x))).toBe(true);
      expect(isForbiddenNeonTarget(m)).toBe(true);
    }
  });

  it("allows HSI red-wave URL", () => {
    const ok = assertHsiNeonDatabaseUrl(
      "postgresql://neondb_owner:x@ep-hsi-production.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require",
      { neonProjectId: "hsi-neon-project" },
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
        "postgresql://neondb_owner:s3cret@ep-hsi-production.aws.neon.tech/neondb",
      ),
    ).toBe("postgresql://neondb_owner:***@ep-hsi-production.aws.neon.tech/neondb");
  });
  it("rejects spoofed domains, wrong databases and a project-pin bypass", () => {
    for (const url of [
      "postgresql://u:p@ep-hsi-production.evil.test/neondb",
      "postgresql://u:p@ep-other.aws.neon.tech/neondb",
      "postgresql://u:p@ep-hsi-production.c-2.eu-west-2.aws.neon.tech/otherdb",
      "https://ep-hsi-production.c-2.eu-west-2.aws.neon.tech/neondb",
      "postgresql://u:p@ep-hsi-production.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=disable",
    ]) expect(assertHsiNeonDatabaseUrl(url, { neonProjectId: HSI_NEON_PROJECT_ID }).ok).toBe(false);
  });
  it("masks delimiter-containing passwords and connection query secrets", () => {
    const masked = maskDatabaseUrl("postgresql://u:p%40ss%3Aword@ep-hsi-production.c-2.eu-west-2.aws.neon.tech/neondb?password=secret");
    expect(masked).not.toContain("p%40ss%3Aword");
    expect(masked).not.toContain("secret");
    expect(maskDatabaseUrl("not a URL secret")).toBe("[invalid database URL]");
  });
});
