import {expect,test} from "bun:test";
import {readFileSync} from "node:fs";
import {parseDomainBundle} from "../src/knowledgeGraph/domainGraph";
import {diffVersions} from "../src/graphWorkspace/versionDiff";
import {buildGraphModel} from "../src/graphWorkspace";

const d02=JSON.parse(readFileSync("research/domain-graph/expansion-d02.v1.json","utf8"));
const g=parseDomainBundle(JSON.parse(readFileSync("research/domain-graph/graph.v1.json","utf8")));
const parent=parseDomainBundle(JSON.parse(readFileSync(`research/domain-graph/versions/${g.parentVersion}.json`,"utf8")));

test("every D-02 source is a PubMed-matched bibliographic candidate: PMID, DOI and title, nothing retrieved or cleared",()=>{
 expect(d02.sources).toHaveLength(14);
 for(const s of d02.sources){
  expect(s.id).toBe(`pmid:${s.pmid}`);expect(s.pmid).toMatch(/^\d{6,9}$/);expect(s.doi).toMatch(/^10\./);
  expect(s.url).toBe(`https://pubmed.ncbi.nlm.nih.gov/${s.pmid}/`);
  expect(s.identityStatus).toBe("bibliographic_candidate_not_retrieved");expect(s.rights).toBe("unverified");
  expect(s.retrievedAt).toBeNull();expect(s.passage).toBeNull();
  const pub=g.sources.find(x=>x.id===s.id)!;expect(pub.pmid).toBe(s.pmid);expect(pub.passages.every(p=>p.text===null)).toBe(true);
 }
});
test("every D-02 claim cites a D-02 source, stays a candidate and says when a result was negative",()=>{
 const ids=new Set(d02.sources.map((s:{id:string})=>s.id));
 for(const c of d02.claims){
  expect(ids.has(c.sourceId)).toBe(true);expect(c.assertion).toMatch(/^Candidate summary: /);expect(c.limitations.length).toBeGreaterThan(20);
  const e=g.edges.find(x=>x.id===c.id)!;expect(e.reviewStatus).toBe("unreviewed");expect(e.scientificClaimAllowed).toBe(false);
 }
 const negated=d02.claims.filter((c:{negated:boolean})=>c.negated).map((c:{id:string})=>c.id).sort();
 expect(negated).toEqual(["TRANS-002","TRANS-003","TRANS-005","TRANS-006"]);
 for(const c of d02.claims.filter((c:{id:string})=>c.id.startsWith("TRANS-"))){expect(c.timepoint).toBeTruthy();expect(c.intervention).toBeTruthy();expect(c.assertion).not.toMatch(/recommend|should be used|effective treatment/i)}
});
test("disease hubs are not re-tagged by the batch, so coverage counts are not inflated",()=>{
 for(const name of ["Systemic sclerosis","Rheumatoid arthritis"]){
  const n=g.nodes.find(x=>x.name===name)!;
  for(const t of ["genomic","skin","lung","kidney","joint"])expect(n.domains).not.toContain(t);
 }
});
test("the temporal diff between the published version and its parent is exactly the D-02 batch",()=>{
 const d=diffVersions(parent,g);
 expect(d.added).toEqual([...d02.claims.map((c:{id:string})=>c.id),...d02.gaps.map((x:{id:string})=>x.id)].sort());
 expect(d.changed).toEqual([]);expect(d.removed).toEqual([]);expect(d.addedSources).toBe(14);
 expect(()=>diffVersions(g,parent)).toThrow("not parent and child");
 const model=buildGraphModel(g);expect(d.added.filter(id=>model.assertions.some(a=>a.id===id))).toHaveLength(21);
});
