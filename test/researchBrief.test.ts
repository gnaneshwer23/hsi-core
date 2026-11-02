import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { buildResearchBrief, evidenceSourceLink, selectedEvidence } from "../site/src/lib/researchBrief";
import type { EvidenceRow } from "../site/src/lib/discoveryData";

const rows: EvidenceRow[] = JSON.parse(readFileSync(new URL("../site/public/discovery/hsi-pilot-evidence-pack.json", import.meta.url), "utf8")).evidenceMap;
const context = { question: "Why does anti-TNF response differ?", disease: "Rheumatoid arthritis", bundleId: "test-snapshot", generatedAt: "2026-11-02T00:00:00Z" };
const ids = rows.slice(0, 2).map((row) => row.claimId);

describe("research comparison brief", () => {
  it("exports selected claims with snapshot identity, uncertainty and unchanged review states", () => {
    const brief = buildResearchBrief(context, rows, ids);
    expect(brief).toContain("test-snapshot");
    expect(brief).toContain(context.generatedAt);
    for (const row of rows.slice(0, 2)) {
      expect(brief).toContain(row.claimId);
      expect(brief).toContain(`Pack evidence grade: ${row.evidenceGrade}`);
      expect(brief).toContain(`Pack review state: ${row.reviewStatus}`);
    }
    expect(brief).toContain("not a literature search");
    expect(brief).toContain("Not independently verified");
    expect(brief).toContain("No contradiction or causal inference");
    expect(brief).toContain("this export records no approval");
    expect(brief).not.toContain(rows[2]!.claimId);
  });

  it("rejects stale selections, empty questions and unsupported selection sizes", () => {
    expect(() => buildResearchBrief(context, rows, ["missing", ...ids])).toThrow("absent");
    expect(() => buildResearchBrief({ ...context, question: " " }, rows, ids)).toThrow("question");
    expect(() => buildResearchBrief(context, rows, [])).toThrow("two to four");
    expect(() => buildResearchBrief(context, rows, [ids[0]!, ids[0]!])).toThrow("two to four");
    expect(() => buildResearchBrief(context, rows, rows.slice(0, 5).map((row) => row.claimId))).toThrow("two to four");
    expect(selectedEvidence(rows, [ids[1]!, ids[0]!, ids[1]!]).map((r) => r.claimId)).toEqual([ids[1]!, ids[0]!]);
  });

  it("does not turn missing citations or limits into verified evidence", () => {
    const modified = structuredClone(rows.slice(0, 2));
    modified[0]!.source = { pmid: null, sourceUrl: "javascript:alert(1)" };
    modified[0]!.limitations = null;
    const brief = buildResearchBrief(context, modified, ids);
    expect(brief).toContain("Unavailable — no valid PMID or DOI");
    expect(brief).toContain("Pack limitations: Not recorded");
    expect(brief).not.toContain("javascript:");
    expect(evidenceSourceLink(modified[0]!)).toBeNull();
    modified[0]!.source.doi = "10.1000/example";
    expect(evidenceSourceLink(modified[0]!)).toBe("https://doi.org/10.1000%2Fexample");
  });

  it("escapes untrusted Markdown and HTML while retaining source text", () => {
    const modified = structuredClone(rows.slice(0, 2));
    modified[0]!.claimText = '<script>alert(1)</script>\n# Approved [claim](javascript:alert(1))';
    const brief = buildResearchBrief(context, modified, ids);
    expect(brief).not.toContain("<script>");
    expect(brief).not.toContain("\n# Approved");
    expect(brief).toContain("&lt;script&gt;");
    expect(brief).toContain("\\[claim\\]");
  });
});
