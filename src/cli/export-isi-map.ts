#!/usr/bin/env bun
/**
 * Write ISI REL-* suggestion map (curation pointers only — not Gate C).
 * Usage: bun run export:isi-map [outPath]
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import {
  ISI_REL_SUGGESTIONS,
  summarizeIsiRelMappings,
} from "../mappings/isiRelSuggestions";

const outArg = process.argv[2] ?? "exports/hsi-isi-rel-map.json";
const outPath = resolve(process.cwd(), outArg);

const payload = {
  schemaVersion: "hsi-isi-rel-map-1" as const,
  notCds: true as const,
  autoApproveIntoKg: false as const,
  generatedAt: new Date().toISOString(),
  summary: summarizeIsiRelMappings(),
  suggestions: ISI_REL_SUGGESTIONS,
};

mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

console.log(
  JSON.stringify(
    {
      written: outPath,
      summary: payload.summary,
      notCds: payload.notCds,
      autoApproveIntoKg: payload.autoApproveIntoKg,
    },
    null,
    2,
  ),
);
