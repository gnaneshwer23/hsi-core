import {canonical,sha256} from "../../../src/clinicalPlane/auditChain";
import type {PlanePatient} from "../../../src/clinicalPlane/phenotype";
/** Loads the compact synthetic cohort and refuses anything that is not marked synthetic, has a non-synthetic id, or fails its digest. */
export async function loadSyntheticCohort(signal:AbortSignal):Promise<PlanePatient[]>{
 const r=await fetch("/research/clinical-plane/synthetic-cohort.v1.json",{signal,cache:"no-store",credentials:"omit",redirect:"error",headers:{Accept:"application/json"}});
 if(!r.ok)throw Error("Synthetic cohort unavailable");
 const text=await r.text();if(text.length>2_000_000)throw Error("Synthetic cohort too large");
 const x=JSON.parse(text) as {schema?:string;dataClass?:string;scientificClaimAllowed?:boolean;source?:string;patients?:PlanePatient[];digest?:string};
 if(x.schema!=="hsi-synthetic-cohort-1"||x.dataClass!=="synthetic"||x.scientificClaimAllowed!==false||!Array.isArray(x.patients)||x.patients.length<1||x.patients.length>500)throw Error("Not a synthetic cohort file");
 if(!x.patients.every(p=>typeof p.id==="string"&&/^SYN-P-\d{6}$/.test(p.id)&&typeof p.condition==="string"&&Array.isArray(p.labs)&&Array.isArray(p.medications)))throw Error("Cohort contains a non-synthetic or malformed record");
 const {digest,...body}=x;if(digest!==sha256(canonical(body)))throw Error("Synthetic cohort failed its integrity check");
 return x.patients;
}
