import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('research program: demo profile builds a personal graph, answers from the graph, labels demo content, axe clean',async({page})=>{
 await page.route('**/api/research/investigations',r=>r.fulfill({status:401,json:{}}));
 await page.goto('/research/home');
 const sec=page.locator('section.pr');
 await sec.getByRole('button',{name:/Load a demo autoimmune profile/}).click();
 await expect(sec.getByText('Built from 2 anchors')).toBeVisible();
 await expect(sec.getByText(/concepts ·.*recorded relationships/)).toBeVisible();
 await sec.getByRole('button',{name:'Ask the graph',exact:true}).click();
 await sec.getByRole('button',{name:/How are/}).click();
 await expect(sec.getByRole('status').getByText(/unreviewed/).first()).toBeVisible();
 await sec.getByRole('button',{name:'Landscape',exact:true}).click();
 await expect(sec.getByText(/Demo content\. Illustrative placeholders/)).toBeVisible();
 await expect(page.getByRole('region',{name:'Next moves'})).toContainText('Trace how');
 expect((await new AxeBuilder({page}).include('section.pr,.pm-moves').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations.map(v=>v.id)).toEqual([]);
 await page.setViewportSize({width:390,height:844});
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth)).toBe(true);
});
