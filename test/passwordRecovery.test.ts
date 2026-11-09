import type { FetchLike } from "../src/fetchLike";
import {test,expect} from 'bun:test';
import {handleAuthGateway} from '../src/server/neonAuthGateway';
import {createHsiAuthClient} from '../site/src/lib/hsiAuthClient';
const config={publicOrigin:'https://hsi.example.invalid',authBaseUrl:'https://provider.example.invalid/neondb/auth'};
const post=(path:string,body:unknown,origin=config.publicOrigin)=>new Request(config.publicOrigin+'/api/auth'+path,{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)});
const token='test-only-recovery-token-not-valid';
test('password recovery fixes redirect, removes arbitrary fields, and confirms provider acceptance',async()=>{
 let outgoing:unknown;const transport=(async(url,init)=>{expect(String(url)).toBe(config.authBaseUrl+'/request-password-reset');outgoing=JSON.parse(String(init?.body));return Response.json({status:true,token:'must-not-leak'})}) as FetchLike;
 const result=await handleAuthGateway(post('/request-password-reset',{email:' test@example.invalid ',redirectTo:'https://attacker.example',role:'admin'}),config,transport);
 expect(result.status).toBe(200);expect(outgoing).toEqual({email:'test@example.invalid',redirectTo:config.publicOrigin+'/reset-password'});expect(await result.json()).toEqual({success:true});expect(result.headers.get('cache-control')).toBe('no-store');
});
test('recovery denies cross-origin and malformed requests before outbound work',async()=>{
 let calls=0;const transport=(async()=>{calls++;return Response.json({status:true})}) as FetchLike;
 for(const [path,body,origin,status] of [
  ['/request-password-reset',{email:'test@example.invalid'},'https://attacker.example',403],
  ['/request-password-reset',{email:'invalid'},config.publicOrigin,400],
  ['/reset-password',{token:'short',newPassword:'long-test-password'},config.publicOrigin,400],
  ['/reset-password',{token,newPassword:'short'},config.publicOrigin,400],
  ['/reset-password',{token:'x'.repeat(2049),newPassword:'long-test-password'},config.publicOrigin,400],
 ] as const)expect((await handleAuthGateway(post(path,body,origin),config,transport)).status).toBe(status);
 expect(calls).toBe(0);
});
test('reset forwards token only to provider and rejects missing success or provider token failures',async()=>{
 const result=await handleAuthGateway(post('/reset-password',{token,newPassword:'long-test-password',role:'admin'}),config,(async(url,init)=>{expect(String(url)).toBe(config.authBaseUrl+'/reset-password');expect(JSON.parse(String(init?.body))).toEqual({token,newPassword:'long-test-password'});return Response.json({status:true})}) as FetchLike);
 expect(await result.json()).toEqual({success:true});
 for(const path of ['/reset-password','/request-password-reset']){
  const body={token,newPassword:'long-test-password',email:'test@example.invalid'};
  expect((await handleAuthGateway(post(path,body),config,(async()=>Response.json({})) as FetchLike)).status).toBe(502);
  const failure=await handleAuthGateway(post(path,body),config,(async()=>Response.json({code:'INVALID_TOKEN',message:token},{status:400})) as FetchLike);
  expect(failure.status).toBe(400);expect(await failure.text()).not.toContain(token);
 }
});
test('browser recovery transport does not confirm arbitrary JSON, uses credentials and fixed local callback',async()=>{
 let sent:unknown;const transport=(async(url,init)=>{expect(String(url)).toBe('/api/auth/request-password-reset');expect(init?.credentials).toBe('include');sent=JSON.parse(String(init?.body));return Response.json({success:true})}) as FetchLike;
 const client=createHsiAuthClient(config.authBaseUrl,transport,8000,'same-origin');
 expect((await client.requestPasswordReset('test@example.invalid',config.publicOrigin)).error).toBeNull();expect(sent).toEqual({email:'test@example.invalid',redirectTo:config.publicOrigin+'/reset-password'});
 expect((await client.requestPasswordReset('test@example.invalid','https://hsi.example.invalid/elsewhere')).error).not.toBeNull();
 const malformed=createHsiAuthClient(config.authBaseUrl,(async()=>Response.json({})) as FetchLike);
 expect((await malformed.resetPassword(token,'long-test-password')).error?.code).toBe('auth_invalid_response');
});
