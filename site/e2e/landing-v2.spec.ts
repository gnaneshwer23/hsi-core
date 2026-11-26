import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {readFile} from 'node:fs/promises';

/** The homepage and the /landing-v2 pages (ported from the Lovable site). They have their own header and footer, state their status honestly, and only the homepage is indexable. */
const INDEXED=['/platform/memory','/platform/agents','/platform/contradiction-analysis','/platform/workbench','/platform/discovery-engine','/data-sources'];
const PREVIEW=['/landing-v2/science','/landing-v2/solutions','/landing-v2/platform/knowledge-graph','/landing-v2/platform/companion'];

for(const r of ['/',...INDEXED,...PREVIEW]){
 test(`${r} renders and has no console errors; the homepage and the six promoted pages are indexable, the rest stay noindex previews`,async({page})=>{
  const errors:string[]=[];page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(r);
  await expect(page.getByRole('heading',{level:1}).first()).toBeVisible();
  if(r==='/'||INDEXED.includes(r)){
   await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/^index/);
   await expect(page.locator('link[rel=canonical]')).toHaveAttribute('href',new RegExp(r==='/'?'/$':r+'$'));
  }else await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/);
  await expect(page).toHaveTitle(/Human Super Intelligence|HSI/);
  expect(errors).toEqual([]);
 });
}

test('the promoted pages are prerendered, in the sitemap, and the old landing addresses lead to them',async({page,request})=>{
 const sitemap=await (await request.get('/sitemap.xml')).text();
 for(const p of INDEXED)expect(sitemap).toContain('/'+p.slice(1)+'</loc>');
 for(const p of PREVIEW)expect(sitemap).not.toContain(p);
 for(const [from,to] of [['/landing-v2/platform/agents','/platform/agents'],['/landing-v2/platform/memory','/platform/memory'],['/landing-v2/data-sources','/data-sources'],['/landing-v2/trust','/trust']]){
  await page.goto(from);await expect(page).toHaveURL(new RegExp(to+'$'));
 }
});

test('an indexed landing page is served as HTML with its content before JavaScript',async({browser})=>{
 const ctx=await browser.newContext({javaScriptEnabled:false});const page=await ctx.newPage();
 // the preview server has no host rewrites, so serve the generated file the host would
 await page.route('**/platform/contradiction-analysis',async route=>route.fulfill({contentType:'text/html',body:await readFile(new URL('../dist/_pages/platform--contradiction-analysis.html',import.meta.url),'utf8')}));
 await page.goto('/platform/contradiction-analysis');
 await expect(page.getByRole('heading',{level:1})).toContainText('Most contradictions are missing context.');
 await expect(page.getByRole('contentinfo')).toBeVisible();
 await ctx.close();
});

test('every early-access button leads to the working request page, and no prototype form remains',async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 await page.goto('/');
 await expect(page.getByText('HSI is being built to connect')).toBeVisible();
 await expect(page.getByRole('banner').getByRole('link',{name:'Request access'})).toHaveAttribute('href','/contact');
 await expect(page.getByRole('contentinfo').getByRole('link',{name:'Early Access'})).toHaveAttribute('href','/contact');
 const s=page.locator('main').getByRole('link',{name:'Start a pilot request'});
 await expect(s).toHaveAttribute('href','/contact#pilot-request');
 await expect(page.locator('main').getByRole('link',{name:'Create an account'})).toHaveAttribute('href','/sign-up');
 await expect(page.getByText('Submit application')).toHaveCount(0);
 await expect(page.getByText('Nothing is sent unless the request page confirms delivery')).toBeVisible();
 await s.click();
 await expect(page).toHaveURL(/\/contact#pilot-request$/);
 await expect(page.getByRole('heading',{level:1})).toContainText('Request a design-partner pilot');
});

test('/landing-v2/early-access redirects to the contact page',async({page})=>{
 await page.goto('/landing-v2/early-access');
 await expect(page).toHaveURL(/\/contact$/);
});

test('landing v2 solutions page states the no-patient-data and not-CDS boundary',async({page})=>{
 await page.goto('/landing-v2/solutions');
 await expect(page.getByText('does not process patient data and is not clinical decision support')).toBeVisible();
});

