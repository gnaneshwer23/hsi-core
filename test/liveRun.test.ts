import {afterAll,expect,test} from "bun:test";
import {mkdtempSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {join} from "node:path";
import {checkLiveRunGate,runLiveInvestigation} from "../src/liveRun";

const target={investigationId:"live-t1",diseaseScope:"ssc" as const,question:"Does X affect Y in cells?",release:{id:"r",version:"1",manifestHash:"0".repeat(64)}};
const base=(over:Record<string,unknown>={})=>({config:{},integrityConfig:{},env:{},target,auditDirectory:"/nonexistent/hsi-audit",
 fetcher:(()=>{throw Error("network call attempted")}) as never,clearance:{decide:async()=>{throw Error("clearance consulted")}},
 ops:{run:async()=>{throw Error("model call attempted")}} as never,runsToday:()=>0,...over});

test("an unconfigured live run is refused, lists both gates, and touches nothing",async()=>{
 const r=await runLiveInvestigation(base());
 expect("refused" in r&&r.refused).toBe(true);
 if("refused" in r){expect(r.reasons.join(" ")).toContain("live readiness");expect(r.reasons.join(" ")).toContain("source integrity readiness")}
});
test("the managed signing gap alone keeps a run refused",()=>{
 const g=checkLiveRunGate(base());
 expect(g?.reasons.some(x=>x.includes("engineering-managedSigningAdapter"))).toBe(true);
});
test("engaged kill switch and exhausted daily cap are reported as reasons",()=>{
 const cfg={limits:{killSwitchEnv:"HSI_LIVE_KILL",maxRunsPerDay:2}};
 const g=checkLiveRunGate(base({config:cfg,env:{HSI_LIVE_KILL:"1"},runsToday:()=>2}));
 expect(g?.reasons).toContain("kill switch engaged");expect(g?.reasons).toContain("daily run cap reached");
});

// ---- fixture parity: the live composition must produce the same structural outcome as the fixture runner ----
import {createHash} from "node:crypto";
import {composeLiveRun} from "../src/liveRun";
import {runFixtureInvestigation} from "../src/investigationRunner";
import type {SourceClearanceReceipt} from "../src/researchV2/sourceClearanceReceipt";

const sha=(t:string)=>createHash("sha256").update(t).digest("hex");
const G1="In a synthetic mouse study, gut microbial metabolites were positively associated with immune signalling in colonic regulatory T cells after 7 days (flow cytometry, n=10).";
const G2="In a synthetic human cohort, gut microbial metabolites were not associated with immune signalling in circulating monocytes (ELISA, n=40).";
const claim=(quote:string,polarity:string)=>({subject:{system:"FIXTURE",value:"gut-microbial-metabolites",label:"Gut microbial metabolites"},predicate:"associated_with",object:{system:"FIXTURE",value:"immune-signalling",label:"Immune signalling"},polarity,quote});
const EXTRACTION:Record<string,unknown>={
 [G1]:{claim:claim("gut microbial metabolites were positively associated with immune signalling","supporting"),context:{species:{quote:"mouse"},tissueCompartment:{quote:"colonic"},cellType:{quote:"regulatory T cells"},timing:{quote:"after 7 days"},assay:{quote:"flow cytometry"},sampleSize:{quote:"n=10"},phenotype:{status:"not_reported",reason:"No phenotype is stated."}},note:null},
 [G2]:{claim:claim("gut microbial metabolites were not associated with immune signalling","opposing"),context:{species:{quote:"human"},tissueCompartment:{quote:"circulating"},cellType:{quote:"monocytes"},assay:{quote:"ELISA"},sampleSize:{quote:"n=40"},timing:{status:"not_reported",reason:"No timepoint is stated."},phenotype:{status:"not_reported",reason:"No phenotype is stated."}},note:null},
};
const SPAN:Record<string,string>={[G1]:"gut microbial metabolites were positively associated with immune signalling",[G2]:"gut microbial metabolites were not associated with immune signalling"};
const verdict=(passage:string)=>({verdict:"supports",evidenceSpan:SPAN[passage],reason:"The passage states this directly."});
const QUESTION="How might gut microbial metabolites influence immune signalling?";
const fixture={schemaVersion:"hsi-runner-fixture-1",id:"parity-gut",scope:"gut-immune-metabolic",question:QUESTION,notice:"Synthetic parity fixture",
 searches:{support:[{id:"g1",title:"Synthetic mouse study",locator:"Synthetic results p1",text:G1}],oppose:[{id:"g2",title:"Synthetic human cohort",locator:"Synthetic results p1",text:G2}]},
 recorded:{extraction:{g1:EXTRACTION[G1],g2:EXTRACTION[G2]},entailment:{"verifier-1":{g1:verdict(G1),g2:verdict(G2)},"verifier-2":{g1:verdict(G1),g2:verdict(G2)}}}};

const xml=(p:string)=>`<article><body><sec><title>Results</title><p>${p}</p></sec></body></article>`;
const search=(id:string)=>JSON.stringify({resultList:{result:[{pmcid:id,isOpenAccess:"Y",title:"Synthetic "+id,pmid:"1"+id.slice(3),doi:"10.1/"+id}]}});
const net=((input:unknown)=>{const url=String(input);
 if(url.includes("/search?"))return Promise.resolve(new Response(search(url.includes("no+association")?"PMC202":"PMC101"),{status:200}));
 const id=/rest\/(PMC\d+)\/fullTextXML/.exec(url)?.[1];
 return Promise.resolve(id==="PMC101"?new Response(xml(G1),{status:200,headers:{"content-type":"application/xml"}}):id==="PMC202"?new Response(xml(G2),{status:200,headers:{"content-type":"application/xml"}}):new Response("",{status:404}));
}) as never;
const receiptFor=(sourceId:string,passage:string,sourceVersion:string):SourceClearanceReceipt=>({schemaVersion:"hsi-source-clearance-1",id:"receipt-"+sha(passage).slice(0,12),issuer:"authority:independent",keyId:"key-1",sourceId,sourceVersion,canonicalId:sourceId,passageSha256:sha(passage),permittedActions:["storage","display","comparison","export"],licenceId:"CC-BY-4.0",attribution:"synthetic",identity:"matched",rights:"verified",retraction:"clear",checkedAt:"2026-11-13T00:00:00Z",expiresAt:"2026-11-14T00:00:00Z",signature:"s",...({} as object)} as SourceClearanceReceipt);
const makeConfig=()=>({limits:{maxArticlesPerIntent:2,maxHitsPerIntent:4,maxModelCallsPerRun:40,maxRunsPerDay:5,killSwitchEnv:"HSI_LIVE_KILL"},extractor:{deploymentId:"ext"},verifiers:[{deploymentId:"va"},{deploymentId:"vb"}]});
const dirs:string[]=[];
function liveDeps(over:Record<string,unknown>={},log:{sent:string[]}={sent:[]}){
 const decide=async(b:{sourceId:string;sourceVersion:string;passage:string})=>({state:"cleared",policyRef:"policy:public-oa-v1",receipt:receiptFor(b.sourceId,b.passage,b.sourceVersion)});
 const ops={run:async(i:{task?:string;payload:{passage:string}})=>{log.sent.push(i.payload.passage);return {result:i.task==="extraction"?EXTRACTION[i.payload.passage]:verdict(i.payload.passage)}}};
 const dir=mkdtempSync(join(tmpdir(),"hsi-live-"));dirs.push(dir);
 return {config:makeConfig(),integrityConfig:{},env:{},target:{...target,diseaseScope:"gut-immune-metabolic" as const,question:QUESTION,investigationId:"parity-live"},auditDirectory:dir,fetcher:net,clearance:{decide},ops:ops as never,runsToday:()=>0,sleep:async()=>{},now:()=>"2026-11-13T12:00:00Z",...over};
}
afterAll(()=>{for(const d of dirs)rmSync(d,{recursive:true,force:true})});
const shape=(a:{units:unknown[];comparisons:unknown[];report:{classification:string}[];verifier:{status:string};gaps:string[];consensusEstablished:boolean;scientificApproval:boolean;graphPromotable:boolean;humanReview:{status:string}})=>
 ({units:a.units.length,comparisons:a.comparisons.length,classes:a.report.map(r=>r.classification).sort(),verifier:a.verifier.status,gaps:a.gaps.length,flags:[a.consensusEstablished,a.scientificApproval,a.graphPromotable,a.humanReview.status]});

test("fixture parity: the live composition and the fixture runner agree on structure and flags",async()=>{
 const fix=await runFixtureInvestigation({fixture,verifierIds:["verifier-1","verifier-2"]});
 const live=await composeLiveRun(liveDeps());
 expect(shape(live.audit)).toEqual(shape(fix.audit));
 expect(live.audit.units.length).toBe(2);expect(live.entailments.length).toBe(fix.entailments.length);
 expect(live.audit.graphPromotable).toBe(false);expect(live.audit.scientificApproval).toBe(false);
 expect(live.rejections).toEqual([]);expect(live.modelCalls).toBe(2+2*2);
});
test("an uncleared source never reaches a model",async()=>{
 const log={sent:[] as string[]};
 const deps=liveDeps({clearance:{decide:async()=>({state:"unknown",policyRef:"policy:public-oa-v1",receipt:null})}},log);
 const live=await composeLiveRun(deps);
 expect(log.sent).toEqual([]);expect(live.modelCalls).toBe(0);expect(live.audit.units.length).toBe(0);
});
test("an exhausted model call budget stops model calls rather than overspending",async()=>{
 const log={sent:[] as string[]};
 const deps=liveDeps({},log);(deps.config as ReturnType<typeof makeConfig>).limits.maxModelCallsPerRun=1;
 const live=await composeLiveRun(deps);
 expect(log.sent.length).toBeLessThanOrEqual(1);expect(live.modelCalls).toBeLessThanOrEqual(1);expect(live.audit.graphPromotable).toBe(false);
});
test("an engaged kill switch stops the run before any request or model call",async()=>{
 const log={sent:[] as string[]};
 await expect(composeLiveRun(liveDeps({env:{HSI_LIVE_KILL:"1"}},log))).rejects.toThrow("kill_switch");
 expect(log.sent).toEqual([]);
});
test("the daily cap stops a composed run before any work",async()=>{
 await expect(composeLiveRun(liveDeps({runsToday:()=>5}))).rejects.toThrow("daily_cap");
});
