/** Offline fixture import. Never reads env credentials, connects to a DB or grants scientific approval. */
import {readFile,mkdir,writeFile,readdir} from "node:fs/promises";
import {resolve} from "node:path";
import {createHash} from "node:crypto";
import {adaptSyntheticValidationDataset,VALIDATION_TABLES,patientValidationBundle,conditionValidationBundle,SYNTHETIC_VALIDATION_VERSION,VALIDATION_LIMITATIONS,type ValidationTable} from "../src/syntheticValidationDataset";
const root=resolve(import.meta.dir,".."),input=resolve(root,"research/validation/v0.1/input"),output=resolve(root,"site/public/research/validation/v0.1"),check=process.argv.includes("--check");
const sha=(s:string)=>createHash("sha256").update(s).digest("hex");
const raw={} as Record<ValidationTable,unknown>,files:Record<string,{sha256:string;bytes:number}>={};
for(const file of (await readdir(input)).sort()){
 if(!/^hsi_synthetic_[a-z_]+\.(?:json|csv)$/.test(file))throw Error("Unexpected input");
 const bytes=await readFile(resolve(input,file));files[file]={sha256:createHash("sha256").update(bytes).digest("hex"),bytes:bytes.byteLength};
}
const receipt=JSON.parse(await readFile(resolve(input,"../upload-receipt.json"),"utf8"));
for(const row of receipt.files){if(row.duplicate_of){if(files[row.duplicate_of]?.sha256!==row.sha256)throw Error("Duplicate upload differs");continue}if(files[row.file]?.sha256!==row.sha256||files[row.file]?.bytes!==row.bytes)throw Error("Uploaded input changed: "+row.file)}
if(receipt.files.filter((f:{duplicate_of?:string})=>!f.duplicate_of).length!==Object.keys(files).length)throw Error("Receipt/input inventory differs");
for(const table of VALIDATION_TABLES)raw[table]=JSON.parse(await readFile(resolve(input,"hsi_synthetic_"+table+".json"),"utf8"));
// RFC 4180-style parsing; compare CSV fields to typed JSON without evaluating array text.
function csvRows(text:string){
 const rows:string[][]=[];let row:string[]=[],field="",quoted=false;
 for(let i=0;i<text.length;i++){
  const ch=text[i]!;
  if(ch==='"'){if(quoted&&text[i+1]==='"'){field+='"';i++}else quoted=!quoted}
  else if(ch===","&&!quoted){row.push(field);field=""}
  else if((ch==="\n"||ch==="\r")&&!quoted){if(ch==="\r"&&text[i+1]==="\n")i++;row.push(field);rows.push(row);row=[];field=""}
  else field+=ch;
 }
 if(quoted)throw Error("Unclosed CSV field");if(field||row.length){row.push(field);rows.push(row)}return rows;
}
const csvParity=[];
for(const table of VALIDATION_TABLES){
 const file="hsi_synthetic_"+table+".csv";if(!files[file])continue;
 const [header,...rows]=csvRows(await readFile(resolve(input,file),"utf8")),records=raw[table] as Record<string,unknown>[];
 if(!header||new Set(header).size!==header.length||rows.length!==records.length)throw Error("CSV row count/header mismatch: "+file);
 for(let n=0;n<records.length;n++){
  const record=records[n]!,fields=rows[n]!;
  if(fields.length!==header.length||Object.keys(record).sort().join()!==[...header].sort().join())throw Error("CSV field mismatch: "+file);
  header.forEach((key,k)=>{
   const actual=fields[k],expected=record[key];
   const equivalent=typeof expected==="number"?actual?.trim()!==""&&Number(actual)===expected:typeof expected==="boolean"?actual===(expected?"True":"False"):Array.isArray(expected)?actual==="["+expected.map(v=>"'"+String(v).replace(/\\/g,"\\\\").replace(/'/g,"\\'")+"'").join(", ")+"]":actual===expected;
   if(!equivalent)throw Error("CSV/JSON value mismatch: "+file+" row "+n+" field "+key);
  });
 }
 csvParity.push({csv:file,json:file.replace(/csv$/,"json"),rows:rows.length,equivalent:true});
}
const dataset=adaptSyntheticValidationDataset(raw),manifest=JSON.parse(await readFile(resolve(input,"hsi_synthetic_dataset_manifest.json"),"utf8"));
const counts=Object.fromEntries(VALIDATION_TABLES.map(t=>[t,dataset[t].length]));
const names:Record<ValidationTable,string>={patients:"patients",lab_results:"lab_results",medications:"medications",lifestyle:"lifestyle_records",wearables:"wearable_records",immune_profiles:"immune_profiles",microbiome:"microbiome_profiles",trials:"trials",evidence:"evidence_records",hypotheses:"hypotheses"};
for(const t of VALIDATION_TABLES)if(manifest.counts[names[t]]!==counts[t])throw Error("Manifest counts differ: "+t);
const assets=new Map<string,string>(),catalogueProfiles=[],conditions=[...new Set(dataset.patients.map(p=>p.condition))].sort();
if(conditions.length!==20||dataset.patients.length!==200)throw Error("Unexpected v0.1 cohort");
const conditionIndex=conditions.map((condition,i)=>{
 const file="condition-"+String(i+1).padStart(2,"0")+".json",content=JSON.stringify(conditionValidationBundle(dataset,condition))+"\n";assets.set(file,content);
 return {condition,file,sha256:sha(content),bytes:Buffer.byteLength(content),patients:dataset.patients.filter(p=>p.condition===condition).length};
});
for(const patient of dataset.patients){
 const content=JSON.stringify(patientValidationBundle(dataset,patient.patient_id))+"\n",file=patient.patient_id+".json";assets.set(file,content);
 catalogueProfiles.push({id:patient.patient_id,condition:patient.condition,domain:patient.domain,file,sha256:sha(content),bytes:Buffer.byteLength(content)});
}
const missingGuard=VALIDATION_TABLES.reduce((sum,t)=>sum+(raw[t] as Array<Record<string,unknown>>).filter(r=>!("scientific_claim_allowed" in r)).length,0);
const audit={schemaVersion:"hsi-validation-audit-1",datasetVersion:SYNTHETIC_VALIDATION_VERSION,totalRecords:Object.values(counts).reduce((a,b)=>a+b,0),counts,conditions:conditionIndex.map(c=>({condition:c.condition,patients:c.patients})),originalRecordsMissingClaimGuard:missingGuard,normalizedRecordsMissingClaimGuard:0,duplicateTrialUpload:"byte_identical_not_double_counted",csvJsonParity:csvParity,missingUploads:receipt.missing_uploads,sourceFiles:files,limitations:VALIDATION_LIMITATIONS,synthetic:true,scientificClaimAllowed:false};
const auditContent=JSON.stringify(audit,null,2)+"\n";assets.set("audit.json",auditContent);
const catalogue={schemaVersion:SYNTHETIC_VALIDATION_VERSION,data_class:"synthetic",scientific_claim_allowed:false,counts,conditions:conditionIndex,patients:catalogueProfiles,audit:{file:"audit.json",sha256:sha(auditContent),bytes:Buffer.byteLength(auditContent)},limitations:VALIDATION_LIMITATIONS};
const catalogueContent=JSON.stringify(catalogue)+"\n";assets.set("catalogue.json",catalogueContent);
const pin='/** Generated by scripts/build-synthetic-validation.ts; not scientific evidence. */\nexport const VALIDATION_CATALOGUE_SHA256="'+sha(catalogueContent)+'";\nexport const VALIDATION_CATALOGUE_BYTES='+Buffer.byteLength(catalogueContent)+';\n';
async function emit(path:string,content:string){if(check){if(await readFile(path,"utf8")!==content)throw Error("Stale validation artifact: "+path)}else{await mkdir(resolve(path,".."),{recursive:true});await writeFile(path,content)}}
for(const [file,content] of assets)await emit(resolve(output,file),content);
await emit(resolve(root,"src/validation/generatedValidationIndex.ts"),pin);
const existing=await readdir(output);if(existing.length!==assets.size||existing.some(f=>!assets.has(f)))throw Error("Unexpected validation output artifacts");
console.log(JSON.stringify({mode:check?"checked":"built",version:SYNTHETIC_VALIDATION_VERSION,counts,totalRecords:audit.totalRecords,conditions:conditions.length,missingGuardsAdded:missingGuard,assets:assets.size,catalogueSha256:sha(catalogueContent),scientificClaimsAllowed:false}));
