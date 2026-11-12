import {test,expect} from '@playwright/test';
const publicPaths=['/','/platform','/technology','/products','/solutions','/research','/evidence-safety','/how-it-works','/science','/for-aksh','/for-isi','/for-trials','/pricing','/contact'];
test('public website excludes fixture promotion and keeps actual product scope',async({page})=>{
 test.setTimeout(90000);const fixtureLoads:string[]=[];page.on('request',r=>{if(r.url().includes('/research/validation/v0.1/'))fixtureLoads.push(r.url())});
 for(const path of publicPaths){
  await page.goto(path);await expect(page.getByRole('heading',{level:1})).toHaveCount(1);
  const text=await page.getByRole('main').innerText();
  if(path==='/')expect(text).toMatch(/Synthetic studies/);
  expect(text,path).not.toMatch(/clinically proven platform|100% accurate/i);
  await expect(page.getByRole('main').locator('a[href*="/research/validation"]')).toHaveCount(0);
 }
 expect(fixtureLoads).toEqual([]);await page.goto('/for-trials');await expect(page.getByRole('main')).toContainText('planned product');await expect(page.getByRole('main')).toContainText('Live matching and enrolment are not currently offered');
});
test('editorial homepage product demo, keyboard tabs and narrow layouts remain usable',async({page},info)=>{
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:1000});await page.goto('/');
  await expect(page.getByRole('heading',{level:1})).toContainText('See why the evidence conflicts.');
  await expect(page.getByRole('heading',{name:/From scientific question to research decision/})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),String(width)).toBe(true);
  if(width===1440)await page.screenshot({path:info.outputPath('editorial-home-desktop.png'),fullPage:true});
  if(width===390)await page.screenshot({path:info.outputPath('editorial-home-mobile.png'),fullPage:true});
 }
 const steps=page.getByRole('group',{name:'Investigation steps'});
 await steps.getByRole('button',{name:/Review/}).click();
 await expect(steps.getByRole('button',{name:/Review/})).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('#investigation-workflow')).toContainText('graph publication are separate');
 await expect(page.getByRole('main')).toContainText('See why the evidence conflicts.');
  await expect(page.getByRole('main')).toContainText(/research workbench/i);
 await expect(page.getByRole('main')).toContainText('A plausible explanation is not a validated mechanism.');
});
test('homepage investigation anchor opens the eight-step sequence',async({page})=>{
 await page.goto('/#investigation-workflow');
 await expect(page.locator('#investigation-workflow')).toBeVisible();
 await expect(page.locator('#investigation-workflow')).toContainText('unvalidated');
 await expect(page.locator('.hsi-home-hero .hsi-actions a')).toHaveCount(2);
 await expect(page.locator('.hsi-home-hero .hsi-actions a').first()).toHaveAttribute('href','/context-conflict-audit');
 await expect(page.locator('.hsi-home-hero .hsi-actions a').nth(1)).toHaveAttribute('href','/research');
 await expect(page.locator('.hsi-home-hero')).toContainText('Explore the Context-Conflict Audit');
 await expect(page.getByRole('link',{name:/Request access/i}).first()).toHaveAttribute('href','/research');
});
