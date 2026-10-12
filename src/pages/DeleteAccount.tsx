import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";
import { Trash2, Mail, AlertTriangle, Zap, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";

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
      <div className="mt-6 flex items-start gap-3 rounded-[22px] border border-mint-200 bg-mint-50/90 p-5">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-mint-700" />
        <p className="text-sm leading-6 text-mint-800 sm:text-base">
          <strong className="font-semibold">Request received.</strong> We've verified +91 {digits} and will delete the account — usually within 3 working days.
        </p>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <form onSubmit={submit} className="mt-6 rounded-[22px] border border-slate-200 bg-white/80 p-5 sm:p-6">
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
    <form onSubmit={(e) => { e.preventDefault(); sendOtp(); }} className="mt-6 rounded-[22px] border border-slate-200 bg-white/80 p-5 sm:p-6">
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
  {
    number: "01",
    title: "Open your Profile",
    description:
      "In the SplitPe app, tap the Profile tab, then go to Privacy & Security.",
  },
  {
    number: "02",
    title: "Go to Danger Zone",
    description: "Scroll down to Danger Zone and tap \"Delete Account\".",
  },
  {
    number: "03",
    title: "Confirm deletion",
    description:
      "Confirm in the dialog. Your account is deleted immediately — no waiting period.",
  },
];

const dataDeleted = [
  "Your profile — name, email, mobile number, and photo",
  "Your login credentials",
  "Your personal settings and preferences",
];

const dataRetained = [
  "Shared expenses stay visible to the other members of your groups, but your name on them will no longer resolve to an account",
  "Information we're legally required to retain (e.g. for fraud prevention or accounting) for a limited period",
];

export default function DeleteAccount() {
  return (
    <div>
      <PageHero
        icon={Trash2}
        tag="एक टैप में डिलीट"
        title="Delete your"
        highlight="account."
        meta={[{ label: "Last updated", value: "September 25, 2026" }]}
      />

      <article className="container-page max-w-5xl pb-16 sm:pb-20">
        <div className="legal glass-card rise p-6 sm:p-10 lg:p-12" style={{ animationDelay: "0.3s" }}>
          <div className="flex items-start gap-3 rounded-[22px] border border-mint-200 bg-mint-50/90 p-5">
            <Zap className="h-5 w-5 shrink-0 text-mint-700" />
            <p className="text-sm leading-6 text-mint-800 sm:text-base">
              <strong className="font-semibold">
                Deletion is instant.
              </strong>{" "}
              Unlike most apps, deleting your SplitPe account isn't a support
              ticket or a 30-day wait — it happens immediately, right from
              Settings.
            </p>
          </div>

          <p className="mt-8 text-base leading-8 text-slate-600 sm:text-lg">
            You can permanently delete your SplitPe account and its
            associated personal data at any time, directly from the app. This
            page explains how, and exactly what happens to your data.
          </p>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              How to Delete Your Account
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="rounded-[22px] border border-white bg-white/80 p-6 shadow-[0_14px_34px_-14px_rgba(30,64,175,0.25)] transition duration-300 hover:-translate-y-1"
                >
                  <span className="text-xs font-bold tracking-widest text-splitpe-600">
                    STEP {step.number}
                  </span>

                  <h3 className="mt-2 text-base font-bold text-slate-950">
                    {step.title}
                  </h3>

                  <p className="mt-2 text-sm leading-7 text-slate-600">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>

            <p className="mt-6 leading-8 text-slate-600">
              Can't access the app? Email us at{" "}
              <a
                href="mailto:support@splitpe.xyz?subject=Account%20Deletion%20Request"
                className="font-semibold text-splitpe-600 hover:text-splitpe-700"
              >
                support@splitpe.xyz
              </a>{" "}
              from your registered email address with "Account Deletion
              Request" in the subject line, or use the form below, and we'll
              process it for you.
            </p>

            <DeletionRequestForm />
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              What Gets Deleted
            </h2>

            <ul className="mt-4 space-y-3">
              {dataDeleted.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm leading-7 text-slate-600 sm:text-base"
                >
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-splitpe-600 to-mint-500" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold text-slate-950">
              What May Be Retained
            </h2>

            <ul className="mt-4 space-y-3">
              {dataRetained.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm leading-7 text-slate-600 sm:text-base"
                >
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-br from-splitpe-600 to-mint-500" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10 flex gap-4 rounded-[22px] border border-amber-200 bg-amber-50/90 p-6">
            <AlertTriangle className="h-6 w-6 shrink-0 text-amber-600" />

            <div>
              <h2 className="text-lg font-bold text-slate-950">
                This action is permanent
              </h2>

              <p className="mt-2 leading-7 text-slate-700">
                Deleting your account permanently removes your profile,
                login, and leaves every group you're in. Shared expenses stay
                visible to other members, but your name on them will no
                longer resolve. This cannot be undone — if you have
                outstanding balances, settle up first.
              </p>
            </div>
          </section>

          <section className="mt-10 callout p-6">
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-splitpe-700" />

              <div>
                <h2 className="text-xl font-bold text-slate-950">
                  Need Help?
                </h2>

                <p className="mt-3 leading-7 text-slate-700">
                  Questions about account deletion? Write to{" "}
                  <a
                    href="mailto:support@splitpe.xyz"
                    className="font-semibold text-splitpe-700 hover:text-splitpe-800"
                  >
                    support@splitpe.xyz
                  </a>
                  . For more on how we handle your data, see our{" "}
                  <Link
                    to="/privacy-policy"
                    className="font-semibold text-splitpe-700 hover:text-splitpe-800"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </div>
          </section>
        </div>
      </article>
    </div>
  );
}
