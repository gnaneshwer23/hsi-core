import { PageHero, Section, StatusTag, meta } from "../components/site/ui";
import { sources } from "../lib/site-data";

export const pageMeta = meta("Data Sources — HSI", "Public biomedical sources HSI connects to or plans to connect to, with honest status for each integration.");

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Data Sources"
        title="Public evidence, clearly labelled."
        intro="Status reflects HSI's integration work only. Listing a source does not imply a partnership or endorsement."
      />
      <Section eyebrow="Integrations" title="Connected and planned sources.">
        <div className="glass overflow-hidden rounded-2xl">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              <tr>
                <th className="px-5 py-3 font-normal">Source</th>
                <th className="px-5 py-3 font-normal">Type</th>
                <th className="px-5 py-3 font-normal">Status</th>
              </tr>
            </thead>
            <tbody>
              {sources.map((s) => (
                <tr
                  key={s.name}
                  className="border-b border-border/60 last:border-0 hover:bg-accent/40"
                >
                  <td className="px-5 py-3 font-medium">{s.name}</td>
                  <td className="px-5 py-3 text-muted-foreground">{s.type}</td>
                  <td className="px-5 py-3">
                    <StatusTag s={s.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </>
  );
}
