/** Writes unreviewed label-match candidates for the domain graph's concepts. Reads the gitignored term tables from
 *  scripts/import-ontologies.ts. Changes no graph node. */
import {readFileSync,writeFileSync,existsSync} from "node:fs";
import {mapConcepts,type TermTable} from "../src/ontology/conceptMapping";

const manifest=JSON.parse(readFileSync("research/ontology/import-manifest.v1.json","utf8")) as {sources:{prefix:string;release:string;sha256:string|null}[]};
const tables:TermTable[]=[];
for(const s of manifest.sources){
 const p=`.ontology-cache/terms/${s.prefix}.json`;if(!existsSync(p))throw Error(`${p} is missing; run scripts/import-ontologies.ts --execute first`);
 const t=JSON.parse(readFileSync(p,"utf8")) as TermTable&{sha256:string};
 if(s.sha256&&t.sha256!==s.sha256)throw Error(`${s.prefix}: cached terms do not match the manifest hash`);
 tables.push(t);
}
const graph=JSON.parse(readFileSync("research/domain-graph/graph.v1.json","utf8")) as {version?:string;nodes:{id:string;name:string;aliases?:string[]}[]};
const concepts=graph.nodes.filter(n=>n.id.startsWith("concept:"));
const mappings=mapConcepts(concepts,tables);
const count=(s:string)=>mappings.filter(m=>m.status===s).length;
const out={schemaVersion:"hsi-ontology-candidate-mappings-1",note:"Unreviewed label-match suggestions only. No mapping is approved; exact mappings need human review (hsiOntologyRegistry).",ontologies:tables.map(t=>({prefix:t.prefix,release:t.release})),conceptCount:concepts.length,summary:{candidate:count("candidate"),ambiguous:count("ambiguous"),obsolete_only:count("obsolete_only"),unmapped:count("unmapped")},mappings};
writeFileSync("research/ontology/candidate-mappings.v1.json",JSON.stringify(out,null,1)+"\n");
console.log(JSON.stringify(out.summary),"of",concepts.length,"concepts");
