import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
test('knowledge graph landing states its limits and links only to real surfaces',async({page})=>{
 await page.goto('/knowledge-graph');
 await expect(page.getByRole('heading',{level:1})).toContainText('Relationships between biological entities');
 await expect(page.getByText('Nothing here has scientific approval',{exact:false})).toBeVisible();
 await expect(page.getByText('Being extended / not live',{exact:true})).toBeVisible();
 for(const [name,href] of [['Browse the educational map','/science/graph'],['Inspect claims and sources','/research/knowledge-graph'],['Ask a question over a selection','/research/investigate']] as const)
  await expect(page.getByRole('link',{name,exact:true})).toHaveAttribute('href',href);
 const results=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa']).analyze();
 expect(results.violations).toEqual([]);
});
test('the header and footer reach the knowledge graph and the graph entry scrolls to the explorer',async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.goto('/');
 await page.getByRole('navigation',{name:'Primary',exact:true}).getByRole('link',{name:'Knowledge graph',exact:true}).click();
 await expect(page).toHaveURL(/knowledge-graph$/);
 await page.getByRole('link',{name:/^Explore the graph/}).first().click();
 await expect(page).toHaveURL(/#home-knowledge-graph$/);
 await expect(page.locator('#home-knowledge-graph')).toBeInViewport();
 await expect(page.getByRole('contentinfo').getByRole('link',{name:'Knowledge graph',exact:true})).toHaveAttribute('href','/knowledge-graph');
});
