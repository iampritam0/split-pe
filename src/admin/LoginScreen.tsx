import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { signInWithCustomToken } from "firebase/auth";
import { httpsCallable } from "firebase/functions";
import { Loader2 } from "lucide-react";
import logo from "../assets/logo-s.png";
import { CATEGORIES } from "../components/landing/data";
import Icon from "../components/landing/Icon";
import IconSprite from "../components/landing/IconSprite";
import PhoneMockup from "../components/landing/hero/PhoneMockup";
import "../components/landing/styles/index.css";
import "./login.css";
import { auth, functions } from "./firebase";

const sendOtpCallable = httpsCallable<{ phone: string }, { resendAfter: number }>(functions, "sendOtp");
const verifyOtpCallable = httpsCallable<{ phone: string; code: string }, { token: string }>(functions, "verifyOtp");

const errorMessage = (err: unknown) =>
  (err as { message?: string })?.message || "Something went wrong. Please try again.";

// ₹ coins and the app's own category tiles around the phone — same pieces
// the landing hero animates, here just floating in place. Positions are the
// token centre as % of the stage; `far` ones sit blurred behind the phone.
type TokenSpec = { kind: string; top: number; left: number; size: number; dur: number; delay: number; rot: number; far?: boolean };
const STAGE_TOKENS: TokenSpec[] = [
  { kind: "coin", top: 6, left: 32, size: 160, dur: 7, delay: 0, rot: -12 },
  { kind: "food", top: 12, left: 72, size: 130, dur: 8, delay: 0.6, rot: 10 },
  { kind: "travel", top: 44, left: 88, size: 150, dur: 6.5, delay: 0.2, rot: -8 },
  { kind: "coin", top: 88, left: 68, size: 130, dur: 7.5, delay: 1.1, rot: 14 },
  { kind: "grocery", top: 56, left: 12, size: 130, dur: 8.5, delay: 0.4, rot: 8 },
  { kind: "rent", top: 84, left: 22, size: 110, dur: 9, delay: 1.4, rot: -6 },
  { kind: "settle", top: 72, left: 92, size: 90, dur: 9, delay: 0.9, rot: 6, far: true },
  { kind: "chai", top: 2, left: 54, size: 90, dur: 9.5, delay: 1.8, rot: 6, far: true },
];
const MOBILE_TOKENS: TokenSpec[] = [
  { kind: "coin", top: 15, left: 88, size: 110, dur: 7, delay: 0, rot: -10 },
  { kind: "food", top: 86, left: 14, size: 120, dur: 8, delay: 0.5, rot: 10 },
  { kind: "travel", top: 92, left: 74, size: 110, dur: 7.5, delay: 0.9, rot: -8 },
  { kind: "coin", top: 80, left: 92, size: 80, dur: 8.5, delay: 0.3, rot: 12 },
  { kind: "grocery", top: 20, left: 6, size: 80, dur: 9, delay: 1.2, rot: 6, far: true },
];

function Token({ kind, top, left, size, dur, delay, rot, far }: TokenSpec) {
  const style = {
    top: `${top}%`, left: `${left}%`, width: size, height: size, margin: -size / 2,
    "--dur": `${dur}s`, "--delay": `${delay}s`, "--rot": `${rot}deg`,
  } as CSSProperties;
  const cat = CATEGORIES[kind];
  return (
    <div className={`berry ${far ? "far" : ""}`} style={style}>
      {kind === "coin" || !cat ? (
        <div className="token coin"><span>₹</span></div>
      ) : (
        <div className="token tile" style={{ "--tfg": cat.fg, "--tbg": cat.bg } as CSSProperties}>
          <Icon name={cat.icon} />
        </div>
      )}
    </div>
  );
}

