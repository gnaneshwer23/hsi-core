/** Opt-in server transport; not wired to credentials, routes or live execution. */
import {lookup} from "node:dns/promises";
import {BlockList,isIP,type LookupFunction} from "node:net";
import {request} from "node:https";
import {Readable} from "node:stream";
import {validateProviderConfig,type ProviderTransport,type ProviderConfig,type ProviderPayload} from "./providerReliability";
const blocked=new BlockList();
for(const [ip,prefix] of [["0.0.0.0",8],["10.0.0.0",8],["100.64.0.0",10],["127.0.0.0",8],["169.254.0.0",16],["172.16.0.0",12],["192.0.0.0",24],["192.0.2.0",24],["192.88.99.0",24],["192.168.0.0",16],["198.18.0.0",15],["198.51.100.0",24],["203.0.113.0",24],["224.0.0.0",4],["240.0.0.0",4]] as const)blocked.addSubnet(ip,prefix,"ipv4");
const globalV6=new BlockList();globalV6.addSubnet("2000::",3,"ipv6");
for(const [ip,prefix] of [["2001::",23],["2001:db8::",32],["2002::",16],["3fff::",20]] as const)blocked.addSubnet(ip,prefix,"ipv6");
export function isPublicProviderAddress(address:string,family:number):boolean{
 if(isIP(address)!==family)return false;
 return family===4?!blocked.check(address,"ipv4"):family===6&&globalV6.check(address,"ipv6")&&!blocked.check(address,"ipv6");
}
export type ProviderDnsResolver=(hostname:string)=>Promise<readonly {address:string;family:number}[]>;
/** Reject mixed public/private answers too; never silently select around a forbidden answer. */
export async function resolveProviderAddress(hostname:string,resolve:ProviderDnsResolver=host=>lookup(host,{all:true,verbatim:true})){
 const answers=await resolve(hostname);
 if(!Array.isArray(answers)||!answers.length||answers.length>64)throw Error("Invalid provider DNS answers");
 const pinned=answers.map(a=>({address:a.address,family:a.family}));
 if(pinned.some(a=>!isPublicProviderAddress(a.address,a.family)))throw Error("Provider DNS resolved to a forbidden address");
 return Object.freeze(pinned[0]!);
}
export type ProviderWireEncoder=(config:Readonly<ProviderConfig>,payload:Readonly<ProviderPayload>)=>{body:string;headers:Readonly<Record<string,string>>};
export function pinnedProviderLookup(hostname:string,address:Readonly<{address:string;family:number}>):LookupFunction{
 const pin={...address};
 if(!isPublicProviderAddress(pin.address,pin.family))throw Error("Forbidden provider connection address");
 return (host,options,callback)=>{
  if(host!==hostname)return callback(Error("Provider hostname changed"),"",0);
  if(options.all)callback(null,[{...pin}]);else callback(null,pin.address,pin.family);
 };
}
/** Provider-specific wire/auth encoding is a trusted server dependency, never request supplied.
 * The native connection uses a pinned lookup result while TLS verifies the original hostname.
 * Responses stay streamed through createProviderRunner's deadline and byte limit.
 */
export function createPinnedProviderTransport(encode:ProviderWireEncoder,resolve?:ProviderDnsResolver):ProviderTransport{
 if(typeof encode!=="function")throw Error("Trusted provider wire encoder required");
 return async(config,payload,options)=>{
  const checked=validateProviderConfig(config),url=new URL(checked.endpoint);
  if(options.redirect!=="error"||options.signal.aborted)throw Error("Provider transport aborted or redirect policy invalid");
  const pinned=await resolveProviderAddress(url.hostname,resolve);
  if(options.signal.aborted)throw Error("Provider transport aborted");
  const wire=encode(checked,Object.freeze({...payload}));
  if(typeof wire.body!=="string"||!wire.body.length||Buffer.byteLength(wire.body)>65536)throw Error("Invalid provider wire body");
  const headers={...wire.headers};
  if(Object.keys(headers).some(k=>["host","connection","transfer-encoding","content-length","proxy-authorization"].includes(k.toLowerCase())))throw Error("Provider framing headers are server controlled");
  return new Promise<Response>((accept,reject)=>{
   const req=request(url,{
    method:"POST",agent:false,signal:options.signal,servername:url.hostname,rejectUnauthorized:true,
    family:pinned.family,
    lookup:pinnedProviderLookup(url.hostname,pinned),
    headers:{...headers,"content-length":String(Buffer.byteLength(wire.body))},
   },res=>{
    try{
     const responseHeaders=new Headers();
     for(const [name,value] of Object.entries(res.headers))if(value!==undefined)responseHeaders.set(name,Array.isArray(value)?value.join(", "):value);
     accept(new Response(Readable.toWeb(res) as unknown as BodyInit,{status:res.statusCode??502,headers:responseHeaders}));
    }catch(error){res.destroy();reject(error);}
   });
   req.once("error",reject);req.end(wire.body);
  });
 };
}
