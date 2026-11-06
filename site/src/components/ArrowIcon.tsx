/** Decorative arrows must not depend on a platform's symbol-font coverage. */
export function ArrowIcon({direction='up-right'}:{direction?:'up-right'|'right'}){
 return <svg className="hsi-arrow-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false"><path d={direction==='right'?'M2 8h12M9 3l5 5-5 5':'M3 13 13 3M3 3h10v10'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
