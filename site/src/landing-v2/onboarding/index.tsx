import {useEffect,type ComponentType} from "react";
import {useLocation} from "react-router-dom";
import {applySeo} from "../../lib/seo/applySeo";
import {stepForPath,type StepId} from "../../../../src/onboarding/scientificOnboarding";
import {Welcome,Role,Institution} from "./stepsA";
import {Identity,Science} from "./stepsB";
import {Objectives,Methods,Resources,Preferences} from "./stepsC";
import {Review} from "./Review";

const SCREENS:Record<StepId,ComponentType>={
 welcome:Welcome,role:Role,institution:Institution,identity:Identity,science:Science,objectives:Objectives,methods:Methods,resources:Resources,preferences:Preferences,review:Review,
};

/** One route component for every /onboarding/* path. The answers live in a module store, so they carry across steps. */
export default function Onboarding(){
 const {pathname}=useLocation();
 const step=stepForPath(pathname)??"welcome";
 const Screen=SCREENS[step];
 useEffect(()=>{document.documentElement.dataset.hydrated||="lv2";applySeo(pathname)},[pathname]);
 return <Screen/>;
}
