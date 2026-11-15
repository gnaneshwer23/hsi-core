import {useState,type ReactNode} from "react";
import {Link} from "react-router-dom";
import {HsiIdentity} from "../HsiIdentity";
import {departments} from "../../lib/departments";
import {DEPT_ICON,Icon} from "./AppIcons";
import "../../styles/research-home.css";

export type ShellNav="home"|"investigations"|"graph"|"evidence"|"library"|"updates";
const deptIcon=(slug:string)=>DEPT_ICON[slug]??"graph";
/** The researcher app shell: own top bar and sidebar in place of the public header and footer. Shared by Research Home and the investigation workspace. */
export function ResearchAppShell({where,whereIcon="home",active,onSearch,theme="light",children}:{where:string;whereIcon?:string;active:ShellNav;onSearch?:()=>void;theme?:"light"|"dark";children:ReactNode}){
 const [menu,setMenu]=useState(false);
 const cur=(k:ShellNav)=>active===k?"page":undefined;
 return (
  <div className="rh-app" data-theme={theme}>
   <a className="rh-skip" href="#rh-main">Skip to the main content</a>
   <header className="rh-top">
    <button type="button" className="rh-menu" aria-expanded={menu} aria-controls="rh-nav" onClick={()=>setMenu(m=>!m)}><Icon name={menu?"x":"menu"} size={20}/><span className="rh-vh">Menu</span></button>
    <Link to="/" className="rh-brand" aria-label="Human Super Intelligence, public site"><HsiIdentity/></Link>
    <span className="rh-sep" aria-hidden="true"/>
    <span className="rh-where"><Icon name={whereIcon} size={18}/> {where}</span>
    {onSearch?<button type="button" className="rh-kbd" onClick={onSearch} aria-label="Focus search (Command K)"><Icon name="search" size={16}/> Search <kbd>⌘K</kbd></button>:<Link className="rh-kbd" to="/research/home#rh-q" aria-label="Search from Research Home"><Icon name="search" size={16}/> Search</Link>}
    <a className="rh-iconbtn" href="/research/home#rh-updates" aria-label="Scientific updates: none connected"><Icon name="bell" size={19}/></a>
    <Link className="rh-iconbtn" to="/research/account" aria-label="Profile and access"><Icon name="user" size={19}/></Link>
   </header>
   <div className="rh-body">
    <aside className="rh-nav" id="rh-nav" data-open={menu} aria-label="Research navigation">
     <nav aria-label="Primary"><ul>
      <li><Link to="/research/home" aria-current={cur("home")}><Icon name="home"/>Home</Link></li>
      <li><Link to="/research/workspace" aria-current={cur("investigations")}><Icon name="flask"/>Investigations</Link></li>
      <li><Link to="/research/knowledge-graph" aria-current={cur("graph")}><Icon name="graph"/>Knowledge Graph</Link></li>
      <li><Link to="/evidence-intelligence" aria-current={cur("evidence")}><Icon name="layers"/>Evidence Intelligence</Link></li>
      <li><Link to="/research/home#rh-library"><Icon name="book"/>Research Library</Link></li>
      <li><Link to="/research/home#rh-updates"><Icon name="bell"/>Scientific Updates</Link></li></ul></nav>
     <nav aria-label="Explore science"><h2>Explore science</h2><ul>{departments.map(d=><li key={d.slug}><Link to={"/research/knowledge-graph?netDepartment="+d.slug}><Icon name={deptIcon(d.slug)}/>{d.name}</Link></li>)}</ul></nav>
     <nav aria-label="Account"><h2>Account</h2><ul><li><Link to="/research/account"><Icon name="user"/>Profile and access</Link></li><li><Link to="/research/home#rh-interests"><Icon name="spark"/>Preferences</Link></li></ul></nav>
     <div className="rh-status"><b>Research preview</b><span>Candidate-only graph. Nothing is scientifically approved. No clinical advice.</span></div>
    </aside>
    {children}
   </div>
  </div>
 );
}
