import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
const root = new URL("../site/", import.meta.url);
describe("static deployment routes", () => {
  it("deploys same-origin Bun functions alongside Vite with exact app rewrites", () => {
    const config = JSON.parse(readFileSync(new URL("vercel.json", root), "utf8"));
    const pkg = JSON.parse(readFileSync(new URL("package.json", root), "utf8"));
    expect(config.bunVersion).toBe("1.x");
    expect(pkg.engines.bun).toBe("1.x");
    for (const path of ["auth", "research"]) {
      expect(readFileSync(new URL(`api/${path}/[...path].ts`, root), "utf8")).toContain("handleVercelResearch");
    }
    expect(config.rewrites.some((row:{source:string})=>row.source.startsWith("/api/"))).toBe(false);
  });
  it("rewrites registered app pages while preserving real 404s and static JSON paths", () => {
    const config = JSON.parse(readFileSync(new URL("vercel.json", root), "utf8"));
    const app = readFileSync(new URL("src/App.tsx", root), "utf8");
    const routes = [...app.matchAll(/path="([^"*]+)"/g)].map((match) => `/${match[1]}`);
    expect(config.rewrites.map((row: { source: string }) => row.source).sort()).toEqual(routes.sort());
    expect(config.rewrites.every((row: { source:string; destination:string }) => row.destination === "/_pages/"+row.source.slice(1).replaceAll("/","--")+".html")).toBe(true);
    expect(config.rewrites.some((row: { source: string }) => row.source.includes(".*"))).toBe(false);
  });
});
