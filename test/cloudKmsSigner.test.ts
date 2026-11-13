import {expect,test} from "bun:test";
import {generateKeyPairSync,sign} from "node:crypto";
import {createCloudKmsSignMessage,crc32c,loadCloudKmsClient,type CloudKmsClient} from "../src/researchV2/cloudKmsSigner";
import {createManagedSigner} from "../src/researchV2/managedSigner";

const KEY="projects/hsi-prod-1/locations/europe-west2/keyRings/hsi-ring/cryptoKeys/clearance/cryptoKeyVersions/1";
const k=generateKeyPairSync("ed25519");
type Res=Awaited<ReturnType<CloudKmsClient["asymmetricSign"]>>[0];
const fake=(tweak:(res:Res,req:{data:Uint8Array;name:string})=>Res|void=()=>{}):CloudKmsClient=>({async asymmetricSign(req){
 const sig=new Uint8Array(sign(null,Buffer.from(req.data),k.privateKey));
 const ok=crc32c(req.data)===Number(req.dataCrc32c.value);
 const res:Res={name:req.name,signature:sig,signatureCrc32c:{value:crc32c(sig)},verifiedDataCrc32c:ok};
 return [tweak(res,req)??res];
}});
const ac=()=>new AbortController().signal;

test("crc32c matches the standard check value",()=>{expect(crc32c(Buffer.from("123456789"))).toBe(0xe3069283)});
test("signs the raw message through Cloud KMS and the managed signer accepts it against the pinned key",async()=>{
 const s=createManagedSigner({serviceRef:"gcpkms:hsi-ring/clearance",issuer:"authority:independent",keyId:"v1",publicKey:k.publicKey,signMessage:createCloudKmsSignMessage({keyVersionName:KEY,client:fake()})});
 expect(await s.sign("receipt body")).toMatch(/^[A-Za-z0-9_-]{86}$/);
});
test("the request carries a CRC32C of the data and names the exact key version",async()=>{
 const seen:{v:{name:string;crc:number}|null}={v:null};const client:CloudKmsClient={async asymmetricSign(r){seen.v={name:r.name,crc:Number(r.dataCrc32c.value)};return fake().asymmetricSign(r)}};
 await createCloudKmsSignMessage({keyVersionName:KEY,client})({serviceRef:"x",message:Buffer.from("m"),signal:ac()});
 expect(seen.v).toEqual({name:KEY,crc:crc32c(Buffer.from("m"))});
});
test("integrity failures are refused: unconfirmed request data, different key version, bad signature length, bad signature CRC",async()=>{
 const call=(c:CloudKmsClient)=>createCloudKmsSignMessage({keyVersionName:KEY,client:c})({serviceRef:"x",message:Buffer.from("m"),signal:ac()});
 await expect(call(fake(r=>({...r,verifiedDataCrc32c:false})))).rejects.toThrow("did not confirm");
 await expect(call(fake(r=>({...r,name:KEY.replace("/1","/2")})))).rejects.toThrow("different key version");
 await expect(call(fake(r=>({...r,signature:new Uint8Array(10),signatureCrc32c:{value:crc32c(new Uint8Array(10))}})))).rejects.toThrow("invalid signature");
 await expect(call(fake(r=>({...r,signatureCrc32c:{value:1}})))).rejects.toThrow("integrity check");
 await expect(call(fake(r=>({...r,signatureCrc32c:null})))).rejects.toThrow("integrity check");
});
test("a signature from another key is still refused by the managed signer (defence in depth)",async()=>{
 const other=generateKeyPairSync("ed25519");
 const s=createManagedSigner({serviceRef:"gcpkms:x",issuer:"authority:independent",keyId:"v1",publicKey:other.publicKey,signMessage:createCloudKmsSignMessage({keyVersionName:KEY,client:fake()})});
 await expect(s.sign("x")).rejects.toThrow();
});
test("provider errors never surface key names or provider text",async()=>{
 const client:CloudKmsClient={async asymmetricSign(){throw new Error("PERMISSION_DENIED on "+KEY)}};
 const s=createManagedSigner({serviceRef:"gcpkms:x",issuer:"authority:independent",keyId:"v1",publicKey:k.publicKey,signMessage:createCloudKmsSignMessage({keyVersionName:KEY,client})});
 const e=await s.sign("x").then(()=>new Error("no error"),(x:unknown)=>x as Error);expect(e.message).toBe("Managed signing failed");expect(e.message).not.toContain("hsi-prod");
});
test("configuration: exact key VERSION required, never a key or a primary pointer",()=>{
 const mk=(n:string)=>()=>createCloudKmsSignMessage({keyVersionName:n,client:fake()});
 expect(mk(KEY)).not.toThrow();
 for(const bad of [KEY.replace("/cryptoKeyVersions/1",""),KEY.replace("cryptoKeyVersions/1","cryptoKeyVersions/primary"),"projects/x","","../"+KEY])expect(mk(bad)).toThrow();
 expect(()=>createCloudKmsSignMessage({keyVersionName:KEY,client:{} as never})).toThrow();
});
test("the real client loader fails clearly when the package is not installed here",async()=>{
 try{Bun.resolveSync("@google-cloud/kms",process.cwd());return}catch{/* not installed: the expected case */}
 await expect(loadCloudKmsClient()).rejects.toThrow("not installed");
});
