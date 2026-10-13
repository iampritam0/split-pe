// The home-page hero: a scripted phone demo on the left, the pitch, CTAs, a
// scan-to-download QR and the four steps (synced to the demo) on the right.
import { useEffect, useState } from "react";
import { Camera, Check, CircleCheck, Download, Play, Receipt, Scale, ScanLine, Users, type LucideIcon } from "lucide-react";
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
const SCAN_STEPS: { Icon: LucideIcon; title: string; text: string }[] = [
  { Icon: Camera, title: "Open your camera", text: "Any phone camera or Google Lens" },
  { Icon: ScanLine, title: "Point at the code", text: "SplitPe opens on Google Play" },
  { Icon: Download, title: "Install for free", text: "Add your first group in a minute" },
];

function QrCard() {
  return (
    <a
      href={PLAY_STORE_URL}
      target="_blank"
      rel="noopener"
      aria-label="Scan to download SplitPe on Google Play"
      className="d-rise group hidden flex-none items-center gap-5 rounded-3xl border border-white bg-white/70 p-3.5 pr-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_60px_-30px_rgba(30,64,175,0.35)] ring-1 ring-slate-200/60 backdrop-blur-sm transition duration-300 [animation-delay:200ms] hover:-translate-y-1 motion-reduce:transition-none min-[1400px]:flex"
    >
      <span className="relative block h-36 w-36 flex-none rounded-2xl bg-white p-2">
        {/* Corner brackets, like a camera viewfinder */}
        {["left-0 top-0 border-l-2 border-t-2 rounded-tl-lg", "right-0 top-0 border-r-2 border-t-2 rounded-tr-lg", "bottom-0 left-0 border-b-2 border-l-2 rounded-bl-lg", "bottom-0 right-0 border-b-2 border-r-2 rounded-br-lg"].map((c) => (
          <span key={c} className={`absolute h-4 w-4 border-blue-500 transition-all duration-300 group-hover:h-5 group-hover:w-5 ${c}`} />
        ))}
        <img src={playQr} alt="" className="h-full w-full [image-rendering:pixelated]" />
        <span className="absolute left-1/2 top-1/2 grid h-9 w-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-lg bg-white p-1.5 shadow-sm ring-1 ring-slate-100">
          <img src={logo} alt="" className="h-full w-full" />
        </span>
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-blue-600">
          <ScanLine className="h-4 w-4" /> Get the app
        </span>
        <b className="mt-1.5 text-[1.12rem] font-bold tracking-[-0.02em] text-[#111827]">Scan to download</b>
        <span className="mt-2.5 flex flex-col gap-1.5">
          {SCAN_STEPS.map(({ Icon, title }) => (
            <span key={title} className="flex items-center gap-2 text-[0.82rem] text-[#475569]">
              <span className="grid h-6 w-6 flex-none place-items-center rounded-md bg-blue-50 text-blue-600">
                <Icon className="h-3.5 w-3.5" />
              </span>
              {title}
            </span>
          ))}
        </span>
      </span>
    </a>
  );
}

/**
 * "See how simple it is": a connected stepper in one glass card. The rail fills
 * as the demo plays; done steps get a tick, the current one a glowing node.
 */
