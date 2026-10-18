import { useState } from "react";
import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";
import { Check, Copy, ExternalLink, HelpCircle, LifeBuoy, Mail, MessageSquare, Trash2 } from "lucide-react";
import { SUPPORT_EMAIL } from "../constants";

// Opens Gmail's web compose — works for people with no mail app set up,
// where a plain mailto: link does nothing.
const GMAIL_URL = `https://mail.google.com/mail/?view=cm&fs=1&to=${SUPPORT_EMAIL}&su=${encodeURIComponent("SplitPe support")}`;

const helpLinks = [
  {
    icon: MessageSquare,
    title: "Message us in the app",
    description: "Open SplitPe → Profile → Help & Support → Message support. Replies come as a notification.",
  },
  {
    icon: HelpCircle,
    title: "Common questions",
    description: "Splits, settling up, groups, iOS — answered in the FAQ.",
    to: "/#faq",
  },
  {
    icon: Trash2,
    title: "Delete your account",
    description: "Instant from the app, or send us a request if you can't open it.",
    to: "/delete-account",
  },
];

/** Contact options that work without a mail app (the old header link was a bare mailto:). */
export default function Support() {
  const [copied, setCopied] = useState(false);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy our support email:", SUPPORT_EMAIL);
    }
  };

  const buttonClass = "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition";

  return (
    <div>
      <PageHero icon={LifeBuoy} tag="We are here to help" title="Help &" highlight="Support." />

      <section className="container-page max-w-5xl pb-16 sm:pb-20">
        <div className="glass-card rise p-6 sm:p-10" style={{ animationDelay: "0.3s" }}>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-splitpe-50 text-splitpe-600">
                <Mail className="h-6 w-6" />
              </span>
              <div>
                <h2 className="text-xl font-bold text-slate-950">Email our team</h2>
                <p className="mt-1 break-all font-semibold text-splitpe-700">{SUPPORT_EMAIL}</p>
                <p className="mt-1 text-sm text-slate-600">We usually reply within 1–2 working days.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={copyEmail} className={`${buttonClass} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`}>
                {copied ? <Check className="h-4 w-4 text-mint-600" /> : <Copy className="h-4 w-4" />} {copied ? "Copied" : "Copy email"}
              </button>
              <a href={GMAIL_URL} target="_blank" rel="noopener" className={`${buttonClass} bg-splitpe-600 text-white hover:bg-splitpe-700`}>
                <ExternalLink className="h-4 w-4" /> Open in Gmail
              </a>
              <a href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("SplitPe support")}`} className={`${buttonClass} border border-slate-200 bg-white text-slate-700 hover:bg-slate-50`}>
                <Mail className="h-4 w-4" /> Mail app
              </a>
            </div>
          </div>

          <p className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
            SplitPe will never ask for your OTP, password or bank details. Please don't share them with anyone.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3" data-scrub="rise">
            {helpLinks.map(({ icon: Icon, title, description, to }) => {
              const body = (
                <>
                  <Icon className="h-5 w-5 text-splitpe-600" />
                  <h3 className="mt-3 text-base font-bold text-slate-950">{title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
                </>
              );
              const cls = "block rounded-[22px] border border-white bg-white/80 p-5 shadow-[0_14px_34px_-14px_rgba(30,64,175,0.25)]";
              return to ? (
                <Link key={title} to={to} className={`${cls} transition duration-300 hover:-translate-y-1`}>{body}</Link>
              ) : (
                <div key={title} className={cls}>{body}</div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
