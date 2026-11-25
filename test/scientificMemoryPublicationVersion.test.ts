import {test,expect} from "bun:test";
import {assessPublicationVersion,type PublicationVersionAssertion} from "../src/scientificMemoryPublicationVersion";
const doi="10.1234/example";
const a:PublicationVersionAssertion={doi,version:"v1",authority:"publisher",locator:"fixture:publisher",publicRecord:true};
const b:PublicationVersionAssertion={...a,authority:"crossref",locator:"fixture:index"};
test("matching publisher and index assertions corroborate but do not authorize ingestion",()=>{
 const r=assessPublicationVersion(doi,"v1",[a,b]);expect(r.state).toBe("corroborated");expect(r.ingestionAllowed).toBe(false);expect(r.scientificClaimAllowed).toBe(false);
});
test("duplicate authority and private assertions cannot satisfy corroboration",()=>{
 expect(assessPublicationVersion(doi,"v1",[a,a]).state).toBe("insufficient");
 expect(assessPublicationVersion(doi,"v1",[a,{...b,publicRecord:false}]).state).toBe("insufficient");
});
test("conflicting DOI or version blocks corroboration",()=>{
 for(const c of [{...b,version:"v2"},{...b,doi:"10.1234/other"}])expect(assessPublicationVersion(doi,"v1",[a,b,c]).state).toBe("ambiguous");
});
test("index agreement alone is insufficient",()=>{expect(assessPublicationVersion(doi,"v1",[b,{...b,authority:"pubmed"}]).state).toBe("insufficient");});
