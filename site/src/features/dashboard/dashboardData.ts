import type {ValidationCatalogue} from '../../lib/syntheticValidationClient';
import type {ValidationPatientBundle} from '../../../../src/syntheticValidationDataset';
export const DOMAIN_COLOURS:Record<string,string>={metabolic:'#39877f',autoimmune:'#7d9d91',liver:'#b6aa76',gut:'#d7a164',gut_brain:'#ad9c7e',neuroimmune:'#8c9caf',neuro:'#7d9bab',brain:'#a39ac9',immune:'#73adbd',post_viral:'#d58a78'};
export function domainDistribution(catalogue:ValidationCatalogue){const counts=new Map<string,number>();for(const p of catalogue.patients)counts.set(p.domain,(counts.get(p.domain)??0)+1);return [...counts].map(([domain,count])=>({domain,count,colour:DOMAIN_COLOURS[domain]??'#7c9991'}))}
export function filterDashboardProfiles(catalogue:ValidationCatalogue,query:string,condition:string){const q=query.trim().toLowerCase();return catalogue.patients.filter(p=>(condition==='all'||p.condition===condition)&&(!q||[p.id,p.condition,p.domain].some(s=>s.toLowerCase().includes(q))))}
export function profileCoverage(profile:ValidationPatientBundle){
 const expected=new Set(profile.lab_results.map(row=>row.visit)),total=expected.size;
 return [
  {name:'Lab observations',rows:profile.lab_results},
  {name:'Immune profiles',rows:profile.immune_profiles},
  {name:'Microbiome',rows:profile.microbiome},
  {name:'Lifestyle',rows:profile.lifestyle},
  {name:'Wearables',rows:profile.wearables}
 ].map(({name,rows})=>({name,records:rows.length,visits:new Set(rows.filter(r=>expected.has(r.visit)).map(r=>r.visit)).size,total}));
}
