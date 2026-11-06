import {test,expect} from 'bun:test';
import {readFileSync} from 'node:fs';
import {domainDistribution,filterDashboardProfiles,profileCoverage} from '../site/src/features/dashboard/dashboardData';
import type {ValidationCatalogue} from '../site/src/lib/syntheticValidationClient';
import type {ValidationPatientBundle} from '../src/syntheticValidationDataset';
const catalogue=JSON.parse(readFileSync(new URL('../site/public/research/validation/v0.1/catalogue.json',import.meta.url),'utf8')) as ValidationCatalogue;
const profile=JSON.parse(readFileSync(new URL('../site/public/research/validation/v0.1/SYN-P-000001.json',import.meta.url),'utf8')) as ValidationPatientBundle;
test('dashboard figures come from represented fixture records rather than invented clinical metrics',()=>{
 const groups=domainDistribution(catalogue);expect(groups.reduce((sum,g)=>sum+g.count,0)).toBe(200);expect(groups.length).toBeGreaterThan(1);
 expect(filterDashboardProfiles(catalogue,'SYN-P-000001','all').map(p=>p.id)).toEqual(['SYN-P-000001']);expect(filterDashboardProfiles(catalogue,'','Migraine')).toHaveLength(10);expect(filterDashboardProfiles(catalogue,'no-such-profile','all')).toHaveLength(0);
 const coverage=profileCoverage(profile);expect(coverage.find(c=>c.name==='Lab observations')).toEqual({name:'Lab observations',records:65,visits:5,total:5});expect(coverage.every(c=>c.visits<=c.total)).toBe(true);
});
