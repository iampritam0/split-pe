import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";
import { Bullets, Lead, LegalSection, LegalShell, Note, linkClass } from "../components/LegalDoc";
import { ShieldCheck, Lock, Trash2, UsersRound, Ban, Mail } from "lucide-react";

const usps = [
  {
    icon: Lock,
    title: "Your bank never touches us",
    description: "SplitPe never makes or processes payments — settling up is just a record (UPI or cash). We never see, store or process account or card numbers.",
  },
  {
    icon: Trash2,
    title: "Delete everything, one tap",
    description: "Account deletion is permanent and instant from Settings — no ticket, no 30-day wait.",
  },
  {
    icon: UsersRound,
    title: "Only your circle sees it",
    description: "An expense is visible only to the friends and group members you added to it — no public feed, no strangers.",
  },
  {
    icon: Ban,
    title: "We don't sell data",
    description: "No data brokers, no \"trusted partners\". Full stop.",
  },
];

const collected = [
  {
    category: "Account",
    what: "Name, email address, mobile number (optional), password (encrypted by Firebase Authentication — we never see it in plain text)",
    why: "Create and secure your account, sign you in",
  },
  { category: "Profile", what: "Profile photo (optional)", why: "Shown to your friends and group members" },
  {
    category: "Google Sign-In",
    what: "Name, email and profile photo from your Google account, if you choose that sign-in method",
    why: "Faster sign-in, in place of creating a password",
  },
  {
    category: "Expense data",
    what: "Expenses, amounts, categories, notes, receipt photos, groups, friends, split ratios, settlements, UPI ID (if you add one)",
    why: "The core purpose of the app — tracking who owes what",
  },
  {
    category: "Contacts (optional)",
    what: "If you use \"Import from Contacts\", the names and numbers already on your phone",
    why: "To check which contacts already use SplitPe so you can add them. Each number is looked up against our systems; your full contact list is never uploaded or stored",
  },
  {
    category: "Device & usage",
    what: "Push notification token, general device/app diagnostics, advertising identifier",
    why: "Deliver notifications about new expenses and payments; show ads that keep the app free",
  },
];

const toc = [
  { id: "collect", title: "Information we collect" },
  { id: "never", title: "What we never collect" },
  { id: "sharing", title: "Who it's shared with" },
  { id: "protection", title: "How we protect it" },
  { id: "controls", title: "Your controls" },
  { id: "children", title: "Children's privacy" },
  { id: "changes", title: "Changes to this policy" },
  { id: "contact", title: "Contact us" },
];

