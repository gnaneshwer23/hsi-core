import {test,expect} from '@playwright/test';
const release={id:'ssc-dashboard-test',version:'1.0.0',manifestHash:'a'.repeat(64)};
const items=[{id:'hsi-interrogative-dashboard-test-12345678',question:'Which source context limits the fibrosis explanation?',createdAt:'2026-11-05T12:00:00.000Z',state:'awaiting_scientific_review',release}];
const workspace={items,releases:[release],nextCursor:null,writesEnabled:true,canCreate:true};
test('dashboard composes authorised research counts and independently verified fixture data',async({page},info)=>{
 await page.route('**/api/research/investigations',r=>r.fulfill({json:workspace}));await page.goto('/research/dashboard');
 const stats=page.getByLabel('Dashboard summary');await expect(stats.locator('.rd-stat').nth(0).locator('strong')).toHaveText('1');await expect(stats.locator('.rd-stat').nth(1).locator('strong')).toHaveText('200');await expect(stats.locator('.rd-stat').nth(2).locator('strong')).toHaveText('20');await expect(stats.locator('.rd-stat').nth(3).locator('strong')).toHaveText('13,000');
 await expect(page.locator('.rd-review-count')).toContainText('1');await expect(page.locator('.rd-recent-list')).toContainText(items[0]!.question);await expect(page.locator('.rd-floating').first()).not.toContainText('—');
 await page.setViewportSize({width:1600,height:1100});await page.screenshot({path:info.outputPath('research-dashboard-desktop.png'),fullPage:true});
 await page.getByLabel('Search profiles',{exact:true}).fill('SYN-P-000002');await expect(page.locator('.rd-profile-panel tbody tr')).toHaveCount(1);await page.getByRole('button',{name:'Preview SYN-P-000002',exact:true}).click();await expect(page.locator('.rd-selected-id')).toHaveText('SYN-P-000002');await expect(page.locator('.rd-anatomy-wrap>p')).toContainText('SYN-P-000002');
 await expect(page.locator('.rd-floating').first()).not.toContainText('—');await page.getByRole('link',{name:'Open selected profile',exact:true}).click();await expect(page).toHaveURL(/patient=SYN-P-000002/);
});
test('dashboard search, condition filter and pagination preserve explicit fixture scope',async({page})=>{
 await page.route('**/api/research/investigations',r=>r.fulfill({status:403,json:{error:'Denied'}}));await page.goto('/research/dashboard');await expect(page.locator('.rd-stat').first().locator('strong')).toHaveText('—');await expect(page.locator('.rd-recent-list')).toHaveCount(0);
 await expect(page.locator('.rd-pagination')).toContainText('of 200 profiles');await page.getByRole('button',{name:'Next',exact:true}).click();await expect(page.getByRole('button',{name:'Preview SYN-P-000006',exact:true})).toBeVisible();
 await page.getByLabel('Condition',{exact:true}).selectOption('Migraine');await expect(page.locator('.rd-pagination')).toContainText('1–5 of 10');await page.getByLabel('Search profiles',{exact:true}).fill('not-in-this-dataset');await expect(page.getByText('No profiles match your search.',{exact:true})).toBeVisible();
 await expect(page.locator('.rd-page')).not.toContainText('AI Diagnoses');await expect(page.locator('.rd-page')).not.toContainText('Treatment Progress');
});
test('dashboard fails closed on fixture tampering and stays usable at 320px',async({page},info)=>{
 await page.route('**/api/research/investigations',r=>r.fulfill({status:403,json:{error:'Denied'}}));await page.route('**/research/validation/v0.1/catalogue.json',r=>r.fulfill({json:{patients:[],counts:{patients:999}}}));await page.setViewportSize({width:320,height:800});await page.goto('/research/dashboard');await expect(page.locator('.rd-notice')).toContainText('could not be verified');await expect(page.locator('.rd-metrics .rd-stat strong')).toHaveText(['—','—','—','—']);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);await page.screenshot({path:info.outputPath('research-dashboard-mobile.png'),fullPage:true});
 await page.unroute('**/research/validation/v0.1/catalogue.json');await page.getByRole('button',{name:'Retry validation data',exact:true}).click();await expect(page.locator('.rd-metrics .rd-stat').nth(1).locator('strong')).toHaveText('200');
});