function StepsCard({ t, active, onPick }: { t: number; active: number; onPick: (ms: number) => void }) {
  const last = HERO_STEPS.length - 1;
  const local = active >= 0 ? ramp(t, HERO_STEPS[active].start, HERO_STEPS[active].end) : 0;
  // Rail runs from the first node to the last; it reaches node i at i / last
  const rail = Math.min(1, (Math.max(active, 0) + (active < last ? local : 0)) / last);

  return (
    <div className="rounded-3xl border border-white bg-white/70 p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_60px_-30px_rgba(30,64,175,0.35)] ring-1 ring-slate-200/60 backdrop-blur-sm sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[0.75rem] font-semibold uppercase tracking-[0.16em] text-blue-600">See how simple it is</p>
          <h2 className="mt-1.5 text-[1.35rem] font-bold tracking-[-0.025em] text-[#111827]">
            From expense to settled. <span className="text-[#94A3B8]">In seconds.</span>
          </h2>
        </div>
        <span className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-[0.75rem] font-semibold text-blue-700 ring-1 ring-blue-100">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-60 motion-reduce:animate-none" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-600" />
          </span>
          Step {Math.max(active, 0) + 1} of {HERO_STEPS.length}
        </span>
      </div>

      <ol className="relative mt-7 grid gap-1 sm:grid-cols-4 sm:gap-2">
        {/* Horizontal rail through the node centres (tablet and up) */}
        <span className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-[1.125rem] hidden h-[2px] -translate-y-1/2 rounded-full bg-slate-200 sm:block" aria-hidden>
          <span className="block h-full rounded-full bg-brand-gradient transition-[width] duration-150 ease-linear" style={{ width: `${rail * 100}%` }} />
        </span>

        {HERO_STEPS.map((s, i) => {
          const on = i === active;
          const done = i < active;
          return (
            <li key={s.title} className="relative">
              {/* Vertical rail between nodes (phones) */}
              {i < last && (
                <span className="absolute bottom-[-0.25rem] left-[1.125rem] top-[2.6rem] w-[2px] -translate-x-1/2 rounded-full bg-slate-200 sm:hidden" aria-hidden>
                  <span className="block w-full rounded-full bg-brand-gradient" style={{ height: done ? "100%" : on ? `${local * 100}%` : "0%" }} />
                </span>
              )}
              <button
                type="button"
                onClick={() => onPick(s.start)}
                aria-current={on ? "step" : undefined}
                className="group flex w-full items-start gap-4 rounded-2xl pb-5 text-left sm:flex-col sm:items-center sm:gap-0 sm:px-2 sm:pb-1 sm:text-center"
              >
                <span
                  className={`relative z-10 grid h-9 w-9 flex-none place-items-center rounded-full transition-all duration-300 motion-reduce:transition-none ${
                    done
                      ? "bg-brand-gradient text-white shadow-[0_6px_14px_-4px_rgba(37,99,235,0.5)]"
                      : on
                        ? "bg-white text-blue-600 shadow-[0_0_0_5px_rgba(37,99,235,0.12),0_8px_18px_-6px_rgba(37,99,235,0.5)] ring-2 ring-blue-600"
                        : "bg-white text-[#94A3B8] ring-1 ring-slate-200 group-hover:text-[#64748B] group-hover:ring-slate-300"
                  }`}
                >
                  {done ? <Check className="h-4 w-4" strokeWidth={3} /> : <s.Icon className="h-4 w-4" strokeWidth={2} />}
                </span>
                <span className="min-w-0 sm:mt-4">
                  <span className={`block text-[0.68rem] font-semibold uppercase tracking-[0.14em] transition-colors duration-300 ${on ? "text-blue-600" : "text-[#94A3B8]"}`}>
                    Step {String(i + 1).padStart(2, "0")}
                  </span>
                  <b className={`mt-1 block text-[1rem] font-semibold leading-snug tracking-[-0.01em] transition-colors duration-300 ${on || done ? "text-[#111827]" : "text-[#475569]"}`}>
                    {s.title}
                  </b>
                  <span className={`mt-1 block text-[0.86rem] leading-[1.55] transition-colors duration-300 ${on ? "text-[#475569]" : "text-[#64748B]"}`}>
                    {s.text}
                  </span>
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </div>
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
      className="relative z-10 mx-auto grid max-w-[1440px] scroll-mt-20 gap-x-16 gap-y-10 px-5 sm:px-8 lg:grid-cols-[auto_minmax(0,1fr)] lg:grid-rows-[auto_auto] lg:gap-y-10 lg:px-12 pb-16 pt-28 lg:pb-16 lg:pt-[6.5rem]"
    >
      {/* Copy — first on mobile, right of the phone on desktop */}
      <div className="lg:col-start-2 lg:row-start-1">
        {/* One line from tablets up — sized to the column width; two lines on phones */}
        {/* w-min: the one-line headline sets the width, so the summary ends where "friendships" ends */}
        <div className="sm:w-min">
        <h1
          aria-label="Split expenses, Not friendships"
          className="text-[2.45rem] font-bold leading-[1.1] tracking-[-0.045em] text-[#111827] min-[380px]:text-[2.7rem] sm:whitespace-nowrap sm:text-[min(3.6rem,calc((100vw-4rem)/14.5))] lg:text-[min(4.35rem,calc((100vw-31rem)/14.5))]"
        >
          <span aria-hidden>
            <span className="hero-word" style={{ animationDelay: "0ms" }}>Split</span>{" "}
            <span className="hero-word" style={{ animationDelay: "90ms" }}>expenses,</span>
            <br className="sm:hidden" />
            <span className="hidden sm:inline"> </span>
            <span className="whitespace-nowrap">
              <span className="hero-word hero-grad" style={{ animationDelay: "180ms" }}>Not</span>{" "}
              <span className="hero-word hero-grad" style={{ animationDelay: "270ms" }}>friendships</span>
            </span>
          </span>
        </h1>
        <p className="d-rise mt-6 text-[1.08rem] [text-wrap:pretty] leading-[1.7] text-[#475569] [animation-delay:120ms] xl:text-[1.22rem]">
          Add a bill in seconds. SplitPe works out who owes what, keeps every balance up to date and shows when everyone is settled —{" "}
          <span className="font-medium text-[#111827]">No awkward reminders.</span>
        </p>
        </div>
        <div className="mt-8 flex items-center justify-between gap-8">
          <div className="flex-none">
            <div className="d-rise [animation-delay:180ms]">
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

      {/* The demo — left of the copy and steps on desktop (sized to fit the screen), between them on mobile */}
      <div
        ref={panelRef}
        className="d-rise relative mx-auto flex w-fit flex-col items-center gap-3 rounded-3xl border border-white bg-white/70 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_24px_60px_-30px_rgba(30,64,175,0.35)] ring-1 ring-slate-200/60 backdrop-blur-sm p-5 [animation-delay:120ms] lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:self-start"
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
        <StepsCard t={t} active={active} onPick={playFrom} />
      </div>
    </section>
  );
}

/**
 * On desktop, shrink the 620px-tall phone so the hero fits one screen.
 * Phones and tablets use a fixed 90% so the mockup doesn't dwarf the copy.
 */
function usePhoneScale() {
  const calc = () => {
    if (typeof window === "undefined" || window.innerWidth < 1024) return 0.9;
    // fixed header + section padding (~176) + panel chrome: padding, controls, gap (~88)
    const room = window.innerHeight - 176 - 88;
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
