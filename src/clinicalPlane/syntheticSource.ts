/** Server-side loader for the repository's synthetic validation shards. Node/Bun only. A real source would implement the same PlanePatient output inside the private plane. */
import {readdirSync,readFileSync} from "node:fs";
import {join} from "node:path";
import type {ValidationPatientBundle} from "../syntheticValidationDataset";
import type {PlanePatient} from "./phenotype";
export function toPlanePatient(b:ValidationPatientBundle):PlanePatient{
 const p=b.patient;
 return {id:p.patient_id,condition:p.condition,age:Number.isFinite(p.age)?p.age:null,sex:typeof p.sex==="string"&&p.sex?p.sex:null,bmi:Number.isFinite(p.bmi)?p.bmi:null,
  labs:b.lab_results.map(l=>({test:l.test,visit:l.visit,value:l.value})),medications:[...new Set(b.medications.map(m=>m.medication))]};
}
export function loadSyntheticPatients(dir:string):PlanePatient[]{
 return readdirSync(dir).filter(f=>/^SYN-P-\d{6}\.json$/.test(f)).sort().map(f=>{
  const b=JSON.parse(readFileSync(join(dir,f),"utf8")) as ValidationPatientBundle;
  if(b.data_class!=="synthetic"||b.scientific_claim_allowed!==false)throw Error("Refusing a shard that is not marked synthetic: "+f);
  return toPlanePatient(b);
 });
}
