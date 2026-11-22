import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {SEO_PAGES} from '../src/lib/seo/siteSeo';

/** Indexed marketing pages — keep in lockstep with SEO_PAGES / sitemap.xml. */
const PUBLIC=Object.keys(SEO_PAGES);

test('the footer leads to the research app, which opens the app shell',async({page})=>{
 await page.route('**/api/research/investigations',r=>r.fulfill({status:401,json:{}}));
 await page.goto('/knowledge-graph');
 const link=page.getByRole('contentinfo').getByRole('link',{name:'Research app'});
 await expect(link).toHaveAttribute('href','/research/home');
 await link.click();
 await expect(page).toHaveURL(/\/research\/home$/);
 await expect(page.locator('.rh-app')).toBeVisible();
});

test('home leads with the graph, context diagram and working scenario choices',async({page})=>{
 await page.goto('/');
 await expect(page.getByRole('heading',{level:1})).toContainText('Your next scientific discovery starts with a better question.');
 await expect(page.locator('.pg-proof')).toBeVisible();
 const diagram=page.locator('.relationship-diagram');
 await diagram.getByRole('button',{name:'Context',exact:true}).click();
 await expect(diagram).toContainText('Under which experimental conditions?');
 await diagram.getByRole('button',{name:'Review',exact:true}).click();
 await expect(diagram).toContainText('What has actually been checked?');
 await expect(page.locator('#product-demo').getByRole('tab')).toHaveCount(6);
 await expect(page.locator('.pg-domain-list').getByRole('link')).toHaveCount(6);
 await expect(page.locator('.pg-status')).toContainText('candidate relationships');
});

test('how it works shows the research flow and separates checks from approval',async({page})=>{
 await page.goto('/how-it-works');
 await expect(page.getByRole('list',{name:'Investigation journey',exact:true}).getByRole('listitem')).toHaveCount(8);
 await expect(page.getByRole('list',{name:'Scientific review boundaries',exact:true}).getByRole('listitem')).toHaveCount(4);
 await expect(page.locator('.pg-shots img')).toHaveCount(2);
 await expect(page.getByRole('link',{name:'Open an example investigation',exact:true}).first()).toHaveAttribute('href','/demo/universe');
});

test('every public page passes axe, has one h1 and does not overflow at 390px',async({page})=>{
 test.setTimeout(120000);
 await page.setViewportSize({width:390,height:844});
 for(const path of PUBLIC){
  await page.goto(path);await expect(page.getByRole('heading',{level:1})).toHaveCount(1);await page.evaluate(()=>document.fonts.ready);
  expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations.map(v=>path+' '+v.id+': '+v.nodes.length)).toEqual([]);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1),path).toBe(true);
 }
});

test('the public sitemap lists the marketing pages, and the header shows Stage 2 destinations',async({page,request})=>{
 const sitemap=await (await request.get('/sitemap.xml')).text();
 const locs=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>new URL(m[1]!).pathname).sort();
 expect(locs).toEqual([...PUBLIC].sort());
 await page.setViewportSize({width:1440,height:900});await page.goto('/');
 await expect(page.getByRole('navigation',{name:'Primary',exact:true}).getByRole('link')).toHaveText(['Home','How It Works','Knowledge Graph','Scientific Intelligence','For Researchers','Community']);
 await expect(page.getByRole('navigation',{name:'Primary',exact:true}).getByRole('button')).toHaveCount(0);
});

test('research gaps page shows recorded gaps from the published snapshot, never substitutes',async({page})=>{
 await page.goto('/research-gaps');
 await expect(page.getByRole('heading',{level:1})).toContainText('what’s missing');
 await expect(page.getByRole('heading',{name:'What the published snapshot records today'})).toBeVisible();
 await expect(page.getByText(/recorded gaps across/)).toBeVisible();
 await expect(page.getByText(/not scientifically reviewed/)).toBeVisible();
 await expect(page.getByRole('link',{name:'Open the recorded gap register'})).toHaveAttribute('href','/research/gaps');
});

test('research gaps page states the failure and shows no figures when the snapshot cannot load',async({page})=>{
 await page.route(/\/research\/claim-graph\/|graph-snapshot/,r=>r.abort());
 await page.goto('/research-gaps');
 await expect(page.getByText(/could not be loaded, so no gap figures are shown/)).toBeVisible();
 await expect(page.getByText(/recorded gaps across/)).toHaveCount(0);
});

test('audience flow diagram is styled: bounded page height and readable step labels',async({page})=>{
 for(const path of ['/researchers','/biotech','/enterprise','/laboratories']){
  await page.setViewportSize({width:1440,height:900});
  await page.goto(path);
  const h=await page.evaluate(()=>document.documentElement.scrollHeight);
  expect(h,path+' page height').toBeLessThan(8000);
  const label=page.locator('.ld-flow-label').first();
  await expect(label).toBeVisible();
  const [fg,bg]=await label.evaluate(el=>[getComputedStyle(el).color,getComputedStyle(document.body).backgroundColor]);
  expect(fg,path+' label colour must differ from page ground').not.toBe(bg);
  expect(fg,path+' label must not be the dark-ink default').not.toBe('rgb(25, 5, 5)');
 }
});
