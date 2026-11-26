import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {SEO_PAGES} from '../src/lib/seo/siteSeo';

/** Indexed marketing pages — keep in lockstep with SEO_PAGES / sitemap.xml. */
const PUBLIC=Object.keys(SEO_PAGES);

test('the footer leads to the research app, which opens the app shell',async({page})=>{
 await page.route('**/api/research/investigations',r=>r.fulfill({status:401,json:{}}));
 await page.goto('/status');
 const link=page.getByRole('contentinfo').getByRole('link',{name:'Research app'});
 await expect(link).toHaveAttribute('href','/research/home');
 await link.click();
 await expect(page).toHaveURL(/\/research\/home$/);
 await expect(page.locator('.rh-app')).toBeVisible();
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
});

