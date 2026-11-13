import {test,expect} from 'bun:test';
import {readFileSync} from 'node:fs';
import {findPublicCopyIssues} from '../scripts/check-public-copy';
const retired=/Aksh Health|HSI Clinical|Immune Super Intelligence|HSI Trials|four governed modules|four products/i;
test('current public copy enforces one HSI technology without the retired portfolio',()=>{
 expect(findPublicCopyIssues()).toEqual([]);
 for(const path of ['ScientificPublic','PublicFoundationPages','ExperiencePages','Technology'])expect(readFileSync('site/src/pages/'+path+'.tsx','utf8')).not.toMatch(retired);
});
test('technology retains source, experimental-context and independent-review boundaries',()=>{
 const page=readFileSync('site/src/pages/PublicFoundationPages.tsx','utf8');expect(page).toContain('experimental context');expect(page).toContain('independent scientific acceptance');expect(page).toContain('No live matching');expect(page).toContain('independently reviewed comparison');
});
test('retired product routes have hosting redirects to the unified HSI platform',()=>{
 const config=JSON.parse(readFileSync('site/vercel.json','utf8'));
 for(const path of ['/modules','/modules/aksh-health','/modules/clinical','/modules/isi','/modules/trials','/products','/for-aksh','/for-isi','/for-trials'])expect(config.redirects.find((r:{source:string})=>r.source===path)?.destination).toBe('/platform');
});
