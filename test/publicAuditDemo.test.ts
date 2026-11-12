import {test,expect} from "bun:test";
import {illustrativeAuditOutcome} from "../site/src/components/public/ResearchPublic";
const study=()=>({context:{species:"Human",tissue:"Skin",cellState:"Activated B cell",stage:"Early disease",assay:"Flow cytometry",outcome:"Cell activation"},finding:"Increase" as "Increase"|"Decrease"});
test("public synthetic teaching classes never collapse missingness, context or comparability",()=>{
 const a=study(),b={...study(),finding:"Decrease" as const};
 expect(illustrativeAuditOutcome(a,b,false,false).outcome).toBe("Insufficient evidence");
 expect(illustrativeAuditOutcome(a,{...b,context:{...b.context,species:"Mouse"}},true,true).outcome).toBe("Not directly comparable");
 expect(illustrativeAuditOutcome(a,{...b,context:{...b.context,tissue:"Lung"}},true,true).outcome).toBe("Contextual difference");
 expect(illustrativeAuditOutcome(a,b,true,false).outcome).toBe("Unresolved disagreement");
 expect(illustrativeAuditOutcome(a,b,true,true).reason).toContain("fictional controlled scenario");
 expect(illustrativeAuditOutcome(a,a,true,true).outcome).not.toBe("Genuine contradiction");
});
