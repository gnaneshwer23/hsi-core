import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PUBLIC=['/','/how-it-works','/knowledge-graph','/trust','/about','/contact'];

test('the footer leads to the research app, which opens the app shell',async({page})=>{
 await page.route('**/api/research/investigations',r=>r.fulfill({status:401,json:{}}));
 await page.goto('/knowledge-graph');
 const link=page.getByRole('contentinfo').getByRole('link',{name:'Research app'});
 await expect(link).toHaveAttribute('href','/research/home');
 await link.click();
 await expect(page).toHaveURL(/\/research\/home$/);
 await expect(page.locator('.rh-app')).toBeVisible();
});

test('home states the vision, the one loop, what you get, and what is not true yet; names no agents and no competitors',async({page})=>{
 await page.goto('/');
 await expect(page.getByRole('heading',{level:1})).toHaveText('Human Super Intelligence Connect the biology. Challenge the evidence.');
 await expect(page.getByRole('link',{name:/Join research preview/}).first()).toHaveAttribute('href','/welcome');
 await expect(page.getByRole('link',{name:/Explore the platform/}).first()).toHaveAttribute('href','/platform');
 await expect(page.getByRole('link',{name:/Walk through all eight steps/})).toHaveAttribute('href','/how-it-works');
 const loop=page.getByRole('list',{name:'The research loop'}).locator(':scope > li');
 await expect(loop).toHaveCount(6);
 await expect(loop.nth(1)).toContainText('Live public sources');await expect(loop.nth(4)).toContainText('Kept on your device');
 await expect(page.getByRole('region',{name:/What makes it different/}).getByRole('listitem')).toHaveCount(3);
 const open=page.getByRole('region',{name:/Questions the graph is open on/});
 await expect(open.getByRole('list',{name:/Open research questions/}).getByRole('listitem')).toHaveCount(9);
 await expect(open).toContainText('candidates for expert review, not findings');
 const get=page.getByRole('region',{name:'Your research home'});
 await expect(get.getByRole('link',{name:/Set up your research home/})).toHaveAttribute('href','/welcome');
 await expect(get).toContainText('Investigations with proof');await expect(get).toContainText('Your gaps, hypotheses and methods');
 await expect(page.getByRole('region',{name:'Limits, stated up front'})).toContainText('Model checks are off');
 await expect(page.locator('.pg-status')).toContainText('candidate relationships');
 const body=page.locator('#main-content');
 await expect(body).not.toContainText(/NEXUS|AEGIS|SCOUT|LANTERN|HELIX|PARALLAX|VANTAGE|VERITAS|ARBITER|SENTINEL|CALIBER|WARDEN/);
 await expect(body).not.toContainText(/Intelligence Collective|Enterprise knowledge graphs|Answer engines|Where HSI fits/);
 await expect(body).not.toContainText(/clinically validated|better than|outperforms/i);
});

test('how it works shows the eight steps, what runs where, and what is missing before real patient data',async({page})=>{
 await page.goto('/how-it-works');
 const steps=page.getByRole('list',{name:'Walkthrough steps'}).locator(':scope > li');
 await expect(steps).toHaveCount(8);
 await expect(steps.nth(3)).toContainText('Synthetic data');await expect(steps.nth(3)).toContainText('What it does not');
 const hrefs=await steps.getByRole('link').evaluateAll(els=>els.map(e=>(e as HTMLAnchorElement).getAttribute('href')));
 expect(hrefs).toEqual(['/research/home','/research/knowledge-graph','/research/gaps','/research/cohort','/research/ledger','/research/targets','/research/prescreen','/research/ledger']);
 await expect(page.getByRole('table',{name:'What each part of HSI does and its status'})).toContainText('Clinical plane');
 await expect(page.getByRole('region',{name:'How to read the labels.'})).toContainText('Synthetic data');
 await expect(page.getByRole('list',{name:'Gates before real patient data'}).getByRole('listitem')).toHaveCount(5);
 await expect(page.getByRole('list',{name:'Gates before real patient data'}).getByRole('listitem').first()).toContainText('Done');
 await expect(page.getByRole('region',{name:'Before any real patient data.'})).toContainText('independent security review');
 await expect(page.getByRole('region',{name:'Go deeper in the app.'}).getByRole('link')).toHaveCount(3);
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

test('the public site is exactly six pages in the sitemap, and the header shows five of them',async({page,request})=>{
 const sitemap=await (await request.get('/sitemap.xml')).text();
 const locs=[...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>new URL(m[1]!).pathname).sort();
 expect(locs).toEqual([...PUBLIC].sort());
 await page.setViewportSize({width:1440,height:900});await page.goto('/');
 await expect(page.getByRole('navigation',{name:'Primary',exact:true}).getByRole('link')).toHaveText(['Home','How it works','Knowledge graph','Trust','About']);
});
