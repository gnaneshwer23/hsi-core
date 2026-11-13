import {test,expect} from 'bun:test';
import {readFile} from 'node:fs/promises';
import {createPublicGraphSnapshotHandler} from '../src/server/publicGraphSnapshotService';
import {DOMAIN_GRAPH_VERSION as version} from '../site/src/features/science/generatedDomainGraphVersion';
const bytes=await readFile(new URL('../site/public/research/domain-graph/versions/'+version+'.json',import.meta.url));
const request=(suffix='',method='GET')=>new Request('http://localhost/api/research/graph-snapshot'+suffix,{method});
test('serves the existing public snapshot with verified identity and all approval gates false',async()=>{
 const handler=createPublicGraphSnapshotHandler({currentVersion:version,readPublishedSnapshot:async()=>bytes});
 const r=await handler(request());expect(r.status).toBe(200);expect(r.headers.get('X-HSI-Graph-Version')).toBe(version);expect(r.headers.get('Cache-Control')).toBe('no-store');
 const g=await r.json();expect(g.version).toBe(version);expect(g.scientificApproval).toBe(false);expect(g.graphPromotable).toBe(false);expect(g.containsPhi).toBe(false);expect(g.edges.every((e:any)=>e.scientificClaimAllowed===false)).toBe(true);
});
test('invalid, duplicate and unexpected queries and mutation methods never read storage',async()=>{
 let calls=0;const handler=createPublicGraphSnapshotHandler({currentVersion:version,readPublishedSnapshot:async()=>{calls++;return bytes}});
 for(const suffix of ['?version=../../secret','?version=','?version='+version+'&version='+version,'?databaseUrl=secret','?version='+version+'&owner=forged'])expect((await handler(request(suffix))).status).toBe(400);
 for(const method of ['POST','PUT','DELETE'])expect((await handler(request('',method))).status).toBe(405);
 expect(calls).toBe(0);
});
test('corrupt, oversized, unavailable and mismatched snapshots fail closed without reflecting contents',async()=>{
 for(const value of [new TextEncoder().encode('secret malformed JSON'),new Uint8Array(2_000_001),new TextEncoder().encode(JSON.stringify({...JSON.parse(bytes.toString()),scientificApproval:true}))]){
 const h=createPublicGraphSnapshotHandler({currentVersion:version,readPublishedSnapshot:async()=>value});const r=await h(request());expect(r.status).toBe(503);expect(await r.text()).not.toContain('secret');}
 const h=createPublicGraphSnapshotHandler({currentVersion:'a'.repeat(64),readPublishedSnapshot:async()=>bytes});expect((await h(request())).status).toBe(503);
 const missing=createPublicGraphSnapshotHandler({currentVersion:version,readPublishedSnapshot:async()=>{throw Error('private path')}});expect((await missing(request())).status).toBe(503);
});

test('Vercel preview share metadata never changes graph selection or reflects a token',async()=>{
 const handler=createPublicGraphSnapshotHandler({currentVersion:version,readPublishedSnapshot:async()=>bytes});
 const r=await handler(request('?version='+version+'&_vercel_share=private-preview-placeholder&...path=graph-snapshot&x-vercel-protection-bypass=private-preview-placeholder&x-vercel-set-bypass-cookie=true'));expect(r.status).toBe(200);expect(await r.text()).not.toContain('private-preview-placeholder');
});
