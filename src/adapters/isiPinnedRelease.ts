/** P0.4 trusted, immutable ISI graph artifact verification.
 * Never trusts a mutable URL, caller-supplied hash without a pinned manifest,
 * or a source's evidence-status labels as HSI scientific approval.
 */
import {createHash} from "node:crypto";
import {stageIsiGraphRelease,type IsiGraphRelease,type IsiStagedGraph} from "./isiGraphReleaseAdapter";
export type IsiPinnedRelease={schemaVersion:"hsi-isi-pinned-release-1";sourceRepository:"gnaneshwer23/immunecity";sourceCommit:string;sourcePath:"src/data/kg.json";graphVersion:"0.3";sha256:string;approvedForStaging:true;approvedForScientificPublication:false};
export function verifyPinnedIsiRelease(input:{manifest:IsiPinnedRelease;bytes:string}):IsiStagedGraph{
 const {manifest:m,bytes}=input;
 if(!m||m.schemaVersion!=="hsi-isi-pinned-release-1"||m.sourceRepository!=="gnaneshwer23/immunecity"||m.sourcePath!=="src/data/kg.json"||m.graphVersion!=="0.3"||m.approvedForStaging!==true||m.approvedForScientificPublication!==false||!/^[a-f0-9]{40}$/.test(m.sourceCommit)||!/^[a-f0-9]{64}$/.test(m.sha256))throw Error("Invalid immutable ISI release manifest");
 if(bytes.length>3_000_000||createHash("sha256").update(bytes,"utf8").digest("hex")!==m.sha256)throw Error("ISI release integrity mismatch");
 let parsed:unknown;try{parsed=JSON.parse(bytes)}catch{throw Error("Invalid ISI release JSON")}
 const staged=stageIsiGraphRelease(parsed as IsiGraphRelease);
 if(staged.sourceVersion!==m.graphVersion||staged.rejected.length)throw Error("ISI release contains invalid graph records");
 return staged;
}
