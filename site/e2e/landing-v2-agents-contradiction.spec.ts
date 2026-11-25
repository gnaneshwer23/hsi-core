import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import type {Page} from '@playwright/test';
/** Opens the homepage and waits until it is hydrated, so clicks are not lost to the prerendered markup. */
const home=async(page:Page)=>{await page.goto('/');await page.waitForFunction(()=>document.documentElement.dataset.hydrated==='home');};

/** LEA-01B: the agent orchestration board and the contradiction lab on /landing-v2. Everything shown is illustrative and invented. */
test('agent board is labelled illustrative and offers three traces',async({page})=>{
 await home(page);
 const s=page.locator('#agents');
 await expect(s.getByText('Illustrative',{exact:true}).first()).toBeVisible();
 await expect(s.getByText('Example claims are invented')).toBeVisible();
 for(const n of ['A claim that holds','A claim returned for missing support','A conflict kept visible'])await expect(s.getByRole('button',{name:n})).toBeVisible();
});

test('a returned claim stays out of the output and says why',async({page})=>{
 await home(page);
 const s=page.locator('#agents');
 await s.getByRole('button',{name:'A claim returned for missing support'}).click();
 await expect(s.getByText('Returned to Literature Synthesis with the reason')).toBeVisible();
 await expect(s.getByText('Returned, not in output.')).toBeVisible();
});

test('an agent states what it takes, hands on, who checks it and what it does not do',async({page})=>{
 await home(page);
 const s=page.locator('#agents');
 await s.getByRole('button',{name:/^Evidence Verification/}).click();
 const d=s.locator('[aria-live]');
 await expect(d.getByRole('heading',{name:'Evidence Verification'})).toBeVisible();
 await expect(d.getByText('Cannot verify a claim whose source passage is missing')).toBeVisible();
 await expect(d.getByText('A human reviewer on disputed or sampled claims')).toBeVisible();
});

test('the last step of a conflict trace is a person, and the board says every chain ends with one',async({page})=>{
 await home(page);
 const s=page.locator('#agents');
 await s.getByRole('button',{name:/Expert review/}).last().click();
 await expect(s.locator('[aria-live]').getByText('Agents propose; scientists decide.')).toBeVisible();
});

test('agent board particles follow the motion preference',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});
 await home(page);await page.waitForTimeout(500);
 expect(await page.locator('#agents animateMotion').count()).toBe(0);
 await page.emulateMedia({reducedMotion:'no-preference'});
 await home(page);
 await expect.poll(()=>page.locator('#agents animateMotion').count()).toBeGreaterThan(0);
});

test('contradiction lab regroups studies and shows how well each variable separates the results',async({page})=>{
 await home(page);
 const s=page.locator('#contradiction');
 await expect(s.getByText('Illustrative',{exact:true}).first()).toBeVisible();
 await expect(s.getByRole('button',{name:'No grouping'})).toHaveAttribute('aria-pressed','true');
 await s.getByRole('button',{name:'Timing',exact:true}).click();
 await expect(s.getByRole('button',{name:'Timing',exact:true})).toHaveAttribute('aria-pressed','true');
 await expect(s.locator('th[scope=rowgroup]').filter({hasText:'Before insult'})).toContainText('all lowers');
 await expect(s.getByText(/strong candidate explanation/)).toBeVisible();
 expect(await s.locator('tbody tr th[scope=row]').count()).toBe(8);
});

test('a study with a missing value stays visible and is not scored',async({page})=>{
 await home(page);
 const s=page.locator('#contradiction');
 await s.getByRole('button',{name:'Dose',exact:true}).click();
 const g=s.locator('th[scope=rowgroup]').filter({hasText:'Not reported'});
 await expect(g).toContainText('value missing, not scored');
 expect(await s.locator('tbody tr th[scope=row]').count()).toBe(8);
});

test('the lab keeps the conflict unresolved and lists its gaps',async({page})=>{
 await home(page);
 const s=page.locator('#contradiction');
 await expect(s.getByText('Unresolved · requires expert review')).toBeVisible();
 await expect(s.getByText('Gaps kept visible')).toBeVisible();
 await expect(s.getByText(/did not report dose/)).toBeVisible();
 await expect(s.getByText('no real publication, study count, confidence score or conclusion is implied',{exact:false})).toBeVisible();
});

test('platform pages for agents and contradiction analysis render the new components',async({page})=>{
 await page.goto('/landing-v2/platform/agents');
 await expect(page.getByRole('button',{name:'A conflict kept visible'})).toBeVisible();
 await page.goto('/landing-v2/platform/contradiction-analysis');
 await expect(page.getByRole('button',{name:'No grouping'})).toBeVisible();
});

test('both sections have no overflow at 375px and pass axe in several states',async({page})=>{
 await page.setViewportSize({width:375,height:812});
 await home(page);
 await page.locator('#contradiction').scrollIntoViewIfNeeded();
 const w=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
 expect(w.sw).toBeLessThanOrEqual(w.cw);
 await page.setViewportSize({width:1280,height:900});
 await page.locator('#agents').getByRole('button',{name:'A claim returned for missing support'}).click();
 await page.locator('#contradiction').getByRole('button',{name:'Dose',exact:true}).click();
 for(const sel of ['#agents','#contradiction']){
  const res=await new AxeBuilder({page}).include(sel).analyze();
  expect(res.violations.map(v=>v.id+':'+v.nodes.length),sel).toEqual([]);
 }
});
