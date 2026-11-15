import {test,expect} from 'bun:test';
import {DEMO_EVIDENCE,DEMO_SCENARIOS,DEMO_NODES,DEMO_SOURCES,selectDemoEvidence} from '../src/demonstration/scenarios';
import {runDemoInvestigation,reviewDemoRun,noticeDemoSource,readDemoHistory,exportDemoRun} from '../src/demonstration/investigation';
const filters={query:'',disease:'',species:''};
const run=(id='test-run',previous?:ReturnType<typeof runDemoInvestigation>,notices:string[]=[])=>runDemoInvestigation({scenarioId:'il21-cross-disease',filters,id,createdAt:'2026-11-15T12:00:00Z',previous,noticeSourceIds:notices});
test('catalogue links are closed, filters select actual evidence and all scenarios execute',()=>{
 for(const e of DEMO_EVIDENCE){expect(DEMO_NODES.some(n=>n.id===e.from)).toBe(true);expect(DEMO_NODES.some(n=>n.id===e.to)).toBe(true);expect(DEMO_SOURCES.some(s=>s.id===e.sourceId)).toBe(true)}
 expect(selectDemoEvidence('il21-cross-disease',{...filters,species:'Mouse'}).map(e=>e.id)).toEqual(['ssc-mouse']);
 expect(selectDemoEvidence('il21-cross-disease',{...filters,disease:'RA'})).toHaveLength(2);expect(selectDemoEvidence('il21-cross-disease',{...filters,query:'unmatched words'})).toHaveLength(0);
 for(const s of DEMO_SCENARIOS){const r=runDemoInvestigation({scenarioId:s.id,filters,id:s.id,createdAt:'2026-11-15T12:00:00Z'});expect(r.events).toHaveLength(3);expect(r.scientificApproval).toBe(false);expect(r.execution).toBe('deterministic_scenario')}
});
test('review and correction preserve immutable versions and never approve scientific publication',()=>{
 const a=run(),b=reviewDemoRun(a,'demonstration_accepted','Preserve the translational limitation.','reviewed','2026-11-15T12:01:00Z');
 expect(a.review).toBe('pending');expect(b.version).toBe(2);expect(b.parentId).toBe(a.id);expect(b.graphPromotable).toBe(false);
 const c=noticeDemoSource(b,'ssc-fibrosis','notice','2026-11-15T12:02:00Z');expect(c.stale).toBe(true);expect(c.review).toBe('pending');expect(b.review).toBe('demonstration_accepted');
 expect(()=>reviewDemoRun(c,'demonstration_accepted','Some note text','bad','2026-11-15T12:03:00Z')).toThrow();
 const d=run('rerun',c,c.noticeSourceIds);expect(d.evidenceIds).not.toContain('ssc-human');expect(d.evidenceIds).not.toContain('ssc-mouse');expect(d.version).toBe(4);expect(d.stale).toBe(false);expect(d.review).toBe('pending');
 expect(readDemoHistory(JSON.stringify([d,c,b,a]))).toHaveLength(4);
 expect(JSON.parse(exportDemoRun(c,'json')).sourceNote).toContain('simulated');expect(exportDemoRun(c,'markdown')).toContain('re-review required');
});
test('reopen rejects malformed data and fabricated production authority',()=>{
 const r=run();expect(readDemoHistory(JSON.stringify([{...r,scientificApproval:true}]))).toEqual([]);expect(readDemoHistory('{broken')).toEqual([]);
 expect(readDemoHistory(JSON.stringify([{...r,evidenceIds:['invented']}]))).toEqual([]);expect(readDemoHistory(JSON.stringify([r]))[0]!.comparisons).toEqual(r.comparisons);
 const empty=runDemoInvestigation({scenarioId:'species-boundary',filters:{...filters,species:'Mouse',query:'unmatched'},id:'empty',createdAt:'2026-11-15T12:00:00Z'});expect(empty.comparisons).toEqual([]);expect(empty.gaps).toContain('Fewer than two findings; pairwise comparison is not assessed');
});
