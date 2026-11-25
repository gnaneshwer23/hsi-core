/**
 * Synthetic example for the contradiction lab. The studies, their attributes and results are invented to demonstrate how
 * disagreement is aligned by context. They are not publications, not counts of real evidence, and carry no confidence score.
 */
export type Result = "lowers" | "no effect" | "raises";
export type Variable = "model" | "sex" | "dose" | "timing";
export type Study = { id: string; model: string; sex: string; dose: string; timing: string; result: Result };

export const CLAIM = "Intervention X lowers inflammatory marker Y.";
export const VARIABLES: { key: Variable; label: string }[] = [
  { key: "model", label: "Model" },
  { key: "sex", label: "Sex" },
  { key: "dose", label: "Dose" },
  { key: "timing", label: "Timing" },
];
export const STUDIES: Study[] = [
  { id: "S1", model: "Mouse", sex: "Male", dose: "High", timing: "Before insult", result: "lowers" },
  { id: "S2", model: "Mouse", sex: "Male", dose: "Low", timing: "Before insult", result: "lowers" },
  { id: "S3", model: "Rat", sex: "Male", dose: "High", timing: "Before insult", result: "lowers" },
  { id: "S4", model: "Mouse", sex: "Mixed", dose: "High", timing: "Before insult", result: "lowers" },
  { id: "S5", model: "Mouse", sex: "Mixed", dose: "Low", timing: "After insult", result: "no effect" },
  { id: "S6", model: "Mouse", sex: "Female", dose: "High", timing: "After insult", result: "raises" },
  { id: "S7", model: "Human cohort", sex: "Mixed", dose: "Not reported", timing: "After insult", result: "no effect" },
  { id: "S8", model: "Mouse", sex: "Female", dose: "Low", timing: "After insult", result: "no effect" },
];

export type Group = { name: string; studies: Study[]; majority: Result; agree: number; scored: boolean };
const MISSING = "Not reported";

function majorityOf(list: Study[]): { r: Result; n: number } {
  const c: Record<Result, number> = { lowers: 0, "no effect": 0, raises: 0 };
  for (const s of list) c[s.result]++;
  const r = (Object.keys(c) as Result[]).sort((a, b) => c[b] - c[a])[0]!;
  return { r, n: c[r] };
}

/** Groups studies by one variable. A group of one cannot be assessed and is kept visible but not scored; missing values are their own visible group. */
export function groupBy(variable: Variable | null): Group[] {
  if (!variable) {
    const m = majorityOf(STUDIES);
    return [{ name: "All studies", studies: STUDIES, majority: m.r, agree: m.n, scored: true }];
  }
  const order: string[] = [];
  for (const s of STUDIES) if (!order.includes(s[variable])) order.push(s[variable]);
  return order
    .sort((a, b) => (a === MISSING ? 1 : b === MISSING ? -1 : 0))
    .map((name) => {
      const studies = STUDIES.filter((s) => s[variable] === name);
      const m = majorityOf(studies);
      return { name, studies, majority: m.r, agree: m.n, scored: studies.length >= 2 && name !== MISSING };
    });
}

/** Share of scored studies whose result matches the majority result of their group. */
export function agreement(variable: Variable | null): number {
  const groups = groupBy(variable).filter((g) => g.scored);
  const total = groups.reduce((n, g) => n + g.studies.length, 0);
  return total ? groups.reduce((n, g) => n + g.agree, 0) / total : 0;
}
export function verdict(score: number): { label: string; tone: "strong" | "some" | "none" } {
  if (score >= 0.85) return { label: "Separates most results: a strong candidate explanation", tone: "strong" };
  if (score >= 0.65) return { label: "Separates some results: a partial candidate", tone: "some" };
  return { label: "Does not separate the results", tone: "none" };
}
export function gaps(): string[] {
  const out: string[] = [];
  const missing = STUDIES.filter((s) => s.dose === MISSING).length;
  if (missing) out.push(`${missing} study did not report dose; it is kept in view as “${MISSING}”, not dropped.`);
  const human = STUDIES.filter((s) => s.model.startsWith("Human")).length;
  out.push(`${human} human study; evidence outside animal models is limited.`);
  out.push("Context variables overlap (every “after insult” study is also the only one not before it), so no single variable is proven.");
  return out;
}
export const resolves: Record<Variable, string> = {
  model: "A study that tests the same intervention in more than one model with dose, sex and timing held fixed.",
  sex: "A study that includes both sexes with dose, timing and model held fixed.",
  dose: "A study that varies dose within one model, sex and timing, and reports every dose.",
  timing: "A study that gives the intervention before and after the insult in the same model, dose and sex.",
};
