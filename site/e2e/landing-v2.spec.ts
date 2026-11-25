import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/** The /landing-v2 preview (ported from the Lovable site). It is mounted outside the site Layout, is noindex, and must state its status honestly. */
const ROUTES=['','/science','/solutions','/data-sources','/trust','/early-access','/platform/memory','/platform/agents','/platform/contradiction-analysis','/platform/workbench','/platform/knowledge-graph','/platform/discovery-engine','/platform/companion'];

for(const r of ROUTES){
 test(`landing v2 ${r||'home'} renders, is noindex and has no console errors`,async({page})=>{
  const errors:string[]=[];page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});page.on('pageerror',e=>errors.push(String(e)));
  await page.goto('/landing-v2'+r);
  await expect(page.getByRole('heading',{level:1}).first()).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content',/noindex/);
  await expect(page).toHaveTitle(/HSI/);
  expect(errors).toEqual([]);
 });
}

test('landing v2 nav leads to a platform page and the early-access form says nothing is sent',async({page})=>{
 await page.goto('/landing-v2/early-access');
 await expect(page.getByText('Submissions are not yet stored or sent')).toBeVisible();
 await expect(page.getByText('Do not enter patient or unpublished research data')).toBeVisible();
 await page.goto('/landing-v2');
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

test('landing v2 does not change the existing site shell',async({page})=>{
 await page.goto('/');
 await expect(page.locator('.lv2')).toHaveCount(0);
 await expect(page.getByRole('heading',{level:1})).toContainText('Your next scientific discovery starts with a better question.');
});

test('landing v2 home and trust pass axe',async({page})=>{
 for(const p of ['/landing-v2','/landing-v2/trust']){
  await page.goto(p);await page.waitForTimeout(1200);
  const res=await new AxeBuilder({page}).analyze();
  expect(res.violations.map(v=>v.id+':'+v.nodes.length),p).toEqual([]);
 }
});
