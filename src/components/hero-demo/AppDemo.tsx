// A scripted, looping "screen recording" of SplitPe: open a group, add a
// dinner, split it four ways, save it, and watch a friend settle up. Every
// frame is derived from the clock `t`, so it can be paused and scrubbed.
import type { ReactNode } from "react";
import { ArrowLeftRight, Bell, Check, ChevronLeft, Hotel, Pause, Plane, Play, Plus, Utensils } from "lucide-react";
import logo from "../../assets/logo-s.png";
import { DEMO_STEPS, inr, lerp, ramp, typed } from "./demoData";

// Timeline marks (ms)
const T = {
  tapFab: 2000,
  sheetIn: 3000,
  descStart: 3500,
  amtStart: 5000,
  tapFood: 6300,
  tapNext: 7600,
  splitIn: 8000,
  check: [8400, 8800, 9200, 9600],
  tapSave: 10500,
  saved: 11000,
  sheetOut: 11500,
  toastIn: 11900,
  toastOut: 14600,
  notifIn: 16000,
  settle: 16700,
  notifOut: 19200,
};

const DESC = "Dinner at Thalassa";
const AMOUNT = "4800";

const MEMBERS = [
  { id: "you", name: "You", initials: "DA", color: "bg-blue-600" },
  { id: "aman", name: "Aman", initials: "AM", color: "bg-amber-500" },
  { id: "neha", name: "Neha", initials: "NE", color: "bg-pink-500" },
  { id: "rahul", name: "Rahul", initials: "RA", color: "bg-violet-500" },
];

/** A tap ripple, shown on its parent around time `at`. */
function Tap({ t, at }: { t: number; at: number }) {
  const on = t >= at - 500 && t <= at + 350;
  const pressed = t >= at;
  return (
    <span
      aria-hidden
      className={`pointer-events-none absolute left-1/2 top-1/2 z-20 h-11 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-slate-900/25 shadow-[0_0_0_6px_rgba(15,23,42,0.08)] transition-all duration-200 ${
        on ? "opacity-100" : "opacity-0"
      } ${pressed ? "scale-75" : "scale-100"}`}
    />
  );
}

function Avatar({ m, size = "h-7 w-7 text-[0.6rem]" }: { m: (typeof MEMBERS)[number]; size?: string }) {
  return <span className={`grid flex-none place-items-center rounded-full font-bold text-white ring-2 ring-white ${m.color} ${size}`}>{m.initials}</span>;
}

function StatusBar() {
  return (
    <div className="flex items-center justify-between px-6 pb-1 pt-3 text-[0.68rem] font-semibold text-slate-900">
      <span>9:41</span>
      <span className="flex items-center gap-1">
        <span className="flex items-end gap-[2px]">
          {[4, 6, 8, 10].map((h) => (
            <i key={h} className="block w-[3px] rounded-sm bg-slate-900" style={{ height: h }} />
          ))}
        </span>
        <span className="ml-1 h-[10px] w-[20px] rounded-[3px] border border-slate-900 p-[1px]">
          <i className="block h-full w-3/4 rounded-[1px] bg-slate-900" />
        </span>
      </span>
    </div>
  );
}

