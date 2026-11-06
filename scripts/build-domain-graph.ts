import {readFileSync,writeFileSync,existsSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {buildDomainGraph} from '../src/knowledgeGraph/buildDomainGraph';
import {verifyDomainBundle} from '../src/knowledgeGraph/domainGraph';
const root=resolve(import.meta.dir,'..'),check=process.argv.includes('--check'),digest=async(s:string)=>createHash('sha256').update(s).digest('hex');
const paths=['site/public/discovery/hsi-pilot-evidence-pack.json','research/claim-graph/graph.v1.json','research/domain-graph/expansion.v1.json','research/validation/v0.1/input/hsi_synthetic_patients.json','research/validation/v0.1/input/hsi_synthetic_lab_results.json','research/validation/v0.1/input/hsi_synthetic_medications.json'];
const raw=paths.map(p=>readFileSync(resolve(root,p),'utf8')),values=raw.map(x=>JSON.parse(x));
const path=resolve(root,'research/domain-graph/graph.v1.json'),previous=existsSync(path)?await verifyDomainBundle(JSON.parse(readFileSync(path,'utf8')),digest):null;
const args={pack:values[0],legacy:values[1],expansion:values[2],patients:values[3],labs:values[4],medications:values[5],inputs:paths.map((path,i)=>({path,sha256:createHash('sha256').update(raw[i]!).digest('hex')}))};
let graph=buildDomainGraph({...args,parentVersion:previous?.parentVersion??null});if(previous&&previous.version!==graph.version)graph=buildDomainGraph({...args,parentVersion:previous.version});await verifyDomainBundle(graph,digest);
for(const directory of ['research/domain-graph','site/public/research/domain-graph']){
 const dir=resolve(root,directory),content=JSON.stringify(graph,null,2)+'\n';if(!check)mkdirSync(resolve(dir,'versions'),{recursive:true});
 let parent=graph.parentVersion;const seen=new Set([graph.version]);while(parent){if(seen.has(parent)||seen.size>100)throw Error('Invalid domain lineage');seen.add(parent);const older=await verifyDomainBundle(JSON.parse(readFileSync(resolve(dir,'versions',parent+'.json'),'utf8')),digest,parent);parent=older.parentVersion}
 for(const file of ['graph.v1.json','versions/'+graph.version+'.json']){const target=resolve(dir,file);if(check){if(readFileSync(target,'utf8')!==content)throw Error('Stale domain graph: '+file)}else{if(file.startsWith('versions/')&&existsSync(target)&&readFileSync(target,'utf8')!==content)throw Error('Immutable domain graph collision');writeFileSync(target,content)}}
}
const index='// Generated research candidate identity; integrity is not scientific approval.\nexport const DOMAIN_GRAPH_VERSION='+JSON.stringify(graph.version)+';\n',indexPath=resolve(root,'site/src/features/science/generatedDomainGraphVersion.ts');if(check){if(readFileSync(indexPath,'utf8')!==index)throw Error('Stale domain graph index')}else writeFileSync(indexPath,index);
console.log(JSON.stringify({version:graph.version,nodes:graph.nodes.length,edges:graph.edges.length,sourceCandidates:graph.sources.length,gaps:graph.gaps.length,validationProfiles:graph.validationProfiles.length,scientificApproval:false}));