test('/landing-v2 now leads to the homepage, and the old homepage content is gone',async({page})=>{
 await page.goto('/landing-v2');
 await expect(page).toHaveURL(/\/$/);
 await expect(page.getByRole('heading',{level:1})).toContainText('Understand biology.');
 await expect(page.locator('#product-demo')).toHaveCount(0);
});

test('homepage chrome: skip link, header with sign-in, links to real site pages, footer',async({page})=>{
 await page.setViewportSize({width:1440,height:900});
 await page.goto('/');
 await expect(page).toHaveTitle('The Living Intelligence of Human Biology | Human Super Intelligence');
 await expect(page.getByRole('link',{name:'Skip to content'})).toHaveAttribute('href','#main-content');
 await expect(page.locator('#main-content')).toHaveCount(1);
 const header=page.getByRole('banner');
 await expect(header.getByRole('link',{name:'Sign in'})).toHaveAttribute('href','/sign-in');
 await expect(header.getByRole('link',{name:'Request access'})).toHaveAttribute('href','/contact');
 const footer=page.getByRole('contentinfo');
 await expect(footer.getByRole('link',{name:'Trust & Governance'})).toHaveAttribute('href','/trust');
 await expect(footer.getByRole('link',{name:'How it works'})).toHaveAttribute('href','/how-it-works');
 await expect(footer.getByRole('link',{name:'Contact'})).toHaveAttribute('href','/contact');
 await footer.getByRole('link',{name:'Trust & Governance'}).click();
 await expect(page).toHaveURL(/\/trust$/);
});

test('homepage mobile menu opens and leads to a platform page',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/');
 await page.getByRole('button',{name:'Open menu'}).click();
 await page.getByRole('banner').getByRole('link',{name:'Contradiction Analysis'}).click();
 await expect(page).toHaveURL(/\/platform\/contradiction-analysis$/);
});

test('homepage is served as prerendered HTML with its content before JavaScript',async({browser})=>{
 const ctx=await browser.newContext({javaScriptEnabled:false});const page=await ctx.newPage();
 await page.goto('/');
 await expect(page.getByRole('heading',{level:1})).toContainText('Understand biology.');
 await expect(page.getByText('Interactive biological atlas')).toBeVisible();
 await ctx.close();
});

test('homepage and a landing v2 page pass axe on desktop and the homepage at 390px',async({page})=>{
 for(const p of ['/','/platform/agents','/platform/contradiction-analysis','/data-sources']){
  await page.goto(p);await page.waitForTimeout(1200);
  const res=await new AxeBuilder({page}).analyze();
  expect(res.violations.map(v=>v.id+':'+v.nodes.length),p).toEqual([]);
 }
 await page.setViewportSize({width:390,height:844});await page.goto('/');await page.waitForTimeout(1200);
 expect((await new AxeBuilder({page}).analyze()).violations.map(v=>v.id+':'+v.nodes.length)).toEqual([]);
});

test('the homepage previews agents, investigation, contradiction and data as short sections that link to the full pages, without repeating the interactives',async({page})=>{
 await page.goto('/');
 for(const [id,link,href] of [['agents','See how agents hand work on','/platform/agents'],['investigation','Walk through the ten stages','/platform/workbench'],['contradiction','Try the alignment','/platform/contradiction-analysis'],['data','See every source and its status','/data-sources']] as const){
  const s=page.locator('#'+id);
  await expect(s.getByRole('link',{name:link})).toHaveAttribute('href',href);
  await expect(s.getByText('Illustrative',{exact:true}).first()).toBeVisible();
 }
 // the full interactive versions live only on their own pages
 await expect(page.getByRole('button',{name:'A conflict kept visible'})).toHaveCount(0);
 await expect(page.getByRole('button',{name:'Verify claims'})).toHaveCount(0);
 await expect(page.getByRole('button',{name:'No grouping'})).toHaveCount(0);
 await expect(page.locator('#agents')).toContainText('Expert review');
 await expect(page.locator('#contradiction')).toContainText('Unresolved · requires expert review');
});

test('every homepage teaser link opens its page with the full interactive',async({page})=>{
 await page.goto('/');
 await page.locator('#contradiction').getByRole('link',{name:'Try the alignment'}).click();
 await expect(page).toHaveURL(/\/platform\/contradiction-analysis$/);
 await expect(page.getByRole('button',{name:'No grouping'})).toBeVisible();
});
