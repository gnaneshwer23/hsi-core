import {open} from 'node:fs/promises';
import {join} from 'node:path';
/** Fixed published directory, validated content-addressed basename, bounded local read. */
export async function readPublishedGraphSnapshot(directory:string,version:string):Promise<Uint8Array>{
 if(!/^[a-f0-9]{64}$/.test(version))throw Error('Invalid snapshot identity');
 const file=await open(join(directory,version+'.json'),'r');
 try{const stat=await file.stat();if(!stat.isFile()||stat.size>2_000_000)throw Error('Snapshot unavailable');
  const bytes=new Uint8Array(2_000_001);const {bytesRead}=await file.read(bytes,0,bytes.length,0);
  if(bytesRead>2_000_000)throw Error('Snapshot too large');return bytes.slice(0,bytesRead);
 }finally{await file.close()}
}
