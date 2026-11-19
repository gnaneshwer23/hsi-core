import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const item={id:'hsi-interrogative-abcdef123456',question:'Which cytokines recur across autoimmune conditions?',createdAt:'2026-11-10T10:00:00.000Z',state:'awaiting_scientific_review'};
const saved=(page:any,status:number,body:unknown)=>page.route('**/api/research/investigations',(r:any)=>r.fulfill({status,json:body}));

test('first-time researcher: onboarding, interests persist, grounded recommendations, no sign-in needed',async({page})=>{
 await saved(page,401,{code:'BACKEND_PROVIDER_SESSION_REQUIRED'});
 await page.route('**/api/research/onboarding-profile/status',(r)=>r.fulfill({status:200,json:{
  enabled:false,path:'localStorage',reason:'HSI_ONBOARDING_PROFILE_STORE_ENABLED is not true',
  holdsUnchanged:true,schemaApplied:false,acceptedForScope:false,scientificApproval:false,
  note:'Default path is device-local localStorage.',
 }}));
 await page.goto('/research/home');
 await expect(page.getByRole('heading',{name:'Tailor your research home'})).toBeVisible();
 await page.getByRole('button',{name:'Next'}).click();
 await page.getByRole('group',{name:/Which areas of biology/}).getByRole('button',{name:'Immunology'}).click();
 await page.getByRole('button',{name:'Next'}).click();
 await page.getByRole('button',{name:'Save and continue'}).click();
 await expect(page.getByRole('heading',{name:'Tailor your research home'})).toHaveCount(0);
 await page.locator('#rh-more > summary').click();
 const rec=page.getByRole('region',{name:'Recommended research'});
 await expect(rec).toContainText('Matches your interest in Immunology');
 await expect(page.getByText('Sign in with a verified research account')).toBeVisible();
 await page.locator('#rh-setup > summary').click();
 await expect(page.getByText(/Preferences stay on this device only/)).toBeVisible();
 await page.reload();
 await expect(page.getByRole('heading',{name:'Tailor your research home'})).toHaveCount(0);
await page.locator('#rh-setup > summary').click();
 await page.locator('#rh-more > summary').click();
 await expect(page.getByRole('region',{name:'Research interests'}).getByRole('button',{name:'Immunology'})).toHaveAttribute('aria-pressed','true');
 await expect(rec).toContainText('Matches your interest in Immunology');
 await page.getByRole('region',{name:'Research interests'}).getByRole('button',{name:'Reset personalisation'}).click();
 await expect(page.getByRole('region',{name:'Research interests'}).getByRole('button',{name:'Immunology'})).toHaveAttribute('aria-pressed','false');
});

test('onboarding can be skipped and the page stays usable',async({page})=>{
 await saved(page,401,{});
 await page.goto('/research/home');
 await page.getByRole('button',{name:'Skip for now'}).click();
 await expect(page.getByRole('heading',{name:'Tailor your research home'})).toHaveCount(0);
 await expect(page.locator('#rh-q')).toBeVisible();
});

test('alert preference card keeps live delivery off and records local cadence changes',async({page})=>{
 await saved(page,401,{});
 await page.addInitScript(()=>localStorage.setItem('hsi-research-profile-v1',JSON.stringify({
  v:1,role:'Research scientist',stage:null,background:'x',question:'Why does IL-21 differ?',
  orcid:null,papers:[],cadence:'off',goals:[],interests:['Immunology'],followed:[],dismissed:[],onboarded:true,
 })));
 await page.goto('/research/home');
 const alerts=page.getByRole('region',{name:/Research update preference/i});
 await expect(alerts).toContainText('preference only: true');
 await expect(alerts).toContainText('live delivery: false');
 await expect(alerts).toContainText('email claimed: false');
 await expect(alerts).toContainText('invents open rates: false');
 await expect(alerts).toContainText('production writes: false');
 await alerts.getByRole('button',{name:'Weekly',exact:true}).click();
 await expect(alerts).toContainText('Cadence preference: weekly');
 await expect(alerts).toContainText('Preference engagement (this browser): 1 change');
 await expect(alerts).toContainText('Not an email open-rate metric');
});

test('first useful investigation card stays unreached without inventing conversion',async({page})=>{
 await saved(page,401,{});
 await page.addInitScript(()=>localStorage.setItem('hsi-research-profile-v1',JSON.stringify({
  v:1,role:'Research scientist',stage:null,background:'x',question:'Why does IL-21 differ?',
  orcid:null,papers:[],cadence:'off',goals:[],interests:['Immunology'],followed:[],dismissed:[],onboarded:true,
 })));
 await page.goto('/research/home');
 const first=page.getByRole('region',{name:/First useful investigation/i});
 await expect(first).toContainText('invents aggregate conversion: false');
 await expect(first).toContainText('invents activation funnel: false');
 await expect(first).toContainText('journey complete claimed: false');
 await expect(first).toContainText('pilot conversion claimed: false');
 await expect(first).toContainText('Rate an investigation as Useful');
});

