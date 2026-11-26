import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type {Page} from '@playwright/test';
/** Opens the homepage and waits until it is hydrated, so clicks are not lost to the prerendered markup. */
const home=async(page:Page)=>{await page.goto('/');await page.waitForFunction(()=>document.documentElement.dataset.hydrated==='home');};

/** LEA-01A: the interactive biological atlas on the /landing-v2 home. Data is illustrative and must say so. */
test('atlas states that it is illustrative and lists its evidence statuses',async({page})=>{
 await home(page);
 const atlas=page.locator('#atlas');
 await expect(atlas.getByText('Illustrative',{exact:true}).first()).toBeVisible();
 await expect(atlas.getByText('not an HSI output',{exact:false})).toBeVisible();
 for(const s of ['Supported in model systems','Association only','Hypothesis','Unresolved conflict'])await expect(atlas.getByText(s,{exact:true}).first()).toBeVisible();
});

test('choosing a pathway lists its steps, domains crossed and unresolved conflicts',async({page})=>{
 await home(page);
 const atlas=page.locator('#atlas');
 await atlas.getByRole('button',{name:'Gut barrier and brain inflammation'}).click();
 await expect(atlas.getByText(/crosses 4 domains · 2 unresolved conflicts/)).toBeVisible();
 await expect(atlas.getByRole('listitem').filter({hasText:'Intestinal barrier → IL-6'})).toBeVisible();
 await atlas.getByRole('button',{name:/Neuroinflammation → Parkinson/}).click();
 await expect(atlas.locator('[aria-live]').getByText('Whether it drives neurodegeneration or follows it is unresolved.')).toBeVisible();
});

test('the same pathway button toggles back to the whole atlas',async({page})=>{
 await home(page);
 const atlas=page.locator('#atlas');
 const b=atlas.getByRole('button',{name:'Microbial metabolites and regulatory T cells'});
 await expect(b).toHaveAttribute('aria-pressed','true');
 await b.click();
 await expect(b).toHaveAttribute('aria-pressed','false');
 await expect(atlas.getByRole('heading',{name:'The whole atlas'})).toBeVisible();
});

test('every entity can be reached by keyboard through the browse list',async({page})=>{
 await home(page);
 const atlas=page.locator('#atlas');
 await atlas.getByText(/Browse all \d+ entities/).click();
 await atlas.getByRole('button',{name:'Microglia',exact:true}).first().focus();
 await page.keyboard.press('Enter');
 await expect(atlas.getByRole('heading',{name:'Microglia'})).toBeVisible();
 await expect(atlas.getByText('Resident immune cells of the central nervous system.')).toBeVisible();
});

test('domain focus shows the domain and its cross-domain relations',async({page})=>{
 await home(page);
 const atlas=page.locator('#atlas');
 await atlas.getByRole('button',{name:'Genomics',exact:true}).click();
 await atlas.getByRole('button',{name:'Microbial metabolites and regulatory T cells'}).click();
 await expect(atlas.getByRole('heading',{name:'Genomics & Multi-omics'})).toBeVisible();
});

test('the text view lists every relation as a table',async({page})=>{
 await home(page);
 const atlas=page.locator('#atlas');
 await atlas.getByText(/Text view of all \d+ relations/).click();
 const rows=atlas.locator('table tbody tr');
 expect(await rows.count()).toBeGreaterThanOrEqual(18);
 await expect(atlas.locator('table')).toContainText('Unresolved');
});

test('reduced motion removes the flowing particles',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await home(page);
 await expect(page.locator('#atlas')).toBeVisible();
 await page.waitForTimeout(500);
 expect(await page.locator('#atlas animateMotion').count()).toBe(0);
});

test('with motion allowed the active pathway has flowing particles',async({page})=>{
 await page.emulateMedia({reducedMotion:'no-preference'});
 await home(page);
 await expect.poll(()=>page.locator('#atlas animateMotion').count()).toBeGreaterThan(0);
});

test('atlas has no horizontal overflow at 375px and passes axe',async({page})=>{
 await page.setViewportSize({width:375,height:812});
 await home(page);
 await page.locator('#atlas').scrollIntoViewIfNeeded();
 const w=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
 expect(w.sw).toBeLessThanOrEqual(w.cw);
 const res=await new AxeBuilder({page}).include('#atlas').analyze();
 expect(res.violations.map(v=>v.id+':'+v.nodes.length)).toEqual([]);
});

test('atlas passes axe on desktop with a conflict pathway and an entity selected',async({page})=>{
 await home(page);
 const atlas=page.locator('#atlas');
 await atlas.getByRole('button',{name:'Gut barrier and brain inflammation'}).click();
 await atlas.getByRole('button',{name:/Intestinal barrier → IL-6/}).click();
 const res=await new AxeBuilder({page}).include('#atlas').analyze();
 expect(res.violations.map(v=>v.id+':'+v.nodes.length)).toEqual([]);
});
