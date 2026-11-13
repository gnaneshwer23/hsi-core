/**
 * SYNTHETIC fixtures for demonstrating and testing source integrity decisions. Every identifier, title, licence and policy here is
 * invented; the demonstration policy is signed with a throwaway key and carries a "DEMO ONLY" approver. None of this is a human
 * approval, a real source, or authority to process any real publication.
 */
import {generateKeyPairSync,type KeyObject} from "node:crypto";
import {signPolicy,type ClearancePolicy,type PolicyAuthority,type PolicyLicenceRule,type SourceUse} from "./researchV2/clearancePolicy";
import type {FetchLike} from "./fetchLike";
import type {SourceRef} from "./researchV2/sourceEvidence";

export const DEMO_NOTICE="DEMONSTRATION: synthetic sources and a throwaway demo key. This is not a human policy approval and authorises nothing real.";
export type DemoScenario={
 id:string;label:string;ref:SourceRef;
 epmc:{status?:number;record?:Record<string,unknown>|null};
 crossref:{status?:number;licence?:{URL:string;"content-version":string;"delay-in-days"?:number}[];updatedBy?:{type:string}[];doi?:string};
};
const rec=(n:number,over:Record<string,unknown>={})=>({id:`9000000${n}`,source:"MED",pmid:`9000000${n}`,pmcid:`PMC900000${n}`,doi:`10.9999/synthetic.00${n}`,title:`Synthetic source ${n} (not a real publication)`,authorString:"Synthetic A.",journalTitle:"Journal of Synthetic Examples",pubYear:"2026",isRetracted:"N",isOpenAccess:"Y",inEPMC:"Y",inPMC:"Y",license:"cc by",...over});
const ref=(n:number):SourceRef=>({pmid:`9000000${n}`});
const cc=(path:string)=>({URL:`https://creativecommons.org/${path}`,"content-version":"vor","delay-in-days":0});
export const DEMO_SCENARIOS:readonly DemoScenario[]=Object.freeze([
 {id:"permissive-cc-by",label:"Permissive CC BY 4.0, no notices",ref:ref(1),epmc:{record:rec(1)},crossref:{licence:[cc("licenses/by/4.0/")]}},
 {id:"permissive-cc0",label:"CC0, no notices",ref:ref(2),epmc:{record:rec(2,{license:"cc0"})},crossref:{licence:[cc("publicdomain/zero/1.0/")]}},
 {id:"restricted-publisher",label:"Publisher-specific terms (restricted)",ref:ref(3),epmc:{record:rec(3,{license:null,isOpenAccess:"N"})},crossref:{licence:[{URL:"https://publisher.example/terms","content-version":"vor"}]}},
 {id:"noncommercial",label:"CC BY-NC (policy prohibits export)",ref:ref(4),epmc:{record:rec(4,{license:"cc by-nc"})},crossref:{licence:[cc("licenses/by-nc/4.0/")]}},
 {id:"missing-licence",label:"No licence metadata anywhere",ref:ref(5),epmc:{record:rec(5,{license:null})},crossref:{licence:[]}},
 {id:"ambiguous-rights",label:"Providers disagree (CC BY vs CC BY-NC)",ref:ref(6),epmc:{record:rec(6,{license:"cc by-nc"})},crossref:{licence:[cc("licenses/by/4.0/")]}},
 {id:"label-only",label:"Unversioned label only",ref:ref(7),epmc:{record:rec(7)},crossref:{licence:[]}},
 {id:"tdm-only",label:"Text-and-data-mining terms only",ref:ref(8),epmc:{record:rec(8,{license:null})},crossref:{licence:[{URL:"https://publisher.example/tdm","content-version":"tdm"}]}},
 {id:"retracted",label:"Retracted (CC BY otherwise)",ref:ref(9),epmc:{record:rec(9,{isRetracted:"Y",pubTypeList:{pubType:["Retracted Publication"]}})},crossref:{licence:[cc("licenses/by/4.0/")],updatedBy:[{type:"retraction"}]}},
 {id:"corrected",label:"Erratum published (CC BY otherwise)",ref:{pmid:"90000010"},epmc:{record:{...rec(1),id:"90000010",pmid:"90000010",pmcid:"PMC9000010",doi:"10.9999/synthetic.010",pubTypeList:{pubType:["Journal Article","Published Erratum"]}}},crossref:{doi:"10.9999/synthetic.010",licence:[cc("licenses/by/4.0/")],updatedBy:[{type:"correction"}]}},
 {id:"expression-of-concern",label:"Expression of concern (CC BY otherwise)",ref:{pmid:"90000011"},epmc:{record:{...rec(1),id:"90000011",pmid:"90000011",pmcid:"PMC9000011",doi:"10.9999/synthetic.011"}},crossref:{doi:"10.9999/synthetic.011",licence:[cc("licenses/by/4.0/")],updatedBy:[{type:"expression_of_concern"}]}},
 {id:"crossref-outage",label:"Crossref unavailable (CC BY otherwise)",ref:{pmid:"90000012"},epmc:{record:{...rec(1),id:"90000012",pmid:"90000012",pmcid:"PMC9000012",doi:"10.9999/synthetic.012"}},crossref:{status:503,doi:"10.9999/synthetic.012"}},
 {id:"europepmc-outage",label:"Europe PMC unavailable",ref:ref(13),epmc:{status:503},crossref:{licence:[cc("licenses/by/4.0/")]}},
 {id:"identity-conflict",label:"PMID and DOI point to different records",ref:{pmid:"90000001",doi:"10.9999/synthetic.002"},epmc:{record:rec(1)},crossref:{licence:[cc("licenses/by/4.0/")]}},
 {id:"unknown-source",label:"No provider record",ref:{pmid:"90000099"},epmc:{record:null},crossref:{}},
]);

