import {describe,expect,test} from "bun:test";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {verifyDomainBundle,exportDomainBrief,renderDomainBrief} from "../src/knowledgeGraph/domainGraph";
import {EDGE_PASSPORT_FIELDS} from "../src/knowledgeGraph/evidenceContextPassport";
import {
  buildPassportEvidenceTable,
  renderPassportEvidenceTableMarkdown,
} from "../src/knowledgeGraph/passportEvidenceTable";

const digest=async(s:string)=>createHash("sha256").update(s).digest("hex");
const graph=await verifyDomainBundle(JSON.parse(readFileSync("research/domain-graph/graph.v1.json","utf8")),digest);

describe("passport evidence table",()=>{
  test("columns match Evidence Context Passport edge fields",()=>{
    const brief=exportDomainBrief(graph,"gut-t1d",{});
    const table=buildPassportEvidenceTable(brief.evidence,brief.sources);
    expect(table.schemaVersion).toBe("hsi-passport-evidence-table-1");
    expect(table.columns.map(c=>c.id)).toEqual([...EDGE_PASSPORT_FIELDS]);
    expect(table.scientificApproval).toBe(false);
    expect(table.graphPromotable).toBe(false);
    expect(table.rowCount).toBe(table.rows.length);
    expect(table.rowCount).toBeGreaterThan(0);
    expect(table.rows.every(r=>r.kind==="source_candidate")).toBe(true);
    expect(table.rows.every(r=>r.cells.length===EDGE_PASSPORT_FIELDS.length)).toBe(true);
    const withTissue=table.rows.find(r=>r.edgeId==="DIAB-003"||r.cells.some(c=>c.fieldId==="tissue"&&c.status==="reported"));
    expect(withTissue||table.rows[0]).toBeTruthy();
    expect(table.rows.some(r=>r.cells.some(c=>c.display==="Not stated"||c.display==="Not extracted"||c.status==="reported"))).toBe(true);
  });

  test("excludes research gaps and keeps missing cells explicit",()=>{
    const gaps=graph.edges.filter(e=>e.kind==="research_gap");
    const table=buildPassportEvidenceTable(gaps,graph.sources);
    expect(table.rowCount).toBe(0);
    const mixed=buildPassportEvidenceTable(graph.edges.slice(0,30),graph.sources);
    expect(mixed.rows.every(r=>r.kind==="source_candidate")).toBe(true);
    for(const row of mixed.rows){
      for(const cell of row.cells){
        if(cell.status!=="reported")expect(["Not stated","Not extracted","Not applicable","Not available"]).toContain(cell.display);
      }
    }
  });

  test("markdown and JSON briefs include the passport evidence table",()=>{
    const brief=exportDomainBrief(graph,"gut-t1d",{});
    expect(brief.evidenceTable.schemaVersion).toBe("hsi-passport-evidence-table-1");
    expect(brief.evidenceTable.scientificApproval).toBe(false);
    expect(brief.evidenceTable.columns.map(c=>c.id)).toEqual([...EDGE_PASSPORT_FIELDS]);
    const md=renderDomainBrief(brief);
    expect(md).toContain("## Evidence table (context passport columns)");
    expect(md).toContain("Study system");
    expect(md).toContain("Scientific approval: false");
    expect(md.toLowerCase()).not.toContain("scientifically approved");
    expect(renderPassportEvidenceTableMarkdown(brief.evidenceTable)).toContain("| Edge | Finding | Source |");
  });
});
