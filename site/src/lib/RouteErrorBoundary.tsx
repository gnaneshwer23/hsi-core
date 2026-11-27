import {Component,type ReactNode} from "react";
import {useLocation} from "react-router-dom";

type Props={children:ReactNode;resetKey:string};
type State={failed:boolean};

/** Catches a page that fails to load or render (a lost connection, or a stale deploy) and says so, instead of leaving a blank screen. */
class Boundary extends Component<Props,State>{
 state:State={failed:false};
 static getDerivedStateFromError():State{return {failed:true}}
 componentDidUpdate(prev:Props){if(this.state.failed&&prev.resetKey!==this.props.resetKey)this.setState({failed:false})}
 render(){
  if(!this.state.failed)return this.props.children;
  return (
   <div className="lv2">
    <main id="main-content" tabIndex={-1} style={{maxWidth:"40rem",margin:"0 auto",padding:"6rem 1.5rem",minHeight:"100vh"}}>
     <p style={{fontFamily:"var(--font-mono)",fontSize:".75rem",letterSpacing:".14em",textTransform:"uppercase",color:"var(--signal)",margin:0}}>Something went wrong</p>
     <h1 style={{fontFamily:"var(--font-serif)",fontWeight:400,fontSize:"clamp(2rem,6vw,3rem)",lineHeight:1.1,margin:"1rem 0"}}>This page couldn’t load.</h1>
     <p style={{fontSize:"1.0625rem",lineHeight:1.6,color:"var(--muted-foreground)",margin:"0 0 1.5rem"}}>This usually means the connection dropped, or the site was updated while you were reading. Nothing you entered has been lost or sent.</p>
     <div style={{display:"flex",gap:".75rem",flexWrap:"wrap"}}>
      <button type="button" onClick={()=>window.location.reload()} style={{minHeight:44,padding:".5rem 1.25rem",borderRadius:6,border:"1px solid var(--primary)",background:"var(--primary)",color:"var(--primary-foreground)",font:"inherit",fontWeight:500,cursor:"pointer"}}>Reload this page</button>
      <a href="/" style={{minHeight:44,display:"inline-flex",alignItems:"center",padding:".5rem 1.25rem",borderRadius:6,border:"1px solid color-mix(in oklab,var(--foreground) 25%,transparent)",color:"var(--foreground)",textDecoration:"none"}}>Go to the homepage</a>
     </div>
    </main>
   </div>
  );
 }
}

export function RouteErrorBoundary({children}:{children:ReactNode}){
 const {pathname,search}=useLocation();
 return <Boundary resetKey={pathname+search}>{children}</Boundary>;
}