/** Replays a scenario's provider responses. No network. */
export function demoFetcher(scenario:DemoScenario):FetchLike{
 return (async(input:unknown)=>{
  const url=String(input);
  if(url.includes("/europepmc/webservices/rest/search")){
   if(scenario.epmc.status)return new Response("",{status:scenario.epmc.status});
   const result=scenario.epmc.record?[scenario.epmc.record]:[];
   return Response.json({hitCount:result.length,nextCursorMark:"*",resultList:{result}});
  }
  if(url.startsWith("https://api.crossref.org/works/")){
   if(scenario.crossref.status)return new Response("",{status:scenario.crossref.status});
   const doi=scenario.crossref.doi??String(scenario.epmc.record?.doi??scenario.ref.doi??"");
   if(!doi||scenario.crossref.licence===undefined&&!scenario.crossref.updatedBy)return new Response("",{status:404});
   return Response.json({status:"ok",message:{DOI:doi,title:["Synthetic"],publisher:"Synthetic Publisher",license:scenario.crossref.licence??[],...(scenario.crossref.updatedBy?{"updated-by":scenario.crossref.updatedBy}:{})}});
  }
  return new Response("",{status:404});
 }) as FetchLike;
}

const rule=(family:PolicyLicenceRule["family"],authorisedUses:SourceUse[],prohibitedUses:SourceUse[]=[],acceptUnversionedLabel=false):PolicyLicenceRule=>({family,authorisedUses,prohibitedUses,acceptUnversionedLabel});
const ALL:SourceUse[]=["retrieval","full_text_processing","model_transmission","storage","display","comparison","export"];
export function buildDemoPolicy(opts:{now:number;privateKey:KeyObject;issuer?:string;keyId?:string;version?:number;windowDays?:number}):ClearancePolicy{
 const issuer=opts.issuer??"demo:policy-approver",keyId=opts.keyId??"demo-key",from=new Date(opts.now-3600_000).toISOString(),to=new Date(opts.now+(opts.windowDays??30)*86_400_000).toISOString();
 return signPolicy({schemaVersion:"hsi-source-clearance-policy-1",policyId:"demo-policy",version:opts.version??1,effectiveFrom:from,expiresAt:to,
  rules:{licences:[rule("cc0",ALL),rule("cc-by",ALL),rule("cc-by-nc",["retrieval","full_text_processing","storage","display","comparison"],["export","model_transmission"]),rule("publisher-specific",["retrieval"])],tdmOnly:"review",correction:"review",expressionOfConcern:"review",maxEvidenceAgeMs:3600_000,receiptValidityMs:12*3600_000,requiredProviders:["europe_pmc","crossref"]},
  approval:{approvedBy:"DEMO ONLY (not a human approval)",role:"demonstration",approvalRef:"demo:not-a-real-approval",approvedAt:new Date(opts.now-1800_000).toISOString(),issuer,keyId}},opts.privateKey);
}
export function demoKeyPair(){const k=generateKeyPairSync("ed25519");return {privateKey:k.privateKey,publicKey:k.publicKey}}
export const demoAuthority=(publicKey:KeyObject,issuer="demo:policy-approver",keyId="demo-key"):PolicyAuthority=>({issuer,keyId,publicKey});
