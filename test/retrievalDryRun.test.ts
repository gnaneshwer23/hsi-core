import {expect,test} from "bun:test";
import {runRetrievalDryRun} from "../src/retrievalDryRun";

const P1="In a synthetic mouse study, gut microbial metabolites were positively associated with immune signalling in colonic regulatory T cells after 7 days (flow cytometry, n=10).";
const P2="In a human cohort, serum monocytes were assayed by ELISA at baseline (n=12) to relate gut microbial metabolites to immune signalling.";
const xml=(...p:string[])=>`<article><body><sec><title>Results</title>${p.map(x=>`<p>${x}</p>`).join("")}</sec></body></article>`;
const search=(id:string)=>JSON.stringify({resultList:{result:[{pmcid:id,isOpenAccess:"Y",title:"t"},{pmcid:"PMC999",isOpenAccess:"N"}]}});
const calls:string[]=[];
const net=((input:unknown)=>{const url=String(input);calls.push(url);
 if(url.includes("/search?"))return Promise.resolve(new Response(search(url.includes("no+association")?"PMC202":"PMC101")));
 const id=/rest\/(PMC\d+)\/fullTextXML/.exec(url)?.[1];
 return Promise.resolve(id==="PMC101"?new Response(xml(P1,P2),{headers:{"content-type":"application/xml"}}):new Response("",{status:404}));
}) as never;
const Q="How might gut microbial metabolites influence immune signalling?";

test("refuses without a source terms reference, before any request",async()=>{
 calls.length=0;await expect(runRetrievalDryRun({question:Q,termsRef:"x",fetcher:net,sleep:async()=>{}})).rejects.toThrow("terms reference");expect(calls).toEqual([]);
});
test("reports counts, cue coverage and failures without any passage text",async()=>{
 calls.length=0;const r=await runRetrievalDryRun({question:Q,termsRef:"terms:europepmc-oa-v1",fetcher:net,sleep:async()=>{}});
 const support=r.intents.find(i=>i.intent==="support")!,oppose=r.intents.find(i=>i.intent==="oppose")!;
 expect(support).toMatchObject({articlesFound:2,openAccessWithPmcid:1,fetched:1,fetchFailed:0,paragraphs:2,selected:2});
 expect(oppose).toMatchObject({openAccessWithPmcid:1,fetched:0,fetchFailed:1});
 expect(r.comparableByCuesOnly).toEqual({paragraphsWithAllCues:1,of:2}); // P1 lacks an experimental-system cue, P2 has every cue
 expect(r.cueCoverage.find(c=>c.field==="experimentalSystem")).toMatchObject({selectedWithCue:1,of:2});
 expect(r.cueCoverage.find(c=>c.field==="sampleSize")).toMatchObject({selectedWithCue:2,of:2,rate:1});
 expect(r.clearance).toEqual({assessed:false,outcomes:{}});
 const text=JSON.stringify(r);expect(text).not.toContain("colonic");expect(text).not.toContain("flow cytometry");
 expect(r.requestsMade).toBe(calls.length);expect(calls.every(u=>new URL(u).hostname==="www.ebi.ac.uk")).toBe(true);
});
test("with a clearance decider, outcomes are tallied by state and errors are counted, never thrown",async()=>{
 let n=0;const clearance={decide:async()=>{n++;if(n===2)throw Error("x");return {state:n===1?"cleared":"unknown",receipt:null,policyRef:"p"}}};
 const r=await runRetrievalDryRun({question:Q,termsRef:"terms:europepmc-oa-v1",fetcher:net,clearance,sleep:async()=>{}});
 expect(r.clearance.assessed).toBe(true);expect(r.clearance.outcomes).toEqual({cleared:1,error:1});
});
test("a disallowed host or a failing search stops the run with a generic error",async()=>{
 await expect(runRetrievalDryRun({question:Q,termsRef:"terms:europepmc-oa-v1",fetcher:(async()=>new Response("",{status:500})) as never,sleep:async()=>{}})).rejects.toThrow("HTTP 500");
});
