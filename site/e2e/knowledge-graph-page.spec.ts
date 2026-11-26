import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('knowledge graph landing states its limits and links only to real surfaces',async({page})=>{
 await page.goto('/knowledge-graph');
 await expect(page.getByRole('heading',{level:1})).toContainText('connections behind complex biology');
 await page.getByText('Has anything been reviewed?',{exact:true}).click();
 await expect(page.getByText('Nothing here has scientific approval',{exact:false})).toBeVisible();
 await expect(page.locator('#home-knowledge-graph canvas')).toBeVisible();
 await expect(page.locator('.hd-inspector')).toContainText('Unreviewed source candidate');
 await expect(page.locator('#home-knowledge-graph')).toContainText('Public research snapshot');
 await expect(page.getByRole('link',{name:/Open the full explorer/})).toHaveAttribute('href','/research/knowledge-graph');
 const diagram=page.locator('.relationship-diagram');
 await diagram.getByRole('button',{name:'Context',exact:true}).click();
 await expect(diagram).toContainText('Missing fields stay visible');
 const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa']).analyze();
 expect(results.violations).toEqual([]);
});
test('the header and footer reach the knowledge graph and the graph entry scrolls to the explorer',async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.goto('/researchers');
 await page.getByRole('navigation',{name:'Primary',exact:true}).getByRole('link',{name:'Knowledge Graph',exact:true}).click();
 await expect(page).toHaveURL(/knowledge-graph$/);
 await page.getByRole('link',{name:/^Explore the graph/}).first().click();
 await expect(page).toHaveURL(/#home-knowledge-graph$/);
 await expect(page.locator('#home-knowledge-graph')).toBeInViewport();
 await expect(page.getByRole('contentinfo').getByRole('link',{name:'Knowledge Graph',exact:true})).toHaveAttribute('href','/knowledge-graph');
});
