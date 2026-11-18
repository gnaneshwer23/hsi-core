import {describe,expect,test} from "bun:test";
import {assessOnboardingProfileGateSamples,assessOnboardingProfileStoreGate} from "../src/db/onboardingProfileWriteGate";
import {createMemoryOnboardingProfileStore} from "../src/onboarding/onboardingProfileStore";
import {EMPTY_PROFILE,normalizeProfile} from "../src/onboarding/researcherProfile";
import {handleOnboardingProfileApi} from "../src/server/onboardingProfileApi";
import {pathHonestyLabel,resolveOnboardingProfileMode,saveOnboardingProfile} from "../site/src/lib/onboardingProfileClient";

const stagingUrl="postgresql://test:x@ep-hsi-staging.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require";

describe("onboarding profile write gate",()=>{
  test("defaults off and refuses production even with flag",()=>{
    const samples=assessOnboardingProfileGateSamples();
    expect(samples.defaultOff).toBe(true);
    expect(samples.stagingFlagOn).toBe(true);
    expect(samples.productionRefused).toBe(true);
    expect(samples.writesOffRefused).toBe(true);
    expect(assessOnboardingProfileStoreGate({
      storeEnabled:true,writesEnabled:true,databaseUrl:stagingUrl,
    }).schemaApplied).toBe(false);
  });
});

describe("onboarding profile API",()=>{
  test("status stays localStorage without injected store even when gate opens",async()=>{
    const res=await handleOnboardingProfileApi(new Request("https://hsi.test/api/research/onboarding-profile/status"),{
      storeEnabled:true,writesEnabled:true,databaseUrl:stagingUrl,store:null,
    });
    expect(res!.status).toBe(200);
    const body=await res!.json() as {enabled:boolean;path:string;reason:string;holdsUnchanged:boolean};
    expect(body.enabled).toBe(false);
    expect(body.path).toBe("localStorage");
    expect(body.reason).toContain("SCHEMA_NOT_APPLIED");
    expect(body.holdsUnchanged).toBe(true);
  });

  test("memory store round-trips for a verified principal",async()=>{
    const store=createMemoryOnboardingProfileStore();
    const cfg={storeEnabled:true,writesEnabled:true,databaseUrl:stagingUrl,store,now:()=>new Date("2026-11-18T12:00:00Z")};
    const status=await handleOnboardingProfileApi(new Request("https://hsi.test/api/research/onboarding-profile/status"),cfg);
    expect((await status!.json() as {enabled:boolean;path:string}).enabled).toBe(true);

    const put=await handleOnboardingProfileApi(new Request("https://hsi.test/api/research/onboarding-profile",{
      method:"PUT",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({profile:{...EMPTY_PROFILE,onboarded:true,interests:["immunology"],question:"Why does IL-21 differ across autoimmune contexts?"}}),
    }),cfg,{id:"user-1",emailVerified:true});
    expect(put!.status).toBe(200);
    const saved=await put!.json() as {persisted:boolean;profile:typeof EMPTY_PROFILE};
    expect(saved.persisted).toBe(true);
    expect(saved.profile.interests).toEqual(["immunology"]);

    const get=await handleOnboardingProfileApi(new Request("https://hsi.test/api/research/onboarding-profile"),cfg,{id:"user-1",emailVerified:true});
    const loaded=await get!.json() as {profile:typeof EMPTY_PROFILE;persisted:boolean};
    expect(loaded.persisted).toBe(true);
    expect(loaded.profile?.question).toContain("IL-21");
  });

  test("refuses PHI-looking onboarding text",async()=>{
    const store=createMemoryOnboardingProfileStore();
    const put=await handleOnboardingProfileApi(new Request("https://hsi.test/api/research/onboarding-profile",{
      method:"PUT",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({profile:{...EMPTY_PROFILE,background:"Patient NHS number 123",onboarded:true}}),
    }),{storeEnabled:true,writesEnabled:true,databaseUrl:stagingUrl,store},{id:"user-1",emailVerified:true});
    expect(put!.status).toBe(400);
    expect((await put!.json() as {code:string}).code).toBe("PHI_REFUSED");
  });
});

describe("onboarding profile client",()=>{
  test("resolve mode and honesty labels stay fail-closed by default",async()=>{
    const fetchImpl=async()=>new Response(JSON.stringify({
      enabled:false,path:"localStorage",reason:"HSI_ONBOARDING_PROFILE_STORE_ENABLED is not true",
      holdsUnchanged:true,schemaApplied:false,acceptedForScope:false,scientificApproval:false,
    }),{status:200,headers:{"Content-Type":"application/json"}});
    const resolved=await resolveOnboardingProfileMode(fetchImpl);
    expect(resolved.mode).toBe("local");
    expect(pathHonestyLabel(resolved.mode,resolved.status)).toContain("this device only");
    const saved=await saveOnboardingProfile("local",normalizeProfile({...EMPTY_PROFILE,interests:["immunology"]}),fetchImpl);
    expect(saved.path).toBe("local");
  });
});
