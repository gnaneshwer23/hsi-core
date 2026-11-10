/**
 * User-facing copy must use one product name: Human Super Intelligence.
 * Landing and marketing sources must not say the data is synthetic.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";

const WRONG_BRAND = ["Health Super Intelligence", "Human Systems Intelligence", "Akeno"];

const LANDING_FILES = [
  "site/public/llms.txt",
  "site/src/pages/Home.tsx",
  "site/src/pages/Products.tsx",
  "site/src/pages/Platform.tsx",
  "site/src/pages/ForAksh.tsx",
  "site/src/pages/ForIsi.tsx",
  "site/src/pages/ForTrials.tsx",
  "site/src/pages/ClinicalModule.tsx",
  "site/src/lib/brand.ts",
  "site/src/lib/seo/siteSeo.ts",
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
    if (/\bsynthetic\b/i.test(text)) issues.push(`${relative} uses the word synthetic on a marketing surface`);
  }
  const readme = readFileSync(resolve(cwd, "README.md"), "utf8");
  if (!/\bsynthetic\b/i.test(readme)) issues.push("README.md must state that demonstration data is synthetic");
  const home = readFileSync(resolve(cwd, "site/src/pages/Home.tsx"), "utf8");
  const homeHero = readFileSync(resolve(cwd, "site/src/components/editorial/HomeHero.tsx"), "utf8");
  const brand = readFileSync(resolve(cwd, "site/src/lib/brand.ts"), "utf8");
  const tagline = "Connecting human biology. Advancing scientific discovery. Transforming our understanding of health.";
  const homeSurface = `${home}\n${homeHero}\n${brand}`;
  if (!homeSurface.includes(tagline)) issues.push("Home.tsx is missing the landing tagline");
  if (!home.includes("HomeHero")) issues.push("Home.tsx must compose HomeHero for the landing tagline");
  return issues;
}

if (import.meta.main) {
  const issues = findPublicCopyIssues();
  if (issues.length > 0) {
    console.error(issues.join("\n"));
    process.exit(1);
  }
}
