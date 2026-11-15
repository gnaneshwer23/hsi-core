import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const noApi=(page:any)=>page.route('**/api/research/investigations',(r:any)=>r.fulfill({status:401,json:{}}));

test('welcome flow: role, background and a focus are required, later steps optional, an invalid ORCID blocks, answers persist, and the look applies',async({page})=>{
 await noApi(page);
 await page.goto('/welcome');
 await expect(page.getByRole('heading',{level:1})).toContainText('Tell us what you work on');
 await page.getByRole('button',{name:'Research scientist'}).click();
 await page.getByRole('button',{name:'Established researcher'}).click();
 await expect(page.getByRole('button',{name:'Next'})).toBeDisabled();
 await page.getByLabel(/^A short background/).fill('Immunologist studying T follicular helper cells and IL-21 in systemic sclerosis.');
 await expect(page.getByText(/We recognise in your description/)).toBeVisible();
 await page.getByRole('button',{name:'Next'}).click();
 await expect(page.getByRole('button',{name:'Next'})).toBeDisabled();
 await page.getByLabel(/What are you researching/).fill('Why does IL-21 signalling differ between lupus and systemic sclerosis?');
 await page.getByLabel('Add a topic').fill('IL-21, T cells and cytomegalovirus, B cells, plasmablast, fibroblasts, extra topic');await page.getByLabel('Add a topic').press('Enter');
 await page.getByRole('button',{name:'Immunology'}).click();
 await expect(page.getByRole('button',{name:'Remove IL-21'})).toBeVisible();
 await expect(page.getByRole('button',{name:'Remove T cells'})).toBeVisible();
 await expect(page.getByRole('button',{name:/^Remove /})).toHaveCount(5);
 await page.getByRole('button',{name:'Next'}).click();
 await page.getByLabel('ORCID iD').fill('0000-0002-1825-0098');
 await expect(page.getByRole('alert')).toContainText('not a valid ORCID');
 await expect(page.getByRole('button',{name:'Next'})).toBeDisabled();
 await page.getByLabel('ORCID iD').fill('https://orcid.org/0000-0002-1825-0097');
 await page.getByLabel(/^Papers/).fill('10.1186/s13075-015-0660-z\n26055806\nnonsense');
 await expect(page.getByRole('status').filter({hasText:'recognised'})).toContainText('2 papers recognised. Not recognised: nonsense');
 await page.getByRole('button',{name:'Next'}).click();
 await expect(page.getByRole('button',{name:'Finish and open my home'})).toBeDisabled();
 await page.getByRole('button',{name:'Generate hypotheses'}).click();
 await page.getByRole('button',{name:'Weekly'}).click();
 await page.getByRole('button',{name:'Dark',exact:true}).click();
 await page.getByRole('button',{name:'Teal'}).click();
 await page.getByRole('button',{name:'Finish and open my home'}).click();
 await expect(page).toHaveURL(/\/research\/home/);
 await expect(page.locator('.rh-app')).toHaveAttribute('data-theme','dark');
 await expect(page.locator('.rh-app')).toHaveAttribute('data-accent','teal');
 const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('hsi-research-profile-v1')!));
 expect(stored).toMatchObject({onboarded:true,role:'Research scientist',stage:'Established researcher',orcid:'0000-0002-1825-0097',cadence:'weekly',papers:['doi:10.1186/s13075-015-0660-z','pmid:26055806']});
 expect(stored.interests).toEqual(expect.arrayContaining(['IL-21','immunology']));
 await expect(page.getByRole('heading',{name:'Tailor your research home'})).toHaveCount(0);
});

test('the example profile fills the required answers and reaches Home with a program',async({page})=>{
 await noApi(page);
 await page.goto('/welcome');
 await expect(page.getByRole('button',{name:'Skip setup'})).toHaveCount(0);
 await page.getByRole('button',{name:'Fill in an example'}).click();
 await page.getByRole('button',{name:'Next'}).click();
 await page.getByRole('button',{name:'Next'}).click();
 await expect(page.getByRole('button',{name:'Skip this step'})).toHaveCount(0);
 await page.getByRole('button',{name:'Next'}).click();
 await page.getByRole('button',{name:'Finish and open my home'}).click();
 await expect(page).toHaveURL(/\/research\/home/);
 await expect(page.locator('section.pr').getByText(/Built from \d anchor/)).toBeVisible();
});

test('appearance menu switches mode and accent and survives reload; light and dark pass axe',async({page})=>{
 await noApi(page);
 await page.goto('/research/home');
 await page.getByRole('button',{name:'Skip for now'}).click();
 const app=page.locator('.rh-app');
 await expect(app).toHaveAttribute('data-theme','light');
 const axeOk=async()=>expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations.map(v=>v.id+': '+v.nodes.length)).toEqual([]);
 await axeOk();
 await page.getByRole('button',{name:'Appearance'}).click();
 await page.getByRole('button',{name:'Dark',exact:true}).click();
 await page.getByRole('button',{name:'Blue'}).click();
 await expect(app).toHaveAttribute('data-theme','dark');await expect(app).toHaveAttribute('data-accent','blue');
 await page.waitForTimeout(400); // let colour transitions finish before measuring contrast
 await axeOk();
 await page.reload();
 await expect(app).toHaveAttribute('data-theme','dark');await expect(app).toHaveAttribute('data-accent','blue');
});

test('welcome page: axe clean and no horizontal scroll at 390px',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await page.goto('/welcome');
 await expect(page.getByRole('heading',{level:1})).toBeVisible();
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations.map(v=>v.id+': '+v.nodes.length)).toEqual([]);
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true);
});
