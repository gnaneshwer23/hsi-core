import {test,expect} from "bun:test";
import {summariseProviderSessionChecks,inspectProviderDatabaseSession} from "../src/db/providerSessionDiagnostics";
const eligible={user_visible:true,email_verified:true,user_not_banned:true,session_visible:true,session_active:true,session_not_impersonated:true,token_usable:true};
test("session diagnostics distinguish every eligibility gate without returning source fields",()=>{
 const result=summariseProviderSessionChecks({...eligible,token:"never-expose",email:"private@example.invalid",id:"private-id"});expect(result.status).toBe("session_eligible");expect(Object.values(result.checks).every(v=>v===true)).toBe(true);expect(JSON.stringify(result)).not.toContain("never-expose");expect(JSON.stringify(result)).not.toContain("private");
 const cases={user_visible:"database_user_not_visible",email_verified:"database_email_not_verified",user_not_banned:"database_user_disabled",session_visible:"database_session_not_visible",session_active:"database_session_expired",session_not_impersonated:"database_session_impersonated",token_usable:"database_session_token_unusable"};
 for(const [key,status] of Object.entries(cases))expect(summariseProviderSessionChecks({...eligible,[key]:false}).status).toBe(status);
 expect(summariseProviderSessionChecks({}).status).toBe("database_user_not_visible");expect(summariseProviderSessionChecks({...eligible,session_active:"true"}).status).toBe("database_session_expired");
});
test("diagnostics refuse unknown database targets and unverified empty identities before connecting",async()=>{
 await expect(inspectProviderDatabaseSession({databaseUrl:"postgresql://user:secret@unknown.example/neondb",sessionId:"session",userId:"user"})).rejects.toThrow("HSI database target rejected");
 await expect(inspectProviderDatabaseSession({databaseUrl:"postgresql://user:never-used@ep-sweet-hill-zasb0lni.c-2.eu-west-2.aws.neon.tech/neondb?sslmode=require",sessionId:"",userId:""})).rejects.toThrow("Verified session identity required");
});
