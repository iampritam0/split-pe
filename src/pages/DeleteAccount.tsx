import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";
import { Trash2, Mail, AlertTriangle, Loader2, CheckCircle2, ShieldCheck, Check, Archive } from "lucide-react";
import { Lead, LegalSection, LegalShell, Note, linkClass } from "../components/LegalDoc";

// SplitPe repo: functions/index.js sendOtp / requestAccountDeletion — called
// over the plain callable HTTP protocol so the public site doesn't ship the
// Firebase SDK.
const FUNCTIONS_URL = "https://asia-south1-splitpe-b4ca6.cloudfunctions.net";

async function callFunction<T>(name: string, data: Record<string, string>): Promise<T> {
  const res = await fetch(`${FUNCTIONS_URL}/${name}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data }),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok || json?.error) throw new Error(json?.error?.message || "Something went wrong. Please try again.");
  return json.result as T;
}

/**
 * For people who can't open the app: the number is proven with an SMS OTP,
 * then a request is recorded for the SplitPe team to handle.
 */
function DeletionRequestForm() {
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"details" | "otp" | "sent">("details");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const digits = phone.replace(/\D/g, "").slice(-10);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn(resendIn - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const sendOtp = async () => {
    setBusy(true);
    setError("");
    try {
      const { resendAfter } = await callFunction<{ resendAfter: number }>("sendOtp", { phone: digits });
      setStep("otp");
      setCode("");
      setResendIn(resendAfter || 60);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await callFunction("requestAccountDeletion", { phone: digits, code: code.trim(), reason });
      setStep("sent");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (step === "sent") {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-mint-200 bg-mint-50/80 p-5">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-mint-700" />
        <p className="text-sm leading-6 text-mint-800 sm:text-base">
          <strong className="font-semibold">Request received.</strong> We've verified +91 {digits} and will delete the account — usually within 3 working days.
        </p>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <form onSubmit={submit} className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 sm:p-6">
        <h3 className="text-base font-bold text-slate-950">Verify your number</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Enter the 6-digit OTP sent to <strong className="font-semibold text-slate-900">+91 {digits}</strong>.{" "}
          <button type="button" onClick={() => { setStep("details"); setError(""); }} className="font-semibold text-splitpe-600 hover:text-splitpe-700">
            Change
          </button>
        </p>
        <input
          className="mt-4 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-center font-mono text-2xl tracking-[0.5em] outline-none focus:border-splitpe-600"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="••••••"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          autoFocus
          required
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <button type="submit" disabled={code.length !== 6 || busy} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} Verify &amp; send request
        </button>
        <p className="mt-3 text-sm text-slate-500">
          Didn't get it?{" "}
          {resendIn > 0 ? (
            <span>Resend in {resendIn}s</span>
          ) : (
            <button type="button" onClick={sendOtp} disabled={busy} className="font-semibold text-splitpe-600 hover:text-splitpe-700 disabled:opacity-50">
              Resend OTP
            </button>
          )}
        </p>
      </form>
    );
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); sendOtp(); }} className="rounded-2xl border border-slate-200/80 bg-white/80 p-5 sm:p-6">
      <h3 className="text-base font-bold text-slate-950">Request deletion without the app</h3>
      <p className="mt-1 text-sm leading-6 text-slate-600">Enter the mobile number registered on SplitPe. We'll send an OTP to confirm it's yours.</p>
      <div className="mt-4 flex items-center rounded-xl border border-slate-200 bg-white focus-within:border-splitpe-600">
        <span className="pl-3 text-sm text-slate-500">+91</span>
        <input className="w-full rounded-xl bg-transparent px-2 py-2.5 outline-none" inputMode="numeric" autoComplete="tel-national" placeholder="10-digit mobile number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
      </div>
      <textarea className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-splitpe-600" rows={3} maxLength={500} placeholder="Why are you leaving? (optional)" value={reason} onChange={(e) => setReason(e.target.value)} />
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={digits.length !== 10 || busy} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} Send OTP
      </button>
    </form>
  );
}

const steps = [
  { title: "Open your Profile", description: "In the SplitPe app, tap the Profile tab, then Privacy & Security." },
  { title: "Go to Danger Zone", description: "Scroll down to Danger Zone and tap \"Delete Account\"." },
  { title: "Request deletion", description: "Tap \"Request Deletion\" to confirm. Your account is permanently deleted within 24–48 hours — you can cancel the request from the same screen until then." },
];

const dataDeleted = [
  "Your profile — name, email, mobile number and photo",
  "Your login credentials",
  "Your personal settings and preferences",
];

const dataRetained = [
  "Shared expenses stay visible to the other members of your groups, but your name on them will no longer resolve to an account",
  "Information we're legally required to retain (e.g. for fraud prevention or accounting) for a limited period",
];

const toc = [
  { id: "in-app", title: "Delete from the app" },
  { id: "without-app", title: "Can't open the app?" },
  { id: "what-happens", title: "What happens to your data" },
  { id: "help", title: "Need help?" },
];

export default function DeleteAccount() {
  return (
    <div>
      <PageHero
        icon={Trash2}
        tag="Delete anytime"
        title="Delete your"
        highlight="account."
        meta={[{ label: "Last updated", value: "15 October 2026" }]}
      />

      <LegalShell toc={toc}>
        <Lead>
          You can ask for your SplitPe account and its personal data to be permanently deleted at any time, right from the
          app. We delete it within 24–48 hours. This page explains how, and exactly what happens to your data.
        </Lead>

        <LegalSection id="in-app" n={1} title="Delete from the app">
          <ol className="space-y-5">
            {steps.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-splitpe-600 text-sm font-bold text-white">
                  {i + 1}
                </span>
                <div className="pt-1">
                  <p className="font-semibold text-slate-900">{step.title}</p>
                  <p className="mt-0.5">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </LegalSection>

        <LegalSection id="without-app" n={2} title="Can't open the app?">
          <p>
            Verify your registered mobile number below and we'll delete the account for you. You can also email{" "}
            <a href="mailto:support@splitpe.xyz?subject=Account%20Deletion%20Request" className={linkClass}>
              support@splitpe.xyz
            </a>{" "}
            from your registered email address with "Account Deletion Request" in the subject.
          </p>
          <DeletionRequestForm />
        </LegalSection>

        <LegalSection id="what-happens" n={3} title="What happens to your data">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5">
              <p className="flex items-center gap-2 font-semibold text-slate-900">
                <Trash2 className="h-4 w-4 text-red-500" /> Deleted
              </p>
              <ul className="mt-3 space-y-2.5 text-[0.9375rem] leading-6">
                {dataDeleted.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-mint-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 p-5">
              <p className="flex items-center gap-2 font-semibold text-slate-900">
                <Archive className="h-4 w-4 text-slate-500" /> May be retained
              </p>
              <ul className="mt-3 space-y-2.5 text-[0.9375rem] leading-6">
                {dataRetained.map((item) => (
                  <li key={item} className="flex gap-2.5">
                    <span className="mt-[0.6rem] h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Note tone="amber" icon={AlertTriangle} title="This can't be undone">
            Deleting your account removes your profile and login, and takes you out of every group you're in. If you have
            outstanding balances, settle up first.
          </Note>
        </LegalSection>

        <section id="help" className="mt-10 scroll-mt-28 border-t border-slate-200/80 pt-10">
          <Note tone="brand" icon={Mail} title="Need help?">
            Questions about deleting your account? Write to{" "}
            <a href="mailto:support@splitpe.xyz" className={linkClass}>
              support@splitpe.xyz
            </a>
            . For how we handle your data, see our{" "}
            <Link to="/privacy-policy" className={linkClass}>
              Privacy Policy
            </Link>
            .
          </Note>
        </section>
      </LegalShell>
    </div>
  );
}
