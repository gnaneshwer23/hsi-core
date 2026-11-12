import {describe,it,expect} from "bun:test";
import {isPublicProviderAddress,resolveProviderAddress,pinnedProviderLookup,createPinnedProviderTransport} from "../src/researchV2/pinnedProviderTransport";
import {createProviderRunner,type ProviderConfig} from "../src/researchV2/providerReliability";
const config:ProviderConfig={providerId:"openai",modelId:"synthetic",endpoint:"https://api.openai.com/v1/responses",timeoutMs:1000,maxResponseBytes:256};
const payload={instruction:"Synthetic",claim:"A associates with B",passage:"Synthetic evidence only"};
describe("opt-in pinned provider transport",()=>{
 it("denies private, loopback, link-local, mapped, reserved and malformed addresses",()=>{
  for(const address of ["0.0.0.0","10.0.0.1","100.64.0.1","127.0.0.1","169.254.169.254","172.16.0.1","192.168.1.1","192.0.2.1","198.18.0.1","198.51.100.1","203.0.113.1","224.0.0.1","255.255.255.255"]){expect(isPublicProviderAddress(address,4)).toBe(false);}
  for(const address of ["::","::1","fc00::1","fe80::1","::ffff:127.0.0.1","2001:db8::1","2002:7f00:1::","3fff::1","ff02::1"]){expect(isPublicProviderAddress(address,6)).toBe(false);}
  expect(isPublicProviderAddress("8.8.8.8",4)).toBe(true);expect(isPublicProviderAddress("2606:4700::1111",6)).toBe(true);
  expect(isPublicProviderAddress("8.8.8.8",6)).toBe(false);expect(isPublicProviderAddress("127.1",4)).toBe(false);
 });
 it("rejects empty and mixed public/private DNS answers before wire encoding",async()=>{
  let encoded=0;
  for(const answers of [[],[{address:"8.8.8.8",family:4},{address:"::1",family:6}]]){
   const transport=createPinnedProviderTransport(()=>{encoded++;return {body:"{}",headers:{}}},async()=>answers);
   await expect(createProviderRunner(config,transport)(payload)).rejects.toThrow();
  }
  expect(encoded).toBe(0);
 });
 it("pins the accepted address across DNS changes and caller mutation",async()=>{
  let calls=0;const answers=[{address:"8.8.8.8",family:4}];
  const pin=await resolveProviderAddress("api.openai.com",async()=>{calls++;return answers});
  const lookup=pinnedProviderLookup("api.openai.com",pin);answers[0]!.address="127.0.0.1";
  for(let n=0;n<2;n++)lookup("api.openai.com",{},(error,address,family)=>{expect(error).toBeNull();expect(address).toBe("8.8.8.8");expect(family).toBe(4)});
  expect(calls).toBe(1);lookup("evil.test",{},error=>expect(error).toBeInstanceOf(Error));
 });
 it("does not encode or dispatch after a deadline expires during DNS lookup",async()=>{
  let encoded=0;let finish!:(v:{address:string;family:number}[])=>void;
  const transport=createPinnedProviderTransport(()=>{encoded++;return {body:"{}",headers:{}}},()=>new Promise(resolve=>{finish=resolve}));
  await expect(createProviderRunner(config,transport)(payload)).rejects.toThrow("deadline");
  finish([{address:"8.8.8.8",family:4}]);await new Promise(resolve=>setTimeout(resolve,0));expect(encoded).toBe(0);
 });
});
