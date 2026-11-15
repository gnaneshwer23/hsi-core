import {test,expect} from '@playwright/test';
test('investor journey filters, investigates, reviews, reopens, exports and propagates a source notice',async({page})=>{
 await page.goto('/demo');await expect(page.getByRole('heading',{name:'One pathway. Different contexts.'})).toBeVisible();
 await page.getByLabel('Species',{exact:true}).selectOption('Mouse');await expect(page.locator('[data-graph-edge]')).toHaveCount(1);
 await page.getByRole('button',{name:'Reset',exact:true}).click();await expect(page.locator('[data-graph-edge]')).toHaveCount(6);
 await page.getByRole('button',{name:'Run investigation',exact:true}).click();await expect(page.getByRole('status')).toContainText('Investigation complete');
 await page.getByRole('button',{name:'Open research brief'}).click();await page.getByLabel('Review note',{exact:true}).fill('Preserve species and tissue limitations.');
 await page.getByRole('button',{name:'Accept for demonstration',exact:true}).click();await expect(page.getByRole('heading',{name:'Scenario review recorded.'})).toBeVisible();
 await page.reload();await page.getByRole('tab',{name:'Version history'}).click();await page.getByRole('button',{name:/v2 · Scenario reviewed/}).click();
 await expect(page.getByRole('heading',{name:'Scenario review recorded.'})).toBeVisible();
 const d=page.waitForEvent('download');await page.getByRole('button',{name:'Export JSON',exact:true}).click();expect((await d).suggestedFilename()).toBe('hsi-demonstration-brief.json');
 await page.getByText('Evidence change exercise',{exact:true}).click();await page.getByRole('button',{name:'Simulate source correction',exact:true}).click();
 await expect(page.getByRole('heading',{name:'Evidence changed. Re-review required.'})).toBeVisible();await expect(page.getByRole('button',{name:'Accept for demonstration',exact:true})).toBeDisabled();
 await page.reload();await page.getByRole('tab',{name:'Version history'}).click();await page.getByRole('button',{name:/v2 · Scenario reviewed/}).click();await expect(page.getByRole('heading',{name:'Evidence changed. Re-review required.'})).toBeVisible();
});
test('demonstration fits mobile without horizontal page overflow',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/demo?scenario=species-boundary');await expect(page.getByRole('heading',{name:'Where translation stops.'})).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2)).toBe(false);
});
