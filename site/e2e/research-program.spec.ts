import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('research program: demo profile builds a personal graph, answers from the graph, labels demo content, axe clean',async({page})=>{
 await page.route('**/api/research/investigations',r=>r.fulfill({status:401,json:{}}));
 await page.goto('/research/home');
 const sec=page.locator('section.pr');
 await sec.getByRole('button',{name:/Load a demo autoimmune profile/}).click();
 await expect(sec.getByText('Built from 2 anchors')).toBeVisible();
 await expect(sec.getByText(/concepts ·.*recorded relationships/)).toBeVisible();
 await sec.getByRole('button',{name:/^IL-21, /}).first().focus();
 await page.keyboard.press('Enter');
 await expect(sec.getByRole('complementary',{name:'Selected concept'}).getByRole('heading',{name:'IL-21'})).toBeVisible();
 await sec.getByRole('button',{name:'2.4×'}).click().catch(()=>{});
 await sec.getByRole('button',{name:'Filters'}).click();
 await sec.getByRole('button',{name:/^human in vivo/}).click();
 await expect(sec.getByRole('list',{name:'Active filters'}).getByRole('button',{name:'Remove filter human in vivo'})).toBeVisible();
 await expect(sec.getByRole('status').or(sec.getByText(/relationships ·/)).first()).toBeVisible();
 await sec.getByRole('button',{name:'Reset'}).click();
 await sec.getByLabel('Find a concept in the published graph').fill('B cell');
 await sec.getByRole('list').getByRole('button',{name:/^B cell/}).first().click();
 await expect(sec.getByRole('button',{name:/Remove added concept B cell/})).toBeVisible();
 await sec.getByRole('button',{name:'Reset'}).click();
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

test('home leads with the researcher\'s own question and names the focus; onboarding summary reflects topics and papers',async({page})=>{
 await page.route('**/api/research/investigations',r=>r.fulfill({status:401,json:{}}));
 await page.addInitScript(()=>localStorage.setItem('hsi-research-profile-v1',JSON.stringify({v:1,role:'Research scientist',stage:null,background:'Immunologist studying Tfh cells',question:'Why does IL-21 signalling differ between lupus and systemic sclerosis?',orcid:null,papers:['doi:10.1186/s13075-015-0660-z'],cadence:'weekly',goals:['Generate hypotheses'],interests:['IL-21','Systemic sclerosis'],followed:[],dismissed:[],onboarded:true})));
 await page.goto('/research/home');
 await expect(page.getByRole('heading',{level:1})).toHaveText('Why does IL-21 signalling differ between lupus and systemic sclerosis?');
 await expect(page.getByText(/focus on IL-21, Systemic sclerosis/)).toBeVisible();
 await page.goto('/welcome');
 await expect(page.getByText(/A knowledge graph around/)).toBeVisible();
 await expect(page.getByText(/1 paper/)).toBeVisible();
});
