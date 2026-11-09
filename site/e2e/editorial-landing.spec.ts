import {test,expect} from '@playwright/test';
const publicPaths=['/','/platform','/technology','/products','/solutions','/research','/evidence-safety','/how-it-works','/science','/for-aksh','/for-isi','/for-trials','/pricing','/contact'];
test('public website excludes fixture promotion and keeps actual product scope',async({page})=>{
 test.setTimeout(90000);const fixtureLoads:string[]=[];page.on('request',r=>{if(r.url().includes('/research/validation/v0.1/'))fixtureLoads.push(r.url())});
 for(const path of publicPaths){
  await page.goto(path);await expect(page.getByRole('heading',{level:1})).toHaveCount(1);
  const text=await page.getByRole('main').innerText();
  // Homepage may label an illustrative demonstration; other public pages must not promote fixtures/synthetic demos.
  if(path==='/'){
   expect(text).toMatch(/illustrative/i);
   expect(text).not.toMatch(/\b(fixtures?|simulation)\b/i);
  }else{
   expect(text,path).not.toMatch(/\b(synthetic|demo|fixtures?|simulation)\b/i);
  }
  await expect(page.getByRole('main').locator('a[href*="/research/validation"]')).toHaveCount(0);
 }
 expect(fixtureLoads).toEqual([]);await page.goto('/for-trials');await expect(page.getByRole('main')).toContainText('planned product');await expect(page.getByRole('main')).toContainText('Live matching and enrolment are not currently offered');
});
test('editorial homepage product demo, keyboard tabs and narrow layouts remain usable',async({page},info)=>{
 for(const width of [320,390,768,1440]){
  await page.setViewportSize({width,height:1000});await page.goto('/');
  await expect(page.getByRole('heading',{level:1})).toContainText('See the biology.');
  await expect(page.getByRole('heading',{name:/From question to research decision/})).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),String(width)).toBe(true);
  if(width===1440)await page.screenshot({path:info.outputPath('editorial-home-desktop.png'),fullPage:true});
  if(width===390)await page.screenshot({path:info.outputPath('editorial-home-mobile.png'),fullPage:true});
 }
 const tabs=page.getByRole('tablist',{name:'Research demonstration panels'});
 await tabs.getByRole('tab',{name:'Mechanism',exact:true}).focus();
 await page.keyboard.press('End');
 await expect(tabs.getByRole('tab',{name:'Research brief',exact:true})).toHaveAttribute('aria-selected','true');
 await expect(page.getByRole('tabpanel')).toContainText('The reasoning stays with the result');
});
