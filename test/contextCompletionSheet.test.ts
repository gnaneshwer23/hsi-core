import {describe,expect,test} from "bun:test";
import {readFileSync,existsSync} from "node:fs";
import {createHash} from "node:crypto";
import {verifyDomainBundle} from "../src/knowledgeGraph/domainGraph";
import {
  NOT_REPORTED,
  applyContextCompletions,
  csvToProposedUpdates,
  d01QuestionEdgeIds,
  exportContextCompletionSheet,
  isD01CandidateEdge,
  mergeCsvProposalsIntoSheet,
  parseContextCompletionSheet,
  sealContextCompletionSheet,
  sheetToCsv,
} from "../src/knowledgeGraph/contextCompletionSheet";

const digest=async(s:string)=>createHash("sha256").update(s).digest("hex");
const graph=await verifyDomainBundle(JSON.parse(readFileSync("research/domain-graph/graph.v1.json","utf8")),digest);

describe("context completion sheet",()=>{
  test("exports D-01 source candidates with empty proposals and honesty flags",()=>{
    const sheet=sealContextCompletionSheet(exportContextCompletionSheet(graph));
    expect(sheet.schemaVersion).toBe("hsi-context-completion-sheet-1");
    expect(sheet.slice).toBe("D-01");
    expect(sheet.mappedAgainst).toBe(graph.version);
    expect(sheet.autoPromotion).toBe(false);
    expect(sheet.scientificApproval).toBe(false);
    expect(sheet.rows.length).toBeGreaterThan(10);
    expect(sheet.rows.every(r=>r.proposed.tissue===null&&r.proposed.population===null&&r.proposed.design===null)).toBe(true);
    const prefer=d01QuestionEdgeIds(graph);
    for(const row of sheet.rows){
      const edge=graph.edges.find(e=>e.id===row.edgeId)!;
      expect(edge.kind).toBe("source_candidate");
      expect(isD01CandidateEdge(edge,prefer)).toBe(true);
      expect(row.current.design).toBe(edge.design);
    }
    expect(parseContextCompletionSheet(sheet,graph)).toEqual(sheet);
  });

  test("rejects promotion flags, digest tampering and version mismatch",()=>{
    const sheet=sealContextCompletionSheet(exportContextCompletionSheet(graph));
    expect(()=>parseContextCompletionSheet({...sheet,autoPromotion:true},graph)).toThrow(/promotion|scientific/i);
    expect(()=>parseContextCompletionSheet({...sheet,scientificApproval:true},graph)).toThrow(/promotion|scientific/i);
    expect(()=>parseContextCompletionSheet({...sheet,digest:"a".repeat(64)},graph)).toThrow(/digest/i);
    expect(()=>parseContextCompletionSheet({...sheet,mappedAgainst:"b".repeat(64)},graph)).toThrow(/mappedAgainst/i);
  });

  test("apply fills tissue/population/design including not_reported without promoting",()=>{
    const base=sealContextCompletionSheet(exportContextCompletionSheet(graph));
    const target=base.rows[0]!;
    const sheet=sealContextCompletionSheet({
      ...base,
      rows:base.rows.map(r=>r.edgeId===target.edgeId?{
        ...r,
        proposed:{tissue:"colon",population:NOT_REPORTED,design:"Mouse colitis model; curator completed"},
        note:"fixture fill",
      }:r),
    });
    const edges=applyContextCompletions(graph.edges,sheet);
    const next=edges.find(e=>e.id===target.edgeId)!;
    expect(next.tissue).toBe("colon");
    expect(next.population).toBe(NOT_REPORTED);
    expect(next.design).toBe("Mouse colitis model; curator completed");
    expect(next.reviewStatus).toBe("unreviewed");
    expect(next.confidence).toBe("not_calibrated");
    expect(next.scientificClaimAllowed).toBe(false);
    const untouched=edges.find(e=>e.id!==target.edgeId&&e.id===base.rows[1]?.edgeId);
    if(untouched){
      const prior=graph.edges.find(e=>e.id===untouched.id)!;
      expect(untouched.tissue).toBe(prior.tissue);
      expect(untouched.population).toBe(prior.population);
      expect(untouched.design).toBe(prior.design);
    }
  });

  test("null proposals leave published values unchanged",()=>{
    const sheet=sealContextCompletionSheet(exportContextCompletionSheet(graph));
    const edges=applyContextCompletions(graph.edges,sheet);
    expect(edges).toEqual(graph.edges);
  });

  test("CSV round-trip merges proposed columns",()=>{
    const base=sealContextCompletionSheet(exportContextCompletionSheet(graph));
    const target=base.rows[0]!;
    const filled=sealContextCompletionSheet({
      ...base,
      rows:base.rows.map(r=>r.edgeId===target.edgeId?{
        ...r,
        proposed:{tissue:"adipose",population:"adult humans with T2D",design:r.current.design},
        note:"csv fixture",
      }:r),
    });
    const csv=sheetToCsv(filled);
    expect(csv).toContain("proposed_tissue");
    expect(csvToProposedUpdates(csv).get(target.edgeId)).toMatchObject({tissue:"adipose",population:"adult humans with T2D",note:"csv fixture"});
    const merged=mergeCsvProposalsIntoSheet(base,csv);
    expect(merged.rows.find(r=>r.edgeId===target.edgeId)!.proposed.tissue).toBe("adipose");
    expect(merged.digest).not.toBe(base.digest);
  });

  test("committed sheet artifact validates against the published graph when present",()=>{
    if(!existsSync("research/domain-graph/context-completions.v1.json"))return;
    const sheet=parseContextCompletionSheet(JSON.parse(readFileSync("research/domain-graph/context-completions.v1.json","utf8")),graph);
    expect(sheet.mappedAgainst).toBe(graph.version);
    expect(sheet.autoPromotion).toBe(false);
    expect(sheet.scientificApproval).toBe(false);
  });
});
