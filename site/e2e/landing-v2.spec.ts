import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/** The homepage and the /landing-v2 pages (ported from the Lovable site). They have their own header and footer, state their status honestly, and only the homepage is indexable. */
const ROUTES=['','/science','/solutions','/data-sources','/trust','/early-access','/platform/memory','/platform/agents','/platform/contradiction-analysis','/platform/workbench','/platform/knowledge-graph','/platform/discovery-engine','/platform/companion'];

for(const r of ROUTES){
 test(`landing v2 ${r||'home'} renders and has no console errors; only the homepage is indexable`,async({page})=>{
  const errors:string[]=[];page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push(String(e)));
  await page.goto(r===''?'/':'/landing-v2'+r);
  await expect(page.getByRole('heading',{level:1}).first()).toBeVisible();
  if(r==='')await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/^index/);
  else await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/);
  await expect(page).toHaveTitle(/Human Super Intelligence|HSI/);
  expect(errors).toEqual([]);
 });
}

test('landing v2 nav leads to a platform page and the early-access form says nothing is sent',async({page})=>{
 await page.goto('/landing-v2/early-access');
 await expect(page.getByText('Submissions are not yet stored or sent')).toBeVisible();
 await expect(page.getByText('Do not enter patient or unpublished research data')).toBeVisible();
 await page.goto('/');
 await expect(page.getByText('HSI is being built to connect')).toBeVisible();
});

test('landing v2 trust page states that safeguards are designed, not deployed',async({page})=>{
 await page.goto('/landing-v2/trust');
 await expect(page.getByText('None of these safeguards is running in a deployed service yet')).toBeVisible();
 await expect(page.getByText('Designed so that one institution')).toBeVisible();
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
 await expect(header.getByRole('link',{name:'Request Early Access'})).toHaveAttribute('href','/landing-v2/early-access');
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
 await expect(page).toHaveURL(/\/landing-v2\/platform\/contradiction-analysis$/);
});

test('homepage is served as prerendered HTML with its content before JavaScript',async({browser})=>{
 const ctx=await browser.newContext({javaScriptEnabled:false});const page=await ctx.newPage();
 await page.goto('/');
 await expect(page.getByRole('heading',{level:1})).toContainText('Understand biology.');
 await expect(page.getByText('Interactive biological atlas')).toBeVisible();
 await ctx.close();
});

test('homepage and a landing v2 page pass axe on desktop and the homepage at 390px',async({page})=>{
 for(const p of ['/','/landing-v2/trust']){
  await page.goto(p);await page.waitForTimeout(1200);
  const res=await new AxeBuilder({page}).analyze();
  expect(res.violations.map(v=>v.id+':'+v.nodes.length),p).toEqual([]);
 }
 await page.setViewportSize({width:390,height:844});await page.goto('/');await page.waitForTimeout(1200);
 expect((await new AxeBuilder({page}).analyze()).violations.map(v=>v.id+':'+v.nodes.length)).toEqual([]);
});
