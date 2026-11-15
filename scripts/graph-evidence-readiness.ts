/** Offline operator tool. Never fetches sources, issues clearance or creates scientific gold. */
import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {verifyDomainBundle} from '../src/knowledgeGraph/domainGraph';
import {graphEvidenceReadiness} from '../src/knowledgeGraph/evidenceReadiness';
import {createGraphCurationPacket} from '../src/knowledgeGraph/evidencePreparation';
const args=process.argv.slice(2),allowed=new Set(['--packet','--edges','--out']);
let packet=false,out:string|undefined,edges:string[]|undefined;
for(let i=0;i<args.length;i++){
 const flag=args[i]!;if(!allowed.has(flag))throw Error('Unknown argument');
 if(flag==='--packet'){if(packet)throw Error('Duplicate --packet');packet=true;continue}
 const value=args[++i];if(!value||value.startsWith('--'))throw Error('Missing argument value');
 if(flag==='--edges'){if(edges)throw Error('Duplicate --edges');edges=value.split(',');}
 else {if(out)throw Error('Duplicate --out');out=value;}
}
const value=JSON.parse(await readFile(new URL('../research/domain-graph/graph.v1.json',import.meta.url),'utf8'));
const bundle=await verifyDomainBundle(value,async text=>createHash('sha256').update(text).digest('hex'));
if(packet&&!edges?.length)throw Error('--packet requires --edges');
const artifact=packet?await createGraphCurationPacket(bundle,edges!):graphEvidenceReadiness(bundle,edges);
const text=JSON.stringify(artifact,null,2)+'\n';if(out)await writeFile(out,text,{flag:'wx',mode:0o600});else process.stdout.write(text);
