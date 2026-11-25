import { useState } from "react";
import { domains } from "../../lib/site-data";
import { StatusTag } from "./ui";

const field =
  "mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30";

export function EarlyAccessForm() {
  const [tried, setTried] = useState(false);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setTried(true);
      }}
      className="max-w-3xl rounded-xl border border-border bg-card/50 p-6 md:p-8"
    >
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <StatusTag s="Prototype" />
        <p className="text-sm text-muted-foreground">
          This form is a prototype. Submissions are not yet stored or sent. Do not enter patient or unpublished
          research data.
        </p>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="text-sm">
          Name
          <input required className={field} name="name" autoComplete="name" />
        </label>
        <label className="text-sm">
          Email
          <input required type="email" className={field} name="email" autoComplete="email" />
        </label>
        <label className="text-sm">
          Organisation
          <input className={field} name="org" />
        </label>
        <label className="text-sm">
          Research role
          <select className={field} name="role" defaultValue="">
            <option value="" disabled>
              Select…
            </option>
            {[
              "Student",
              "Postdoc / Staff scientist",
              "Principal Investigator",
              "Department lead",
              "Biotech / Pharma R&D",
              "Clinical researcher",
            ].map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Scientific domain
          <select className={field} name="domain" defaultValue="">
            <option value="" disabled>
              Select…
            </option>
            {domains.map((d) => (
              <option key={d.key}>{d.name}</option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Interest
          <select className={field} name="interest">
            <option>Join Early Access</option>
            <option>Become a Research Collaborator</option>
            <option>Discuss an Institutional Pilot</option>
          </select>
        </label>
        <label className="text-sm md:col-span-2">
          Intended use case
          <textarea rows={4} className={field} name="use" />
        </label>
      </div>
      <button className="mt-6 rounded-md bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">
        Submit application
      </button>
      {tried && (
        <p
          role="status"
          className="mt-4 rounded-md border border-signal/40 bg-signal/10 p-3 text-sm text-signal"
        >
          Not sent: this form is a prototype and has no connected backend yet. Please contact HSI
          via humansuperintelligence.tech.
        </p>
      )}
    </form>
  );
}
