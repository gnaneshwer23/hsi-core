/** Heuristic only (email, phone-like and NHS-number-shaped numbers, dd/mm/yyyy dates, UK postcodes). It is not
 *  de-identification. Shared by the graph agents and the ontology mapping review. */
const IDENTIFYING=[/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/,/\b\d{3}[ -]?\d{3}[ -]?\d{4}\b/,/(?:\+\d{1,3}[ -]?)?\(?\d{2,5}\)?[ -]?\d{3,4}[ -]?\d{3,4}\b(?=\D|$)/,/\b\d{1,2}[/.-]\d{1,2}[/.-](?:\d{2}|\d{4})\b/,/\b[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}\b/i];
export const looksIdentifying=(t:string)=>IDENTIFYING.some(r=>r.test(t));
