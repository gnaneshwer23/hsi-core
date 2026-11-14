import {describe,expect,test} from "bun:test";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {domainPaths,parseDomainBundle,type DomainBundle} from "../src/knowledgeGraph/domainGraph";
import {SELECTION_LIMITS,applyProposalToGraph,assertResponseInvariants,buildInvestigationRecord,buildSelectionContext,classifyComparability,contextDigest,investigateSelection,proposeFromFinding,verifyInvestigationRecord,type AgentResponse} from "../src/knowledgeGraph/graphAgents";

const g=parseDomainBundle(JSON.parse(readFileSync(resolve("research/domain-graph/graph.v1.json"),"utf8")));
const Q="What does the graph record about this selection?";
const sel=(nodeIds:string[]=[],edgeIds:string[]=[],extra:Record<string,unknown>={})=>buildSelectionContext(g,{investigationId:"inv-test-001",graphVersion:g.version,question:Q,nodeIds,edgeIds,...extra} as never);
const candidates=g.edges.filter(e=>e.kind==="source_candidate");
const node=(name:string)=>g.nodes.find(n=>n.name===name)!;

describe("the selection becomes an explicit, validated context",()=>{
 test("it records the graph version, ids, filters and question, and derives the evidence ids itself",()=>{
  const e=candidates.find(x=>x.sourceId)!;
  const c=sel([e.subjectId],[e.id],{department:"microbiome",filters:{model:"mouse"}});
  expect(c.graphVersion).toBe(g.version);expect(c.department).toBe("microbiome");expect(c.filters).toEqual({model:"mouse"});
  expect(c.evidenceIds).toEqual([e.sourceId!]);expect(c.nodeIds).toEqual([e.subjectId]);expect(c.edgeIds).toEqual([e.id]);
 });
 test("a stale graph version, unknown ids, empty and oversized selections and bad departments are refused",()=>{
  const n=g.nodes[0]!.id;
  expect(()=>buildSelectionContext(g,{investigationId:"inv-test-001",graphVersion:"0".repeat(64),question:Q,nodeIds:[n]})).toThrow("Stale graph version");
  expect(()=>sel(["concept:nope-123"])).toThrow("Unknown concept");expect(()=>sel([],["NOPE-999"])).toThrow("Unknown relationship");
  expect(()=>sel([])).toThrow("Select at least one");
  expect(()=>sel(g.nodes.slice(0,SELECTION_LIMITS.maxNodes+1).map(x=>x.id))).toThrow("too large");
  expect(()=>sel([n],[],{department:"cardiology"})).toThrow("Unknown department");
  expect(()=>buildSelectionContext(g,{investigationId:"x",graphVersion:g.version,question:Q,nodeIds:[n]})).toThrow("Invalid investigation id");
 });
 test("a question carrying personal identifiers is refused, ordinary scientific numbers are not, and the length is bounded",()=>{
  const n=g.nodes[0]!.id,ask=(question:string)=>()=>buildSelectionContext(g,{investigationId:"inv-test-001",graphVersion:g.version,question,nodeIds:[n]});
  for(const bad of ["Why did jane.doe@example.com respond to the treatment?","Patient with NHS number 943 476 5919 responded","Call 07700 900123 about the result","Born 01/02/1980 and improved on treatment","Patient name is on file for this question","Seen at SE1 7PB clinic last week"])expect(ask(bad),bad).toThrow("personal or clinical identifiers");
  for(const ok of ["How does IL-6 change at 24 hours after butyrate in n=10 mice?","Is a 2.5 fold change at day 7 supported by 3 studies?","What links GPR109A signalling to Treg expansion in 2019 cohorts?"])expect(ask(ok),ok).not.toThrow();
  expect(()=>buildSelectionContext(g,{investigationId:"inv-test-001",graphVersion:g.version,question:"hi",nodeIds:[n]})).toThrow("5-500");
  expect(()=>buildSelectionContext(g,{investigationId:"inv-test-001",graphVersion:g.version,question:"x".repeat(501),nodeIds:[n]})).toThrow("5-500");
 });
 test("the digest is stable and changes when the selection changes",async()=>{
  const a=sel([g.nodes[0]!.id]),b=sel([g.nodes[0]!.id]),c=sel([g.nodes[1]!.id]);
  expect(await contextDigest(a)).toBe(await contextDigest(b));expect(await contextDigest(a)).not.toBe(await contextDigest(c));expect(await contextDigest(a)).toMatch(/^[0-9a-f]{64}$/);
 });
});

