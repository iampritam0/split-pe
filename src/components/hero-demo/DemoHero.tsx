// The home-page hero: a scripted phone demo on the left, the pitch, CTAs, a
// scan-to-download QR and the four steps (synced to the demo) on the right.
import { useEffect, useState } from "react";
import { Check, CircleCheck, Play, Receipt, Scale, ScanLine, Users, type LucideIcon } from "lucide-react";
import { PlayIcon } from "../Navbar";
import { PLAY_STORE_URL } from "../../constants";
import logo from "../../assets/logo-s.png";
import playQr from "../../assets/play-qr.svg";
import { DemoControls, DemoPhone } from "./AppDemo";
import { DEMO_TOTAL, ramp, useInView, useLoopClock } from "./demoData";
import "./demo.css";

// Chapters of the demo. They reuse the demo's own clock (t / seek) and
// map onto what the phone is showing: group → add & split → balances → settle.
const HERO_STEPS: { title: string; text: string; Icon: LucideIcon; start: number; end: number }[] = [
  { title: "Create your group", text: "Bring friends together for a trip, a flat or everyday plans.", Icon: Users, start: 0, end: 3000 },
  { title: "Add an expense", text: "Paid for everyone? Add the amount and pick who shares it.", Icon: Receipt, start: 3000, end: 11500 },
  { title: "Know who owes what", text: "Everyone's share and balance update automatically.", Icon: Scale, start: 11500, end: 15500 },
  { title: "Settle up, stay sorted", text: "Record repayments and see when everything is settled.", Icon: CircleCheck, start: 15500, end: DEMO_TOTAL },
];

/** Scan-to-download card for desktop visitors (on a phone they just tap the button). */
function QrCard() {
  return (
    <a
      href={PLAY_STORE_URL}
      target="_blank"
      rel="noopener"
      aria-label="Scan to download SplitPe on Google Play"
      className="d-rise group hidden flex-none items-center gap-5 rounded-3xl border border-white bg-white/70 p-3.5 pr-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_60px_-30px_rgba(30,64,175,0.35)] ring-1 ring-slate-200/60 backdrop-blur-sm transition duration-300 [animation-delay:200ms] hover:-translate-y-1 motion-reduce:transition-none min-[1400px]:flex"
    >
      <span className="relative block h-[12.5rem] w-[12.5rem] flex-none rounded-2xl bg-white p-2">
        {/* Corner brackets, like a camera viewfinder */}
        {["left-0 top-0 border-l-2 border-t-2 rounded-tl-lg", "right-0 top-0 border-r-2 border-t-2 rounded-tr-lg", "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg", "bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg"].map((c) => (
          <span key={c} className={`absolute h-4 w-4 border-blue-500 transition-all duration-300 group-hover:h-5 group-hover:w-5 ${c}`} />
        ))}
        <img src={playQr} alt="" className="h-full w-full [image-rendering:pixelated]" />
        <span className="absolute left-1/2 top-1/2 grid h-11 w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-lg bg-white p-1.5 shadow-sm ring-1 ring-slate-100">
          <img src={logo} alt="" className="h-full w-full" />
        </span>
      </span>
      <span className="flex w-[9.75rem] flex-col justify-center">
        <ScanLine className="h-5 w-5 text-blue-600" />
        <b className="mt-2.5 text-[0.98rem] font-semibold leading-snug tracking-[-0.01em] text-[#111827]">Scan to download</b>
        <small className="mt-1 text-[0.8rem] leading-5 text-[#64748B]">Point your phone camera at the code.</small>
        <small className="mt-3 flex items-center gap-1.5 text-[0.78rem] font-medium text-[#111827]">
          <PlayIcon className="h-3.5 w-3.5" /> Free on Google Play
        </small>
      </span>
    </a>
  );
}

/** Quiet texture behind the hero: a faded dot grid and two soft brand glows. */
function HeroBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] opacity-50 [background-size:22px_22px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,#000_30%,transparent_80%)]" />
      <div className="absolute -left-40 top-10 h-[34rem] w-[34rem] rounded-full bg-blue-200/40 blur-[110px]" />
      <div className="absolute -right-32 top-24 h-[30rem] w-[30rem] rounded-full bg-emerald-200/40 blur-[110px]" />
    </div>
  );
}

