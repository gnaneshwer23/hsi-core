import {test,expect} from "bun:test";
import {interpretEuropePmcIdentity} from "../src/scientificMemoryEuropePmc";
const row={source:"MED",id:"123",pmid:"123",doi:"10.1234/example",pmcid:"PMC456"};
const payload=(r:unknown)=>({hitCount:1,resultList:{result:[r]}});
test("exact MED identity projects identifiers without trusting status",()=>{
 expect(interpretEuropePmcIdentity("123",payload(row))).toEqual({pmid:"123",doi:"10.1234/example",pmcid:"PMC456",status:"unknown",ingestionAllowed:false,scientificClaimAllowed:false});
});
test("rejects wrong source, identity and ambiguous results",()=>{
 for(const r of [{...row,source:"PMC"},{...row,id:"456"},{...row,pmid:"456"},{...row,pmcid:"invalid"}])expect(()=>interpretEuropePmcIdentity("123",payload(r))).toThrow();
 expect(()=>interpretEuropePmcIdentity("123",{hitCount:2,resultList:{result:[row,row]}})).toThrow();
});
test("missing optional identifiers stay absent",()=>{const r=interpretEuropePmcIdentity("123",payload({source:"MED",id:"123",pmid:"123"}));expect(r.doi).toBeNull();expect(r.pmcid).toBeNull();});
