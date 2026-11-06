/** No input clinical files. Only a seed, cohort size and a local output directory are accepted. */
import {generateScenarioPack,scenarioQuality} from '../src/capabilities/longitudinal';
import {canonicalEvidenceJson} from '../src/evidence/researchEvidenceCorpus';
import {createHash} from 'node:crypto';
import {mkdirSync,writeFileSync,existsSync,readFileSync} from 'node:fs';
import {resolve} from 'node:path';
const args=process.argv.slice(2),options=new Map<string,string>();
for(let i=0;i<args.length;i+=2){const k=args[i],v=args[i+1];if(!k||!['--seed','--per-cohort','--out'].includes(k)||!v||options.has(k))throw Error('Use --seed, --per-cohort and --out only');options.set(k,v)}
const pack=generateScenarioPack(Number(options.get('--seed')??482913),Number(options.get('--per-cohort')??2));
const directory=resolve(options.get('--out')??'/tmp/hsi-longitudinal-scenarios');mkdirSync(directory,{recursive:true});
const content=canonicalEvidenceJson(pack),sha256=createHash('sha256').update(content).digest('hex'),quality=scenarioQuality(pack);
function immutable(file:string,text:string){if(existsSync(file)){if(readFileSync(file,'utf8')!==text)throw Error('Content-addressed artifact collision')}else writeFileSync(file,text,{flag:'wx'})}
immutable(resolve(directory,'scenarios-'+sha256+'.json'),JSON.stringify(pack,null,2)+'\n');
immutable(resolve(directory,'manifest-'+sha256+'.json'),JSON.stringify({schemaVersion:'hsi-scenario-manifest-1',generatorVersion:pack.generatorVersion,seed:pack.seed,perCohort:pack.perCohort,contentSha256:sha256,counts:quality,scientific_claim_allowed:false,modelCalibrated:false,sourcePatientDataUsed:false},null,2)+'\n');
console.log(JSON.stringify({out:directory,contentSha256:sha256,...quality}));