function Hero() {
  const [panelRef, onScreen] = useInView<HTMLDivElement>(false, "0px");
  const { t, playing, setPlaying, seek } = useLoopClock(DEMO_TOTAL, onScreen);
  const active = HERO_STEPS.findIndex((s) => t >= s.start && t < s.end);
  const scale = usePhoneScale();

  const playFrom = (ms: number) => {
    seek(ms);
    setPlaying(true);
  };
  const watchDemo = () => {
    playFrom(0);
    // On a single-column layout the demo sits below the copy — bring it into view
    if (!matchMedia("(min-width: 1024px)").matches) panelRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <section
      id="demo"
      className="relative z-10 mx-auto grid max-w-[1440px] scroll-mt-20 gap-x-16 gap-y-10 px-5 sm:px-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:grid-rows-[auto_auto] lg:content-center lg:gap-y-10 lg:px-12 pb-16 pt-28 lg:min-h-[100svh] lg:pb-6 lg:pt-[6.5rem]"
    >
      {/* Copy — first on mobile, top-right on desktop */}
      <div className="lg:col-start-2 lg:row-start-1 lg:self-start">
        {/* One line from tablets up — sized to the column width; two lines on phones */}
        <h1 className="d-rise text-[2.45rem] font-bold leading-[1.05] tracking-[-0.045em] text-[#111827] [animation-delay:60ms] min-[380px]:text-[2.7rem] sm:whitespace-nowrap sm:text-[min(3.6rem,calc((100vw-4rem)/15.5))] lg:text-[min(4rem,calc((100vw-31rem)/15.5))]">
          Split expenses,
          <br className="sm:hidden" />
          <span className="hidden sm:inline"> </span>
          <span className="whitespace-nowrap bg-brand-gradient bg-clip-text text-transparent">Not friendships.</span>
        </h1>
        <div className="mt-6 flex items-stretch justify-between gap-12">
          <div className="min-w-0 max-w-[36rem] flex-1">
            <p className="d-rise max-w-[44rem] text-[1.08rem] [text-wrap:pretty] leading-[1.7] text-[#475569] [animation-delay:120ms] xl:text-[1.22rem]">
              Add a bill in seconds. SplitPe works out who owes what, keeps every balance up to date and shows when everyone is settled —{" "}
              <span className="font-medium text-[#111827]">no awkward reminders.</span>
            </p>
            <div className="d-rise mt-8 [animation-delay:180ms]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={PLAY_STORE_URL}
                target="_blank"
                rel="noopener"
                className="inline-flex h-12 items-center justify-center gap-2.5 whitespace-nowrap rounded-xl bg-[#111827] px-6 text-[0.95rem] font-semibold text-white shadow-[0_1px_2px_rgba(17,24,39,0.2),0_8px_20px_-6px_rgba(17,24,39,0.35)] transition duration-200 hover:-translate-y-px hover:bg-black hover:shadow-[0_1px_2px_rgba(17,24,39,0.2),0_14px_28px_-8px_rgba(17,24,39,0.45)] motion-reduce:transition-none"
              >
                <PlayIcon className="h-5 w-5" />
                Get SplitPe
              </a>
              <button
                type="button"
                onClick={watchDemo}
                className="group inline-flex h-12 items-center justify-center gap-2.5 whitespace-nowrap rounded-xl border border-slate-200 bg-white px-5 text-[0.95rem] font-semibold text-[#111827] transition duration-200 hover:border-slate-300 hover:bg-[#F8FAFC] motion-reduce:transition-none"
              >
                <span className="grid h-6 w-6 place-items-center rounded-full bg-[#F1F5F9] transition-colors duration-200 group-hover:bg-white">
                  <Play className="ml-px h-3 w-3 fill-current" />
                </span>
                See how it works
              </button>
            </div>
              <span className="mt-5 flex flex-wrap gap-x-5 gap-y-1 text-[0.85rem] text-[#64748B]">
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2.5} /> Free on Android
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-emerald-600" strokeWidth={2.5} /> Settle by UPI or cash
                </span>
              </span>
            </div>
          </div>
          <QrCard />
        </div>
      </div>

      {/* The demo — left column on desktop (sized to fit the screen), between copy and steps on mobile */}
      <div
        ref={panelRef}
        className="d-rise relative mx-auto flex w-full max-w-[400px] flex-col items-center gap-4 rounded-3xl border border-white bg-white/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_60px_-30px_rgba(30,64,175,0.35)] ring-1 ring-slate-200/60 backdrop-blur-sm px-4 py-6 [animation-delay:120ms] lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:w-auto lg:justify-center lg:self-stretch lg:px-8"
      >
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
          <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
        </div>
        <div className="relative" style={{ width: 300 * scale, height: 620 * scale }}>
          <div className="origin-top-left" style={{ transform: `scale(${scale})` }}>
            <DemoPhone t={t} />
          </div>
        </div>
        <div className="relative flex w-full justify-center">
          <DemoControls t={t} playing={playing} onToggle={() => setPlaying(!playing)} onSeek={seek} />
        </div>
      </div>

      {/* Interactive steps, synced to the demo clock */}
      <div className="d-rise [animation-delay:300ms] lg:col-start-2 lg:row-start-2 lg:self-end">
        <div className="border-t border-slate-200 pt-8">
          <p className="text-[0.78rem] font-semibold uppercase tracking-[0.16em] text-blue-600">See how simple it is</p>
          <h2 className="mt-2 text-[1.4rem] font-bold tracking-[-0.025em] text-[#111827]">
            From expense to settled. <span className="text-[#94A3B8]">In seconds.</span>
          </h2>
        </div>
        <ol className="-mx-3.5 mt-4 grid grid-cols-2 gap-2 xl:grid-cols-4">
          {HERO_STEPS.map((s, i) => {
            const on = i === active;
            const done = i < active;
            const progress = on ? ramp(t, s.start, s.end) : done ? 1 : 0;
            return (
              <li key={s.title}>
                <button
                  type="button"
                  onClick={() => playFrom(s.start)}
                  aria-current={on ? "step" : undefined}
                  className={`flex h-full w-full flex-col rounded-2xl p-3.5 text-left transition-colors duration-300 motion-reduce:transition-none ${
                    on ? "bg-white shadow-[0_10px_30px_-14px_rgba(15,23,42,0.25)] ring-1 ring-slate-200/80" : "hover:bg-white/70"
                  }`}
                >
                  {/* Progress indicator */}
                  <span className="block h-[3px] w-full overflow-hidden rounded-full bg-slate-200/80" aria-hidden>
                    <span className="block h-full rounded-full bg-brand-gradient" style={{ width: `${progress * 100}%` }} />
                  </span>
                  <span className="mt-3.5 flex items-center gap-2.5">
                    <span
                      className={`grid h-8 w-8 flex-none place-items-center rounded-lg transition-all duration-300 motion-reduce:transition-none ${
                        on
                          ? "bg-brand-gradient text-white shadow-[0_6px_14px_-4px_rgba(37,99,235,0.45)]"
                          : done
                            ? "bg-white text-blue-600 ring-1 ring-blue-200"
                            : "bg-white text-[#94A3B8] ring-1 ring-slate-200"
                      }`}
                    >
                      <s.Icon className="h-4 w-4" strokeWidth={2} />
                    </span>
                    <span className={`text-[0.72rem] font-semibold tabular-nums tracking-wider transition-colors duration-300 ${on ? "text-blue-600" : "text-[#94A3B8]"}`}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </span>
                  <b className={`mt-3 block text-[1.02rem] font-semibold leading-snug tracking-[-0.01em] transition-colors duration-300 ${on ? "text-[#111827]" : "text-[#334155]"}`}>
                    {s.title}
                  </b>
                  <span className={`mt-1 block text-[0.9rem] leading-[1.55] transition-colors duration-300 ${on ? "text-[#475569]" : "text-[#64748B]"}`}>
                    {s.text}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/**
 * On desktop, shrink the 620px-tall phone so the whole hero fits one screen.
 * Phones and tablets use a fixed 90% so the mockup doesn't dwarf the copy.
 */
function usePhoneScale() {
  const calc = () => {
    if (typeof window === "undefined" || window.innerWidth < 1024) return 0.9;
    // fixed header + section padding (~176) + panel chrome: padding, controls, gap (~100)
    const room = window.innerHeight - 176 - 100;
    return Math.min(0.86, Math.max(0.6, room / 620));
  };
  const [scale, setScale] = useState(calc);
  useEffect(() => {
    const onResize = () => setScale(calc());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return scale;
}


export default function DemoHero() {
  return (
    <div className="relative overflow-hidden">
      <HeroBackdrop />
      <Hero />
    </div>
  );
}
