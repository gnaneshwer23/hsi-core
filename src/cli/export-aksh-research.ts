#!/usr/bin/env bun
import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { buildAkshResearchExport } from "../akshResearchExport";

const revision = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
const output = resolve(process.argv[2] ?? "dist/hsi-aksh-research.json");
const dirty = execFileSync("git", ["status", "--porcelain", "--untracked-files=normal"], { encoding: "utf8" }).trim();
const bundle = buildAkshResearchExport(revision, undefined, dirty ? "includes_local_changes" : "clean");
mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, `${JSON.stringify(bundle, null, 2)}\n`);
console.log(`Wrote ${bundle.cards.length} read-only research cards to ${output}`);
