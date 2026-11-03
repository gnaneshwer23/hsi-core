/**
 * Resolve DATABASE_URL for HSI Neon scripts.
 * Never commits secrets — reads env / optional neonctl fetch.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  HSI_NEON_BRANCH_ID,
  HSI_NEON_DATABASE,
  HSI_NEON_PROJECT_ID,
} from "./neonGuard";

export type ResolveDatabaseUrlOptions = {
  cwd?: string;
  /** When true, call neonctl for red-wave connection string. */
  fromNeonctl?: boolean;
  env?: NodeJS.ProcessEnv;
};

function loadDotEnvFile(path: string, env: NodeJS.ProcessEnv): void {
  if (!existsSync(path)) return;
  const text = readFileSync(path, "utf8");
  for (const line of text.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (env[key] === undefined) env[key] = val;
  }
}

/** Load .env.local then .env into a copy of process.env (local files win only if unset). */
export function loadLocalEnv(cwd = process.cwd(), base?: NodeJS.ProcessEnv): NodeJS.ProcessEnv {
  const env = { ...(base ?? process.env) };
  // Prefer .env.local over .env for Vercel-style local secrets.
  loadDotEnvFile(resolve(cwd, ".env.local"), env);
  loadDotEnvFile(resolve(cwd, ".env"), env);
  return env;
}

export function fetchHsiDatabaseUrlViaNeonctl(): string {
  const args = [
    "--yes",
    "neonctl",
    "connection-string",
    `--project-id=${HSI_NEON_PROJECT_ID}`,
    `--branch-id=${HSI_NEON_BRANCH_ID}`,
    `--database-name=${HSI_NEON_DATABASE}`,
    "--role-name=neondb_owner",
  ];
  const result = spawnSync("npx", args, {
    encoding: "utf8",
    env: process.env,
  });
  if (result.status !== 0) {
    throw new Error("neonctl connection-string failed; verify authentication and access to the canonical HSI branch.");
  }
  const url = (result.stdout || "").trim().split("\n").filter(Boolean).at(-1);
  if (!url?.startsWith("postgres")) {
    throw new Error("neonctl did not return a postgres URL");
  }
  return url;
}

export function resolveDatabaseUrl(opts?: ResolveDatabaseUrlOptions): {
  databaseUrl: string;
  neonProjectId: string | null;
  source: "env" | "neonctl";
} {
  const cwd = opts?.cwd ?? process.cwd();
  const env = loadLocalEnv(cwd, opts?.env ?? process.env);

  if (opts?.fromNeonctl) {
    return {
      databaseUrl: fetchHsiDatabaseUrlViaNeonctl(),
      neonProjectId: HSI_NEON_PROJECT_ID,
      source: "neonctl",
    };
  }

  const databaseUrl = (env.DATABASE_URL ?? "").trim();
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example → .env.local with HSI red-wave URL, " +
        "or pass --from-neonctl (requires neonctl OAuth / NEON_API_KEY).",
    );
  }

  return {
    databaseUrl,
    neonProjectId: (env.NEON_PROJECT_ID ?? "").trim() || null,
    source: "env",
  };
}
