import {expect,it} from "bun:test";
import {resolveContradictionDiseaseScope as scope} from "../src/db/contradictionDiseaseScope";
const edge=(value:string,status="reported",sourceLocator="PMID:example")=>({
 context:{disease:{value,status,sourceLocator}}
});
it("accepts two independently source-located SSc contexts",()=>{
 expect(scope({left:edge("SSc"),right:edge("ssc")})).toBe("ssc");
});
it("rejects mixed disease contexts",()=>{
 expect(()=>scope({left:edge("ssc"),right:edge("ra")})).toThrow();
});
it("rejects unsupported disease and unreported context",()=>{
 expect(()=>scope({left:edge("ibd"),right:edge("ibd")})).toThrow();
 expect(()=>scope({left:edge("ssc","not_reported"),right:edge("ssc")})).toThrow();
});
it("rejects absent source locator and absent edge",()=>{
 expect(()=>scope({left:edge("ssc","reported",""),right:edge("ssc")})).toThrow();
 expect(()=>scope({left:edge("ssc")})).toThrow();
});
