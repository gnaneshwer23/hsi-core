import { Link } from "../router";
import { PageHero, Section, StatusTag, meta } from "../components/site/ui";
import { Spine, PaperPanel } from "../components/site/Spine";
import { AccessIntentPanel } from "../../components/AccessIntentPanel";
import { signInHref, signUpHref } from "../../lib/researchContext";

export const pageMeta = meta("Contact — HSI", "Request a design-partner pilot. A browser draft is kept; an account is not research access; permissions are provisioned independently.");

const path = [
  ["Create and verify your account", "Register with your email address and complete the verification process through the configured authentication provider."],
  ["Confirm research access", "An administrator provisions the appropriate permissions. The research backend checks your identity, role and permitted source access."],
  ["Check what you can open", "After you sign in, the research account page shows permissions an administrator has provisioned. This page does not start an investigation, and research writes stay closed."],
] as const;

const tiers = [
  ["Individual researcher", "Research preview for a single investigator: public literature retrieval, published graph and on-device records. Permissions remain administrator-provisioned.", "Prototype"],
  ["Research group", "Group-oriented access for PIs and teams. Organisation tables, seats and confidential science unlocks are not sold on this page.", "Planned"],
  ["Organisation / institution", "Institutional programmes under separate agreement. No subscription price, seat catalogue or auto-provisioned writes are listed here.", "Planned"],
] as const;

export default function Page() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Request a design-partner pilot."
        intro="Tell us the research question. This page keeps a browser draft. An account is not research access."
      >
        <p className="mt-4 max-w-2xl text-sm text-muted-foreground">
          Researcher, source and scientific-review permissions are provisioned independently. The page never claims operator receipt unless the server reports provider acceptance.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="#pilot-request" className="bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90">Start a pilot request</a>
          <Link to={signUpHref()} className="border border-border px-5 py-3 text-sm font-medium hover:border-primary">Create an account</Link>
          <Link to={signInHref()} className="border border-border px-5 py-3 text-sm font-medium hover:border-primary">Sign in</Link>
        </div>
      </PageHero>

      <Section eyebrow="Access path" title="Three separate steps." intro="Each step is separate: an account does not grant research access, and an administrator's grant does not enable research writes.">
        <Spine label="The access path" items={path.map(([title, text]) => ({ title, text }))} />
        <p className="mt-6 max-w-3xl text-sm text-muted-foreground">An access request, when delivery is configured, notifies the operator only. It does not provision permissions.</p>
      </Section>

      <Section id="pilot-request" eyebrow="Pilot request" title="Start a pilot request.">
        <PaperPanel className="max-w-3xl">
          <AccessIntentPanel />
          <p className="mt-4 text-sm" role="note">Browser drafts are optional. Create an account, then an administrator grants research access. Check status on your research account after sign-in.</p>
          <p className="mt-3 text-sm"><Link to="/research/account" className="underline underline-offset-2">Check your research account →</Link></p>
          <p className="mt-2 text-sm"><Link to="/trust" className="underline underline-offset-2">Evidence, review and safety boundaries →</Link></p>
        </PaperPanel>
      </Section>

      <Section eyebrow="Access shapes" title="Planned labels only." intro="No prices, subscriptions or seat SKUs are published here. Labels describe intended access shapes, not a checkout.">
        <div className="grid gap-x-10 gap-y-8 md:grid-cols-3">
          {tiers.map(([t, d, s]) => (
            <div key={t} className="border-t border-border pt-5">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-lg font-medium">{t}</h3>
                <StatusTag s={s} />
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 text-xs text-muted-foreground" role="note">Former /pricing URLs redirect here. Do not treat this section as a commercial offer.</p>
      </Section>
    </>
  );
}