function GroupScreen({ t }: { t: number }) {
  const showNew = t >= T.sheetOut;
  const settled = t >= T.settle;
  // Balances owed to you: dinner adds ₹1,200 each, then Aman settles his ₹1,800
  const dinner = ramp(t, T.toastIn, T.toastIn + 700);
  const settleK = ramp(t, T.settle, T.settle + 600);
  const owed = {
    aman: lerp(lerp(600, 1800, dinner), 0, settleK),
    neha: lerp(1200, 2400, dinner),
    rahul: lerp(600, 1800, dinner),
  };
  const total = owed.aman + owed.neha + owed.rahul;

  const expenses: { icon: ReactNode; title: string; sub: string; amt: string; tint: string; fresh?: boolean }[] = [
    { icon: <Hotel className="h-4 w-4" />, title: "Hotel · 2 nights", sub: "You paid · Mon", amt: "₹9,600", tint: "bg-violet-100 text-violet-600" },
    { icon: <Plane className="h-4 w-4" />, title: "Scooty rent", sub: "Aman paid · Sun", amt: "₹1,600", tint: "bg-blue-100 text-blue-600" },
  ];
  if (showNew)
    expenses.unshift({ icon: <Utensils className="h-4 w-4" />, title: DESC, sub: "You paid · Just now", amt: "₹4,800", tint: "bg-orange-100 text-orange-600", fresh: true });

  return (
    <div className="absolute inset-0 flex flex-col bg-slate-50">
      <StatusBar />
      <div className="flex items-center gap-2 px-4 pb-3 pt-2">
        <ChevronLeft className="h-5 w-5 text-slate-500" />
        <div className="flex-1">
          <b className="block text-[0.95rem] font-bold text-slate-900">Goa Trip 🏖️</b>
          <small className="text-[0.65rem] text-slate-500">4 members</small>
        </div>
        <div className="flex -space-x-2">
          {MEMBERS.map((m) => (
            <Avatar key={m.id} m={m} size="h-6 w-6 text-[0.5rem]" />
          ))}
        </div>
      </div>

      <div className="mx-4 rounded-2xl bg-brand-gradient p-4 text-white shadow-lg shadow-blue-600/20">
        <small className="text-[0.62rem] font-semibold tracking-wider opacity-85">YOU GET BACK</small>
        <b className="mt-0.5 block font-heading text-[1.8rem] font-extrabold leading-none tabular-nums">{inr(total)}</b>
        <small className="text-[0.65rem] opacity-85">{settled ? "from 2 friends" : "from 3 friends"}</small>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 px-4">
        {MEMBERS.slice(1).map((m) => {
          const v = owed[m.id as keyof typeof owed];
          const done = m.id === "aman" && settled;
          return (
            <div
              key={m.id}
              className={`flex flex-col items-center rounded-xl border bg-white py-2 transition-colors duration-500 ${
                done ? "border-emerald-300 bg-emerald-50" : "border-slate-200"
              }`}
            >
              <Avatar m={m} />
              <small className="mt-1 text-[0.62rem] font-semibold text-slate-700">{m.name}</small>
              {done ? (
                <small className="flex items-center gap-0.5 text-[0.6rem] font-bold text-emerald-600">
                  <Check className="h-3 w-3" /> Settled
                </small>
              ) : (
                <small className="text-[0.62rem] font-bold tabular-nums text-emerald-600">{inr(v)}</small>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center justify-between px-4">
        <b className="text-[0.75rem] font-bold text-slate-900">Expenses</b>
        <small className="text-[0.65rem] font-semibold text-blue-600">See all</small>
      </div>
      <div className="mt-2 flex flex-col gap-2 px-4">
        {expenses.map((e) => (
          <div
            key={e.title}
            className={`flex items-center gap-2.5 rounded-xl border bg-white p-2.5 ${
              e.fresh ? "animate-[demoRowIn_.5s_ease-out] border-blue-200 ring-2 ring-blue-100" : "border-slate-200"
            }`}
          >
            <span className={`grid h-8 w-8 place-items-center rounded-lg ${e.tint}`}>{e.icon}</span>
            <div className="min-w-0 flex-1">
              <b className="block truncate text-[0.72rem] font-semibold text-slate-900">{e.title}</b>
              <small className="text-[0.6rem] text-slate-500">{e.sub}</small>
            </div>
            <b className="text-[0.72rem] font-bold text-slate-900">{e.amt}</b>
          </div>
        ))}
      </div>

      <span className="absolute bottom-7 right-5 grid h-12 w-12 place-items-center rounded-2xl bg-brand-gradient text-white shadow-lg shadow-blue-600/30">
        <Plus className="h-6 w-6" />
        <Tap t={t} at={T.tapFab} />
      </span>
    </div>
  );
}

function Field({ label, children, active }: { label: string; children: ReactNode; active?: boolean }) {
  return (
    <div className={`rounded-xl border px-3 py-2 transition-colors ${active ? "border-blue-500 bg-blue-50/40" : "border-slate-200"}`}>
      <small className="block text-[0.58rem] font-semibold uppercase tracking-wider text-slate-400">{label}</small>
      {children}
    </div>
  );
}

const Caret = () => <span className="ml-px inline-block h-[1em] w-[1.5px] translate-y-[2px] animate-pulse bg-blue-600" />;

function AddSheet({ t }: { t: number }) {
  const open = t >= T.sheetIn && t < T.sheetOut;
  const desc = typed(DESC, t, T.descStart, 65);
  const digits = typed(AMOUNT, t, T.amtStart, 220);
  const typingDesc = t >= T.descStart && t < T.amtStart;
  const typingAmt = t >= T.amtStart && t < T.tapFood;
  const food = t >= T.tapFood;
  const splitView = t >= T.splitIn;
  const checked = T.check.filter((c) => t >= c).length;
  const share = checked ? 4800 / checked : 0;
  const saved = t >= T.saved;

  return (
    <div
      className={`absolute inset-x-0 bottom-0 top-10 z-10 flex flex-col rounded-t-[1.6rem] bg-white shadow-[0_-12px_40px_rgba(15,23,42,0.18)] transition-transform duration-500 ease-out ${
        open ? "translate-y-0" : "translate-y-full"
      }`}
    >
      <span className="mx-auto mt-2.5 h-1 w-10 rounded-full bg-slate-200" />
      <div className="flex items-center justify-between px-5 pb-2 pt-3">
        <b className="text-[0.95rem] font-bold text-slate-900">{splitView ? "Split between" : "Add expense"}</b>
        <small className="text-[0.65rem] font-semibold text-slate-400">Goa Trip</small>
      </div>

      <div className="relative flex-1 overflow-hidden">
        {/* Step 1: what & how much */}
        <div className={`absolute inset-0 flex flex-col gap-2.5 px-5 transition-all duration-500 ${splitView ? "-translate-x-full opacity-0" : ""}`}>
          <Field label="Description" active={typingDesc}>
            <span className="block min-h-[1.2rem] text-[0.82rem] font-semibold text-slate-900">
              {desc || <span className="font-normal text-slate-300">e.g. Dinner</span>}
              {typingDesc && <Caret />}
            </span>
          </Field>
          <Field label="Amount" active={typingAmt}>
            <span className="block font-heading text-[1.7rem] font-extrabold leading-tight text-slate-900 tabular-nums">
              {digits ? inr(Number(digits)) : <span className="text-slate-300">₹0</span>}
              {typingAmt && <Caret />}
            </span>
          </Field>
          <div>
            <small className="mb-1.5 block text-[0.58rem] font-semibold uppercase tracking-wider text-slate-400">Category</small>
            <div className="flex flex-wrap gap-1.5">
              {["🍽️ Food", "✈️ Travel", "🏨 Stay", "🛒 Shopping"].map((c, i) => (
                <span
                  key={c}
                  className={`relative rounded-full border px-2.5 py-1 text-[0.65rem] font-semibold transition-colors ${
                    i === 0 && food ? "border-orange-300 bg-orange-50 text-orange-700" : "border-slate-200 text-slate-600"
                  }`}
                >
                  {c}
                  {i === 0 && <Tap t={t} at={T.tapFood} />}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5">
            <small className="text-[0.68rem] font-medium text-slate-500">Paid by</small>
            <span className="flex items-center gap-1.5 text-[0.7rem] font-bold text-slate-900">
              <Avatar m={MEMBERS[0]} size="h-5 w-5 text-[0.45rem]" /> You
            </span>
          </div>
        </div>

        {/* Step 2: split between */}
        <div className={`absolute inset-0 flex flex-col px-5 transition-all duration-500 ${splitView ? "" : "translate-x-full opacity-0"}`}>
          <div className="mb-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
            <span className="text-[0.7rem] font-semibold text-slate-700">🍽️ {DESC}</span>
            <b className="text-[0.75rem] font-bold text-slate-900">₹4,800</b>
          </div>
          <div className="mb-3 grid grid-cols-2 rounded-lg bg-slate-100 p-0.5 text-center text-[0.66rem] font-bold">
            <span className="rounded-md bg-white py-1.5 text-slate-900 shadow-sm">Equally</span>
            <span className="py-1.5 text-slate-400">Custom</span>
          </div>
          <div className="flex flex-col gap-1.5">
            {MEMBERS.map((m, i) => {
              const on = i < checked;
              return (
                <div key={m.id} className={`flex items-center gap-2.5 rounded-xl border px-2.5 py-2 transition-colors ${on ? "border-blue-200 bg-blue-50/50" : "border-slate-200"}`}>
                  <span className={`grid h-4 w-4 place-items-center rounded-[5px] border transition-colors ${on ? "border-blue-600 bg-blue-600 text-white" : "border-slate-300"}`}>
                    {on && <Check className="h-3 w-3" strokeWidth={3} />}
                  </span>
                  <Avatar m={m} size="h-6 w-6 text-[0.5rem]" />
                  <span className="flex-1 text-[0.72rem] font-semibold text-slate-800">{m.name}</span>
                  <b className={`text-[0.72rem] font-bold tabular-nums transition-opacity ${on ? "text-slate-900" : "text-slate-300"}`}>
                    {on ? inr(share) : "—"}
                  </b>
                </div>
              );
            })}
          </div>
          <small className="mt-2 text-center text-[0.62rem] font-semibold text-slate-500">
            {checked === 4 ? "₹1,200 each · 3 friends owe you ₹3,600" : "Tap who was there"}
          </small>
        </div>
      </div>

      <div className="px-5 pb-6 pt-2">
        <span
          className={`relative flex items-center justify-center gap-1.5 rounded-xl py-3 text-[0.8rem] font-bold text-white transition-colors duration-300 ${
            saved ? "bg-emerald-500" : splitView ? "bg-blue-600" : "bg-slate-900"
          }`}
        >
          {saved ? (
            <>
              <Check className="h-4 w-4" strokeWidth={3} /> Saved
            </>
          ) : splitView ? (
            "Save expense"
          ) : (
            "Next: split"
          )}
          <Tap t={t} at={T.tapNext} />
          <Tap t={t} at={T.tapSave} />
        </span>
      </div>
    </div>
  );
}

function Toast({ t }: { t: number }) {
  const on = t >= T.toastIn && t < T.toastOut;
  return (
    <div
      className={`absolute inset-x-4 bottom-24 z-20 flex items-center gap-2 rounded-xl bg-slate-900 px-3 py-2.5 text-white shadow-xl transition-all duration-500 ${
        on ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-500">
        <Check className="h-3.5 w-3.5" strokeWidth={3} />
      </span>
      <span className="text-[0.66rem] font-semibold leading-snug">
        Added · Aman, Neha &amp; Rahul notified
        <Bell className="ml-1 inline h-3 w-3 opacity-70" />
      </span>
    </div>
  );
}

function PushNotif({ t }: { t: number }) {
  const on = t >= T.notifIn && t < T.notifOut;
  return (
    <div
      className={`absolute inset-x-2.5 top-9 z-30 flex items-center gap-2.5 rounded-2xl bg-white/95 p-2.5 shadow-[0_10px_30px_rgba(15,23,42,0.18)] ring-1 ring-slate-900/5 backdrop-blur transition-all duration-500 ${
        on ? "translate-y-0 opacity-100" : "-translate-y-[140%] opacity-0"
      }`}
    >
      <img src={logo} alt="" className="h-8 w-8 rounded-lg" />
      <div className="min-w-0 flex-1">
        <span className="flex items-center justify-between text-[0.68rem] font-bold text-slate-900">
          Aman settled up <em className="text-[0.58rem] font-medium not-italic text-slate-400">now</em>
        </span>
        <small className="flex items-center gap-1 text-[0.62rem] text-slate-500">
          <ArrowLeftRight className="h-3 w-3" /> Paid you ₹1,800 via UPI · Goa Trip
        </small>
      </div>
    </div>
  );
}

/** The phone itself, rendering the demo at time `t`. */
export function DemoPhone({ t, className = "" }: { t: number; className?: string }) {
  return (
    <div className={`relative h-[620px] w-[300px] rounded-[3rem] bg-slate-900 p-[10px] shadow-[0_40px_80px_-20px_rgba(15,23,42,0.45)] ${className}`}>
      <div className="relative h-full w-full overflow-hidden rounded-[2.4rem] bg-white">
        <span className="absolute left-1/2 top-2 z-40 h-[22px] w-[86px] -translate-x-1/2 rounded-full bg-slate-900" />
        <GroupScreen t={t} />
        <div className={`absolute inset-0 z-[5] bg-slate-900/30 transition-opacity duration-500 ${t >= T.sheetIn && t < T.sheetOut ? "opacity-100" : "opacity-0"}`} />
        <AddSheet t={t} />
        <Toast t={t} />
        <PushNotif t={t} />
        <span className="absolute bottom-1.5 left-1/2 z-40 h-1 w-24 -translate-x-1/2 rounded-full bg-slate-900/80" />
      </div>
    </div>
  );
}

/** Video-style controls: play/pause plus a segmented, clickable scrubber. */
export function DemoControls({
  t,
  playing,
  onToggle,
  onSeek,
  dark = false,
}: {
  t: number;
  playing: boolean;
  onToggle: () => void;
  onSeek: (ms: number) => void;
  dark?: boolean;
}) {
  return (
    <div className="flex w-full max-w-[340px] items-center gap-3">
      <button
        type="button"
        onClick={onToggle}
        aria-label={playing ? "Pause demo" : "Play demo"}
        className={`grid h-9 w-9 flex-none place-items-center rounded-full transition ${
          dark ? "bg-white text-slate-900 hover:bg-slate-200" : "bg-slate-900 text-white hover:bg-slate-700"
        }`}
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="ml-0.5 h-4 w-4" />}
      </button>
      <div className="flex flex-1 gap-1.5">
        {DEMO_STEPS.map((s) => {
          const k = ramp(t, s.start, s.end);
          return (
            <button
              key={s.title}
              type="button"
              onClick={() => onSeek(s.start)}
              aria-label={`Jump to: ${s.title}`}
              className={`h-1.5 flex-1 overflow-hidden rounded-full ${dark ? "bg-white/15" : "bg-slate-200"}`}
              style={{ flexGrow: s.end - s.start }}
            >
              <span className="block h-full rounded-full bg-brand-gradient" style={{ width: `${k * 100}%` }} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
