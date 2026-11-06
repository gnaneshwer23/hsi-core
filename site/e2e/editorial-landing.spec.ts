import {test,expect} from '@playwright/test';
const publicPaths=['/','/platform','/technology','/products','/solutions','/research','/evidence-safety','/how-it-works','/science','/for-aksh','/for-isi','/for-trials','/pricing','/contact'];
test('public website excludes fixture/demo promotion and keeps actual product scope',async({page})=>{
 test.setTimeout(90000);const fixtureLoads:string[]=[];page.on('request',r=>{if(r.url().includes('/research/validation/v0.1/'))fixtureLoads.push(r.url())});
 for(const path of publicPaths){await page.goto(path);await expect(page.getByRole('heading',{level:1})).toHaveCount(1);const text=await page.getByRole('main').innerText();expect(text,path).not.toMatch(/\b(synthetic|demo|fixtures?|simulation)\b/i);await expect(page.getByRole('main').locator('a[href*="/research/validation"]')).toHaveCount(0)}
 expect(fixtureLoads).toEqual([]);await page.goto('/for-trials');await expect(page.getByRole('main')).toContainText('planned product');await expect(page.getByRole('main')).toContainText('Live matching and enrolment are not currently offered');
});
test('editorial homepage artwork, keyboard tabs and narrow layouts remain usable',async({page},info)=>{
 for(const width of [320,390,768,1440]){await page.setViewportSize({width,height:1000});await page.goto('/');const art=page.getByRole('img',{name:/Sculptural view of human anatomy/});await expect(art).toBeVisible();expect(await art.evaluate(el=>(el as HTMLImageElement).complete&&(el as HTMLImageElement).naturalWidth>0)).toBe(true);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),String(width)).toBe(true);if(width===1440)await page.screenshot({path:info.outputPath('editorial-home-desktop.png'),fullPage:true});if(width===390)await page.screenshot({path:info.outputPath('editorial-home-mobile.png'),fullPage:true})}
 const review=page.getByRole('tab',{name:'Evidence',exact:true});await review.focus();await page.keyboard.press('End');await expect(page.getByRole('tab',{name:'Review',exact:true})).toHaveAttribute('aria-selected','true');await expect(page.getByRole('tabpanel')).toContainText('independent review');
});