export default function PrivacyPolicy() {
  return (
    <div>
      <PageHero
        icon={ShieldCheck}
        tag="आपका डेटा, आपका हक़"
        title="Privacy"
        highlight="Policy."
        meta={[
          { label: "Last updated", value: "19 September 2026" },
          { label: "App", value: "SplitPe for Android" },
        ]}
      />

      <LegalShell toc={toc}>
        <Lead>
          SplitPe ("we", "us") helps you track and split shared expenses with friends and groups. This policy explains
          what information we collect through the app, why, and how you can control it.
        </Lead>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {usps.map(({ icon: Icon, title, description }) => (
            <div key={title} className="flex gap-3 rounded-2xl border border-slate-200/80 bg-white/80 p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-splitpe-50 to-mint-50 text-splitpe-600">
                <Icon className="h-[18px] w-[18px]" />
              </span>
              <div>
                <p className="text-[0.9375rem] font-semibold text-slate-900">{title}</p>
                <p className="mt-0.5 text-sm leading-6 text-slate-600">{description}</p>
              </div>
            </div>
          ))}
        </div>

        <LegalSection id="collect" n={1} title="Information we collect">
          <p>
            We collect only what's needed to run the app: keeping your account, showing your name and photo to people
            you split with, and recording expenses, groups and settlements.
          </p>
          <dl className="divide-y divide-slate-200/80 overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80">
            {collected.map((row) => (
              <div key={row.category} className="p-4 sm:grid sm:grid-cols-[9.5rem_minmax(0,1fr)] sm:gap-5 sm:p-5">
                <dt className="font-semibold text-slate-900">{row.category}</dt>
                <dd className="mt-2 space-y-2 text-[0.9375rem] leading-6 sm:mt-0">
                  <p>
                    <span className="mr-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">What</span>
                    {row.what}
                  </p>
                  <p>
                    <span className="mr-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">Why</span>
                    {row.why}
                  </p>
                </dd>
              </div>
            ))}
          </dl>
        </LegalSection>

        <LegalSection id="never" n={2} title="What we never collect">
          <Bullets
            items={[
              {
                title: "Bank or card numbers.",
                text: "SplitPe does not make or process payments. When you settle up, you only record the amount and whether it was paid by UPI or cash.",
              },
              {
                title: "Your full contact list.",
                text: "Contact import only checks the numbers you choose against existing SplitPe accounts; the list itself stays on your device.",
              },
            ]}
          />
        </LegalSection>

        <LegalSection id="sharing" n={3} title="Who your data is shared with">
          <p>
            Your name, photo, and the expenses and balances you're part of are visible to the friends and group members
            you share them with — that's how splitting a bill works. Beyond that:
          </p>
          <Bullets
            items={[
              {
                title: "Google Firebase",
                text: "stores your account and data (Authentication, Firestore, Cloud Storage) and delivers push notifications, under Google's own privacy terms.",
              },
              {
                title: "Google AdMob",
                text: "shows ads in the app and may use your advertising identifier for ad delivery and measurement.",
              },
              { text: "We do not sell your personal data to anyone, for any reason." },
            ]}
          />
        </LegalSection>

        <LegalSection id="protection" n={4} title="How we protect it">
          <Bullets
            items={[
              { text: "All traffic between the app and our servers is encrypted in transit (TLS)." },
              { text: "Your session token is kept in your device's encrypted secure storage, not in plain text." },
              {
                text: "Firestore security rules restrict every read and write to the account that owns it, or to people you've explicitly shared a group, friend or expense with.",
              },
            ]}
          />
        </LegalSection>

        <LegalSection id="controls" n={5} title="Your controls">
          <Bullets
            items={[
              {
                title: "Delete your account",
                text: (
                  <>
                    anytime from Profile → Privacy &amp; Security → Delete Account. This permanently removes your profile,
                    groups and expense history.{" "}
                    <Link to="/delete-account" className={linkClass}>
                      How deletion works
                    </Link>
                  </>
                ),
              },
              { title: "Hide amounts", text: "on your home screen, and choose which notifications you get, from Settings." },
              {
                title: "Revoke contacts access",
                text: "anytime from your phone's settings — SplitPe still works; you'll just add friends by email, phone or search instead.",
              },
            ]}
          />
        </LegalSection>

        <LegalSection id="children" n={6} title="Children's privacy">
          <p>
            SplitPe keeps track of real money owed between people, so it's meant for users{" "}
            <strong className="font-semibold text-slate-900">18 and older</strong>. We don't knowingly collect data from
            children.
          </p>
        </LegalSection>

        <LegalSection id="changes" n={7} title="Changes to this policy">
          <p>
            If this policy changes in a way that matters, we'll update the date at the top of this page and, for
            significant changes, let you know in the app.
          </p>
        </LegalSection>

        <section id="contact" className="mt-10 scroll-mt-28 border-t border-slate-200/80 pt-10">
          <Note tone="brand" icon={Mail} title="Questions about your data?">
            Write to{" "}
            <a href="mailto:support@splitpe.xyz" className={linkClass}>
              support@splitpe.xyz
            </a>{" "}
            — we reply to every request.
          </Note>
        </section>
      </LegalShell>
    </div>
  );
}
