import {describe,expect,test} from "bun:test";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {parseDomainBundle} from "../src/knowledgeGraph/domainGraph";
import {DEPARTMENT_SLUGS,DEPARTMENT_TAGS,TRAVERSAL_LIMITS,crossDepartmentPaths,departmentCoverage,departmentsOfNode,projectDepartment,verifyPathReconstruction} from "../src/knowledgeGraph/departments";
import {departments} from "../site/src/lib/departments";

const g=parseDomainBundle(JSON.parse(readFileSync(resolve("research/domain-graph/graph.v1.json"),"utf8")));

describe("departments are projections of one graph",()=>{
 test("coverage equals the real graph and the public department pages (one source of truth)",()=>{
  const c=departmentCoverage(g);
  expect(c.departments.map(d=>[d.department,d.concepts])).toEqual([["immunology",127],["neuroscience",35],["microbiome",38],["metabolism",47],["genomics-multi-omics",0],["human-physiology",0]]);
  for(const d of departments)expect(d.graphConcepts,d.slug).toBe(c.departments.find(x=>x.department===d.slug)!.concepts);
  expect(departments.every(d=>d.graphTags===DEPARTMENT_TAGS[d.slug as keyof typeof DEPARTMENT_TAGS])).toBe(true);
 });
 test("one canonical concept belongs to several departments and keeps one identity",()=>{
  const c=departmentCoverage(g);expect(c.conceptsInSeveralDepartments).toBeGreaterThan(10);
  const butyrate=g.nodes.find(n=>n.name==="Butyrate")!;
  expect(departmentsOfNode(butyrate)).toEqual(expect.arrayContaining(["immunology","microbiome","metabolism"]));
  const inImm=projectDepartment(g,"immunology").nodes.filter(n=>n.id===butyrate.id),inMicro=projectDepartment(g,"microbiome").nodes.filter(n=>n.id===butyrate.id);
  expect(inImm.length).toBe(1);expect(inMicro.length).toBe(1);expect(inImm[0]).toEqual(inMicro[0]); // the same node object content, not a copy per department
 });
 test("coverage is honest about what is not mapped or not covered",()=>{
  const c=departmentCoverage(g);
  expect(c.unmappedTags).toEqual(expect.arrayContaining(["lifestyle","trials"]));
  expect(c.conceptsInNoDepartment).toBeGreaterThan(0);
  for(const d of ["genomics-multi-omics","human-physiology"]){
   const p=projectDepartment(g,d);expect(p.status).toBe("no_graph_coverage");expect(p.nodes).toEqual([]);expect(p.edges).toEqual([]);expect(p.note).toContain("Nothing is shown rather than inferred");
  }
 });
 test("a department projection exposes candidate and gap edges separately and its cross-department edges",()=>{
  const p=projectDepartment(g,"microbiome");
  expect(p.status).toBe("candidate_coverage");expect(p.counts.candidateEdges+p.counts.gapEdges).toBe(p.edges.length);
  expect(p.crossDepartmentEdges.length).toBeGreaterThan(0);
  for(const x of p.crossDepartmentEdges){expect(g.edges.some(e=>e.id===x.edgeId)).toBe(true);expect(x.otherDepartments).not.toContain("microbiome")}
  expect(p.graphVersion).toBe(g.version);
 });
 test("unknown departments are rejected",()=>{expect(()=>projectDepartment(g,"cardiology")).toThrow("Unknown department");expect(()=>crossDepartmentPaths(g,g.nodes[0]!.id,"cardiology")).toThrow("Unknown department")});
});

