import {test,expect} from '@playwright/test';
import {readFile,writeFile} from 'node:fs/promises';
import {PUBLIC_MARKETING_PATHS} from '../src/lib/primaryNav';

test('all public links and selector states resolve, without linking older engineering pages',async({page},info)=>{
  test.setTimeout(180000);
  const app=await readFile(new URL('../src/App.tsx',import.meta.url),'utf8');
  const routes=new Set(['/',...Array.from(app.matchAll(/<Route path="([^"]+)"/g),m=>'/'+m[1])]);
  const destinations=new Set<string>();const report:{path:string;buttons:number;links:number}[]=[];
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.setViewportSize({width:1440,height:1000});
  for(const path of PUBLIC_MARKETING_PATHS){
    await page.goto(path);await expect(page.getByRole('heading',{level:1})).toBeVisible();
    // Homepage graph mounts after hydration to avoid React #418 float-layout mismatches.
    if(path==='/')await expect(page.locator('#home-knowledge-graph')).toBeVisible();
    async function inspectLinks(){
      const links=await page.locator('a[href]').evaluateAll(as=>as.map(a=>({href:a.getAttribute('href')!,name:(a.textContent||a.getAttribute('aria-label')||'').trim()})));
      for(const link of links){
        expect(link.href,`${path}: ${link.name}`).not.toMatch(/^(?:#|javascript:|undefined|null)$/);
        if(!link.href.startsWith('/')&&!link.href.startsWith('#'))continue;
        const url=new URL(link.href,'http://127.0.0.1:4178'+path);
        expect(routes.has(url.pathname),`${path}: ${link.name} → ${link.href}`).toBe(true);
        expect(['/docs','/gateway','/clinical-timeline','/trials-criteria','/roadmap','/alignment','/curator','/systems','/discovery-engine','/explore']).not.toContain(url.pathname);
        if(url.hash||!PUBLIC_MARKETING_PATHS.includes(url.pathname as typeof path))destinations.add(url.pathname+url.search+url.hash);
        if(url.pathname===path&&url.hash)expect(await page.locator(`[id=${JSON.stringify(decodeURIComponent(url.hash.slice(1)))}]`).count(),`${path}: ${link.href}`).toBe(1);
      }
      return links.length;
    }
    // The lazy graph has its own complete navigation/a11y suite. Its drawer and
    // growing network controls must not invalidate positional marketing selectors.
    const links=await inspectLinks(),buttons=page.getByRole('main').locator('button:not(.ig-experience button):not(.hsi-graph-entry button):not(.sp-live-graph button):not(.sp-workspace button)');
    const count=await buttons.count();
    for(let i=0;i<count;i++){
      const button=buttons.nth(i),label=await button.innerText();
      if(await button.isDisabled()){expect(label).toMatch(/Previous|Next stage/);continue}
      const active=(await Promise.all(['aria-pressed','aria-selected','aria-checked'].map(a=>button.getAttribute(a)))).includes('true');
      const before=await page.getByRole('main').innerText();await button.click();
      if(!active){await expect.poll(()=>page.getByRole('main').innerText(),{message:`${path}: ${label} must change the content`}).not.toBe(before)}
      await inspectLinks();
    }
    report.push({path,buttons:count,links});
  }
  for(const destination of destinations){
    await page.goto(destination);await expect(page.getByRole('heading',{level:1})).toBeVisible();
    await expect(page.getByRole('heading',{level:1})).not.toContainText('This page');
    const hash=new URL(page.url()).hash;
    if(hash)await expect(page.locator(`[id=${JSON.stringify(decodeURIComponent(hash.slice(1)))}]`)).toHaveCount(1);
  }
  expect(errors).toEqual([]);
  await writeFile(info.outputPath('public-navigation.json'),JSON.stringify({pages:report,destinations:[...destinations],errors},null,2));
});

test('all public body links are clickable and reach their intended destinations',async({page})=>{
  test.setTimeout(180000);
  for(const path of PUBLIC_MARKETING_PATHS){
    await page.goto(path);
    const links=await page.getByRole('main').locator('a[href]').evaluateAll(as=>as.map(a=>a.getAttribute('href')!).filter(h=>h.startsWith('/')||h.startsWith('#')));
    for(const href of new Set(links)){
      await page.goto(path);
      await page.getByRole('main').locator(`a[href=${JSON.stringify(href)}]`).first().click();
      const expected=new URL(href,'http://127.0.0.1:4178'+path);
      await expect(page).toHaveURL(expected.href);
      await expect(page.getByRole('heading',{level:1})).toBeVisible();
      if(expected.hash){
        const target=page.locator(`[id=${JSON.stringify(expected.hash.slice(1))}]`);
        await expect(target).toBeInViewport();
      }
    }
  }
});

test('hero illustrations fit their pages and remain legible at mobile sizes',async({page},info)=>{
  const artwork:Record<string,string>={'/technology':'technology','/solutions':'solutions','/evidence-safety':'evidence','/contact':'access'};
  for(const [path,kind] of Object.entries(artwork)){
    for(const width of [320,768,1440]){
      await page.setViewportSize({width,height:1000});await page.goto(path);
      const art=page.locator(`[data-artwork="${kind}"]`);await expect(art).toBeVisible();await expect(art.getByRole('img')).toHaveAccessibleName(/.+/);
      await expect(page.locator('img[src*="hsi-anatomy"]')).toHaveCount(0);
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${path} at ${width}`).toBe(true);
      if(width!==768)await page.screenshot({path:info.outputPath(`${kind}-${width}.png`)});
    }
  }
});

test('header and footer destinations can be clicked',async({page})=>{
  await page.setViewportSize({width:1440,height:1000});await page.goto('/');
  const hrefs=await page.locator('.hsi-nav-inner,#research-pages,.hsi-footer').locator('a[href]').evaluateAll(as=>as.map(a=>a.getAttribute('href')!).filter(h=>h.startsWith('/')));
  for(const href of new Set(hrefs)){
    await page.goto('/');
    let link=page.locator('.hsi-nav,.hsi-footer').locator(`a[href=${JSON.stringify(href)}]:visible`).first();
    if(!await link.count()){await page.getByRole('button',{name:'Research',exact:true}).click();link=page.locator('#research-pages').locator(`a[href=${JSON.stringify(href)}]`)}
    await link.click();await expect(page).toHaveURL(new URL(href,'http://127.0.0.1:4178').href);await expect(page.getByRole('heading',{level:1})).toBeVisible();
  }
});
