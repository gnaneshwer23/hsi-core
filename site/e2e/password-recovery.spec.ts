import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {build} from 'vite';
import {mkdtemp,readFile,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {resolve,extname} from 'node:path';
let directory='';const origin='https://hsi.example.invalid';
test.beforeAll(async()=>{
 directory=await mkdtemp(resolve(tmpdir(),'hsi-auth-qa-'));
 await build({root:resolve('.'),configFile:resolve('vite.config.ts'),envDir:false,logLevel:'silent',define:{'import.meta.env.VITE_HSI_AUTH_BASE_URL':JSON.stringify('https://provider.example.invalid/neondb/auth'),'import.meta.env.VITE_HSI_USE_AUTH_GATEWAY':JSON.stringify('true')},build:{outDir:directory,emptyOutDir:true}});
});
test.afterAll(async()=>{if(directory)await rm(directory,{recursive:true,force:true})});
test.beforeEach(async({page})=>{
 await page.route(origin+'/**',async route=>{
  const path=new URL(route.request().url()).pathname;
  if(path.startsWith('/api/'))return route.fulfill({json:null});
  const asset=path.startsWith('/assets/')?path:'/index.html',mime:Record<string,string>={'.js':'text/javascript','.css':'text/css','.html':'text/html','.woff2':'font/woff2'};
  try{return await route.fulfill({contentType:mime[extname(asset)]??'application/octet-stream',body:await readFile(resolve(directory,'.'+asset))})}catch{return route.fulfill({status:404,body:'Not found'})}
 });
});
test('request recovery uses a neutral confirmation and a single in-flight submission',async({page})=>{
 let calls=0;let release:()=>void=()=>{};const blocked=new Promise<void>(r=>{release=r});
 await page.route(origin+'/api/auth/request-password-reset',async route=>{calls++;expect(route.request().postDataJSON()).toEqual({email:'test@example.invalid',redirectTo:origin+'/reset-password'});await blocked;await route.fulfill({json:{success:true}})});
 await page.goto(origin+'/forgot-password');await page.getByLabel('Email address',{exact:true}).fill('test@example.invalid');
 await page.getByRole('button',{name:'Send recovery email'}).click();await expect(page.getByRole('button',{name:'Please wait…'})).toBeDisabled();
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
 release();await expect(page.getByRole('status')).toContainText('If this address has an eligible account');expect(calls).toBe(1);
});
test('recovery token stays out of URL, storage and metadata; mismatches do not submit',async({page})=>{
 const token='test-only-recovery-token-not-valid';let calls=0;
 await page.route(origin+'/api/auth/reset-password',async route=>{calls++;expect(route.request().postDataJSON()).toEqual({token,newPassword:'a-long-test-password'});await route.fulfill({json:{success:true}})});
 await page.goto(origin+'/reset-password?token='+token);await expect(page).toHaveURL(origin+'/reset-password');
 await page.getByLabel('New password',{exact:true}).fill('a-long-test-password');await page.getByLabel('Confirm new password',{exact:true}).fill('different-test-password');await page.getByRole('button',{name:'Reset password',exact:true}).click();await expect(page.getByRole('alert')).toContainText('matching passwords');expect(calls).toBe(0);
 expect((await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze()).violations).toEqual([]);
 expect(await page.evaluate(()=>JSON.stringify({local:{...localStorage},session:{...sessionStorage},head:document.head.innerHTML}))).not.toContain(token);
 await page.getByLabel('Confirm new password',{exact:true}).fill('a-long-test-password');await page.getByRole('button',{name:'Reset password',exact:true}).click();await expect(page.getByRole('status')).toContainText('Your password was reset');expect(calls).toBe(1);
 await page.reload();await expect(page.getByRole('alert')).toContainText('missing or invalid');
});
test('expired provider token reports safe failure without exposing provider content',async({page})=>{
 await page.route(origin+'/api/auth/reset-password',route=>route.fulfill({status:400,json:{code:'INVALID_TOKEN',message:'sensitive provider detail'}}));
 await page.goto(origin+'/reset-password?token=test-only-expired-token-value');await page.getByLabel('New password',{exact:true}).fill('a-long-test-password');await page.getByLabel('Confirm new password',{exact:true}).fill('a-long-test-password');await page.getByRole('button',{name:'Reset password',exact:true}).click();await expect(page.getByRole('alert')).toContainText('invalid or has expired');await expect(page.getByRole('main')).not.toContainText('sensitive provider detail');
});
