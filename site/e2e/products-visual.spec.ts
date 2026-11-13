import {expect,test} from '@playwright/test';
const retired=['/products','/modules','/modules/aksh-health','/modules/clinical','/modules/isi','/modules/trials','/for-aksh','/for-isi','/for-trials'];
test('retired product routes resolve to one HSI technology without the old portfolio',async({page})=>{
 for(const route of retired){await page.goto(route);await expect(page).toHaveURL(/\/platform$/);await expect(page.getByRole('heading',{level:1})).toContainText('connected biomedical research');await expect(page.getByRole('main')).not.toContainText(/Aksh Health|HSI Clinical|Immune Super Intelligence|HSI Trials|four governed modules/i)}
});
test('public positioning stays consistent across homepage, technology and core pages',async({page})=>{
 for(const route of ['/','/platform','/technology','/applications','/about','/solutions']){await page.goto(route);await expect(page.getByRole('main')).not.toContainText(/Aksh Health|HSI Clinical|Immune Super Intelligence|HSI Trials|four products/i);await expect(page).not.toHaveTitle(/Aksh Health|HSI Clinical|Immune Super Intelligence|HSI Trials/)}
});
