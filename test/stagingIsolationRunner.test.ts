import {test,expect} from "bun:test";
import {createHash} from "node:crypto";
import {createStagingIsolationRunner,NEXT_B_UNASSIGNED,type IsolationProbe} from "../src/db/stagingIsolationRunner";
const hash=(v:string)=>createHash("sha256").update(v).digest("hex");
const probe=(id="read",actor:IsolationProbe["actor"]="researcher_a",status=200):IsolationProbe=>({id,actor,check:"staging_http_end_to_end",method:"GET",path:"/api/research/interrogative/fixture",expectedStatus:status,expectedBodySha256:hash('{"ok":true}')});
function fixture(extra:Record<string,unknown>={}){let calls=0;const runner=createStagingIsolationRunner({enabled:true,fixture:true,origin:"https://staging.invalid",approvedOrigin:"https://staging.invalid",productionOrigins:["https://production.invalid"],scope:"interrogative_workspace",targetHash:"a".repeat(64),commitSha:"b".repeat(40),authorize:async()=>true,session:async()=>"synthetic=fixture",transport:async()=>{calls++;return Response.json({ok:true})},...extra});return {runner,get calls(){return calls}};}
test("unassigned manifest and default/production gates do not authorize execution",async()=>{
 expect(NEXT_B_UNASSIGNED.approval_record_ref).toBe("NOT_APPROVED");const f=fixture({enabled:undefined});await expect(f.runner.run([probe()])).rejects.toThrow("disabled");expect(f.calls).toBe(0);expect(()=>fixture({productionOrigins:["https://staging.invalid"]})).toThrow();
});
test("whole-batch route/mutation/digest validation dispatches zero HTTP",async()=>{
 for(const p of [{...probe("bad"),path:"//attacker.invalid/x"},{...probe("bad"),method:"POST"},{...probe("bad"),expectedBodySha256:"invalid"}]){const f=fixture();await expect(f.runner.run([probe(),p as IsolationProbe])).rejects.toThrow();expect(f.calls).toBe(0);}
});
test("authorization denial, revoked credentials and wrong response cannot pass",async()=>{
 const a=fixture({authorize:async()=>false});expect((await a.runner.run([probe()])).observations[0]!.outcome).toBe("failed");expect(a.calls).toBe(0);
 const b=fixture({session:async()=>null});expect((await b.runner.run([probe("revoked","revoked_session")])).observations[0]!.outcome).toBe("failed");expect(b.calls).toBe(0);
 const c=fixture({transport:async()=>Response.json({otherOwner:"leaked"},{status:403})});const r=await c.runner.run([probe("cross_scope","researcher_b",403),probe("later")]);expect(r.observations[0]!.outcome).toBe("mismatch");expect(r.unexecutedProbeIds).toEqual(["later"]);expect(JSON.stringify(r)).not.toContain("leaked");
});
test("interleaved actors remain observations, never signed acceptance",async()=>{
 const f=fixture();const r=await f.runner.run([probe("owner_a"),probe("owner_b","researcher_b"),probe("review","reviewer")]);expect(f.calls).toBe(3);expect(r.fixture).toBe(true);expect(r.acceptedForScope).toBe(false);expect(r.productionActivationApproved).toBe(false);
});
test("deadline bounds non-cooperative transport and does not retry",async()=>{
 const f=fixture({timeoutMs:100,transport:async()=>new Promise(()=>{})});const r=await f.runner.run([probe(),probe("later")]);expect(r.observations[0]!.outcome).toBe("failed");expect(r.unexecutedProbeIds).toEqual(["later"]);
});

test("explicit revoked-session and self-review denial responses match only exact expected bodies",async()=>{
 for(const [actor,status,check] of [["revoked_session",401,"logout_session_revocation_enforced"],["researcher_a",403,"self_review_denied"]] as const){
  const f=fixture({transport:async()=>Response.json({ok:true},{status})});const p={...probe("denial",actor,status),check};const r=await f.runner.run([p]);expect(r.observations[0]!.outcome).toBe("matched");expect(r.acceptedForScope).toBe(false);
 }
});
test("simultaneous calls cannot interleave an acceptance run",async()=>{
 let release!:()=>void;const wait=new Promise<void>(r=>{release=r});const f=fixture({authorize:async()=>{await wait;return true}});const first=f.runner.run([probe()]);await expect(f.runner.run([probe()])).rejects.toThrow("already active");release();await first;
});

test("HTTP probes cannot stand in for catalogue, migration or restore evidence",async()=>{
 for(const check of ["restricted_role_no_bypassrls","migration_rollback_verified","backup_restore_verified"] as const){const f=fixture();await expect(f.runner.run([{...probe(),check}])).rejects.toThrow();expect(f.calls).toBe(0);}
});

test("anonymous probe cannot accidentally use a supplied authenticated cookie",async()=>{
 const f=fixture();const r=await f.runner.run([probe("anonymous","anonymous",401)]);expect(r.observations[0]!.outcome).toBe("failed");expect(f.calls).toBe(0);
});
