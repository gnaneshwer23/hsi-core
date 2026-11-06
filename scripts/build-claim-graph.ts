/** Immutable working graph snapshots; check mode never writes or calls live services. */
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {buildClaimGraph} from '../src/knowledgeGraph/buildClaimGraph';
import {verifyClaimGraph,claimGraphQuality} from '../src/knowledgeGraph/claimGraph';
import {createHash} from 'node:crypto';
const root=resolve(import.meta.dir,'..'),check=process.argv.includes('--check');
const corpus=JSON.parse(readFileSync(resolve(root,'research/evidence-corpus/corpus.v1.json'),'utf8')),ssc=JSON.parse(readFileSync(resolve(root,'site/public/research/ssc-tfh-il21-graph-draft.v1.json'),'utf8'));
const currentPath=resolve(root,'research/claim-graph/graph.v1.json');
const previous=existsSync(currentPath)?await verifyClaimGraph(JSON.parse(readFileSync(currentPath,'utf8')),async text=>createHash('sha256').update(text).digest('hex')):null;
const candidate=buildClaimGraph(corpus,ssc,previous?.parentVersion??null);
const graph=previous&&candidate.version!==previous.version?buildClaimGraph(corpus,ssc,previous.version):candidate;
await verifyClaimGraph(graph,async text=>createHash('sha256').update(text).digest('hex'));
for(const path of ['research/claim-graph','site/public/research/claim-graph']){
 const dir=resolve(root,path),content=JSON.stringify(graph,null,2)+'\n';
 if(!check)mkdirSync(resolve(dir,'versions'),{recursive:true});
 let parent=graph.parentVersion;const seen=new Set([graph.version]);
 while(parent){if(seen.has(parent)||seen.size>100)throw Error('Invalid graph lineage');seen.add(parent);const older=await verifyClaimGraph(JSON.parse(readFileSync(resolve(dir,'versions',parent+'.json'),'utf8')),async text=>createHash('sha256').update(text).digest('hex'),parent);parent=older.parentVersion}
 for(const file of ['graph.v1.json','versions/'+graph.version+'.json']){
  const target=resolve(dir,file);
  if(check){if(readFileSync(target,'utf8')!==content)throw Error('Stale claim graph: '+file)}
  else {if(file.startsWith('versions/')&&existsSync(target)&&readFileSync(target,'utf8')!==content)throw Error('Immutable graph collision');writeFileSync(target,content)}
 }
}
const index='// Generated working graph identity. Hash integrity is not scientific approval.\nexport const CLAIM_GRAPH_VERSION='+JSON.stringify(graph.version)+';\n';
const indexPath=resolve(root,'site/src/features/science/generatedClaimGraphVersion.ts');
if(check){if(readFileSync(indexPath,'utf8')!==index)throw Error('Stale claim graph index')}else writeFileSync(indexPath,index);
console.log(JSON.stringify({version:graph.version,...claimGraphQuality(graph),graphPromotable:false}));
