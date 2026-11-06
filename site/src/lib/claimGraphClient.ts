import {verifyClaimGraph} from '../../../src/knowledgeGraph/claimGraph';
import {deliveryDigest} from './investigationDeliveryClient';
import {CLAIM_GRAPH_VERSION} from '../features/science/generatedClaimGraphVersion';
export async function loadClaimGraph(version:string|null,signal:AbortSignal){
 const expected=version??CLAIM_GRAPH_VERSION;if(!/^[a-f0-9]{64}$/.test(expected))throw Error('Invalid graph version');
 const response=await fetch('/research/claim-graph/versions/'+expected+'.json',{signal,cache:'no-store',redirect:'error',credentials:'omit',headers:{Accept:'application/json'}});
 if(!response.ok||!(response.headers.get('content-type')??'').includes('application/json')||Number(response.headers.get('content-length')??0)>2_000_000||!response.body)throw Error('Graph unavailable');
 const reader=response.body.getReader(),chunks:Uint8Array[]=[];let bytes=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.length;if(bytes>2_000_000)throw Error('Graph exceeds inspection budget');chunks.push(value)}}catch(e){await reader.cancel().catch(()=>{});throw e}finally{reader.releaseLock()}
 const joined=new Uint8Array(bytes);let offset=0;for(const c of chunks){joined.set(c,offset);offset+=c.length}
 return verifyClaimGraph(JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(joined)),deliveryDigest,expected);
}