/**
 * Admin sign-in — the public home page's hero (3D phone showing the app
 * dashboard, ₹ coins, category tiles, toasts, logo) re-themed dark, with the
 * white login card beside it. Same phone + OTP sign-in as the mobile app
 * (sendOtp / verifyOtp Cloud Functions); AdminApp then checks the `admin`
 * claim and signs anyone without it straight back out.
 */
export default function LoginScreen({ notice }: { notice?: string }) {
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  // The landing animation normally flips the phone from its splash to the
  // dashboard — here it just starts on the dashboard.
  useEffect(() => {
    document.getElementById("phone")?.setAttribute("data-screen", "dash");
  }, []);

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

  const fieldClass =
    "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-splitpe-500 focus:bg-white focus:ring-4 focus:ring-splitpe-500/15";
  const buttonClass =
    "mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-gradient py-3.5 text-base font-bold text-white shadow-lg shadow-blue-600/25 transition hover:brightness-110 disabled:opacity-40";

  return (
    <div className="landing admin-dark">
      <IconSprite />

      <header className="adm-top">
        <a className="logo" href="/" aria-label="SplitPe home">
          <img src={logo} alt="" />
          <span className="logo-word">
            <b>Split<span className="grad-text">Pe</span></b>
            <small>हिसाब भी, दोस्ती भी</small>
          </span>
        </a>
        <span className="adm-badge"><i></i>Admin Console</span>
      </header>

      <main className="adm-main">
        {/* Home-page hero, dark */}
        <section className="adm-stage" aria-hidden="true">
          <div className="adm-tokens">
            {STAGE_TOKENS.map((t, i) => <Token key={i} {...t} />)}
          </div>
          <PhoneMockup />
        </section>

        {/* Login */}
        <section className="adm-card-wrap">
          <div className="adm-mobile-tokens" aria-hidden="true">
            {MOBILE_TOKENS.map((t, i) => <Token key={i} {...t} />)}
          </div>

          <div className="adm-card relative z-10">
            <img src={logo} alt="SplitPe" className="adm-card-logo" />
            <h2>Welcome back</h2>
            <p className="sub">Sign in to the SplitPe admin console</p>

            {notice && <p className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">{notice}</p>}

            {step === "phone" ? (
              <form className="mt-6" onSubmit={(e) => { e.preventDefault(); if (digits.length === 10) requestOtp(); }}>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Mobile number</label>
                <div className="flex items-center gap-2">
                  <span className="rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-base font-semibold text-slate-700">+91</span>
                  <input
                    className={fieldClass}
                    inputMode="numeric"
                    autoFocus
                    maxLength={14}
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <button type="submit" disabled={digits.length !== 10 || busy} className={buttonClass}>
                  {busy && <Loader2 size={18} className="animate-spin" />} Send OTP
                </button>
              </form>
            ) : (
              <form className="mt-6" onSubmit={(e) => { e.preventDefault(); if (code.trim()) verify(); }}>
                <label className="mb-2 block text-sm font-semibold text-slate-700">Enter the OTP sent to +91 {digits}</label>
                <input
                  className={`${fieldClass} text-center text-xl tracking-[0.5em]`}
                  inputMode="numeric"
                  autoFocus
                  maxLength={6}
                  placeholder="••••••"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                <button type="submit" disabled={!code.trim() || busy} className={buttonClass}>
                  {busy && <Loader2 size={18} className="animate-spin" />} Verify &amp; sign in
                </button>
                <button type="button" className="mt-4 w-full text-sm font-medium text-slate-500 hover:text-slate-900" onClick={() => { setStep("phone"); setCode(""); setError(""); }}>
                  ← Change number
                </button>
              </form>
            )}

            {error && <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

            <p className="mt-6 border-t border-slate-100 pt-4 text-center text-xs text-slate-400">
              Authorised SplitPe team members only
            </p>
          </div>

          <a href="/" className="relative z-10 mt-6 text-sm text-slate-400 hover:text-white">← Back to splitpe.xyz</a>
        </section>
      </main>
    </div>
  );
}
