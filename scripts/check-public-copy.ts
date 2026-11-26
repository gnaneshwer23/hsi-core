/**
 * User-facing copy must use one product name: Human Super Intelligence.
 * Public demonstrations must state their synthetic nature; no scientific acceptance is implied.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const WRONG_BRAND = ["Health Super Intelligence", "Human Systems Intelligence", "Akeno"];

const LANDING_FILES = [
  "site/public/llms.txt",
  "site/src/lib/seo/siteSeo.ts",
  "site/src/landing-v2/pages/index.tsx",
  "site/src/components/Footer.tsx",
];

function walk(dir: string, out: string[]): void {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (name.endsWith(".tsx") || name.endsWith(".ts")) out.push(path);
  }
}

export function findPublicCopyIssues(cwd = process.cwd()): string[] {
  const issues: string[] = [];
  const siteFiles: string[] = [];
  walk(resolve(cwd, "site/src"), siteFiles);
  const brandTargets = [...siteFiles, resolve(cwd, "README.md"), resolve(cwd, "NAME.md"), resolve(cwd, "site/public/llms.txt")];
  for (const file of brandTargets) {
    const text = readFileSync(file, "utf8");
    for (const phrase of WRONG_BRAND) {
      if (text.includes(phrase)) issues.push(`${file} contains "${phrase}"`);
    }
  }
  for (const relative of LANDING_FILES) {
    const text = readFileSync(resolve(cwd, relative), "utf8");
    if (/100% accurate|clinically proven platform/i.test(text)) issues.push(`${relative} contains an unsupported accuracy claim`);
  }
  // Current public positioning: one HSI technology, never the retired product portfolio.
  for (const relative of ["site/src/pages/ScientificPublic.tsx", "site/src/landing-v2/pages/trust.tsx", "site/src/landing-v2/pages/about.tsx", "site/src/landing-v2/pages/index.tsx", "site/src/lib/seo/siteSeo.ts", "site/public/llms.txt"]) {
    if (/Aksh Health|HSI Clinical|Immune Super Intelligence|HSI Trials|four governed modules|four products/i.test(readFileSync(resolve(cwd, relative), "utf8"))) issues.push(`${relative} reintroduces retired public product positioning`);
  }
  const readme = readFileSync(resolve(cwd, "README.md"), "utf8");
  if (!/\bsynthetic\b/i.test(readme)) issues.push("README.md must state that demonstration data is synthetic");
  const home = readFileSync(resolve(cwd, "site/src/landing-v2/components/home/Hero.tsx"), "utf8");
  if (!home.includes("See what the evidence supports")) issues.push("The homepage hero must keep the approved headline");
  return issues;
}

if (import.meta.main) {
  const issues = findPublicCopyIssues();
  if (issues.length > 0) {
    console.error(issues.join("\n"));
    process.exit(1);
  }
}
