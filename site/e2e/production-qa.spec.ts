import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {writeFile} from 'node:fs/promises';
import {SEO_PAGES} from '../src/lib/seo/siteSeo';
for(const path of [...Object.keys(SEO_PAGES),'/sign-in','/sign-up','/forgot-password','/reset-password','/research/dashboard','/science/graph','/research/validation']){
 test('WCAG automated scan '+path,async({page},testInfo)=>{
  await page.goto(path);await expect(page.getByRole('heading',{level:1})).toBeVisible();
  await page.evaluate(()=>document.fonts.ready);
  const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  await writeFile(testInfo.outputPath('axe.json'),JSON.stringify({path,violations:results.violations,incomplete:results.incomplete},null,2));
  await testInfo.attach('axe-results',{body:JSON.stringify({path,violations:results.violations,incomplete:results.incomplete},null,2),contentType:'application/json'});
  expect(results.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))).toEqual([]);
 });
}
test('recovery navigation, absent-token error and query removal never expose token in metadata',async({page})=>{
 await page.goto('/sign-in');await page.getByRole('link',{name:'Forgot your password?'}).click();await expect(page).toHaveURL(/forgot-password$/);
 await page.goto('/reset-password?token=test-only-recovery-value-not-valid');await expect(page).toHaveURL(/reset-password$/);
 expect(await page.locator('head').textContent()).not.toContain('test-only-recovery-value');await expect(page.locator('meta[name=referrer]')).toHaveAttribute('content','no-referrer');
 await expect(page.locator('meta[name=robots]')).toHaveAttribute('content','noindex, follow');
});

for(const path of ['/','/platform','/products','/research/dashboard','/science/graph','/research/validation']){
 test('mobile WCAG scan '+path,async({page},info)=>{
  await page.setViewportSize({width:390,height:844});await page.emulateMedia({reducedMotion:'reduce'});await page.goto(path);await expect(page.getByRole('heading',{level:1})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  await writeFile(info.outputPath('axe.json'),JSON.stringify({path,viewport:'mobile',violations:result.violations,incomplete:result.incomplete},null,2));
  expect(result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))).toEqual([]);
 });
}
test('public pages load the existing typefaces locally without third-party font requests',async({page})=>{
 const fonts:string[]=[];page.on('request',r=>{if(/fonts\.(googleapis|gstatic)\.com/.test(r.url()))fonts.push(r.url())});
 await page.goto('/');await page.evaluate(()=>document.fonts.ready);
 expect(await page.evaluate(()=>[...document.fonts].some(f=>f.family==='Host Grotesk Variable'&&f.status==='loaded'))).toBe(true);expect(fonts).toEqual([]);
});

test('mobile hero leads with the research workbench demonstration',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 await expect(page.getByRole('heading',{level:1})).toContainText('See why the evidence conflicts.');
 await expect(page.locator('#product-demo')).toBeVisible();
 await expect(page.getByRole('group',{name:'Investigation steps'})).toBeVisible();
 await expect(page.getByRole('heading',{name:/A plausible explanation is not a validated mechanism/})).toBeVisible();
});

test('editorial action arrows use scalable paths instead of platform symbol fonts',async({page})=>{
 await page.goto('/');
 for(const item of await page.locator('.ed-actions a,.ed-feature-tablist button,.ed-product-rows a').all())await expect(item.locator('svg.hsi-arrow-icon path')).toHaveCount(1);
});
