/**
 * D-01 curator context-completion sheet (A2.4).
 *
 *   bun run context-sheet:export
 *   bun run context-sheet:validate
 *   bun run context-sheet:merge-csv -- path/to/edits.csv
 *   bun run context-sheet:apply          # opt-in; never promotes edges
 */
import {readFileSync,writeFileSync,existsSync,mkdirSync} from "node:fs";
import {resolve} from "node:path";
import {createHash} from "node:crypto";
import {verifyDomainBundle} from "../src/knowledgeGraph/domainGraph";
import {
  applyContextCompletions,
  exportContextCompletionSheet,
  mergeCsvProposalsIntoSheet,
  parseContextCompletionSheet,
  sealContextCompletionSheet,
  sheetToCsv,
} from "../src/knowledgeGraph/contextCompletionSheet";
import {canonicalEvidenceJson} from "../src/evidence/researchEvidenceCorpus";

const root=resolve(import.meta.dir,"..");
const graphPath=resolve(root,"research/domain-graph/graph.v1.json");
const sheetPath=resolve(root,"research/domain-graph/context-completions.v1.json");
const csvPath=resolve(root,"research/domain-graph/context-completions.v1.csv");
const digest=async(s:string)=>createHash("sha256").update(s).digest("hex");

const cmd=process.argv[2]??"export";
const graph=await verifyDomainBundle(JSON.parse(readFileSync(graphPath,"utf8")),digest);

if(cmd==="export"){
  const sheet=sealContextCompletionSheet(exportContextCompletionSheet(graph));
  writeFileSync(sheetPath,JSON.stringify(sheet,null,2)+"\n");
  writeFileSync(csvPath,sheetToCsv(sheet));
  console.log(JSON.stringify({wrote:sheetPath,csv:csvPath,rows:sheet.rows.length,mappedAgainst:sheet.mappedAgainst.slice(0,12),autoPromotion:false}));
  process.exit(0);
}

if(cmd==="validate"){
  if(!existsSync(sheetPath)){console.error("Missing "+sheetPath);process.exit(1)}
  const sheet=parseContextCompletionSheet(JSON.parse(readFileSync(sheetPath,"utf8")),graph);
  const filled=sheet.rows.filter(r=>r.proposed.tissue!==null||r.proposed.population!==null||r.proposed.design!==null).length;
  console.log(JSON.stringify({ok:true,rows:sheet.rows.length,withProposals:filled,autoPromotion:false,scientificApproval:false}));
  process.exit(0);
}

if(cmd==="merge-csv"){
  const src=process.argv[3];
  if(!src){console.error("Usage: bun run context-sheet:merge-csv -- <edits.csv>");process.exit(1)}
  if(!existsSync(sheetPath)){console.error("Export a sheet first");process.exit(1)}
  const base=parseContextCompletionSheet(JSON.parse(readFileSync(sheetPath,"utf8")),graph);
  const merged=mergeCsvProposalsIntoSheet(base,readFileSync(resolve(src),"utf8"));
  writeFileSync(sheetPath,JSON.stringify(merged,null,2)+"\n");
  writeFileSync(csvPath,sheetToCsv(merged));
  console.log(JSON.stringify({wrote:sheetPath,rows:merged.rows.length,digest:merged.digest.slice(0,12)}));
  process.exit(0);
}

if(cmd==="apply"){
  if(!existsSync(sheetPath)){console.error("Missing "+sheetPath);process.exit(1)}
  const sheet=parseContextCompletionSheet(JSON.parse(readFileSync(sheetPath,"utf8")),graph);
  const filled=sheet.rows.filter(r=>r.proposed.tissue!==null||r.proposed.population!==null||r.proposed.design!==null);
  if(filled.length===0){
    console.log(JSON.stringify({applied:0,note:"No proposed values; graph unchanged"}));
    process.exit(0);
  }
  const edges=applyContextCompletions(graph.edges,sheet);
  if(edges.some(e=>e.reviewStatus!=="unreviewed"||e.scientificClaimAllowed!==false||e.confidence!=="not_calibrated")){
    console.error("Refuse to apply: promotion or review flags would change");
    process.exit(1);
  }
  const {version:_previousVersion,...body}=graph;
  const nextBody={
    ...body,
    parentVersion:graph.version,
    edges:edges.sort((a,b)=>a.id<b.id?-1:a.id>b.id?1:0),
  };
  const version=createHash("sha256").update(canonicalEvidenceJson(nextBody)).digest("hex");
  const next=await verifyDomainBundle({...nextBody,version},digest);
  const content=JSON.stringify(next,null,2)+"\n";
  for(const directory of ["research/domain-graph","site/public/research/domain-graph"]){
    const dir=resolve(root,directory);
    mkdirSync(resolve(dir,"versions"),{recursive:true});
    const immutable=resolve(dir,"versions/"+next.version+".json");
    if(existsSync(immutable)&&readFileSync(immutable,"utf8")!==content)throw Error("Immutable domain graph collision");
    writeFileSync(immutable,content);
    writeFileSync(resolve(dir,"graph.v1.json"),content);
  }
  writeFileSync(
    resolve(root,"site/src/features/science/generatedDomainGraphVersion.ts"),
    '// Generated research candidate identity; integrity is not scientific approval.\nexport const DOMAIN_GRAPH_VERSION='+JSON.stringify(next.version)+';\n',
  );
  const refreshed=sealContextCompletionSheet(exportContextCompletionSheet(next));
  writeFileSync(sheetPath,JSON.stringify(refreshed,null,2)+"\n");
  writeFileSync(csvPath,sheetToCsv(refreshed));
  console.log(JSON.stringify({applied:filled.length,version:next.version,parentVersion:next.parentVersion,autoPromotion:false,scientificApproval:false}));
  process.exit(0);
}

console.error("Unknown command "+cmd);
process.exit(1);
