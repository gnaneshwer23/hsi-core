import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
const root = new URL("../site/", import.meta.url);
describe("static deployment routes", () => {
  it("rewrites registered app pages while preserving real 404s and static JSON paths", () => {
    const config = JSON.parse(readFileSync(new URL("vercel.json", root), "utf8"));
    const app = readFileSync(new URL("src/App.tsx", root), "utf8");
    const routes = [...app.matchAll(/path="([^"*]+)"/g)].map((match) => `/${match[1]}`);
    expect(config.rewrites.map((row: { source: string }) => row.source).sort()).toEqual(routes.sort());
    expect(config.rewrites.every((row: { destination: string }) => row.destination === "/index.html")).toBe(true);
    expect(config.rewrites.some((row: { source: string }) => row.source.includes(".*"))).toBe(false);
  });
});
