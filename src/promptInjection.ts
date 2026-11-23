/** Shared heuristic for instructions hidden in untrusted text (provider output, retrieved passages). It is a tripwire, not a defence on its
 *  own: a hit is a flag for exclusion and review, never proof that text is safe when it passes. */
export const INJECTION_PATTERNS:readonly RegExp[]=[
 /ignore\s+(all\s+|any\s+|the\s+)?(previous|prior|above|earlier)\s+(instructions?|prompts?|rules?)/i,
 /disregard\s+.{0,40}(instructions?|rules?|guidelines?)/i,
 /\b(you\s+are\s+now|new\s+instructions?\s*:|act\s+as\s+(an?\s+)?(system|admin|developer))/i,
 /\b(system|developer)\s+(prompt\b|notice\s+to\s+the\s+model)/i,
 /<\/?\s*(system|assistant|tool|function_call|tool_call)\b[^>]*>/i,
 /\[\[?\s*(INST|SYSTEM)\s*\]?\]/i,
];
// eslint-disable-next-line no-control-regex
const STRIP=/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]|\p{Cf}/gu;
/** True when the text, after removing control and format characters and compatibility-normalising, matches an injection pattern. */
export const hasInjectionMarkers=(text:string):boolean=>{const probe=text.replace(STRIP,"").normalize("NFKC");return INJECTION_PATTERNS.some(r=>r.test(probe))};
