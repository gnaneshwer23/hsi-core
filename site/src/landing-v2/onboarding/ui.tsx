import {createContext,useContext,type ReactNode} from "react";
import type {CapabilityStatus,Errors} from "../../../../src/onboarding/scientificOnboarding";

export const ErrorsContext=createContext<Errors>({});
export const useErrors=()=>useContext(ErrorsContext);

export function FieldError({name}:{name:string}){
 const e=useErrors()[name];
 return e?<p id={`err-${name}`} className="ob-error" role="alert">{e}</p>:null;
}

/** A toggle chip. `role` is checkbox for many-of, radio for one-of; both announce state. */
export function Chip({on,onClick,children,role="checkbox",disabled}:{on:boolean;onClick:()=>void;children:ReactNode;role?:"checkbox"|"radio";disabled?:boolean}){
 return <button type="button" role={role} aria-checked={on} disabled={disabled} onClick={onClick} className="ob-chip" data-on={on}>{children}</button>;
}

const STATUS_CLASS:Record<CapabilityStatus,string>={Prototype:"ob-badge ob-badge-proto","In development":"ob-badge ob-badge-dev",Planned:"ob-badge ob-badge-plan",Illustrative:"ob-badge ob-badge-ill"};
export function Status({s}:{s:CapabilityStatus}){return <span className={STATUS_CLASS[s]}>{s}</span>}

export function Note({children,tone="info"}:{children:ReactNode;tone?:"info"|"caution"}){
 return <p className="ob-note" data-tone={tone} role="note">{children}</p>;
}

export function Group({legend,hint,children}:{legend:string;hint?:string;children:ReactNode}){
 return <fieldset className="ob-group"><legend>{legend}</legend>{hint&&<p className="ob-hint">{hint}</p>}<div className="ob-chips">{children}</div></fieldset>;
}

/** A labelled text input wired to the step's validation errors. */
export function TextField({name,label,optional,value,onChange,type="text",autoComplete,maxLength=200,list,hint}:{name:string;label:string;optional?:boolean;value:string;onChange:(v:string)=>void;type?:string;autoComplete?:string;maxLength?:number;list?:string;hint?:string}){
 const err=useErrors()[name];
 return (
  <label className="ob-field">
   <span>{label}{optional&&<span className="ob-optional"> (optional)</span>}</span>
   <input id={`f-${name}`} type={type} value={value} onChange={e=>onChange(e.target.value)} autoComplete={autoComplete} maxLength={maxLength} list={list} aria-invalid={!!err} aria-describedby={err?`err-${name}`:hint?`hint-${name}`:undefined}/>
   {hint&&!err&&<span id={`hint-${name}`} className="ob-hint">{hint}</span>}
   <FieldError name={name}/>
  </label>
 );
}
