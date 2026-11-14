import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
test('homepage carries an actual graph connection through evidence to a pinned draft and reopen',async({page})=>{
 await page.goto('/');const discovery=page.getByRole('region',{name:'Homepage scientific discovery'});
 await expect(discovery.locator('[data-graph-node]')).not.toHaveCount(0);
 await expect(page.getByRole('article',{name:'Selected graph evidence record'})).toContainText('DIAB-001');
 await expect(page.getByRole('article',{name:'Selected graph evidence record'})).toContainText('mouse');
 await discovery.getByRole('button',{name:'Inspect this evidence',exact:true}).click();
 await expect(discovery.locator('.hd-inspector dl')).toContainText('mouse');
 await expect(discovery.locator('.hd-inspector')).toContainText('Not recorded');
 await discovery.locator('.hd-inspector').getByRole('button',{name:'Create draft brief',exact:true}).click();
 const brief=discovery.getByRole('article',{name:'Homepage research brief'});await expect(brief).toContainText('Unreviewed / no scientific approval');
 const event=page.waitForEvent('download');await brief.getByRole('button',{name:'Download draft brief',exact:true}).click();
 const text=await readFile((await(await event).path())!,'utf8');expect(text).toContain('Graph version:');expect(text).toContain('Model: mouse');expect(text).toContain('No new search, model execution');
 const href=await brief.getByRole('link',{name:'Reopen in research workspace ↗',exact:true}).getAttribute('href');expect(href).toMatch(/domainVersion=[a-f0-9]{64}/);expect(href).toContain('edge=DIAB-001');
 await brief.getByRole('link',{name:'Reopen in research workspace ↗',exact:true}).click();await expect(page).toHaveURL(new RegExp('edge=DIAB-001'));
});
test('changing the homepage condition resets the draft to the active view and evidence page has no duplicate graph',async({page})=>{
 await page.goto('/');await page.getByRole('button',{name:'Inspect this evidence',exact:true}).click();await page.locator('.hd-inspector').getByRole('button',{name:'Create draft brief',exact:true}).click();
 await page.getByLabel('Research condition',{exact:true}).selectOption('Rheumatoid arthritis');await expect(page.locator('.hd-steps button').first()).toHaveAttribute('aria-current','step');await expect(page.locator('.hd-brief')).toHaveCount(0);
 await page.goto('/evidence-intelligence');await expect(page.locator('#home-knowledge-graph')).toHaveCount(0);
});