describe("PARALLAX: comparable disagreement is not the same as a non-comparable experiment",()=>{
 test("real pairs fall into not_comparable and insufficient_context, and are never a confirmed contradiction",()=>{
  const seen=new Set<string>();
  for(let i=0;i<candidates.length;i++)for(let j=i+1;j<candidates.length;j++){const k=classifyComparability(g,candidates[i]!.id,candidates[j]!.id);if(k)seen.add(k.class)}
  expect(seen.has("not_comparable")).toBe(true);expect(seen.has("insufficient_context")).toBe(true);
 });
 const cloneWith=(over:Record<string,unknown>)=>{const b=structuredClone(g) as DomainBundle;const e=candidates.find(x=>x.sourceId)!;const e2={...structuredClone(e),id:"TEST-CLONE-001",...over};b.edges.push(e2 as never);
  for(const x of b.edges.filter(x=>x.id===e.id||x.id==="TEST-CLONE-001"))Object.assign(x,{tissue:"colon",population:"adult",assay:"ELISA",timepoint:"day 7",intervention:"x",outcome:"y"});return {b,e};};
 test("identical recorded context with opposite findings is a potential disagreement needing review, not a contradiction",()=>{
  const {b,e}=cloneWith({negated:!candidates.find(x=>x.sourceId)!.negated});
  const k=classifyComparability(b,e.id,"TEST-CLONE-001")!;expect(k.class).toBe("potential_disagreement");expect(k.reason).toContain("not a confirmed contradiction");
 });
 test("a different model or tissue makes the pair non-comparable and names the difference",()=>{
  const {b,e}=cloneWith({model:e0().model==="mouse"?"human_in_vivo":"mouse"});
  const k=classifyComparability(b,e.id,"TEST-CLONE-001")!;expect(k.class).toBe("not_comparable");expect(k.differing).toContain("model");
  function e0(){return candidates.find(x=>x.sourceId)!}
 });
 test("missing context yields insufficient_context rather than a guess",()=>{
  const b=structuredClone(g) as DomainBundle;const e=candidates.find(x=>x.sourceId)!;b.edges.push({...structuredClone(e),id:"TEST-CLONE-002"} as never);
  for(const x of b.edges.filter(x=>x.id===e.id||x.id==="TEST-CLONE-002"))Object.assign(x,{tissue:null});
  expect(classifyComparability(b,e.id,"TEST-CLONE-002")!.class).toBe("insufficient_context");
 });
 test("the agent abstains with fewer than two candidate relationships, and reports pair classes otherwise",()=>{
  const one=investigateSelection(g,sel([],[candidates[0]!.id]),"PARALLAX");expect(one.status).toBe("abstained");expect(one.abstentionReason).toContain("at least two");
  const two=investigateSelection(g,sel([],[candidates[0]!.id,candidates[1]!.id]),"PARALLAX");expect(two.status).toBe("completed");expect(two.findings.length).toBe(1);
  expect(["not_comparable","insufficient_context","potential_disagreement","consistent_context"]).toContain(two.findings[0]!.class??"");
  expect(two.uncertainty.join(" ")).toContain("No pair is confirmed as a contradiction");
 });
});

describe("VANTAGE: a recorded question is not a coverage gap",()=>{
 test("both kinds appear, with different kinds and honest wording",()=>{
  const bare=g.nodes.find(n=>!g.edges.some(e=>e.kind==="source_candidate"&&(e.subjectId===n.id||e.objectId===n.id)));
  const gapEdge=g.edges.find(e=>e.kind==="research_gap")!;
  expect(bare).toBeTruthy();
  const r=investigateSelection(g,sel([bare!.id],[gapEdge.id]),"VANTAGE");
  const kinds=new Set(r.findings.map(f=>f.kind));
  expect(kinds.has("graph_coverage_gap")).toBe(true);expect(kinds.has("recorded_research_question")).toBe(true);
  expect(r.findings.find(f=>f.kind==="graph_coverage_gap")!.detail).toContain("not a statement that the literature is silent");
  expect(r.findings.find(f=>f.kind==="recorded_research_question")!.detail).toMatch(/question here, not a finding|Recorded unresolved question/);
  expect(r.uncertainty.join(" ")).toContain("Literature coverage is not assessed");
 });
 test("a department with no graph coverage is reported as a coverage gap",()=>{
  const r=investigateSelection(g,sel([g.nodes[0]!.id],[],{department:"genomics-multi-omics"}),"VANTAGE");
  expect(r.findings.some(f=>f.kind==="graph_coverage_gap"&&f.title.includes("genomics-multi-omics"))).toBe(true);
 });
});

describe("HELIX: scoped candidate chains; model-backed interpretation is not enabled",()=>{
 const pair=(()=>{for(const a of g.nodes)for(const b of g.nodes)if(a.id!==b.id&&domainPaths(g,a.id,b.id,5).length)return [a,b] as const;return null})();
 test("a chain between two selected concepts is returned within the snapshot and labelled association-only",()=>{
  expect(pair).toBeTruthy();
  const r=investigateSelection(g,sel([pair![0].id,pair![1].id]),"HELIX");
  expect(r.status).toBe("completed");expect(r.modelBacked).toBe(false);expect(r.findings[0]!.class).toBe("association_only");
  expect(r.uncertainty[0]).toContain("Model-backed mechanism interpretation is not enabled");
  expect(r.findings[0]!.detail).toContain("not an established causal mechanism");
  assertResponseInvariants(g,r);
 });
 test("one concept plus a target department lists chains with evidence boundaries; no coverage abstains",()=>{
  const b=node("Butyrate");
  const r=investigateSelection(g,sel([b.id],[],{department:"neuroscience"}),"HELIX");
  expect(r.status).toBe("completed");expect(r.findings.some(f=>f.class==="association_with_evidence_boundary")).toBe(true);
  const none=investigateSelection(g,sel([b.id],[],{department:"human-physiology"}),"HELIX");expect(none.status).toBe("abstained");expect(none.abstentionReason).toContain("no concept in the graph");
 });
 test("an unusable selection abstains and says why",()=>{
  const r=investigateSelection(g,sel([g.nodes[0]!.id]),"HELIX");expect(r.status).toBe("abstained");expect(r.abstentionReason).toContain("Select exactly two concepts");
 });
});

