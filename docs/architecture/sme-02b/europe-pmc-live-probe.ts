import {createEuropePmcTransport} from "../../../src/scientificMemoryEuropePmcTransport";
if(process.env.SME_PUBLIC_EUROPE_PMC_PROBE!=="1")throw Error("Explicit opt-in required");
const t=createEuropePmcTransport(fetch,true,10000);
for(const [id,expected] of [["9500320","retracted"],["13054692","unknown"]] as const){
 const r=await t.lookup(id);
 if(r.kind!=="metadata")throw Error("Provider unavailable: "+id+" "+r.reason);
 console.log(JSON.stringify({id,status:r.candidate.status,noticePmids:r.candidate.noticePmids,unmapped:r.candidate.unmappedNoticeCount}));
 if(r.candidate.status!==expected||r.candidate.ingestionAllowed)throw Error("Unexpected provider mapping: "+id);
 await new Promise(resolve=>setTimeout(resolve,1500));
}
