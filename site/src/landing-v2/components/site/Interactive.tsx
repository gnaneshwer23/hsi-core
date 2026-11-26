import { useState } from "react";
import { cn } from "../../lib/utils";
import { personas } from "../../lib/site-data";

export function PersonaTabs() {
  const [k, setK] = useState(0);
  const p = personas[k]!;
  return (
    <div className="grid gap-6 md:grid-cols-[280px_1fr]">
      <div role="tablist" className="flex flex-col gap-1">
        {personas.map((x, j) => (
          <button
            key={x.key}
            role="tab"
            aria-selected={j === k}
            onClick={() => setK(j)}
            className={cn(
              "rounded-lg px-4 py-3 text-left text-sm",
              j === k ? "bg-primary/10 text-foreground" : "text-muted-foreground hover:bg-accent",
            )}
          >
            {x.name}
          </button>
        ))}
      </div>
      <div role="tabpanel" className="glass rounded-2xl p-6 md:p-8">
        <h3 className="text-2xl font-semibold">{p.name}</h3>
        <p className="mt-3 text-signal">
          Challenge: <span className="text-muted-foreground">{p.pain}</span>
        </p>
        <ul className="mt-6 space-y-3">
          {p.value.map((v) => (
            <li key={v} className="flex gap-3">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-verify" />
              {v}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
