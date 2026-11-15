import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('homepage leads with the researcher story, real screens with descriptive alt text, and honest limits',async({page})=>{
 await page.goto('/');
 await expect(page.getByRole('heading',{level:1})).toHaveText('Know what the evidence says, where it disagrees, and what is still untested.');
 await expect(page.getByRole('link',{name:/Set up your research home/}).first()).toHaveAttribute('href','/welcome');
 const shots=page.locator('.ps-frame img');
 await expect(shots).toHaveCount(5);
 for(const img of await shots.all()){const alt=await img.getAttribute('alt');expect((alt??'').length).toBeGreaterThan(60);expect(await img.getAttribute('width')).toBeTruthy();expect(await img.getAttribute('height')).toBeTruthy()}
 await expect(page.locator('.ps-hero img')).toHaveAttribute('fetchpriority','high');
 for(const t of ['Live now · no account','Live now · heuristic','model checks are switched on per deployment','a prompt to look, not a finding'])await expect(page.getByRole('main')).toContainText(t);
 const cmp=page.getByRole('table',{name:'Capabilities by type of tool'});
 await expect(cmp).toContainText('Licensed full text and proprietary relationships at scale');
 await expect(cmp.getByRole('row',{name:/Licensed full text/}).getByRole('cell').last()).toHaveText('No');
 await expect(page.getByRole('main')).toContainText('no customers, benchmarks or accuracy figures');
 await expect(page.locator('#home-knowledge-graph')).toContainText('Public research snapshot');
});
test('every shipped screen loads, and the page passes axe with no horizontal scroll at 390px',async({page})=>{
 const failed:string[]=[];page.on('response',r=>{if(r.url().includes('/images/product/')&&!r.ok())failed.push(r.url())});
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.locator('.ps-rows').scrollIntoViewIfNeeded();
 await page.evaluate(async()=>{for(const i of document.querySelectorAll<HTMLImageElement>('.ps-frame img')){i.loading='eager';await i.decode().catch(()=>{})}});
 expect(failed).toEqual([]);
 expect(await page.evaluate(()=>[...document.querySelectorAll<HTMLImageElement>('.ps-frame img')].every(i=>i.naturalWidth>0))).toBe(true);
 await expect(page.getByRole('heading',{level:1})).toBeVisible();
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations.map(v=>v.id+': '+v.nodes.length)).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true);
});
