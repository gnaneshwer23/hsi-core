import {test,expect} from '@playwright/test';
const departments=['Immunology','Neuroscience','Microbiome','Metabolism','Genomics & Multi-omics','Human Physiology'];
test('all six homepage departments retain selected context and expose real coverage limitations',async({page})=>{
 await page.goto('/');const graph=page.getByRole('region',{name:'Homepage scientific discovery'}),nav=graph.getByRole('navigation',{name:'Scientific departments'});
 await expect(graph.locator('[data-graph-node]')).not.toHaveCount(0);
 const selected=await graph.locator('.hd-inspector h3').textContent();
 for(const label of departments){const button=nav.getByRole('button',{name:new RegExp('^'+label.replace('&','\\&'))});await button.click();await expect(button).toHaveAttribute('aria-pressed','true');await expect(graph.locator('.hd-inspector h3')).toHaveText(selected!);}
 await expect(graph).toContainText('coverage limitation');await expect(graph.locator('[data-graph-node]')).toHaveCount(0);
 await expect(graph.locator('.hd-steps button').last()).toBeDisabled();
 await nav.getByRole('button',{name:/^Microbiome/}).click();await graph.getByRole('button',{name:'Inspect this evidence',exact:true}).click();
 await graph.locator('.hd-inspector').getByRole('button',{name:'Create draft brief',exact:true}).click();
 const link=graph.getByRole('link',{name:'Reopen in research workspace ↗',exact:true});await expect(link).toHaveAttribute('href',/netDepartment=microbiome/);await expect(link).toHaveAttribute('href',/edge=DIAB-001/);
 await link.click();await expect(page).toHaveURL(/netDepartment=microbiome/);await expect(page.getByRole('navigation',{name:'Scientific departments'}).getByRole('button',{name:/^Microbiome/})).toHaveAttribute('aria-pressed','true');
});
test('workspace department changes retain exact edge/source/version across reload and three-hop navigation',async({page})=>{
 await page.goto('/research/knowledge-graph?node=concept%3Abutyrate-ec227cb&edge=DIAB-001&netScope=global&netDepartment=microbiome');
 const network=page.getByRole('region',{name:'Research network explorer',exact:true});await expect(network).toBeVisible();
 const nav=network.getByRole('navigation',{name:'Scientific departments'});await nav.getByRole('button',{name:/^Genomics/}).click();
 expect(new URL(page.url()).searchParams.get('edge')).toBe('DIAB-001');expect(new URL(page.url()).searchParams.get('node')).toBe('concept:butyrate-ec227cb');
 await expect(network).toContainText('coverage limitation');await page.reload();await expect(network).toContainText('coverage limitation');
 await nav.getByRole('button',{name:/^Microbiome/}).click();await network.locator('.rn-refine>summary').click();await network.getByLabel('Neighbourhood depth',{exact:true}).selectOption('3');
 await expect(network.getByLabel('Neighbourhood depth',{exact:true})).toHaveValue('3');expect(new URL(page.url()).searchParams.get('edge')).toBe('DIAB-001');
 const handoff=page.getByRole('link',{name:'Continue in Science',exact:true});await expect(handoff).toHaveAttribute('href',/netDepartment=microbiome/);await expect(handoff).toHaveAttribute('href',/netDepth=3/);await expect(handoff).toHaveAttribute('href',/domainVersion=[a-f0-9]{64}/);
});
test('department navigation remains keyboard usable without page overflow on mobile',async({page})=>{
 await page.setViewportSize({width:390,height:900});await page.goto('/');const graph=page.getByRole('region',{name:'Homepage scientific discovery'});const button=graph.getByRole('navigation',{name:'Scientific departments'}).getByRole('button',{name:/^Immunology/});
 await button.focus();await page.keyboard.press('Enter');await expect(button).toHaveAttribute('aria-pressed','true');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});
