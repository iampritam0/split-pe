import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageHero from "../components/PageHero";
import { ArrowLeft, CheckCircle2, Loader2, PartyPopper, ShieldCheck, UserPlus } from "lucide-react";

// SplitPe repo: functions/index.js sendOtp / preRegister — called over the
// plain callable HTTP protocol so the public site doesn't ship the Firebase SDK.
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

const fieldClass =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-base outline-none transition focus:border-splitpe-600 focus:ring-4 focus:ring-splitpe-500/15";
const buttonClass =
  "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-splitpe-600 to-mint-500 px-5 py-3 text-base font-semibold text-white shadow-[0_14px_30px_-10px_rgba(37,99,235,0.6)] transition hover:brightness-110 disabled:opacity-50";

/** Name + mobile, verified with an SMS OTP, saved as a pre-registration (no app account is created). */
function PreRegisterForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"details" | "otp" | "done">("details");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const digits = phone.replace(/\D/g, "").slice(-10);
  const validDetails = name.trim().length >= 2 && /^[6-9]\d{9}$/.test(digits);

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

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await callFunction("preRegister", { name: name.trim(), phone: digits, code: code.trim() });
      setStep("done");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  if (step === "done") {
    return (
      <div className="flex flex-col items-center px-2 py-6 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-splitpe-600 to-mint-500 text-white shadow-[0_14px_30px_-8px_rgba(37,99,235,0.55)]">
          <PartyPopper className="h-8 w-8" />
        </span>
        <h2 className="mt-5 font-heading text-2xl font-black text-slate-950 sm:text-3xl">
          Thanks for showing your interest, {name.trim().split(" ")[0]}!
        </h2>
        <p className="mt-3 max-w-md leading-7 text-slate-600">
          You're on the SplitPe list. We'll reach out on <strong className="font-semibold text-slate-900">+91 {digits}</strong> as soon as it's ready for you.
        </p>
        <p className="mt-2 font-hindi text-lg font-bold text-emerald-700">हिसाब भी, दोस्ती भी</p>
        <Link to="/" className="mt-6 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          <ArrowLeft className="h-4 w-4" /> Back to home
        </Link>
      </div>
    );
  }

  if (step === "otp") {
    return (
      <form onSubmit={verify}>
        <h2 className="text-xl font-bold text-slate-950">Verify your number</h2>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Enter the 6-digit OTP sent to <strong className="font-semibold text-slate-900">+91 {digits}</strong>.{" "}
          <button type="button" onClick={() => { setStep("details"); setError(""); }} className="font-semibold text-splitpe-600 hover:text-splitpe-700">
            Change
          </button>
        </p>
        <input
          className={`${fieldClass} mt-4 text-center font-mono text-2xl tracking-[0.5em]`}
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
        <button type="submit" disabled={code.length !== 6 || busy} className={buttonClass}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />} Verify &amp; register
        </button>
        <p className="mt-4 text-center text-sm text-slate-500">
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
    <form onSubmit={(e) => { e.preventDefault(); sendOtp(); }}>
      <h2 className="text-xl font-bold text-slate-950">Pre-register for SplitPe</h2>
      <p className="mt-1 text-sm leading-6 text-slate-600">Tell us who you are — we'll verify your mobile number with a one-time OTP.</p>
      <label className="mt-5 block text-sm font-semibold text-slate-700" htmlFor="pr-name">Your name</label>
      <input id="pr-name" className={`${fieldClass} mt-1.5`} autoComplete="name" maxLength={60} placeholder="e.g. Rahul Sharma" value={name} onChange={(e) => setName(e.target.value)} required />
      <label className="mt-4 block text-sm font-semibold text-slate-700" htmlFor="pr-phone">Mobile number</label>
      <div className="mt-1.5 flex items-center rounded-xl border border-slate-200 bg-white transition focus-within:border-splitpe-600 focus-within:ring-4 focus-within:ring-splitpe-500/15">
        <span className="pl-3 text-base text-slate-500">+91</span>
        <input id="pr-phone" className="w-full rounded-xl bg-transparent px-2 py-3 text-base outline-none" inputMode="numeric" autoComplete="tel-national" placeholder="10-digit mobile number" value={phone} onChange={(e) => setPhone(e.target.value)} required />
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={!validDetails || busy} className={buttonClass}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />} Send OTP
      </button>
      <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-slate-500">
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-mint-600" />
        <span>
          We only use your name and number to contact you about SplitPe. See our{" "}
          <Link to="/privacy-policy" className="font-semibold text-splitpe-600 hover:text-splitpe-700">Privacy Policy</Link>.
        </span>
      </p>
    </form>
  );
}

export default function PreRegister() {
  return (
    <div>
      <PageHero icon={UserPlus} tag="सबसे पहले जुड़ें" title="Pre-register for" highlight="SplitPe." />
      <section className="container-page max-w-xl pb-16 sm:pb-20">
        <div className="glass-card rise p-6 sm:p-8" style={{ animationDelay: "0.3s" }}>
          <PreRegisterForm />
        </div>
      </section>
    </div>
  );
}
