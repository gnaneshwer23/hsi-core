import {VALIDATION_CATALOGUE_SHA256,VALIDATION_CATALOGUE_BYTES} from "../../../src/validation/generatedValidationIndex";
import {SYNTHETIC_VALIDATION_VERSION,VALIDATION_TABLES,verifyValidationBundles,type ValidationPatientBundle,type ValidationConditionBundle} from "../../../src/syntheticValidationDataset";
import {deliveryDigest} from "./investigationDeliveryClient";
export type ValidationAsset={file:string;sha256:string;bytes:number};
export type ValidationCatalogue={sourceFiles:Record<string,ValidationAsset>;schemaVersion:typeof SYNTHETIC_VALIDATION_VERSION;data_class:"synthetic";scientific_claim_allowed:false;counts:Record<string,number>;conditions:Array<ValidationAsset&{condition:string;patients:number}>;patients:Array<ValidationAsset&{id:string;condition:string;domain:string}>;audit:ValidationAsset;limitations:string[]};
const base="/research/validation/v0.1/";
async function asset(ref:ValidationAsset,signal:AbortSignal):Promise<unknown>{
 if(!/^(?:catalogue|audit|condition-\d{2}|SYN-P-\d{6})\.json$/.test(ref.file)||!Number.isInteger(ref.bytes)||ref.bytes<1||ref.bytes>1_000_000||!/^[a-f0-9]{64}$/.test(ref.sha256))throw Error("Invalid validation asset reference");
 const r=await fetch(base+ref.file,{signal,cache:"no-store",credentials:"omit",redirect:"error",headers:{Accept:"application/json"}});
 if(!r.ok||!r.body)throw Error("Validation data unavailable");
 const reader=r.body.getReader(),chunks:Uint8Array[]=[];let size=0;
 try{while(true){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>ref.bytes)throw Error("Validation asset budget exceeded");chunks.push(part.value)}}finally{await reader.cancel()}
 const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.byteLength}
 const text=new TextDecoder("utf-8",{fatal:true}).decode(bytes);
 if(size!==ref.bytes||await deliveryDigest(text)!==ref.sha256)throw Error("Validation asset integrity failed");
 return JSON.parse(text);
}
export async function loadValidationCatalogue(signal:AbortSignal):Promise<ValidationCatalogue>{
 const value=await asset({file:"catalogue.json",sha256:VALIDATION_CATALOGUE_SHA256,bytes:VALIDATION_CATALOGUE_BYTES},signal) as ValidationCatalogue;
 if(value.schemaVersion!==SYNTHETIC_VALIDATION_VERSION||value.data_class!=="synthetic"||value.scientific_claim_allowed!==false||!Array.isArray(value.patients)||value.patients.length!==200||!Array.isArray(value.conditions)||value.conditions.length!==20||!Array.isArray(value.limitations)||VALIDATION_TABLES.some(t=>!Number.isInteger(value.counts?.[t])||value.counts[t]!<1))throw Error("Invalid validation catalogue");
 if(VALIDATION_TABLES.some(t=>value.sourceFiles?.[t]?.file!=="hsi_synthetic_"+t+".json"||!(/^[a-f0-9]{64}$/).test(value.sourceFiles[t]!.sha256)))throw Error("Invalid source-file lineage index");
 const ids=new Set<string>();for(const p of value.patients){if(!/^SYN-P-\d{6}$/.test(p.id)||p.file!==p.id+".json"||ids.has(p.id)||!value.conditions.some(c=>c.condition===p.condition))throw Error("Invalid validation profile index");ids.add(p.id)}
 return value;
}
export async function loadValidationScenario(catalogue:ValidationCatalogue,id:string,signal:AbortSignal):Promise<{profile:ValidationPatientBundle;condition:ValidationConditionBundle;provenance:{catalogueSha256:string;profileSha256:string;conditionSha256:string}}>{
 const p=catalogue.patients.find(p=>p.id===id);if(!p)throw Error("Unknown validation profile");
 const c=catalogue.conditions.find(c=>c.condition===p.condition);if(!c)throw Error("Missing validation condition");
 const [profile,condition]=await Promise.all([asset(p,signal),asset(c,signal)]),checked=verifyValidationBundles(profile,condition);
 const tables={patients:[checked.profile.patient],lab_results:checked.profile.lab_results,medications:checked.profile.medications,lifestyle:checked.profile.lifestyle,wearables:checked.profile.wearables,immune_profiles:checked.profile.immune_profiles,microbiome:checked.profile.microbiome,trials:checked.condition.trials,evidence:checked.condition.evidence,hypotheses:checked.condition.hypotheses};
 for(const table of VALIDATION_TABLES)for(const row of tables[table])if(row.validation_provenance.sourceFileSha256!==catalogue.sourceFiles[table]!.sha256)throw Error("Record source-file lineage mismatch");
 if(checked.profile.patient.patient_id!==id||checked.profile.patient.condition!==p.condition)throw Error("Wrong validation profile");
 return {...checked,provenance:{catalogueSha256:VALIDATION_CATALOGUE_SHA256,profileSha256:p.sha256,conditionSha256:c.sha256}};
}
export async function loadValidationAudit(catalogue:ValidationCatalogue,signal:AbortSignal){return asset(catalogue.audit,signal)}