test('repeat usage card stays unreached without inventing retention metrics',async({page})=>{
 await saved(page,401,{});
 await page.addInitScript(()=>localStorage.setItem('hsi-research-profile-v1',JSON.stringify({
  v:1,role:'Research scientist',stage:null,background:'x',question:'Why does IL-21 differ?',
  orcid:null,papers:[],cadence:'off',goals:[],interests:['Immunology'],followed:[],dismissed:[],onboarded:true,
 })));
 await page.goto('/research/home');
 const repeat=page.getByRole('region',{name:/Repeat usage \(this device\)/i});
 await expect(repeat).toContainText('invents retention metrics: false');
 await expect(repeat).toContainText('invents aggregate conversion: false');
 await expect(repeat).toContainText('journey complete claimed: false');
 await expect(repeat).toContainText('pilot conversion claimed: false');
 await expect(repeat).toContainText('Reopen a browser-saved investigation');
});

test('cross-domain search returns typed graph concepts, follows, previews and opens the graph',async({page})=>{
 await saved(page,401,{});
 await page.goto('/research/home');
 await page.getByRole('button',{name:'Skip for now'}).click();
 await page.locator('#rh-q').fill('systemic sclerosis');
 const hits=page.getByRole('list',{name:'Matching concepts'});
 await expect(hits).toContainText('Systemic sclerosis');
 await hits.getByRole('button',{name:'Follow'}).first().click();
 await expect(page.getByRole('region',{name:'Your knowledge graph'})).toContainText('recorded relationships');
await page.locator('#rh-setup > summary').click();
 await expect(page.getByRole('region',{name:'Research library'})).toContainText('Systemic sclerosis');
 await expect(hits.getByRole('link',{name:'Open in graph'}).first()).toHaveAttribute('href',/netQuery=Systemic%20sclerosis/);
 await page.locator('#rh-q').fill('qqqzzzxx');
 await expect(page.getByText('No concept in the published graph matches')).toBeVisible();
});

test('a complex question offers live investigation as primary and save-for-review as secondary',async({page})=>{
 await saved(page,200,{items:[],nextCursor:null,releases:[{id:'rel-1',version:'1.0.0',manifestHash:'a'.repeat(64)}],writesEnabled:false,canCreate:false});
 await page.goto('/research/home');
 await page.getByRole('button',{name:'Skip for now'}).click();
 await page.locator('#rh-q').fill('How do microbial metabolites influence immune signalling and brain inflammation?');
 await expect(page.getByText('This reads as a research question')).toBeVisible();
 await expect(page.getByRole('link',{name:/Deep Investigate: run live|Open live investigation/}).first()).toHaveAttribute('href','/research/workspace');
 await page.getByRole('link',{name:'Save question for review'}).click();
 await expect(page).toHaveURL(/\/research\/dashboard\?q=/);
 await expect(page.locator('#research-question')).toHaveValue(/microbial metabolites/);
});

test('returning researcher sees saved investigations with an honest status and a resume link',async({page})=>{
 await saved(page,200,{items:[item],nextCursor:null,releases:[],writesEnabled:false,canCreate:false});
 await page.goto('/research/home');
 await page.locator('#rh-more > summary').click();
 const cont=page.getByRole('region',{name:'Continue researching'});
 await expect(cont).toContainText(item.question);
 await expect(cont).toContainText('Awaiting scientific review');
 await expect(cont.getByRole('link',{name:'Resume'})).toHaveAttribute('href','/research/decision-workbench?investigation='+item.id);
});

test('API failure is stated, not simulated; axe is clean',async({page})=>{
 await saved(page,500,{});
 await page.goto('/research/home');
 await page.getByRole('button',{name:'Skip for now'}).click();
 await expect(page.getByText('Saved investigations are temporarily unavailable.')).toBeVisible();
 const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
 expect(axe.violations.map(v=>v.id+': '+v.nodes.length)).toEqual([]);
});

test('mobile layout has no horizontal scroll',async({page})=>{
 await page.setViewportSize({width:375,height:812});
 await saved(page,401,{});
 await page.goto('/research/home');
 await page.getByRole('button',{name:'Skip for now'}).click();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth+1)).toBe(true);
});

test('app shell: custom topics drive suggestions, Cmd+K focuses search, and the mobile menu opens',async({page})=>{
 await page.route('**/api/research/investigations',r=>r.fulfill({status:401,json:{}}));
 await page.goto('/research/home');
 await page.getByRole('button',{name:'Skip for now'}).click();
await page.locator('#rh-setup > summary').click();
 await page.getByRole('button',{name:'Add interest'}).click();
 await page.getByLabel('New research topic').fill('systemic sclerosis');
 await page.getByRole('button',{name:'Add',exact:true}).click();
 await page.locator('#rh-more > summary').click();
 await expect(page.getByRole('region',{name:'Recommended research'})).toContainText('Matches your topic');
 await page.locator('#rh-q').blur();
 await page.keyboard.press('Control+k');
 await expect(page.locator('#rh-q')).toBeFocused();
 await page.setViewportSize({width:390,height:844});
 const menu=page.getByRole('button',{name:'Menu'});
 await expect(page.locator('#rh-nav')).toHaveAttribute('data-open','false');
 await menu.click();
 await expect(page.locator('#rh-nav')).toHaveAttribute('data-open','true');
 await expect(page.getByRole('link',{name:'Knowledge Graph',exact:true})).toBeVisible();
});
