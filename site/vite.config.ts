import path from "node:path";
import {realpathSync} from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import {createPublicGraphSnapshotHandler} from '../src/server/publicGraphSnapshotService';
import {readPublishedGraphSnapshot} from '../src/server/readPublishedGraphSnapshot';
import {DOMAIN_GRAPH_VERSION} from './src/features/science/generatedDomainGraphVersion';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const repoSrc = path.resolve(rootDir, "../src");

// Shared evidence code under ../src hashes with node:crypto. A browser cannot load it (the dev server threw at import time and every route was blank),
// so client builds and the dev server get a small SHA-256 stand-in. The server-side prerender build (`--ssr`) keeps the real module.
const browserNodeCrypto = path.resolve(rootDir, "src/shims/nodeCryptoBrowser.ts");

export default defineConfig(({ isSsrBuild }) => ({
  plugins: [react(), tailwindcss(), {
    name:'hsi-public-graph-backend',
    configureServer(server){
      const handler=createPublicGraphSnapshotHandler({currentVersion:DOMAIN_GRAPH_VERSION,readPublishedSnapshot:version=>readPublishedGraphSnapshot(path.join(rootDir,'public/research/domain-graph/versions'),version)});
      server.middlewares.use(async(req,res,next)=>{
        if((req.url??'').split('?')[0]!=='/api/research/graph-snapshot')return next();
        const controller=new AbortController();req.on('aborted',()=>controller.abort());
        const result=await handler(new Request('http://localhost'+req.url,{method:req.method??'GET',signal:controller.signal}));
        res.statusCode=result.status;result.headers.forEach((value,key)=>res.setHeader(key,value));res.end(new Uint8Array(await result.arrayBuffer()));
      });
    },
    configurePreviewServer(server){
      const handler=createPublicGraphSnapshotHandler({currentVersion:DOMAIN_GRAPH_VERSION,readPublishedSnapshot:version=>readPublishedGraphSnapshot(path.join(rootDir,'public/research/domain-graph/versions'),version)});
      server.middlewares.use(async(req,res,next)=>{
        if((req.url??'').split('?')[0]!=='/api/research/graph-snapshot')return next();
        const controller=new AbortController();req.on('aborted',()=>controller.abort());
        const result=await handler(new Request('http://localhost'+req.url,{method:req.method??'GET',signal:controller.signal}));
        res.statusCode=result.status;result.headers.forEach((value,key)=>res.setHeader(key,value));res.end(new Uint8Array(await result.arrayBuffer()));
      });
    }
  }],
  resolve: {
    alias: [
      { find: "@hsi", replacement: repoSrc },
      ...(isSsrBuild ? [] : [{ find: /^node:crypto$/, replacement: browserNodeCrypto }]),
    ],
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
}));
