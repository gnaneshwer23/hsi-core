import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('selecting a concept shows entity intelligence with gaps from the gap index; a gap opens evidence-linked detail',async({page})=>{
 await page.goto('/research/knowledge-graph?netScope=global&node='+encodeURIComponent('concept:butyrate-ec227cb'));
 const intel=page.getByRole('region',{name:'Entity intelligence'});
 await expect(intel.getByRole('heading',{name:/What the graph holds for Butyrate/})).toBeVisible();
 await expect(intel).toContainText('did not hold');
 await expect(intel).toContainText('No relationship in this snapshot is scientifically reviewed');
 await expect(intel.getByRole('article').first()).toContainText('Graph coverage gap');
 await expect(intel.getByRole('article').first()).toContainText('Unreviewed research gap');
 await expect(intel.getByRole('link',{name:'Investigate with live sources'}).last()).toHaveAttribute('href',/\/research\/dashboard\?q=/);

 const network=page.getByRole('region',{name:'Research network explorer',exact:true});
 const gaps=network.getByRole('region',{name:'Research gaps'});
 await expect(gaps.getByRole('heading',{name:/Research gaps \(12\)/})).toBeVisible();
 await gaps.getByRole('button',{name:/Does a reproducible change in human butyrate/}).click();
 await expect(gaps.getByRole('article')).toContainText('Why it ranks here');
 await expect(gaps.getByRole('article')).toContainText('judged on those');
 await expect(gaps.getByRole('article').getByRole('button',{name:'Show on the graph'})).toBeVisible();
 expect((await new AxeBuilder({page}).include('.rn-gaps').include('.ni').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations.map(v=>v.id+': '+v.nodes.map(n=>n.html.slice(0,90)).join(' | '))).toEqual([]);
});

test('multi-select: add concepts, route highlight, expand, brief export, keyboard-reachable',async({page})=>{
 await page.goto('/research/knowledge-graph?netScope=global&node='+encodeURIComponent('concept:butyrate-ec227cb'));
 const network=page.getByRole('region',{name:'Research network explorer',exact:true});
 const tray=network.getByRole('region',{name:'Selection'});
 await expect(tray.getByRole('heading',{name:'Selection (0)'})).toBeVisible();
 await tray.getByRole('button',{name:/^Add Butyrate/}).click();
 await expect(tray.getByRole('heading',{name:'Selection (1)'})).toBeVisible();
 await network.getByRole('button',{name:'Select Systemic sclerosis',exact:true}).dispatchEvent('click');
 await tray.getByRole('button',{name:/^Add Systemic sclerosis/}).click();
 await expect(tray.getByRole('heading',{name:'Selection (2)'})).toBeVisible();
 await expect(tray.getByRole('status').filter({hasText:/Route of|No route/})).toBeVisible();
 const [download]=await Promise.all([page.waitForEvent('download'),tray.getByRole('button',{name:'Export evidence-linked brief'}).click()]);
 expect(download.suggestedFilename()).toBe('hsi-research-brief.md');
 await tray.getByRole('button',{name:'Expand neighbours'}).click();
 await expect(page).toHaveURL(/netDepth=2/);
 await expect(page.locator('section.st').getByRole('button',{name:'Clear'})).toBeVisible();
 expect((await new AxeBuilder({page}).include('.st').withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations.map(v=>v.id)).toEqual([]);
});

const release={id:'browser-test-release',version:'1.0.0',manifestHash:'a'.repeat(64)};
test('a gap can be checked against Europe PMC (bounded, labelled) and saved as an investigation; failures are stated',async({page})=>{
 let posted:any=null,count=0;
 await page.route('**/api/research/cooccurrence',r=>{count++;return r.fulfill({json:{schemaVersion:'hsi-cooccurrence-1',generatedAt:'2026-11-15T10:00:00.000Z',terms:[{term:'Autoreactive CD8 T cells',count:5000,error:null,queryUrl:'https://europepmc.org/search?query=a'},{term:'Beta-cell injury',count:3000,error:null,queryUrl:'https://europepmc.org/search?query=b'}],pairs:[{a:'Autoreactive CD8 T cells',b:'Beta-cell injury',joint:30,error:null,queryUrl:'https://europepmc.org/search?query=ab'}],note:'n'}})});
 await page.route('**/api/research/investigations',async r=>{
  if(r.request().method()==='POST'){posted=r.request().postDataJSON();return r.fulfill({json:{id:'hsi-interrogative-abcdef123456',created:true}})}
  return r.fulfill({json:{items:[],releases:[release],nextCursor:null,writesEnabled:true,canCreate:true}});
 });
 await page.goto('/research/knowledge-graph?netScope=global');
 const gaps=page.getByRole('region',{name:'Research gaps'});
 await gaps.getByRole('button',{name:/Which antigen-specific immune-cell changes/}).click();
 const card=gaps.getByRole('article');
 await expect(card).toContainText('Scientific knowledge gap: not assessed');
 await card.getByRole('button',{name:'Check Europe PMC'}).click();
 await expect(card).toContainText('Under-explored by this heuristic');
 await expect(card).toContainText('Both: 30 records');
 await expect(card).toContainText('needs expert reading');
 expect(count).toBe(1);
 await card.getByRole('button',{name:'Save as investigation'}).click();
 await expect(card).toContainText('Saved under the server-approved release');
 expect(Object.keys(posted).sort()).toEqual(['question','releaseId','requestId']);
 expect(posted.question).toContain('Autoreactive CD8 T cells');
 await expect(card.getByRole('link',{name:'Open in the workbench'})).toHaveAttribute('href',/investigation=hsi-interrogative-abcdef123456/);
});

test('save is blocked clearly when signed out, and a failed count is not shown as zero',async({page})=>{
 await page.route('**/api/research/investigations',r=>r.fulfill({status:401,json:{}}));
 await page.route('**/api/research/cooccurrence',r=>r.fulfill({status:502,json:{error:'Europe PMC is unavailable.'}}));
 await page.goto('/research/knowledge-graph?netScope=global');
 const gaps=page.getByRole('region',{name:'Research gaps'});
 await gaps.getByRole('button',{name:/Which antigen-specific immune-cell changes/}).click();
 const card=gaps.getByRole('article');
 await card.getByRole('button',{name:'Check Europe PMC'}).click();
 await expect(card).toContainText('a failed count is not zero');
 await card.getByRole('button',{name:'Save as investigation'}).click();
 await expect(card).toContainText('Sign in with a verified research account');
});
