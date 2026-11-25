import {test,expect} from "bun:test";
import {projectEuropePmcCore} from "../src/scientificMemoryEuropePmcCore";
const payload=(entries?:unknown)=>({hitCount:1,resultList:{result:[{source:"MED",id:"123",pmid:"123",...(entries===undefined?{}:{commentCorrectionList:{commentCorrection:entries}})}]}});
test("maps directional notices",()=>{const r=projectEuropePmcCore("123",payload([{type:"Retraction in",source:"MED",id:"456"},{type:"Erratum in",source:"MED",id:"789"}]));expect(r.status).toBe("retracted");expect(r.noticePmids).toEqual(["456","789"]);expect(r.liveSchemaVerified).toBe(false);});
test("missing and reverse notices remain unknown",()=>{expect(projectEuropePmcCore("123",payload()).status).toBe("unknown");const r=projectEuropePmcCore("123",payload([{type:"Retraction of",source:"MED",id:"456"}]));expect(r.status).toBe("unknown");expect(r.unmappedNoticeCount).toBe(1);});
test("rejects malformed lists and unsupported adverse identities",()=>{expect(()=>projectEuropePmcCore("123",payload({}))).toThrow();expect(()=>projectEuropePmcCore("123",payload([{type:"Retraction in",source:"PMC",id:"PMC456"}]))).toThrow();});
