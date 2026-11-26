import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('researchers page states preview limits and real CTAs',async({page})=>{
 await page.goto('/researchers');
 await expect(page.getByRole('heading',{level:1})).toContainText('Spend less time connecting the literature');
 await expect(page.getByRole('link',{name:/Explore the Research Workbench/}).first()).toHaveAttribute('href','/research/workspace');
 await expect(page.getByRole('heading',{name:'What this preview is not.'})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Continue the investigation.'})).toBeVisible();
 await expect(page.getByRole('list',{name:'Researcher investigation path',exact:true}).locator(':scope > li')).toHaveCount(4);
 await expect(page.locator('#main-content')).toContainText('Live public literature retrieval');
 await expect(page.locator('#main-content')).toContainText('does not automatically grant access');
 await expect(page.locator('#main-content')).not.toContainText(/clinically validated|outperforms|better than/i);
});

test('research groups page is marketing with labelled demo shells',async({page})=>{
 await page.goto('/enterprise');
 await expect(page.getByRole('heading',{level:1})).toContainText('connected work for principal investigators');
 await expect(page.getByRole('link',{name:/Create account/}).first()).toHaveAttribute('href','/sign-up');
 await expect(page.getByRole('link',{name:/Professor \/ PI workspace/})).toHaveAttribute('href','/enterprise/professor');
 await expect(page.getByRole('link',{name:/Student \/ researcher workspace/})).toHaveAttribute('href','/enterprise/student');
 await expect(page.locator('#main-content')).toContainText('do not receive automatic access to private student work');
 await expect(page.locator('#main-content')).not.toContainText(/clinically validated|outperforms|better than/i);
 await expect(page.getByRole('navigation',{name:'Primary'})).toBeVisible();
});

test('biotech page discusses pilots without inventing MoUs',async({page})=>{
 await page.goto('/biotech');
 await expect(page.getByRole('heading',{level:1})).toContainText('small R&D team');
 await expect(page.getByRole('link',{name:/Request a pilot conversation/}).first()).toHaveAttribute('href','/contact');
 await expect(page.getByRole('heading',{name:'Pilot discussions stay honest.'})).toBeVisible();
 await expect(page.locator('#main-content')).toContainText('No MoU');
 await expect(page.getByRole('link',{name:/Open R&D dashboard preview/})).toHaveAttribute('href','/enterprise/biotech');
});

test('clinical research landing forbids CDS and PHI claims',async({page})=>{
 await page.goto('/clinical');
 await expect(page.getByRole('heading',{level:1})).toContainText('not clinical decision support');
 await expect(page.getByRole('link',{name:/Discuss clinical research access/})).toHaveAttribute('href','/contact');
 await expect(page.getByRole('link',{name:/Open clinical demo shell/})).toHaveAttribute('href','/enterprise/clinical');
 await expect(page.locator('#main-content')).toContainText('No PHI');
 await expect(page.locator('#main-content')).toContainText('No patient data on this site');
 await expect(page.locator('#main-content')).not.toContainText(/synthetic/i);
 await expect(page.locator('#main-content')).not.toContainText(/clinically validated|outperforms|better than/i);
 await expect(page.getByRole('navigation',{name:'Primary'})).toBeVisible();
});

test('laboratories landing forbids live instruments and invented QC',async({page})=>{
 await page.goto('/laboratories');
 await expect(page.getByRole('heading',{level:1})).toContainText('without inventing QC scores');
 await expect(page.getByRole('link',{name:/Discuss laboratory access/})).toHaveAttribute('href','/contact');
 await expect(page.getByRole('link',{name:/Open lab demo shell/})).toHaveAttribute('href','/enterprise/lab');
 await expect(page.locator('#main-content')).toContainText('No live instrument');
 await expect(page.locator('#main-content')).not.toContainText(/clinically validated|outperforms|better than/i);
});

test('validation methodology page is distinct from the workflow-rehearsal surface',async({page})=>{
 await page.goto('/validation');
 await expect(page).toHaveURL(/\/validation$/);
 await expect(page.getByRole('heading',{level:1})).toContainText('accountable to evidence');
 await expect(page.getByRole('heading',{name:'Validation is a methodology, not a scoreboard.'})).toBeVisible();
 await expect(page.locator('#main-content')).toContainText('/research/validation');
 await expect(page.locator('#validation')).not.toContainText(/synthetic/i);
 await expect(page.locator('#main-content')).not.toContainText(/\d{2,}% accuracy|120 expert-adjudicated results/i);
 const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa']).analyze();
 expect(axe.violations.map(v=>v.id+': '+v.nodes.length)).toEqual([]);
});

test('research community landing keeps Circles held and /community redirect honest',async({page})=>{
 await page.goto('/research-community');
 await expect(page.getByRole('heading',{level:1})).toContainText('rarely happens in isolation');
 await expect(page.getByRole('link',{name:/Discuss community access/})).toHaveAttribute('href','/contact');
 await expect(page.getByRole('link',{name:/Open community demo shell/})).toHaveAttribute('href','/enterprise/community');
 await expect(page.locator('#main-content')).toContainText('/community');
 await expect(page.locator('#main-content')).toContainText('Circles');
 // Honesty copy may say "No invented testimonials" — forbid promotional member claims only.
 await expect(page.locator('#main-content')).not.toContainText(/members worldwide|join thousands|customer testimonials|read our testimonials/i);
});

test('pricing and access page lists planned tiers without inventing prices',async({page})=>{
 await page.goto('/contact');
 await expect(page.getByRole('heading',{level:1})).toContainText('design-partner pilot');
 await expect(page.getByRole('heading',{name:'Planned labels only.'})).toBeVisible();
 await expect(page.locator('#main-content')).toContainText('No prices');
 await expect(page.locator('#main-content')).toContainText('Individual researcher');
 await expect(page.locator('#main-content')).toContainText('Research group');
 await expect(page.locator('#main-content')).not.toContainText(/\$\d|£\d|per seat|subscribe now/i);
});

test('biotech, laboratories and community pages explain their use and label what is planned',async({page})=>{
 await page.goto('/biotech');
 await expect(page.getByRole('heading',{name:'Questions an R&D team could bring.'})).toBeVisible();
 await expect(page.locator('#main-content')).toContainText('does not decide which study is right');
 await page.goto('/laboratories');
 await expect(page.getByRole('heading',{name:'Where it fits a laboratory workflow.'})).toBeVisible();
 await expect(page.locator('#main-content')).toContainText('cannot be uploaded in this preview');
 await page.goto('/research-community');
 await expect(page.getByRole('heading',{name:'What a future Research Network could offer.'})).toBeVisible();
 await expect(page.locator('#main-content')).toContainText('No collaborators, institutions or matches are shown');
});
