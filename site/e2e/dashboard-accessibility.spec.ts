import {test,expect} from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// The role dashboards are client-side demonstrations, so their accessibility is the part of them a visitor can actually verify.
// Before this spec, 18 of them failed serious or critical axe rules (a muted-text colour at about 4.0:1, toggle buttons marked
// role=listitem that also carried aria-pressed, and a <dl> whose children were not dt/dd) and nothing noticed.
const ROUTES=[
 "/workspaces","/workspaces/researcher","/workspaces/professor","/workspaces/student","/workspaces/biotech","/workspaces/clinical","/workspaces/laboratory","/workspaces/community","/workspaces/enterprise",
 "/enterprise/professor","/enterprise/student","/enterprise/biotech","/enterprise/clinical","/enterprise/lab","/enterprise/community","/enterprise/participant","/enterprise/funding","/enterprise/pilot",
 "/demo-universe",
];
// The nested <main> findings come from the app shell on every ResearchAppShell page (moderate; see gap-register.spec.ts) and are tracked separately.
const SHELL=new Set(["landmark-main-is-top-level","landmark-no-duplicate-main","landmark-unique"]);
for(const route of ROUTES)test(`${route} has no serious or critical accessibility violations`,async({page})=>{
 await page.goto(route,{waitUntil:"networkidle"});
 await expect(page.locator("main").first()).toBeVisible();
 const r=await new AxeBuilder({page}).analyze();
 const bad=r.violations.filter(v=>["serious","critical"].includes(v.impact??"")&&!SHELL.has(v.id));
 expect(bad.map(v=>`${v.id} (${v.nodes.length}): ${v.nodes[0]?.target.join(" ")}`)).toEqual([]);
});

test("toggle-button sets on the dashboards are labelled groups of real buttons, and still toggle",async({page})=>{
 await page.goto("/workspaces/professor");
 const group=page.getByRole("group",{name:"Knowledge map nodes"});
 await expect(group).toBeVisible();
 const buttons=group.getByRole("button");
 expect(await buttons.count()).toBeGreaterThan(3);
 await expect(buttons.first()).toHaveAttribute("aria-pressed","true");
 await expect(group.getByRole("listitem")).toHaveCount(0);
 await buttons.nth(1).click();
 await expect(buttons.nth(1)).toHaveAttribute("aria-pressed","true");await expect(buttons.first()).toHaveAttribute("aria-pressed","false");
});
