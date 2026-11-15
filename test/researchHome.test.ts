import {describe,expect,test} from "bun:test";
import {parseOrcid,parsePaperIds,STAGES,summariseSavedLiveRun,classifyIntent,EMPTY_PROFILE,focusNetwork,loadProfile,parseProfile,recommend,resetProfile,saveProfile,searchEntities,looksLikeTrialId} from "../site/src/lib/researchHome";
import {departments} from "../site/src/lib/departments";

const dept=departments[0]!,tag=dept.graphTags[0]!;
const node=(id:string,name:string,domains:string[]=[tag],aliases:string[]=[])=>({id,name,kind:"biological concept",aliases,domains});
const edge=(id:string,s:string,o:string,negated=false)=>({id,subjectId:s,objectId:o,predicate:"associated_with",kind:"source_candidate" as const,negated,sourceId:null,assertion:"",domains:[tag],conditions:[]});
const bundle:any={nodes:[node("a","Interleukin 6",[tag],["IL6"]),node("b","STAT3"),node("c","Microglia"),node("d","Isolated")],edges:[edge("e1","a","b"),edge("e2","b","c"),edge("e3","a","c",true),{...edge("g","a","d"),kind:"research_gap"}]};
const mem=()=>{const m=new Map<string,string>();return {getItem:(k:string)=>m.get(k)??null,setItem:(k:string,v:string)=>{m.set(k,v)},removeItem:(k:string)=>{m.delete(k)}}};

describe("research home logic",()=>{
 test("entity search ranks exact, prefix and alias matches and ignores 1-char queries",()=>{
  expect(searchEntities(bundle.nodes,"IL6")[0]!.name).toBe("Interleukin 6");
  expect(searchEntities(bundle.nodes,"stat")[0]!.id).toBe("b");
  expect(searchEntities(bundle.nodes,"s")).toEqual([]);
  expect(searchEntities(bundle.nodes,"zzzz")).toEqual([]);
 });
 test("intent separates entities, exploration and investigations",()=>{
  const hit=searchEntities(bundle.nodes,"IL6");
  expect(classifyIntent("IL6",hit)).toBe("entity");
  expect(classifyIntent("gut microbiome neuroinflammation",[])).toBe("exploratory");
  expect(classifyIntent("How do microbial metabolites influence immune signalling and brain inflammation?",[])).toBe("investigation");
  expect(classifyIntent(" ",[])).toBe("empty");
  expect(looksLikeTrialId("nct01234567")).toBe(true);
 });
 test("profile storage is defensive: corrupt, oversized and unavailable storage never throw",()=>{
  expect(parseProfile("{not json")).toEqual(EMPTY_PROFILE);
  expect(parseProfile(JSON.stringify({v:2}))).toEqual(EMPTY_PROFILE);
  const p=parseProfile(JSON.stringify({v:1,role:"Academic",goals:["x","x",5],interests:Array(40).fill("a").map((_,i)=>"t"+i),followed:[{id:"a",name:"A"},{id:1}],dismissed:[],onboarded:true}));
  expect(p.goals).toEqual(["x"]);expect(p.interests.length).toBe(20);expect(p.followed).toEqual([{id:"a",name:"A"}]);
  const s=mem();expect(saveProfile({...EMPTY_PROFILE,interests:["immunology"]},s)).toBe(true);expect(loadProfile(s).interests).toEqual(["immunology"]);
  expect(resetProfile(s)).toEqual(EMPTY_PROFILE);expect(loadProfile(s)).toEqual(EMPTY_PROFILE);
  const broken={getItem:()=>{throw Error("x")},setItem:()=>{throw Error("x")},removeItem:()=>{throw Error("x")}};
  expect(loadProfile(broken)).toEqual(EMPTY_PROFILE);expect(saveProfile(EMPTY_PROFILE,broken)).toBe(false);expect(saveProfile(EMPTY_PROFILE,null)).toBe(false);
 });
 test("recommendations are real concepts, explained, deduplicated and respect follow/dismiss",()=>{
  const none=recommend(EMPTY_PROFILE,bundle);expect(none).toEqual([]);
  const r=recommend({...EMPTY_PROFILE,interests:[dept.slug]},bundle);
  expect(r.length).toBeGreaterThan(0);
  expect(r.every(x=>bundle.nodes.some((n:any)=>n.id===x.id)&&x.reason.includes(dept.name))).toBe(true);
  expect(r.some(x=>x.id==="d")).toBe(false); // only a research gap touches it
  const f=recommend({...EMPTY_PROFILE,followed:[{id:"a",name:"Interleukin 6"}]},bundle);
  expect(f.every(x=>x.id!=="a"&&x.reason.includes("Interleukin 6"))).toBe(true);
  const dis=recommend({...EMPTY_PROFILE,interests:[dept.slug],dismissed:r.map(x=>x.id)},bundle);expect(dis.some(x=>r.some(y=>y.id===x.id))).toBe(false);
 });
 test("a free-text topic matches concepts by name or alias",()=>{
  const r=recommend({...EMPTY_PROFILE,interests:["IL6"]},bundle);
  expect(r[0]!.id).toBe("a");expect(r[0]!.reason).toContain("IL6");
  expect(recommend({...EMPTY_PROFILE,interests:["nonexistent topic"]},bundle)).toEqual([]);
 });
 test("focus network keeps only recorded candidate edges",()=>{
  const n=focusNetwork(bundle,"a")!;
  expect(n.nodes.map(x=>x.id).sort()).toEqual(["a","b","c"]);
  expect(n.edges.some(e=>e.id==="g")).toBe(false);expect(n.edges.find(e=>e.id==="e3")!.negated).toBe(true);
  expect(focusNetwork(bundle,"missing")).toBeNull();
 });
});

