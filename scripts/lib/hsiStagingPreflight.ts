/** Read-only control-plane checks. No SQL, migrations, signup or role writes. */
import {
  HSI_DISPOSABLE_BRANCH_ID,
  HSI_NEON_BRANCH_ID,
  HSI_NEON_PROJECT_ID,
  HSI_STAGING_BRANCH_ID,
} from "../../src/db/neonGuard";
export const HSI_PROJECT=HSI_NEON_PROJECT_ID;
export const PRODUCTION_BRANCH=HSI_NEON_BRANCH_ID;
export const STAGING_BRANCH=HSI_STAGING_BRANCH_ID;
export const DISPOSABLE_BRANCH=HSI_DISPOSABLE_BRANCH_ID;
export function assertNonProductionBranch(projectId:string,branchId:string){
 if(projectId!==HSI_PROJECT||![STAGING_BRANCH,DISPOSABLE_BRANCH].includes(branchId)||branchId===PRODUCTION_BRANCH)throw Error("Only the explicit HSI staging/disposable branches are allowed");
}
export type BranchSummary={id:string;exists:boolean;state:string|null;safeNonProduction:boolean};
export function summariseBranches(projectId:string,rows:unknown):BranchSummary[]{
 assertNonProductionBranch(projectId,STAGING_BRANCH);
 if(!Array.isArray(rows))throw Error("Neon branch listing is invalid");
 for(const raw of rows)if(!raw||typeof raw!=="object"||typeof raw.id!=="string"||(raw.project_id!==undefined&&raw.project_id!==projectId))throw Error("Neon branch identity mismatch");
 return [STAGING_BRANCH,DISPOSABLE_BRANCH].map(id=>{const matches=rows.filter(r=>r.id===id);if(matches.length>1)throw Error("Duplicate branch identity in listing");const b=matches[0];return{id,exists:!!b,state:typeof b?.current_state==="string"?b.current_state:null,safeNonProduction:!!b&&b.default!==true&&b.is_default!==true&&id!==PRODUCTION_BRANCH};});
}
export function validateTestIdentityPair(a:{id:string;email:string},b:{id:string;email:string}){
 for(const x of [a,b])if(!x.id?.trim()||x.id!==x.id.trim()||!/^\S+@\S+\.\S+$/.test(x.email?.trim()??""))throw Error("Two actual provider identities are required");
 if(a.id===b.id||a.email.trim().toLowerCase()===b.email.trim().toLowerCase())throw Error("Researcher and scientific reviewer must be separate identities");
 return {distinct:true as const,reviewerPermission:"not_verified" as const};
}
export async function inspectNeonBranches(apiKey:string,request:typeof fetch=fetch){
 if(!apiKey.trim())throw Error("NEON_API_KEY is not configured");
 const headers={Accept:"application/json",Authorization:`Bearer ${apiKey}`};
 const get=async(path:string)=>{const r=await request(`https://console.neon.tech/api/v2/projects/${HSI_PROJECT}${path}`,{method:"GET",headers,cache:"no-store",redirect:"error",signal:AbortSignal.timeout(10000)});if(!r.ok)throw Error(`Neon management request denied (HTTP ${r.status})`);return r.json() as Promise<Record<string,unknown>>;};
 const project=await get("");const details=project.project as Record<string,unknown>|undefined;if(details?.id!==HSI_PROJECT)throw Error("HSI project identity could not be verified");
 const all:unknown[]=[];const seen=new Set<string>();let cursor:string|undefined;
 for(let page=0;page<20;page++){
  const result=await get(`/branches${cursor?`?cursor=${encodeURIComponent(cursor)}`:""}`);if(!Array.isArray(result.branches))throw Error("Invalid Neon branch listing");all.push(...result.branches);
  const next=(result.pagination as Record<string,unknown>|undefined)?.cursor;if(next===undefined||next===null||next==="")return{projectId:HSI_PROJECT,branches:summariseBranches(HSI_PROJECT,all),listingComplete:true};
  if(typeof next!=="string"||seen.has(next)||page===19)throw Error("Neon pagination is invalid or incomplete");seen.add(next);cursor=next;
 }
 throw Error("Neon listing incomplete");
}
export async function inspectSignIn(url:string,request:typeof fetch=fetch){
 const u=new URL(url);if(u.protocol!=="https:"||u.username||u.password||u.search||u.hash)throw Error("Use a credential-free HTTPS sign-in URL");
 const r=await request(u,{method:"GET",redirect:"error",cache:"no-store",signal:AbortSignal.timeout(10000)});
 return{httpStatus:r.status,contentType:r.headers.get("content-type"),authenticated:false,loginAttempted:false};
}
