/** Connected, labelled figures. The list stays readable; the layout is the diagram. */

export function FigurePath({
  label,
  steps,
  onSheet,
}: {
  label: string;
  steps: readonly {n: string; title: string; text?: string}[];
  onSheet?: boolean;
}) {
  return (
    <ol className={onSheet ? "fig-path fig-on-sheet" : "fig-path"} aria-label={label}>
      {steps.map((step) => (
        <li key={step.n}>
          <span className="fig-node">{step.n}</span>
          <strong>{step.title}</strong>
          {step.text ? <p>{step.text}</p> : null}
        </li>
      ))}
    </ol>
  );
}

export function FigureBoard({
  label,
  cells,
}: {
  label: string;
  cells: readonly {n: string; title: string; text: string}[];
}) {
  return (
    <ul className="fig-board" aria-label={label}>
      {cells.map((cell) => (
        <li key={cell.title}>
          <span className="fig-node">{cell.n}</span>
          <strong>{cell.title}</strong>
          <p>{cell.text}</p>
        </li>
      ))}
    </ul>
  );
}
