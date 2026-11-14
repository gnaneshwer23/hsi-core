import {test,expect} from '@playwright/test';
test('platform stack lists all capabilities with their state, the five layers, and keeps its limits in the caption',async({page})=>{
 await page.goto('/platform');
 await expect(page.getByRole('heading',{level:1})).toHaveText('The intelligence behind connected biomedical research.');
 for(const name of ['Outputs','Agents','Verify and govern','Graph and context','Governed sources'])await expect(page.getByRole('heading',{name,exact:true})).toBeVisible();
 await expect(page.locator('[data-layer=agents] .pd-chip')).toHaveCount(13);
 await expect(page.locator('.pd-dot[data-state=built_disabled]')).toHaveCount(1);
 await expect(page.locator('#pd-cap')).toContainText('No clinical advice; no patient data');
 await expect(page.getByText('0 independently accepted',{exact:false}).first()).toBeVisible();
 await expect(page.getByRole('heading',{name:'Connected, not merged.'})).toBeVisible();
 for(const width of [320,768,1440]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Overflow at ${width}`).toBe(true)}
});