describe("cross-department traversal keeps evidence and never implies causation",()=>{
 const starts=g.nodes.filter(n=>departmentsOfNode(n).includes("microbiome"));
 const found=starts.map(n=>({n,r:crossDepartmentPaths(g,n.id,"neuroscience",{maxHops:4,maxPaths:5})})).filter(x=>x.r.paths.length);
 test("real paths exist from microbiome concepts into neuroscience",()=>{expect(found.length).toBeGreaterThan(0)});
 test("every path is reconstructable from the graph and carries per-hop context",()=>{
  for(const {r} of found)for(const p of r.paths){
   expect(verifyPathReconstruction(g,p)).toBe(true);expect(p.causalConclusionAllowed).toBe(false);
   expect(p.warnings[0]).toContain("not an established causal mechanism");
   for(const h of p.hops){expect(h.claimAllowed).toBe(false);expect(h.predicate).not.toBe("studied_in");expect(["source_candidate","research_gap"]).toContain(h.evidence)}
   expect(p.reconstruct.graphVersion).toBe(g.version);
   // the last node is in the target department, and no earlier node is
   const mem=(id:string)=>departmentsOfNode(g.nodes.find(n=>n.id===id)!);
   expect(mem(p.nodeIds.at(-1)!)).toContain("neuroscience");for(const id of p.nodeIds.slice(1,-1))expect(mem(id)).not.toContain("neuroscience");
  }
 });
 test("where evidence stops is marked, and a gap hop makes the whole chain a gap chain",()=>{
  const all=found.flatMap(x=>x.r.paths);
  for(const p of all){
   p.hops.forEach((h,i)=>{expect(p.boundaries.includes(i+1)).toBe(h.evidenceStops);if(h.evidence==="research_gap")expect(h.evidenceStops).toBe(true)});
   expect(p.evidenceChain).toBe(p.hops.some(h=>h.evidence==="research_gap")?"contains_gap":"candidate_only");
   if(p.evidenceChain==="contains_gap")expect(p.warnings.join(" ")).toContain("unresolved research gap");
  }
  // supported chains are ranked before chains that contain a boundary
  for(const {r} of found){const b=r.paths.map(p=>p.boundaries.length);expect([...b].sort((x,y)=>x-y)).toEqual(b)}
 });
 test("results are deterministic and bounded",()=>{
  const a=found[0]!;expect(crossDepartmentPaths(g,a.n.id,"neuroscience",{maxHops:4,maxPaths:5})).toEqual(a.r);
  expect(a.r.paths.length).toBeLessThanOrEqual(5);for(const p of a.r.paths)expect(p.hops.length).toBeLessThanOrEqual(4);
  expect(()=>crossDepartmentPaths(g,a.n.id,"neuroscience",{maxHops:TRAVERSAL_LIMITS.maxHops+1})).toThrow("Invalid traversal bound");
  expect(()=>crossDepartmentPaths(g,a.n.id,"neuroscience",{maxPaths:TRAVERSAL_LIMITS.maxPaths+1})).toThrow("Invalid traversal bound");
  expect(()=>crossDepartmentPaths(g,a.n.id,"neuroscience",{maxHops:0})).toThrow("Invalid traversal bound");
 });
 test("missing coverage, unknown entities and absent paths are reported, not invented",()=>{
  expect(crossDepartmentPaths(g,g.nodes[0]!.id,"genomics-multi-omics").status).toBe("target_has_no_graph_coverage");
  expect(()=>crossDepartmentPaths(g,"concept:does-not-exist","immunology")).toThrow("Unknown entity");
  const none=crossDepartmentPaths(g,starts[0]!.id,"neuroscience",{maxHops:1,maxPaths:1});
  expect(["paths_found","no_path_within_bound"]).toContain(none.status);
 });
 test("a tampered path no longer reconstructs",()=>{
  const p=found[0]!.r.paths[0]!;
  expect(verifyPathReconstruction(g,{...p,hops:p.hops.map((h,i)=>i===0?{...h,predicate:"causes"}:h)})).toBe(false);
  expect(verifyPathReconstruction(g,{...p,reconstruct:{...p.reconstruct,graphVersion:"0".repeat(64)}})).toBe(false);
  expect(verifyPathReconstruction(g,{...p,hops:p.hops.map((h,i)=>i===0?{...h,direction:h.direction==="forward"?"reverse":"forward"}:h)})).toBe(false);
 });
 test("no result text asserts causation or proof",()=>{
  const text=JSON.stringify(found.map(x=>x.r));expect(/\b(proves|proven|causes|demonstrates that)\b/i.test(text.replace(/not an established causal mechanism/g,""))).toBe(false);
 });
});
