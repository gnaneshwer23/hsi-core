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
 await expect(page.getByRole('heading',{level:1})).toHaveText('Connect biology. Find the gaps. Translate evidence into human impact.');
 await expect(page.getByRole('link',{name:/Set up your research home/}).first()).toHaveAttribute('href','/welcome');
 await expect(page.getByRole('link',{name:'See how it works'})).toHaveAttribute('href','/how-it-works');
 const loop=page.getByRole('list',{name:'The research loop'}).locator(':scope > li');
 await expect(loop).toHaveCount(4);
 await expect(loop.nth(0)).toContainText('Live public sources');await expect(loop.nth(2)).toContainText('Synthetic patients');
 const get=page.getByRole('region',{name:'What you get when you start.'});
 for(const [name,href] of [['Your research home','/welcome'],['Investigations with proof','/research/workspace'],['Your gaps, hypotheses and methods','/research/gaps']] as const)
  await expect(get.getByRole('link',{name:new RegExp(name)})).toHaveAttribute('href',href);
 await expect(page.getByRole('region',{name:'How it stays honest.'})).toContainText('Model checks are off');
 await expect(page.getByRole('region',{name:'The graph underneath.'}).getByRole('status')).toContainText('candidate relationships');
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
