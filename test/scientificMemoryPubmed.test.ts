import {test,expect} from "bun:test";
import {interpretPubmedStatus} from "../src/scientificMemoryPubmed";
const pmid="123456";
test("retraction takes precedence over correction",()=>{
 const r=interpretPubmedStatus(pmid,{pmid,commentsCorrections:[{refType:"ErratumIn",pmid:"234567"},{refType:"RetractionIn",pmid:"345678"}]});
 expect(r.status).toBe("retracted");expect(r.noticePmids).toEqual(["234567","345678"]);expect(r.ingestionAllowed).toBe(false);
});
test("reverse notice links do not mark notice itself retracted",()=>{
 expect(interpretPubmedStatus(pmid,{pmid,commentsCorrections:[{refType:"RetractionOf",pmid:"234567"}]}).status).toBe("unknown");
});
test("missing notice identifier does not hide adverse status",()=>{expect(interpretPubmedStatus(pmid,{pmid,commentsCorrections:[{refType:"ExpressionOfConcernIn"}]}).status).toBe("expression_of_concern");});
test("empty links remain unknown and identity mismatch fails",()=>{
 expect(interpretPubmedStatus(pmid,{pmid,commentsCorrections:[]}).status).toBe("unknown");
 expect(()=>interpretPubmedStatus(pmid,{pmid:"987654",commentsCorrections:[]})).toThrow();
});
