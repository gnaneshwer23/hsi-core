import {test,expect} from '@playwright/test';
test('shared header stays usable without overlap across mobile and desktop widths',async({page})=>{
 for(const width of [320,390,768,1150,1280,1440,1920]){
  await page.setViewportSize({width,height:900});await page.goto('/');const header=page.getByRole('banner');
  await expect(header.getByRole('link',{name:'Human Super Intelligence home',exact:true})).toBeVisible();
  const links=await header.locator('.hsi-nav-inner > a,.hsi-nav-inner > nav,.hsi-nav-inner > .hsi-header-actions').evaluateAll(els=>els.map(e=>e.getBoundingClientRect()).filter(r=>r.width&&r.height).map(r=>({x:r.x,right:r.right,width:r.width,height:r.height})));
  for(let i=1;i<links.length;i++)expect(links[i]!.x,`Header overlap at ${width}`).toBeGreaterThanOrEqual(links[i-1]!.right-1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`Overflow at ${width}`).toBe(true);
 }
});
test('desktop Research menu closes with Escape/outside click and reaches its destinations',async({page})=>{
 await page.setViewportSize({width:1440,height:900});await page.goto('/');const more=page.getByRole('button',{name:'Research',exact:true});await more.click();await expect(more).toHaveAttribute('aria-expanded','true');
 await page.keyboard.press('Escape');await expect(more).toBeFocused();await expect(more).toHaveAttribute('aria-expanded','false');await more.click();await page.getByRole('heading',{level:1}).click();await expect(more).toHaveAttribute('aria-expanded','false');
 await more.click();await page.locator('#research-pages').getByRole('link',{name:'Evidence Intelligence',exact:true}).click();await expect(page).toHaveURL(/evidence-intelligence$/);await expect(more).toHaveAttribute('aria-expanded','false');
});
test('mobile menu uses a clear icon, touch targets and working account/navigation links',async({page})=>{
 await page.setViewportSize({width:320,height:800});await page.goto('/science/graph');const toggle=page.getByRole('button',{name:'Open menu',exact:true});await expect(toggle.locator('svg')).toBeVisible();const box=(await toggle.boundingBox())!;expect(box.width).toBeGreaterThanOrEqual(44);expect(box.height).toBeGreaterThanOrEqual(44);await toggle.click();
 const drawer=page.getByRole('navigation',{name:'Mobile navigation'});
 await expect(drawer.getByRole('link',{name:'Sign in',exact:true})).toBeVisible();
 await expect(drawer.getByRole('link',{name:'Sign up',exact:true})).toHaveCount(0);
 await expect(drawer.getByRole('link',{name:'Request access',exact:true})).toHaveText(/Request access/);await drawer.getByRole('link',{name:'Request access',exact:true}).click();await expect(page).toHaveURL(/contact$/);await expect(drawer).toBeHidden();
});
test('footer has product navigation, clear project links and accessible touch targets',async({page})=>{
 for(const width of [320,768,1440]){
  await page.setViewportSize({width,height:900});await page.goto('/');const footer=page.getByRole('contentinfo');await footer.scrollIntoViewIfNeeded();
  await expect(footer.getByRole('navigation',{name:'Footer research'})).toBeVisible();await expect(footer.getByRole('link',{name:'Context-Conflict Audit',exact:true})).toHaveAttribute('href','/context-conflict-audit');await expect(footer.getByRole('navigation',{name:'Footer trust'})).toBeVisible();
  for(const a of await footer.locator('nav a').all())expect((await a.boundingBox())!.height).toBeGreaterThanOrEqual(44);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 }
 await page.getByRole('contentinfo').getByRole('link',{name:'Context-Conflict Audit',exact:true}).click();await expect(page).toHaveURL(/context-conflict-audit$/);
});
test('primary and secondary actions remain readable and large enough on light and dark sections',async({page})=>{
 await page.goto('/');const heroActions=page.locator('.hsi-home-hero .hsi-actions a');await expect(heroActions).toHaveCount(2);const buttons=page.locator('.hsi-action');
 for(const button of await buttons.all()){
  const b=(await button.boundingBox())!;expect(b.height).toBeGreaterThanOrEqual(44);
  const ratio=await button.evaluate(el=>{const toRgb=(s:string)=>(s.match(/[\d.]+/g)??[]).slice(0,3).map(Number);let bg=getComputedStyle(el).backgroundColor;let p=el.parentElement;while((bg==='rgba(0, 0, 0, 0)'||bg==='transparent')&&p){bg=getComputedStyle(p).backgroundColor;p=p.parentElement}const lum=(rgb:number[])=>rgb.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i]!,0);const a=lum(toRgb(getComputedStyle(el).color)),b=lum(toRgb(bg));return (Math.max(a,b)+.05)/(Math.min(a,b)+.05)});
  expect(ratio).toBeGreaterThanOrEqual(4.5);
 }
});
