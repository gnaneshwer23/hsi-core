/**
 * Synthetic clinical-plane demonstration. Reads the repository's synthetic validation profiles, evaluates one phenotype
 * definition inside the plane, and attempts releases through the gate: one that is refused (row-level payload), one refused for
 * lack of approval, and one approved. Prints the released aggregate and verifies the audit chain. Synthetic data only.
 *   bun scripts/clinical-plane-demo.ts
 */
import {readFileSync} from "node:fs";
import {emptyAudit,verifyAudit} from "../src/clinicalPlane/auditChain";
import {evaluateCohort,validateDefinition} from "../src/clinicalPlane/phenotype";
import {release,type Approval,type ReleaseRequest} from "../src/clinicalPlane/releaseGate";
import {raisedHbA1cAdults as diabetesGlycaemicResponse} from "../src/clinicalPlane/definitions";
import {loadSyntheticPatients} from "../src/clinicalPlane/syntheticSource";

const graphVersion=(JSON.parse(readFileSync("research/domain-graph/graph.v1.json","utf8")) as {version:string}).version;
const v=validateDefinition(diabetesGlycaemicResponse(graphVersion));if(!v.ok)throw Error(v.error);
const patients=loadSyntheticPatients("site/public/research/validation/v0.1");
const {aggregate,matchedIds}=evaluateCohort(v.def,patients);
const now=new Date().toISOString();
const request:ReleaseRequest={definitionId:v.def.id,requestedBy:"researcher-demo",purpose:"Illustrative synthetic cohort exploration",dataClass:"synthetic"};
const reviewer:Approval={approverId:"reviewer-demo",role:"release_reviewer",decision:"approve",at:now};
let audit=emptyAudit();
console.log(`Definition (from ${v.def.origin.ref}, graph ${graphVersion.slice(0,8)}): ${v.def.title}`);
console.log(`Inside the plane: ${patients.length} synthetic profiles evaluated, ${matchedIds.length} matched (ids stay inside).\n`);
const attempts:[string,Parameters<typeof release>[0]][]=[
 ["row-level payload",{request,graphVersion,aggregate:{...aggregate,matchedIds} as never,approval:reviewer,audit,now}],
 ["no approval",{request,graphVersion,aggregate,approval:null,audit,now}],
 ["approved by reviewer",{request,graphVersion,aggregate,approval:reviewer,audit,now}],
];
for(const [name,input] of attempts){
 const r=release({...input,audit});audit=r.audit;
 console.log(`${name}: ${r.ok?"RELEASED":"REFUSED ("+r.reason+")"}`);
 if(r.ok)console.log(JSON.stringify(r.finding,null,1));
}
console.log(`\nAudit entries: ${audit.entries.length}; chain ${verifyAudit(audit)===null?"verifies":"BROKEN"}.`);
