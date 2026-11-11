import {expect,it} from "bun:test";
import {createContradictionRecord,appendIndependentContradictionReview} from "../src/db/transactionalContradictionStore";
const config={databaseUrl:"postgres://invalid",runtimeDatabaseUrl:"postgres://invalid-runtime",serverSessionToken:null,stagingActivationApproved:false};
it("denies contradiction creation before touching database",async()=>{
 await expect(createContradictionRecord({...config,id:"x",tenantId:"t",left:{} as never,right:{} as never}))
 .rejects.toThrow("not activated");
});
it("denies independent review before touching database",async()=>{
 await expect(appendIndependentContradictionReview({...config,contradictionId:"x",tenantId:"t",
 decision:"approved",rationale:"test",sourceLocator:"source",reviewedAt:"2026-11-11T00:00:00Z",scope:"ssc"}))
 .rejects.toThrow("not activated");
});