describe("saved live run summary",()=>{
 test("counts only model-checked findings and rejects malformed data",()=>{
  const run=JSON.stringify({question:"q",candidates:[{polarity:"supporting",verification:"agree_directional"},{polarity:"supporting",verification:"not_run"},{polarity:"opposing",verification:"agree_directional"},{polarity:"uncertain",verification:"disputed"}]});
  expect(summariseSavedLiveRun(run)).toEqual({question:"q",candidates:4,supporting:1,opposing:1,checked:3});
  expect(summariseSavedLiveRun("{bad")).toBeNull();expect(summariseSavedLiveRun(null)).toBeNull();expect(summariseSavedLiveRun(JSON.stringify({question:1}))).toBeNull();
 });
});

describe("researcher profile inputs",()=>{
 test("ORCID iDs are validated including the check digit, and URLs are accepted",()=>{
  expect(parseOrcid("0000-0002-1825-0097")).toBe("0000-0002-1825-0097");
  expect(parseOrcid("https://orcid.org/0000-0002-1825-0097")).toBe("0000-0002-1825-0097");
  expect(parseOrcid("0000-0002-1825-0098")).toBeNull();expect(parseOrcid("1234")).toBeNull();expect(parseOrcid("")).toBeNull();
 });
 test("pasted DOIs and PMIDs are normalised, de-duplicated and capped; junk is reported",()=>{
  const r=parsePaperIds("10.1186/s13075-015-0660-z, https://doi.org/10.1186/S13075-015-0660-Z\nPMID:26055806 26055806 https://pubmed.ncbi.nlm.nih.gov/12345/ nonsense");
  expect(r.ids).toEqual(["doi:10.1186/s13075-015-0660-z","pmid:26055806","pmid:12345"]);expect(r.rejected).toEqual(["nonsense"]);
  expect(parsePaperIds(Array.from({length:40},(_,i)=>String(1000+i)).join(" ")).ids.length).toBe(20);
 });
 test("an old stored profile without the new fields loads with safe defaults, and bad values are dropped",()=>{
  const p=parseProfile(JSON.stringify({v:1,role:"Academic",interests:["immunology"],onboarded:true,orcid:"nope",cadence:"hourly",background:"x".repeat(900)}));
  expect(p).toMatchObject({role:"Academic",stage:null,orcid:null,cadence:"off",papers:[],question:""});expect(p.background.length).toBe(600);expect(STAGES.length).toBeGreaterThan(3);
 });
});
