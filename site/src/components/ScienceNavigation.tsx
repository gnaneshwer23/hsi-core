import {useEffect,useRef,useState} from 'react';
import {NavLink,useLocation} from 'react-router-dom';
import {departments,departmentPath} from '../lib/departments';
import '../styles/science-navigation.css';

const links=[{to:'/science',label:'Science overview'},...departments.map(d=>({to:departmentPath(d.slug),label:d.name})),{to:'/research/knowledge-graph',label:'Explore Atlas'}];
export function ScienceNavigation({mobile=false}:{mobile?:boolean}){
 const [open,setOpen]=useState(false),root=useRef<HTMLDivElement>(null),trigger=useRef<HTMLButtonElement>(null);
 const {pathname}=useLocation(),active=pathname==='/science'||pathname.startsWith('/departments')||pathname==='/research/knowledge-graph';
 const id=mobile?'mobile-science-links':'science-links';
 useEffect(()=>{setOpen(false)},[pathname]);
 useEffect(()=>{if(!open)return;const outside=(e:PointerEvent)=>{if(!root.current?.contains(e.target as Node))setOpen(false)};document.addEventListener('pointerdown',outside);return()=>document.removeEventListener('pointerdown',outside)},[open]);
 function focusLink(last=false){requestAnimationFrame(()=>{const items=root.current?.querySelectorAll<HTMLAnchorElement>('.hsi-science-links a');(last?items?.[items.length-1]:items?.[0])?.focus()})}
 return <div ref={root} className={'hsi-science-nav'+(mobile?' hsi-science-mobile':'')} onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setOpen(false)}} onKeyDown={e=>{
  if(e.key==='Escape'&&open){e.preventDefault();e.stopPropagation();setOpen(false);trigger.current?.focus()}
  if(e.target===trigger.current&&['ArrowDown','ArrowUp'].includes(e.key)){e.preventDefault();setOpen(true);focusLink(e.key==='ArrowUp')}
  else if(open&&['ArrowDown','ArrowUp','Home','End'].includes(e.key)){const items=[...e.currentTarget.querySelectorAll<HTMLAnchorElement>('.hsi-science-links a')];const index=items.indexOf(document.activeElement as HTMLAnchorElement);if(index>=0){e.preventDefault();items[e.key==='Home'?0:e.key==='End'?items.length-1:(index+(e.key==='ArrowDown'?1:-1)+items.length)%items.length]?.focus()}}
 }}>
  <button ref={trigger} type="button" className={active?'is-active':''} aria-expanded={open} aria-controls={id} onClick={()=>setOpen(v=>!v)}>Explore Science <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12"><path d="m2 4 4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.4"/></svg></button>
  <div className="hsi-science-links" id={id} hidden={!open}>{links.map(l=><NavLink key={l.to} to={l.to} end>{l.label}{l.to==='/research/knowledge-graph'&&<span aria-hidden="true">↗</span>}</NavLink>)}</div>
 </div>
}
