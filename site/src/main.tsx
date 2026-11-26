import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import {RouteErrorBoundary} from "./lib/RouteErrorBoundary";
import {LV2_INDEXED} from "./landing-v2/indexed";
import "./landing-v2/styles";

const root=document.getElementById("root")!;
const app=<StrictMode><BrowserRouter><RouteErrorBoundary><App /></RouteErrorBoundary></BrowserRouter></StrictMode>;
// Query-driven screens render afresh; public static pages hydrate only their exact route.
if(root.dataset.prerendered===window.location.pathname&&!window.location.search){
 // The homepage chunk loads before hydration starts, so the prerendered markup is hydrated in one pass rather than waiting behind a suspended boundary.
 (window.location.pathname==="/"?import("./landing-v2/HomePage").then(()=>undefined,()=>undefined):(LV2_INDEXED as readonly string[]).includes(window.location.pathname)?import("./landing-v2/LandingV2").then(()=>undefined,()=>undefined):Promise.resolve()).then(()=>{hydrateRoot(root,app)});
}else{createRoot(root).render(app)}
