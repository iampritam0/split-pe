import { useState } from "react";
import { signInWithCustomToken } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { ArrowLeftRight, Bell, Camera, Loader2, Receipt, ShieldCheck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import logo from "../assets/logo-s.png";
import { FEATURES, NOTIFS } from "../components/landing/data";
import type { IconName } from "../components/landing/data";
import { auth, functions } from "./firebase";

const sendOtpCallable = httpsCallable<{ phone: string }, { resendAfter: number }>(functions, "sendOtp");
const verifyOtpCallable = httpsCallable<{ phone: string; code: string }, { token: string }>(functions, "verifyOtp");

const errorMessage = (err: unknown) =>
  (err as { message?: string })?.message || "Something went wrong. Please try again.";

// The landing page's own feature icons, drawn with lucide here.
const FEATURE_ICONS: Partial<Record<IconName, LucideIcon>> = {
  users: Users,
  receipt: Receipt,
  swap: ArrowLeftRight,
  camera: Camera,
};

const Wordmark = ({ size = "lg" }: { size?: "lg" | "sm" }) => (
  <div className="flex items-center gap-3">
    <img src={logo} alt="SplitPe" className={size === "lg" ? "h-12 w-12" : "h-10 w-10"} />
    <div className="leading-tight">
      <p className={`font-heading font-extrabold text-white ${size === "lg" ? "text-2xl" : "text-xl"}`}>
        Split<span className="bg-brand-gradient bg-clip-text text-transparent">Pe</span>
      </p>
      <p className="font-hindi text-sm text-slate-400">हिसाब भी, दोस्ती भी</p>
    </div>
  </div>
);

/**
 * Admin sign-in — a dark take on the public home page (same logo, tagline,
 * features and sample notifications from components/landing/data) beside
 * the login card. Same phone + OTP sign-in as the mobile app (sendOtp /
 * verifyOtp Cloud Functions); AdminApp then checks the `admin` claim and
 * signs anyone without it straight back out.
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

  const inputClass =
    "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2.5 text-white placeholder:text-slate-500 outline-none focus:border-splitpe-400";

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      {/* Brand glows, same blue → green as the site. */}
      <div className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-splitpe-600/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-mint-500/20 blur-3xl" />

      <div className="relative mx-auto grid min-h-screen max-w-7xl items-center gap-12 px-6 py-10 lg:grid-cols-[1.2fr_1fr] lg:px-12">
        {/* Home-page overview — hidden on small screens to keep login first. */}
        <section className="hidden lg:block">
          <Wordmark />
          <h1 className="mt-10 font-heading text-5xl font-extrabold leading-tight">
            Split <span className="bg-brand-gradient bg-clip-text text-transparent">bills</span>,
            <br />
            keep <span className="bg-brand-gradient bg-clip-text text-transparent">friendship</span>.
          </h1>
          <p className="mt-4 max-w-lg text-lg text-slate-400">
            Trips, flatmates, late-night chai — add it once, split it fairly and keep track of who has paid.
          </p>

          <div className="mt-10 grid max-w-xl grid-cols-2 gap-3">
            {FEATURES.slice(0, 4).map(({ icon, title }) => {
              const Icon = FEATURE_ICONS[icon] || Receipt;
              return (
                <div key={title} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-gradient">
                    <Icon size={18} />
                  </div>
                  <p className="text-sm font-semibold text-slate-200">{title}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-8 max-w-sm space-y-2">
            {NOTIFS.slice(0, 2).map(([title, sub]) => (
              <div key={title} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-splitpe-600/20 text-splitpe-300">
                  <Bell size={15} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-100">{title}</p>
                  <p className="truncate text-xs text-slate-400">{sub}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Login card */}
        <section className="mx-auto w-full max-w-sm">
          <div className="mb-8 flex justify-center lg:hidden">
            <Wordmark size="sm" />
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.06] p-8 shadow-2xl backdrop-blur-xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient">
                <ShieldCheck size={22} />
              </div>
              <div>
                <h2 className="font-heading text-xl font-bold">Admin sign in</h2>
                <p className="text-sm text-slate-400">Authorised team members only</p>
              </div>
            </div>

            {notice && <p className="mb-4 rounded-lg bg-amber-400/10 px-3 py-2 text-sm text-amber-300">{notice}</p>}

            {step === "phone" ? (
              <form onSubmit={(e) => { e.preventDefault(); if (digits.length === 10) requestOtp(); }}>
                <label className="mb-1 block text-sm font-medium text-slate-300">Mobile number</label>
                <div className="flex items-center rounded-xl border border-white/10 bg-white/5 focus-within:border-splitpe-400">
                  <span className="pl-3 text-sm text-slate-400">+91</span>
                  <input
                    className="w-full rounded-xl bg-transparent px-2 py-2.5 text-white placeholder:text-slate-500 outline-none"
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
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient py-2.5 font-semibold text-white disabled:opacity-40"
                >
                  {busy && <Loader2 size={16} className="animate-spin" />} Send OTP
                </button>
              </form>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); if (code.trim()) verify(); }}>
                <label className="mb-1 block text-sm font-medium text-slate-300">OTP sent to +91 {digits}</label>
                <input
                  className={`${inputClass} tracking-widest`}
                  inputMode="numeric"
                  autoFocus
                  placeholder="Enter OTP"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                <button
                  type="submit"
                  disabled={!code.trim() || busy}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-gradient py-2.5 font-semibold text-white disabled:opacity-40"
                >
                  {busy && <Loader2 size={16} className="animate-spin" />} Verify &amp; sign in
                </button>
                <button type="button" className="mt-3 w-full text-sm text-slate-400 hover:text-slate-200" onClick={() => { setStep("phone"); setCode(""); setError(""); }}>
                  Change number
                </button>
              </form>
            )}

            {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            <a href="/" className="hover:text-slate-300">← Back to splitpe.xyz</a>
          </p>
        </section>
      </div>
    </div>
  );
}
