import {test,expect} from "@playwright/test";

// The Vite dev server (`bun run dev`) is what a developer runs. CI tests the production build, so a client-bundle problem that only the dev
// server hits (it threw "node:crypto has been externalized" at import time and every route rendered a blank page) went unnoticed.
// This spec loads real routes on the dev server and fails on a blank page or any page error.
test.use({baseURL:"http://127.0.0.1:4179"});

const ROUTES:[string,RegExp][]=[
 ["/",/See what the evidence supports/i],
 ["/welcome",/Tell us what you work on/i],
 ["/research/account",/Research account/i],
 ["/workspaces",/HSI Research Intelligence/i],
 ["/research/workspace",/Investigation workspace/i],
 ["/research/scientific-workbench",/Investigate mechanisms/i],
];
for(const [path,heading] of ROUTES)test(`dev server renders ${path} with no page errors`,async({page})=>{
 const errors:string[]=[];
 page.on("pageerror",e=>errors.push(e.message));
 page.on("console",m=>{if(m.type()==="error"&&/externalized for browser compatibility|Cannot access .* in client code/.test(m.text()))errors.push(m.text())});
 await page.goto(path);
 await expect(page.locator("main").first()).toContainText(heading,{timeout:30_000});
 expect(errors).toEqual([]);
});

test("the SHA-256 stand-in runs in a real browser and gives the same digest as Node",async({page})=>{
 await page.goto("/");
 // loaded through the dev server in a real browser
 const hex=await page.evaluate(async()=>{
  const m=await import(/* @vite-ignore */ "/src/shims/nodeCryptoBrowser.ts");
  return m.createHash("sha256").update("abc").digest("hex");
 });
 expect(hex).toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
});
