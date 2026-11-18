import {describe,expect,test} from "bun:test";
import {
  buildLiveBriefEvidenceTable,
  liveInvestigationPassportEdges,
  renderLiveBriefPassportSections,
} from "../src/investigation/liveBriefPassport";
import {EDGE_PASSPORT_FIELDS} from "../src/knowledgeGraph/evidenceContextPassport";
import type {LiveInvestigation} from "../src/investigation/liveRun";

const cand=(o:Partial<LiveInvestigation["candidates"][number]>={}):LiveInvestigation["candidates"][number]=>({
  id:"c1",relationId:"il21-tfh",subject:"IL-21",object:"T follicular helper cells",contexts:["ssc"],species:"human",
  sourceId:"s1",sourceUrl:"https://europepmc.org/article/MED/1",sentence:"IL-21 was increased and Tfh cells expanded in patients with systemic sclerosis.",
  state:"extracted_candidate",lexicalPolarity:"supporting",polarity:"supporting",polarityBasis:"two_model_challenge",
  direction:"positive",priority:{score:7,reasons:["States an effect or direction"]},verification:"agree_directional",
  verdicts:[{verifier:"openai-a",model:"m1",direction:"positive",evidenceSpan:"IL-21 was increased",reason:"States an increase."}],
  retraction:"not_flagged_by_provider",...o,
});

const run:LiveInvestigation={
  schemaVersion:"hsi-live-investigation-1",mode:"live",scenarioId:"il21-autoimmune",
  question:"Why might IL-21 signalling have different biological consequences across autoimmune disease contexts?",
  version:1,briefHash:"a".repeat(64),entities:["IL-21"],searches:[],
  records:[{provider:"europe-pmc",sourceId:"s1",title:"IL-21 in SSc",doi:"10.1/x",pmid:"1",publicationDate:"2020-01-01",
    sourceUrl:"https://europepmc.org/article/MED/1",retrievedAt:"2026-11-15T00:00:00Z",licenceStatus:"not_assessed",
    retraction:"not_flagged_by_provider",studyTypes:[],verificationState:"metadata_retrieved_not_claim_verified",
    reviewState:"unreviewed",hasAbstract:true}],
  targets:[],candidates:[cand()],
  byContext:{ssc:{label:"Systemic sclerosis",records:1,supporting:["c1"],opposing:[],uncertain:[]}},
  verification:{status:"completed",reason:null,checked:1,independence:"independent_execution_only"},
  hypotheses:{status:"not_configured",reason:"none",items:[],dropped:0,basis:{findings:0}},
  gaps:["No opposing finding was identified."],budget:null,
  flags:{scientificApproval:false,graphPromotable:false,consensusEstablished:false,humanReview:"required",clinicalAdvice:false,containsPhi:false},
  events:[],
} as LiveInvestigation;

describe("live brief passport sections",()=>{
  test("maps candidates to passport edges with explicit missing fields",()=>{
    const edges=liveInvestigationPassportEdges(run);
    expect(edges).toHaveLength(1);
    expect(edges[0]!.id).toBe("live-claim:c1");
    expect(edges[0]!.kind).toBe("source_candidate");
    expect(edges[0]!.scientificClaimAllowed).toBe(false);
    const table=buildLiveBriefEvidenceTable(run);
    expect(table.schemaVersion).toBe("hsi-passport-evidence-table-1");
    expect(table.columns.map(c=>c.id)).toEqual([...EDGE_PASSPORT_FIELDS]);
    expect(table.scientificApproval).toBe(false);
    expect(table.graphPromotable).toBe(false);
    expect(table.rowCount).toBe(1);
    expect(table.rows[0]!.sourceTitle).toBe("IL-21 in SSc");
    expect(table.rows[0]!.cells.some(c=>c.status==="not_stated"||c.status==="not_extracted")).toBe(true);
  });

  test("markdown includes verification status and passport evidence table honesty",()=>{
    const md=renderLiveBriefPassportSections(run);
    expect(md).toContain("## Claim verification status");
    expect(md).toContain("both checks agree on direction");
    expect(md).toContain("## Evidence table (context passport columns)");
    expect(md).toContain("Study system");
    expect(md).toContain("Scientific approval: false");
    expect(md).toContain("Not stated");
    expect(md.toLowerCase()).not.toContain("scientifically approved");
  });
});
