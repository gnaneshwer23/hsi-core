import {expect,test} from "@playwright/test";

/** ING-01: the browser must not call third-party science APIs directly. */
const BLOCKED=/^(https?:\/\/)?([^/]*\.)?(ebi\.ac\.uk|reactome\.org|uniprot\.org|opentargets\.org|openalex\.org|api\.ncbi\.nlm\.nih\.gov)(:|\/|$)/i;

test("science literature uses the same-origin proxy and never calls Europe PMC from the browser",async({page})=>{
 const blocked:string[]=[];
 let literatureCalls=0;
 await page.route("**/*",async r=>{
  const url=r.request().url();
  if(BLOCKED.test(url)){blocked.push(url);return r.abort();}
  if(new URL(url).pathname==="/api/research/literature-search"){
   literatureCalls++;
   return r.fulfill({json:{
    schemaVersion:"hsi-literature-search-1",hitCount:1,nextCursorMark:null,cursorMark:"*",
    records:[{id:"1",source:"MED",pmid:"1",doi:"10.1/x",title:"Stub SSc paper",authorString:"A",journalTitle:"J",pubYear:"2020",url:"https://europepmc.org/article/MED/1",isRetracted:false}],
   }});
  }
  return r.continue();
 });
 await page.goto("/science/literature",{waitUntil:"networkidle"});
 await expect(page.getByRole("status")).toContainText("1 matching records");
 await expect(page.getByRole("heading",{name:"Stub SSc paper"})).toBeVisible();
 expect(literatureCalls).toBeGreaterThan(0);
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
 await expect(page.getByRole("status")).toContainText("Metadata retrieved");
 await expect(page.getByRole("heading",{name:/Protein · P01375/})).toBeVisible();
 expect(metaCalls).toBe(1);
 expect(blocked).toEqual([]);
});
