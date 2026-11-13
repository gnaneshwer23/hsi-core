import path from "node:path";
import {realpathSync} from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import {createPublicGraphSnapshotHandler} from '../src/server/publicGraphSnapshotService';
import {readPublishedGraphSnapshot} from '../src/server/readPublishedGraphSnapshot';
import {DOMAIN_GRAPH_VERSION} from './src/features/science/generatedDomainGraphVersion';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const repoSrc = path.resolve(rootDir, "../src");

export default defineConfig({
  plugins: [react(), {
    name:'hsi-public-graph-backend',
    configureServer(server){
      const handler=createPublicGraphSnapshotHandler({currentVersion:DOMAIN_GRAPH_VERSION,readPublishedSnapshot:version=>readPublishedGraphSnapshot(path.join(rootDir,'public/research/domain-graph/versions'),version)});
      server.middlewares.use(async(req,res,next)=>{
        if((req.url??'').split('?')[0]!=='/api/research/graph/snapshot')return next();
        const controller=new AbortController();req.on('aborted',()=>controller.abort());
        const result=await handler(new Request('http://localhost'+req.url,{method:req.method??'GET',signal:controller.signal}));
        res.statusCode=result.status;result.headers.forEach((value,key)=>res.setHeader(key,value));res.end(new Uint8Array(await result.arrayBuffer()));
      });
    }
  }],
  resolve: {
    alias: {
      "@hsi": repoSrc,
    },
  },
  server: {
    port: 5173,
    fs: {
      // Thin demos import substrate APIs from ../src
      allow: [rootDir, repoSrc, realpathSync(path.join(rootDir,"node_modules"))],
    },
  },
  build: {
    outDir: "dist",
  },
});