describe("governance: agents propose, they never publish",()=>{
 test("every response is candidate-only with no approval, promotion or graph change",()=>{
  for(const a of ["PARALLAX","VANTAGE","HELIX"] as const){const r=investigateSelection(g,sel([node("Butyrate").id],[candidates[0]!.id,candidates[1]!.id],{department:"neuroscience"}),a);
   expect(r.scientificApproval).toBe(false);expect(r.graphPromotable).toBe(false);expect(r.proposedGraphChange).toBeNull();expect(r.reviewState).toBe("candidate_finding");}
 });
 test("a proposal from a finding is unreviewed and cannot be applied",()=>{
  const r=investigateSelection(g,sel([],[candidates[0]!.id,candidates[1]!.id]),"PARALLAX"),p=proposeFromFinding(r,r.findings[0]!);
  expect(p.status).toBe("proposed_unreviewed");expect(p.requiresIndependentReview).toBe(true);expect(p.approved).toBe(false);
  expect(()=>applyProposalToGraph(g,p)).toThrow("cannot publish knowledge");
  expect(()=>proposeFromFinding(r,{...r.findings[0]!})).toThrow("does not belong");
 });
 test("a forged or out-of-snapshot response fails the invariant check",()=>{
  const r=investigateSelection(g,sel([],[candidates[0]!.id,candidates[1]!.id]),"PARALLAX");
  expect(()=>assertResponseInvariants(g,{...r,scientificApproval:true as never})).toThrow("candidate-only");
  expect(()=>assertResponseInvariants(g,{...r,graphPromotable:true as never})).toThrow("candidate-only");
  expect(()=>assertResponseInvariants(g,{...r,proposedGraphChange:{} as never})).toThrow("candidate-only");
  expect(()=>assertResponseInvariants(g,{...r,graphVersion:"0".repeat(64)})).toThrow("not bound");
  const foreign:AgentResponse={...r,findings:[{...r.findings[0]!,refs:{...r.findings[0]!.refs,edgeIds:["INVENTED-001"]}}]};
  expect(()=>assertResponseInvariants(g,foreign)).toThrow("not in the snapshot");
 });
 test("a stale snapshot is refused and an unknown agent is rejected",()=>{
  const c=sel([g.nodes[0]!.id]);expect(()=>investigateSelection({...g,version:"1".repeat(64)},c,"VANTAGE")).toThrow("Stale graph version");
  expect(()=>investigateSelection(g,c,"ORACLE" as never)).toThrow("Unknown agent");
 });
});

describe("reproducibility: the record re-derives from the graph",()=>{
 const ctx=()=>sel([node("Butyrate").id],[candidates[0]!.id,candidates[1]!.id],{department:"neuroscience",filters:{model:"mouse"}});
 test("a record reproduces, preserving ids, version, filters and verification state",()=>{
  const rec=buildInvestigationRecord(g,ctx());
  expect(verifyInvestigationRecord(g,rec)).toEqual([]);
  expect(rec.graphVersion).toBe(g.version);expect(rec.context.filters).toEqual({model:"mouse"});expect(rec.context.nodeIds).toEqual([node("Butyrate").id]);
  expect(rec.scientificApproval).toBe(false);expect(rec.checks).toEqual({scopedToSnapshot:true,candidateOnly:true,deterministicRerunMatches:true});
  expect(JSON.parse(JSON.stringify(rec))).toEqual(rec);
 });
 test("results are deterministic",()=>{expect(buildInvestigationRecord(g,ctx())).toEqual(buildInvestigationRecord(g,ctx()))});
 test("tampering is detected: edited responses, altered context, a different graph version or an approval flag",()=>{
  const rec=buildInvestigationRecord(g,ctx());
  const edited=structuredClone(rec);edited.responses[0]!.findings.push({kind:"x",title:"invented",detail:"invented",refs:{nodeIds:[],edgeIds:[],sourceIds:[]}});
  expect(verifyInvestigationRecord(g,edited).join(" ")).toContain("does not reproduce");
  const ctxEdit=structuredClone(rec);ctxEdit.context.evidenceIds=["doi:10.0000/forged"];
  expect(verifyInvestigationRecord(g,ctxEdit).join(" ")).toContain("does not match");
  expect(verifyInvestigationRecord({...g,version:"2".repeat(64)},rec).join(" ")).toContain("Graph version differs");
  expect(verifyInvestigationRecord(g,{...rec,scientificApproval:true as never}).join(" ")).toContain("may not carry scientific approval");
 });
});
