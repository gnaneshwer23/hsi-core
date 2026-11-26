import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type {Page} from '@playwright/test';

/** LEA-01C: the investigation record (replacing the simulated run) and the removal of invented figures from the landing copy. */
const open=async(page:Page,path:string)=>{await page.goto(path);await page.waitForFunction(()=>!!document.documentElement.dataset.hydrated);};

test('the investigation record says it is a record, not a run, and has ten stages',async({page})=>{
 await open(page,'/platform/workbench');
 const s=page.locator('main');
 await expect(s.getByText('a record, not a run')).toBeVisible();
 await expect(s.getByText('Illustrative',{exact:true}).first()).toBeVisible();
 expect(await s.getByRole('list',{name:'Investigation stages'}).getByRole('button').count()).toBe(10);
 await expect(s.getByText('Stage 01 of 10')).toBeVisible();
 await expect(s.getByText(/running…|complete$/)).toHaveCount(0);
});

test('a failed claim stays out of the output, with its reason, producer and checker',async({page})=>{
 await open(page,'/platform/workbench');
 const s=page.locator('main');
 await s.getByRole('button',{name:'Verify claims'}).click();
 await expect(s.getByText('Stage 06 of 10')).toBeVisible();
 await expect(s.getByText('Not supported',{exact:true})).toBeVisible();
 await expect(s.getByText('The passages report the effect in animal models only')).toBeVisible();
 const aside=s.getByLabel('Provenance of this stage');
 await expect(aside).toContainText('Evidence Verification');
 await expect(aside).toContainText('A human reviewer on disputed or sampled claims');
 await expect(aside).toContainText('A claim that fails stays out of the output');
});

test('mechanism links each carry their own evidence status, and the conflict stage links to the lab',async({page})=>{
 await open(page,'/platform/workbench');
 const s=page.locator('main');
 await s.getByRole('button',{name:'Map relevant mechanisms'}).click();
 const route=s.getByRole('list',{name:/status of each link/});
 await expect(route).toContainText('Supported');await expect(route).toContainText('Association');await expect(route).toContainText('Hypothesis');
 await s.getByRole('button',{name:'Compare conflicting findings'}).click();
 await expect(s.getByRole('link',{name:/contradiction lab/})).toHaveAttribute('href','/platform/contradiction-analysis');
});

test('Next and Previous step through the stages',async({page})=>{
 await open(page,'/platform/workbench');
 const s=page.locator('main');
 await s.getByRole('button',{name:'Next stage →'}).click();
 await expect(s.getByText('Stage 02 of 10')).toBeVisible();
 await s.getByRole('button',{name:'Previous'}).click();
 await expect(s.getByText('Stage 01 of 10')).toBeVisible();
 await expect(s.getByRole('button',{name:'Previous'})).toBeDisabled();
});

test('landing pages carry no invented counts, dates or confidence scores',async({page})=>{
 const bad=/212 records|37 preprints|9 sources|14 Oct|n=12|1,284|\b28%|71%|confidence: (low|moderate)|\d+ linked records|\d+ new murine/i;
 for(const p of ['/','/landing-v2/platform/memory','/landing-v2/platform/discovery-engine','/platform/companion','/landing-v2/platform/workbench']){
  await page.goto(p);
  // the contradiction lab shows percentages computed from its own labelled synthetic studies; everything else must carry none of the old invented figures
  const text=await page.locator('main').evaluate(el=>{const c=el.cloneNode(true) as HTMLElement;c.querySelector('#contradiction')?.remove();return c.textContent??'';});
  expect(text.match(bad)?.[0]??null,p).toBeNull();
 }
});

test('the workbench page shows the same record',async({page})=>{
 await page.goto('/landing-v2/platform/workbench');
 await expect(page.getByText('a record, not a run')).toBeVisible();
 await expect(page.getByRole('button',{name:'Retain the investigation history'})).toBeVisible();
});

test('the record has no overflow at 390px and the redesigned pages pass axe',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await open(page,'/platform/workbench');
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 await page.setViewportSize({width:1280,height:900});
 expect((await new AxeBuilder({page}).include('main').analyze()).violations.map(v=>v.id+':'+v.nodes.length)).toEqual([]);
 for(const p of ['/landing-v2/platform/workbench','/landing-v2/platform/memory','/landing-v2/platform/discovery-engine','/platform/companion']){
  await page.goto(p);await page.waitForTimeout(800);
  expect((await new AxeBuilder({page}).analyze()).violations.map(v=>p+' '+v.id+':'+v.nodes.length)).toEqual([]);
 }
});
