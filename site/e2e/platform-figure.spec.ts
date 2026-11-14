import {test,expect} from '@playwright/test';
test('platform figure lists all capabilities with their state and keeps its limits in the caption',async({page})=>{
 await page.goto('/platform');
 await expect(page.getByRole('heading',{level:1})).toHaveText('The intelligence behind connected biomedical research.');
 await expect(page.locator('.pf-agents li')).toHaveCount(13);
 await expect(page.locator('.pf-state[data-state=built_disabled]')).toHaveCount(1);
 await expect(page.locator('#pf-cap')).toContainText('No clinical advice; no patient data');
 await expect(page.getByText('0 independently accepted',{exact:false}).first()).toBeVisible();
 for(const width of [320,768,1440]){await page.setViewportSize({width,height:900});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Overflow at ${width}`).toBe(true)}
});
