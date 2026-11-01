#!/usr/bin/env bun
/**
 * Write Aksh HITL node-id map (curation pointers only — never CDS auto-surface).
 * Usage: bun run export:aksh-map [outPath]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
  AKSH_NODE_SUGGESTIONS,
  akshNodeIdMap,
  summarizeAkshNodeMappings,
} from "../mappings/akshNodeSuggestions";

const outArg = process.argv[2] ?? "exports/hsi-aksh-node-map.json";
const outPath = resolve(process.cwd(), outArg);

const payload = {
  schemaVersion: "hsi-aksh-node-map-1" as const,
  notCds: true as const,
  autoSurfaceCds: false as const,
  cdsRequiresApprovedEstablished: true as const,
  generatedAt: new Date().toISOString(),
  summary: summarizeAkshNodeMappings(),
  claimToAkshNodeId: akshNodeIdMap(),
  suggestions: AKSH_NODE_SUGGESTIONS,
};

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

console.log(
  JSON.stringify(
    {
      written: outPath,
      summary: payload.summary,
      notCds: payload.notCds,
      autoSurfaceCds: payload.autoSurfaceCds,
      mappedClaims: Object.keys(payload.claimToAkshNodeId).length,
    },
    null,
    2,
  ),
);
