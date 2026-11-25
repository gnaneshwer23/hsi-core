import {test,expect} from "bun:test";
import {normalizeEvidenceDoi,interpretCrossrefStatus} from "../src/scientificMemoryCrossref";
const doi="10.1234/example";
const payload=(updates:unknown[])=>({status:"ok","message-type":"work",message:{DOI:doi,"updated-by":updates}});
test("normalizes DOI identity",()=>{expect(normalizeEvidenceDoi("https://doi.org/10.1234/EXAMPLE")).toBe(doi);expect(()=>normalizeEvidenceDoi("https://example.org")).toThrow();});
test("absence of notices never establishes current status",()=>{expect(interpretCrossrefStatus(doi,payload([])).status).toBe("unknown");});
test("retraction takes precedence and preserves notice identifiers",()=>{
 const result=interpretCrossrefStatus(doi,payload([{DOI:"10.1234/correction",type:"correction"},{DOI:"10.1234/retraction",type:"retraction"}]));
 expect(result.status).toBe("retracted");expect(result.noticeDois).toEqual(["10.1234/correction","10.1234/retraction"]);expect(result.scientificClaimAllowed).toBe(false);
});
test("rejects mismatched identity and malformed notices",()=>{expect(()=>interpretCrossrefStatus("10.1234/other",payload([]))).toThrow();expect(()=>interpretCrossrefStatus(doi,payload([{type:"retraction"}]))).toThrow();});
