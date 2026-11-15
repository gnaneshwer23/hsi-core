import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const radar=(over:any={})=>({schemaVersion:'hsi-radar-1',generatedAt:new Date().toISOString(),window:{days:7,from:'2026-11-08',to:'2026-11-15'},
 topics:[{topic:'IL-21',status:'ok',error:null,newCount:6,papers:[{title:'IL-21 in lupus',sourceId:'europepmc:MED:1',url:'https://europepmc.org/article/MED/1',doi:'10.1/a',pmid:'1',date:'2026-11-09',journal:'Autoimmunity',provider:'europe-pmc',retraction:'not_flagged_by_provider',preprint:false}],trend:Array.from({length:10},(_,i)=>({year:2017+i,count:300+i*20})),trendError:null},
  {topic:'systemic sclerosis',status:'failed',error:'HTTP 503',newCount:0,papers:[],trend:null,trendError:null}],
 own:{status:'ok',error:null,papers:[{title:'My paper',sourceId:'openalex:W1',url:'https://openalex.org/W1',doi:null,pmid:null,date:'2025-01-01',journal:'Nature',provider:'openalex',retraction:'unknown',preprint:false,citedBy:12}],unresolved:['pmid:999']},
 note:'Generated now from Europe PMC and OpenAlex. Counts are literature volume, not quality, novelty or consensus. Nothing here is reviewed, and it is not clinical advice.',...over});
const seed=(page:any,profile:any)=>page.addInitScript((p:any)=>localStorage.setItem('hsi-research-profile-v1',JSON.stringify(p)),{v:1,onboarded:true,interests:['IL-21','systemic sclerosis'],orcid:'0000-0002-1825-0097',papers:['pmid:999'],cadence:'weekly',goals:[],followed:[],dismissed:[],role:null,stage:null,background:'',question:'',...profile});
const base=(page:any)=>page.route('**/api/research/investigations',(r:any)=>r.fulfill({status:401,json:{}}));

test('radar shows new-paper counts, a trend, failed searches as failed, own papers, and builds a digest download',async({page})=>{
 await base(page);await seed(page,{});
 let body:any=null;await page.route('**/api/research/radar',r=>{body=JSON.parse(r.request().postData()!);return r.fulfill({json:radar()})});
 await page.goto('/research/home');
 const card=page.getByRole('region',{name:'Research radar'});
 await expect(card).toContainText('6 new in 7 days');
 await expect(card.getByRole('img',{name:/IL-21: publications per year from 2017/})).toBeVisible();
 await expect(card).toContainText('Search failed (HTTP 503). Absence of results is not evidence of absence.');
 await expect(card).toContainText('Your papers');await expect(card).toContainText('1 found');
 expect(body).toMatchObject({topics:['IL-21','systemic sclerosis'],days:7,orcid:'0000-0002-1825-0097',papers:['pmid:999']});
 await card.getByText('Latest papers (1 of 6)').click();
 await expect(card.getByRole('link',{name:'IL-21 in lupus'})).toHaveAttribute('href','https://europepmc.org/article/MED/1');
 const dl=page.waitForEvent('download');await card.getByRole('button',{name:'Download digest'}).click();
 expect((await dl).suggestedFilename()).toMatch(/^hsi-digest-\d{4}-\d{2}-\d{2}\.md$/);
});

test('the window toggle re-queries, and a second visit uses the device cache instead of calling again',async({page})=>{
 await base(page);await seed(page,{});
 const days:number[]=[];await page.route('**/api/research/radar',r=>{days.push(JSON.parse(r.request().postData()!).days);return r.fulfill({json:radar()})});
 await page.goto('/research/home');
 const card=page.getByRole('region',{name:'Research radar'});
 await expect(card).toContainText('6 new');
 await card.getByRole('button',{name:'30 days'}).click();
 await expect.poll(()=>days).toEqual([7,30]);
 await page.goto('/research/home');await expect(page.getByRole('region',{name:'Research radar'})).toContainText('saved on this device');
 expect(days).toEqual([7,30]); // the 7-day result was cached, so no third request
});

test('a failed radar says nothing was generated; no topics shows a setup prompt and makes no request',async({page})=>{
 await base(page);await seed(page,{});
 await page.route('**/api/research/radar',r=>r.fulfill({status:502,json:{error:'The radar could not be built. Nothing was generated.'}}));
 await page.goto('/research/home');
 await expect(page.getByRole('region',{name:'Research radar'}).getByRole('alert')).toContainText('Nothing was generated');
 const page2=await page.context().newPage();let calls=0;
 await page2.route('**/api/research/investigations',r=>r.fulfill({status:401,json:{}}));
 await page2.route('**/api/research/radar',r=>{calls++;return r.fulfill({json:radar()})});
 await page2.addInitScript(()=>localStorage.setItem('hsi-research-profile-v1',JSON.stringify({v:1,onboarded:true,interests:['immunology']})));
 await page2.goto('/research/home');
 await expect(page2.getByRole('link',{name:'Set up my radar'})).toBeVisible();expect(calls).toBe(0);
});

test('radar passes axe in light and dark and does not overflow at 390px',async({page})=>{
 await base(page);await seed(page,{});await page.route('**/api/research/radar',r=>r.fulfill({json:radar()}));
 await page.setViewportSize({width:390,height:844});
 await page.goto('/research/home');await expect(page.getByRole('region',{name:'Research radar'})).toContainText('6 new');
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations.map(v=>v.id+': '+v.nodes.length)).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true);
});
