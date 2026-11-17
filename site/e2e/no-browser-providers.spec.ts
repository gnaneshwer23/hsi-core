import {expect,test} from "@playwright/test";

/** ING-01: the browser must not call third-party science APIs directly. */
const BLOCKED=/^(https?:\/\/)?([^/]*\.)?(ebi\.ac\.uk|reactome\.org|uniprot\.org|opentargets\.org|openalex\.org|api\.ncbi\.nlm\.nih\.gov)(:|\/|$)/i;

test("science literature uses the same-origin proxy and never calls Europe PMC from the browser",async({page})=>{
 const blocked:string[]=[];
 let literatureCalls=0;
 let relatedCalls=0;
 await page.route("**/*",async r=>{
  const url=r.request().url();
  if(BLOCKED.test(url)){blocked.push(url);return r.abort();}
  const path=new URL(url).pathname;
  if(path==="/api/research/literature-search"){
   literatureCalls++;
   return r.fulfill({json:{
    schemaVersion:"hsi-literature-search-1",hitCount:1,nextCursorMark:null,cursorMark:"*",
    records:[{id:"1",source:"MED",pmid:"1",doi:"10.1/x",title:"Stub SSc paper",authorString:"A",journalTitle:"J",pubYear:"2020",url:"https://europepmc.org/article/MED/1",isRetracted:false}],
   }});
  }
  if(path==="/api/research/related-works"){
   relatedCalls++;
   return r.fulfill({json:{
    schemaVersion:"hsi-related-works-1",status:"ok",error:null,
    seed:{title:"Stub SSc paper",sourceId:"openalex:W1",url:"https://openalex.org/W1",doi:"10.1/x",pmid:"1"},
    related:[{title:"Related stub",sourceId:"openalex:W2",url:"https://openalex.org/W2",doi:null,pmid:null,date:"2019-01-01",journal:"J",citedBy:1,retraction:"not_flagged_by_provider",preprint:false,relation:"openalex_related_works"}],
    unresolvedRelatedIds:[],
    note:"OpenAlex related_works metadata only.",
   }});
  }
  return r.continue();
 });
 await page.goto("/science/literature",{waitUntil:"networkidle"});
 await expect(page.getByRole("status").first()).toContainText("1 matching records");
 await expect(page.getByRole("heading",{name:"Stub SSc paper"})).toBeVisible();
 await page.getByRole("button",{name:"View evidence dossier"}).click();
 await expect(page.getByRole("heading",{name:"Related works"})).toBeVisible();
 await expect(page.getByText("Related stub")).toBeVisible();
 expect(literatureCalls).toBeGreaterThan(0);
 expect(relatedCalls).toBeGreaterThan(0);
 expect(blocked).toEqual([]);
});

test("scientific workbench biomedical lookup stays same-origin",async({page})=>{
 const blocked:string[]=[];
 let metaCalls=0;
 await page.route("**/*",async r=>{
  const url=r.request().url();
  if(BLOCKED.test(url)){blocked.push(url);return r.abort();}
  if(new URL(url).pathname==="/api/research/biomedical-metadata"){
   metaCalls++;
   return r.fulfill({json:{
    ok:true,schemaVersion:"hsi-biomedical-metadata-1",
    protein:{accession:"P01375",name:"TNF",url:"https://www.uniprot.org/uniprotkb/P01375",retrievedAt:"2026-11-17T00:00:00.000Z"},
    pathway:{id:"R-HSA-199420",name:"Pathway",url:"https://reactome.org/content/detail/R-HSA-199420",retrievedAt:"2026-11-17T00:00:00.000Z"},
   }});
  }
  return r.continue();
 });
 await page.goto("/research/scientific-workbench",{waitUntil:"networkidle"});
 await page.getByRole("button",{name:"Retrieve public metadata"}).click();
 await expect(page.locator("#biomedical-metadata-status")).toContainText("Metadata retrieved");
 await expect(page.getByRole("heading",{name:/Protein · P01375/})).toBeVisible();
 expect(metaCalls).toBe(1);
 expect(blocked).toEqual([]);
});
