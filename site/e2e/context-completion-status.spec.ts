import {test,expect} from '@playwright/test';

test('context completion status shows sealed fill progress without claiming promotion',async({page})=>{
 await page.goto('/research/context-completion');
 await expect(page.getByRole('heading',{level:1})).toContainText('D-01 context completion');
 await expect(page.getByLabel('Context completion fill progress')).toContainText('candidate edges');
 await expect(page.getByRole('note')).toContainText('autoPromotion=false');
 await expect(page.getByRole('note')).toContainText('scientificApproval=false');
 await expect(page.getByText(/never applies edits/i)).toBeVisible();
});
