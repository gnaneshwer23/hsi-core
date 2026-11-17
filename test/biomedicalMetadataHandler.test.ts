import {beforeEach,describe,expect,test} from "bun:test";
import {handleBiomedicalMetadata,resetBiomedicalMetadataLimiter} from "../src/server/biomedicalMetadataHandler";

beforeEach(()=>resetBiomedicalMetadataLimiter());

const post=(b:unknown,h:Record<string,string>={})=>new Request("https://hsi.example/api/research/biomedical-metadata",{method:"POST",headers:{"content-type":"application/json",...h},body:JSON.stringify(b)});

describe("biomedical metadata handler",()=>{
 test("returns UniProt and Reactome metadata via the server",async()=>{
  const urls:string[]=[];
  const fetcher=(async(u:any)=>{
   urls.push(String(u));
   if(String(u).includes("uniprot"))return new Response(JSON.stringify({primaryAccession:"P01375",proteinDescription:{recommendedName:{fullName:{value:"Tumor necrosis factor"}}},organism:{scientificName:"Homo sapiens",taxonId:9606},genes:[{geneName:{value:"TNF"}}],entryType:"UniProtKB reviewed (Swiss-Prot)"}),{status:200});
   if(String(u).includes("reactome"))return new Response(JSON.stringify({stId:"R-HSA-199420",displayName:"Pathway X",schemaClass:"Pathway",species:[{displayName:"Homo sapiens"}]}),{status:200});
   return new Response("?",{status:404});
  }) as any;
  const r=await handleBiomedicalMetadata(post({accession:"P01375",stableId:"R-HSA-199420"}),{},{fetcher});
  const b:any=await r.json();
  expect(r.status).toBe(200);expect(b.ok).toBe(true);expect(b.protein.accession).toBe("P01375");expect(b.pathway.id).toBe("R-HSA-199420");
  expect(urls.some(u=>u.includes("uniprot.org"))).toBe(true);expect(urls.some(u=>u.includes("reactome.org"))).toBe(true);
 });

 test("rejects foreign origin and invalid bodies before provider work",async()=>{
  let calls=0;const fetcher=(async()=>{calls++;return new Response("x")}) as any;
  expect((await handleBiomedicalMetadata(post({accession:"P01375",stableId:"R-HSA-199420"},{origin:"https://evil.example"}),{HSI_PUBLIC_ORIGIN:"https://hsi.example"},{fetcher})).status).toBe(403);
  expect((await handleBiomedicalMetadata(post({accession:"",stableId:""}),{},{fetcher})).status).toBe(400);
  expect(calls).toBe(0);
 });
});
