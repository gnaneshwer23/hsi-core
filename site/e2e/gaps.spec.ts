import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const counts=(over:any={})=>({schemaVersion:'hsi-cooccurrence-1',generatedAt:new Date().toISOString(),
 terms:[{term:'IL-21',count:4834,error:null,queryUrl:'https://europepmc.org/search?query=a'},{term:'systemic sclerosis',count:22733,error:null,queryUrl:'u'},{term:'fibroblast activation',count:6580,error:null,queryUrl:'u'},{term:'T follicular helper cells',count:2451,error:null,queryUrl:'u'}],
 pairs:[{a:'IL-21',b:'fibroblast activation',joint:2,error:null,queryUrl:'https://europepmc.org/search?query=pair1'},{a:'IL-21',b:'systemic sclerosis',joint:31,error:null,queryUrl:'https://europepmc.org/search?query=pair2'},{a:'IL-21',b:'T follicular helper cells',joint:548,error:null,queryUrl:'https://europepmc.org/search?query=pair3'},{a:'systemic sclerosis',b:'fibroblast activation',joint:null,error:'HTTP 503',queryUrl:'https://europepmc.org/search?query=pair4'}],
 note:'Counts are records whose title or abstract mention the terms, from Europe PMC. They measure attention, not quality or novelty. A low joint count can mean a real gap, different wording, or little interest.',...over});
const seed=(page:any,interests:string[])=>page.addInitScript((i:string[])=>localStorage.setItem('hsi-research-profile-v1',JSON.stringify({v:1,onboarded:true,interests:i,orcid:null,papers:[],cadence:'off',goals:[],followed:[],dismissed:[],role:null,stage:null,background:'',question:''})),interests);
const base=async(page:any)=>{await page.route('**/api/research/investigations',(r:any)=>r.fulfill({status:401,json:{}}));await page.route('**/api/research/radar',(r:any)=>r.fulfill({status:502,json:{error:'off'}}))};

test('gap finder keeps recorded graph gaps and the literature heuristic apart, and only counts when asked',async({page})=>{
 await base(page);await seed(page,['IL-21','systemic sclerosis']);
 let body:any=null,calls=0;await page.route('**/api/research/cooccurrence',r=>{calls++;body=JSON.parse(r.request().postData()!);return r.fulfill({json:counts()})});
 await page.goto('/research/home');
 const card=page.getByRole('region',{name:'Gap finder'});
 await expect(card.getByText('Recorded in the published graph')).toBeVisible();
 await expect(card.getByText('Editorial candidate')).toBeVisible();
 await expect(card).toContainText('pairs ready to count');
 expect(calls).toBe(0);
 await card.getByRole('button',{name:'Find gaps'}).click();
 await expect(card.getByText('Under-explored intersection').first()).toBeVisible();
 expect(body.terms.length).toBeGreaterThanOrEqual(2);expect(body.pairs.length).toBeGreaterThanOrEqual(1);
 const row=card.getByRole('listitem').filter({hasText:'IL-21 × fibroblast activation'});
 await expect(row.getByRole('img',{name:/2 records mention both/})).toBeVisible();
 await row.getByText('Counts and how to check').click();
 await expect(row).toContainText('4,834');
 await expect(row.getByRole('link',{name:'Check this search on Europe PMC'})).toHaveAttribute('href','https://europepmc.org/search?query=pair1');
 await expect(card).toContainText('Count unavailable');await expect(card).toContainText('HTTP 503');
 await expect(card).toContainText('a prompt to look, not a finding');
});

test('a failed count says nothing was counted; no topics shows a prompt and calls nothing',async({page})=>{
 await base(page);await seed(page,['IL-21','systemic sclerosis']);
 await page.route('**/api/research/cooccurrence',r=>r.fulfill({status:502,json:{error:'The counts could not be built. Nothing was generated.'}}));
 await page.goto('/research/home');
 const card=page.getByRole('region',{name:'Gap finder'});
 await card.getByRole('button',{name:'Find gaps'}).click();
 await expect(card.getByRole('alert')).toContainText('Nothing was counted, so no gap is implied');
 const p2=await page.context().newPage();let calls=0;await base(p2);await seed(p2,['immunology']);
 await p2.route('**/api/research/cooccurrence',r=>{calls++;return r.fulfill({json:counts()})});
 await p2.goto('/research/home');
 await expect(p2.getByRole('region',{name:'Gap finder'}).getByRole('link',{name:'Add topics'})).toBeVisible();expect(calls).toBe(0);
});

test('results are cached on this device and the card passes axe in light and dark at 390px',async({page})=>{
 await base(page);await seed(page,['IL-21','systemic sclerosis']);
 let calls=0;await page.route('**/api/research/cooccurrence',r=>{calls++;return r.fulfill({json:counts()})});
 await page.setViewportSize({width:390,height:844});
 await page.goto('/research/home');
 await page.getByRole('region',{name:'Gap finder'}).getByRole('button',{name:'Find gaps'}).click();
 await expect(page.getByRole('region',{name:'Gap finder'})).toContainText('Under-explored');
 const axe=async()=>{await page.evaluate(()=>window.scrollTo(0,0));const r=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();expect(r.violations.map(v=>v.id+': '+v.nodes.map(n=>n.html.slice(0,90)+' '+JSON.stringify((n.any[0]?.data as any)?.fgColor)+JSON.stringify((n.any[0]?.data as any)?.bgColor)).join(' | '))).toEqual([])};
 await axe();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true);
 await page.getByRole('button',{name:'Appearance'}).click();await page.getByRole('button',{name:'Dark',exact:true}).click();await page.getByRole('button',{name:'Appearance'}).click();
 await page.waitForTimeout(400);await axe();
 await page.reload();
 await page.getByRole('region',{name:'Gap finder'}).getByRole('button',{name:'Find gaps'}).click();
 await expect(page.getByRole('region',{name:'Gap finder'})).toContainText('saved on this device');expect(calls).toBe(1);
});
