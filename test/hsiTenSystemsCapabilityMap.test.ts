import { describe, expect, test } from "bun:test";
import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = join(import.meta.dir, "..");

type SystemRow = {
  id: string;
  name: string;
  band: string;
  status: string;
  stageFit: string[];
  anchors: string[];
  hsi1Gaps: string[];
};

describe("hsi ten systems capability map v1", () => {
  const map = JSON.parse(
    readFileSync(join(root, "docs/architecture/hsi-ten-systems-capability-map.v1.json"), "utf8"),
  ) as {
    schemaVersion: string;
    priorityDifferentiator: string;
    honesty: Record<string, boolean>;
    systems: SystemRow[];
    hsi1CriticalPath: string[];
  };

  const doctrine = readFileSync(
    join(root, "docs/architecture/HSI_TECHNOLOGY_ARCHITECTURE_TEN_SYSTEMS.md"),
    "utf8",
  );

  test("freeze documents ten logical systems and rejects greenfield redesign", () => {
    expect(doctrine).toContain("Biological Context Intelligence");
    expect(doctrine).toContain("logical capabilities");
    expect(doctrine).toContain("Rejected until evidenced need");
    expect(doctrine).toContain("HSI 1.0");
    expect(doctrine).toContain("hsi-ten-systems-capability-map.v1.json");
  });

  test("map enumerates exactly systems 01–10 with anchors and gaps", () => {
    expect(map.schemaVersion).toBe("hsi-ten-systems-capability-map-1");
    expect(map.priorityDifferentiator).toBe("03");
    expect(map.honesty.logicalCapabilitiesNotMicroservices).toBe(true);
    expect(map.honesty.gateCAutoApprove).toBe(false);
    expect(map.systems).toHaveLength(10);
    expect(map.systems.map((s) => s.id)).toEqual([
      "01",
      "02",
      "03",
      "04",
      "05",
      "06",
      "07",
      "08",
      "09",
      "10",
    ]);
    for (const system of map.systems) {
      expect(system.name.length).toBeGreaterThan(3);
      expect(system.anchors.length).toBeGreaterThan(0);
      expect(system.hsi1Gaps.length).toBeGreaterThan(0);
      expect(["foundation", "core_usp", "core", "later", "ux"]).toContain(system.band);
      expect(["shipped", "partial", "contract_only", "later"]).toContain(system.status);
      for (const anchor of system.anchors) {
        const path = join(root, anchor.replace(/\/$/, ""));
        expect(existsSync(path)).toBe(true);
        expect(statSync(path).isFile() || statSync(path).isDirectory()).toBe(true);
      }
    }
    expect(map.systems.find((s) => s.id === "09")?.status).toBe("later");
    expect(map.hsi1CriticalPath.length).toBeGreaterThanOrEqual(5);
  });
});
