import {describe,it,expect} from "bun:test";
import {normalizePubmed,normalizeEuropePmc,mergeBibliographies} from "../src/bibliographyNormalization";
import type {PubmedResult} from "../src/scientificPubmedRetrieval";
const at="2026-11-11T12:00:00.000Z";
const pub:PubmedResult={query:"How does inflammation affect aging?",retrievedAt:at,total:3,status:"retrieved",disclaimer:"bibliographic leads",hits:[
 {pmid:"12345",title:"Inflammation and aging",authors:[],journal:"Journal",pubdate:"2026",url:"https://pubmed.ncbi.nlm.nih.gov/12345/"},
 {pmid:"12345",title:"Duplicate",authors:[],journal:"Journal",pubdate:"2026",url:"https://pubmed.ncbi.nlm.nih.gov/12345/"},
 {pmid:"oops",title:"Invalid",authors:[],journal:"Journal",pubdate:"2026",url:"https://example.org"}
]};
describe("B-01 bibliographic normalization",()=>{
 it("deduplicates PubMed and rejects invalid identifiers without inventing rights",()=>{
  const x=normalizePubmed(pub);expect(x.sources).toHaveLength(1);expect(x.duplicates).toBe(1);expect(x.rejected).toBe(1);
  expect(x.sources[0]?.licence).toEqual({status:"unknown",identifier:null,passageUsePermitted:false});
  expect(x.sourceHashes["pmid-12345"]).toMatch(/^[a-f0-9]{64}$/);
 });
 it("normalizes Europe PMC DOI and retains source identity",()=>{
  const x=normalizeEuropePmc({resultList:{result:[{pmid:"12345",title:"Study",doi:"10.1000/xyz123"},{pmid:"23456",title:"Second study",doi:"invalid"}]}},at);
  expect(x.sources[0]?.doi).toBe("10.1000/xyz123");expect(x.sources[1]?.doi).toBeNull();
  expect(x.sources[0]?.provenance.datasetId).toBe("europepmc-pmid-12345");
 });
 it("merges duplicate PMIDs across providers without overwriting provenance",()=>{
  const a=normalizePubmed(pub),b=normalizeEuropePmc({resultList:{result:[{pmid:"12345",title:"Other",doi:"10.1000/xyz123"},{pmid:"23456",title:"New"}]}},at);
  const merged=mergeBibliographies(a,b);expect(merged.sources).toHaveLength(2);expect(merged.duplicates).toBe(2);
  expect(merged.sources[0]?.title).toBe("Inflammation and aging");
 });
 it("fails closed on malformed upstream payload",()=>{
  expect(()=>normalizeEuropePmc({},at)).toThrow("Malformed");
  expect(()=>normalizePubmed({...pub,retrievedAt:"bad"})).toThrow("timestamp");
 });
});
