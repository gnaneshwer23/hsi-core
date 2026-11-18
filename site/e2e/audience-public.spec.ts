import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('researchers page states preview limits and real CTAs',async({page})=>{
 await page.goto('/researchers');
 await expect(page.getByRole('heading',{level:1})).toContainText('context, not just citations');
 await expect(page.getByRole('link',{name:/Apply for the research preview/})).toHaveAttribute('href','/welcome');
 await expect(page.getByRole('heading',{name:'What this preview is not.'})).toBeVisible();
 await expect(page.locator('#main-content')).toContainText('not grant research writes');
 await expect(page.locator('#main-content')).not.toContainText(/clinically validated|outperforms|better than/i);
});

test('biotech page discusses pilots without inventing MoUs',async({page})=>{
 await page.goto('/biotech');
 await expect(page.getByRole('heading',{level:1})).toContainText('R&D evidence');
 await expect(page.getByRole('link',{name:/Discuss a research pilot/})).toHaveAttribute('href','/contact');
 await expect(page.getByRole('heading',{name:'Pilot discussions stay honest.'})).toBeVisible();
 await expect(page.locator('#main-content')).toContainText('No MoU');
});

test('validation methodology page is distinct from synthetic lab',async({page})=>{
 await page.goto('/validation');
 await expect(page.getByRole('heading',{level:1})).toContainText('separated from approval');
 await expect(page.getByRole('link',{name:/View methodology/})).toHaveAttribute('href','/validation#methodology');
 await expect(page.getByRole('heading',{name:'Synthetic lab is a different surface.'})).toBeVisible();
 await expect(page.locator('#main-content')).toContainText('/research/validation');
 await expect(page.locator('#main-content')).not.toContainText(/\d{2,}% accuracy|120 expert-adjudicated results/i);
 const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa']).analyze();
 expect(axe.violations.map(v=>v.id+': '+v.nodes.length)).toEqual([]);
});
