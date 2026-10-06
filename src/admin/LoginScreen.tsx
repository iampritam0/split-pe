import { useState } from "react";
import { signInWithCustomToken } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { Loader2, ShieldCheck } from "lucide-react";
import { auth, functions } from "./firebase";

const sendOtpCallable = httpsCallable<{ phone: string }, { resendAfter: number }>(functions, "sendOtp");
const verifyOtpCallable = httpsCallable<{ phone: string; code: string }, { token: string }>(functions, "verifyOtp");

const errorMessage = (err: unknown) =>
  (err as { message?: string })?.message || "Something went wrong. Please try again.";

/**
 * Same phone + OTP sign-in as the mobile app (the sendOtp/verifyOtp Cloud
 * Functions). Signing in only proves who you are — AdminApp then checks the
 * `admin` claim and signs anyone without it straight back out.
 */
export default function LoginScreen({ notice }: { notice?: string }) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const digits = phone.replace(/\D/g, "").slice(-10);

  const requestOtp = async () => {
    setBusy(true);
    setError("");
    try {
      await sendOtpCallable({ phone: digits });
      setStep("code");
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setBusy(true);
    setError("");
    try {
      const { data } = await verifyOtpCallable({ phone: digits, code: code.trim() });
      await signInWithCustomToken(auth, data.token);
    } catch (err) {
      setError(errorMessage(err));
      setBusy(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-card">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-white">
            <ShieldCheck size={22} />
          </div>
          <div>
            <h1 className="font-heading text-xl font-bold text-ink">SplitPe Admin</h1>
            <p className="text-sm text-ink-soft">Authorised team members only</p>
          </div>
        </div>

        {notice && <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{notice}</p>}

        {step === "phone" ? (
          <form onSubmit={(e) => { e.preventDefault(); if (digits.length === 10) requestOtp(); }}>
            <label className="mb-1 block text-sm font-medium text-ink">Mobile number</label>
            <div className="flex items-center rounded-xl border border-slate-200 focus-within:border-splitpe-600">
              <span className="pl-3 text-sm text-ink-soft">+91</span>
              <input
                className="w-full rounded-xl px-2 py-2.5 outline-none"
                inputMode="numeric"
                autoFocus
                placeholder="10-digit number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <button
              type="submit"
              disabled={digits.length !== 10 || busy}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-splitpe-600 py-2.5 font-semibold text-white disabled:opacity-50"
            >
              {busy && <Loader2 size={16} className="animate-spin" />} Send OTP
            </button>
          </form>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); if (code.trim()) verify(); }}>
            <label className="mb-1 block text-sm font-medium text-ink">OTP sent to +91 {digits}</label>
            <input
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 tracking-widest outline-none focus:border-splitpe-600"
              inputMode="numeric"
              autoFocus
              placeholder="Enter OTP"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            <button
              type="submit"
              disabled={!code.trim() || busy}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-splitpe-600 py-2.5 font-semibold text-white disabled:opacity-50"
            >
              {busy && <Loader2 size={16} className="animate-spin" />} Verify &amp; sign in
            </button>
            <button type="button" className="mt-3 w-full text-sm text-ink-soft" onClick={() => { setStep("phone"); setCode(""); setError(""); }}>
              Change number
            </button>
          </form>
        )}

        {error && <p className="mt-4 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
