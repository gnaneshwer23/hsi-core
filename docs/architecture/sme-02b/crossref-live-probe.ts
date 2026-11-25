// Explicitly dispatched public metadata probe. No database or private inputs.
import {createCrossrefTransport} from "../../../src/scientificMemoryCrossrefTransport";
if(process.env.SME_PUBLIC_CROSSREF_PROBE!=="1")throw Error("Explicit public probe opt-in required");
const cases=[{doi:"10.1016/S0140-6736(97)11096-0",expected:"retracted"},{doi:"10.1038/171737a0",expected:"unknown"}] as const;
const transport=createCrossrefTransport((url,init)=>fetch(url,init),true,10000);
let failed=false;
for(const c of cases){
 const result=await transport.lookup(c.doi);
 if(result.kind!=="metadata"){console.log(JSON.stringify({doi:c.doi,result}));failed=true;continue;}
 const {status,noticeDois}=result.candidate;
 const passed=status===c.expected&&(status!=="retracted"||noticeDois.length>0);
 console.log(JSON.stringify({doi:c.doi,expected:c.expected,status,noticeDois,passed}));
 if(!passed)failed=true;
 await Bun.sleep(1500);
}
if(failed)throw Error("Crossref live validation failed; investigate metadata or transport before activation");
