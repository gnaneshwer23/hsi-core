import {test,expect} from '@playwright/test';
const departments=['Immunology','Neuroscience','Microbiome','Metabolism','Genomics & Multi-omics','Human Physiology'];
test('workspace department changes retain exact edge/source/version across reload and three-hop navigation',async({page})=>{
 await page.goto('/research/knowledge-graph?node=concept%3Abutyrate-ec227cb&edge=DIAB-001&netScope=global&netDepartment=microbiome');
 const network=page.getByRole('region',{name:'Research network explorer',exact:true});await expect(network).toBeVisible();
 await network.getByRole('button',{name:/^Filters/}).click();const nav=network.getByRole('navigation',{name:'Scientific departments'});await nav.getByRole('button',{name:/^Genomics/}).click();
 expect(new URL(page.url()).searchParams.get('edge')).toBe('DIAB-001');expect(new URL(page.url()).searchParams.get('node')).toBe('concept:butyrate-ec227cb');
 await expect(network).toContainText('The inspected concept is outside these filters');await page.reload();await expect(network).toContainText('The inspected concept is outside these filters');
 await network.getByRole('button',{name:/^Filters/}).click();await nav.getByRole('button',{name:/^Microbiome/}).click();await network.locator('.rn-refine>summary').click();await network.getByLabel('Neighbourhood depth',{exact:true}).selectOption('3');
 await expect(network.getByLabel('Neighbourhood depth',{exact:true})).toHaveValue('3');expect(new URL(page.url()).searchParams.get('edge')).toBe('DIAB-001');
 const handoff=page.getByRole('link',{name:'Continue in Science',exact:true});await expect(handoff).toHaveAttribute('href',/netDepartment=microbiome/);await expect(handoff).toHaveAttribute('href',/netDepth=3/);await expect(handoff).toHaveAttribute('href',/domainVersion=[a-f0-9]{64}/);
});
