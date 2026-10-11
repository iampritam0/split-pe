import { useEffect, useState } from "react";
import { collection, doc, getDoc, limit, onSnapshot, orderBy, query, setDoc } from "firebase/firestore";
import type { Timestamp } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { ChevronDown, Eye, FlaskConical, HandCoins, Heart, Loader2, PenLine, Play, Plus, Save, Sparkles, Trash2, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { db, functions } from "./firebase";
import { logAdminAction } from "./adminLog";
import { useRole } from "./role";
import { TAGLINE, pushSummary } from "./users";
import type { Receipts } from "./users";

/*
 * Mirror of AUTOMATION_DEFAULTS in the SplitPe repo (functions/index.js) —
 * keep the two in sync. The server falls back to these for any field
 * appConfig/automations doesn't set.
 */
type Message = { title: string; body: string; day?: number };
type Config = {
  enabled: boolean;
  hour: number;
  messages: Message[];
  cooldownDays?: number;
  maxReminders?: number;
  maxExpenses?: number;
  minAccountAgeDays?: number;
  minAmount?: number;
  weekday?: number;
};
type Id = "duesReminder" | "welcomeSeries" | "lowExpenseReminder" | "winBack" | "weeklySummary";
type NumField = { key: keyof Config; label: string; hint: string; min: number; max: number };

const COMMON_LIMITS: NumField[] = [
  { key: "cooldownDays", label: "Gap between messages (days)", hint: "Same person won't hear from this more often.", min: 1, max: 30 },
  { key: "maxReminders", label: "Max messages per person", hint: "After this, it stops for them.", min: 1, max: 30 },
];

const SPECS: Record<Id, {
  title: string;
  icon: LucideIcon;
  what: (c: Config) => string;
  fields: NumField[];
  vars: string;
  dayLabel?: string;
  defaults: Config;
}> = {
  duesReminder: {
    title: "Dues reminder",
    icon: HandCoins,
    what: (c) => `People who owe others at least ₹${c.minAmount} get a nudge to settle up — every ${c.cooldownDays} days, up to ${c.maxReminders} times (starts over once they've settled). Skips anyone who turned off “Payment reminders”. The message never shows amounts.`,
    fields: [{ key: "minAmount", label: "Only if they owe at least (₹)", hint: "Skips tiny leftover amounts.", min: 1, max: 100000 }, ...COMMON_LIMITS],
    vars: "{name} first name · {count} how many people they owe (e.g. “2 people”)",
    defaults: {
      enabled: false, hour: 20, cooldownDays: 3, maxReminders: 4, minAmount: 50,
      messages: [
        { title: "{name}, you have pending dues 💸", body: "You have pending dues with {count} on SplitPe. Settle up in one tap and keep it friendly." },
        { title: "Settle up reminder ⏰", body: "You still owe {count}. Open SplitPe and clear it in one tap." },
        { title: "Clear your dues today ✅", body: "A quick settle-up keeps friendships smooth. You owe {count} on SplitPe." },
      ],
    },
  },
  welcomeSeries: {
    title: "Welcome series",
    icon: Sparkles,
    what: () => "New users get each message on the day after sign-up you set — a short guided tour of the app. Only fresh sign-ups (2 days' grace), so existing users never get a late welcome.",
    fields: [],
    vars: "{name} first name",
    dayLabel: "Day after sign-up",
    defaults: {
      enabled: false, hour: 11,
      messages: [
        { day: 1, title: "Welcome to SplitPe, {name}! 🎉", body: "Start with a group — trip, flat or office lunch — and add your first expense. We'll do the maths." },
        { day: 3, title: "Tip: add friends by number 📱", body: "Friends not on SplitPe yet? Add them by mobile number and split anyway — they can join later." },
        { day: 7, title: "Settle up in one tap 💸", body: "See who owes whom and record a payment in seconds. Clear accounts, zero stress!" },
      ],
    },
  },
  lowExpenseReminder: {
    title: "Expense reminder",
    icon: PenLine,
    what: (c) => `Users who have added ${c.maxExpenses} or fewer expenses get a nudge to add more — every ${c.cooldownDays} days, up to ${c.maxReminders} times. Skips accounts under ${c.minAccountAgeDays} day(s) old and anyone who turned off “Daily reminder”.`,
    fields: [
      { key: "maxExpenses", label: "Expenses added — at most", hint: "Users with this many or fewer are nudged.", min: 0, max: 50 },
      { key: "minAccountAgeDays", label: "Account age — at least (days)", hint: "Gives new users time to explore.", min: 0, max: 60 },
      ...COMMON_LIMITS,
    ],
    vars: "{name} first name",
    defaults: {
      enabled: false, hour: 19, cooldownDays: 2, maxReminders: 5, maxExpenses: 2, minAccountAgeDays: 1,
      messages: [
        { title: "{name}, did you add your expenses today? 📝", body: "Tea, a cab or dinner — whatever you shared, add it to SplitPe in 10 seconds." },
        { title: "Remember to add your expenses ⏰", body: "Add your shared expenses now so nobody forgets who paid what." },
        { title: "Clear accounts, strong friendships 🤝", body: "Add your next expense on SplitPe and let us do the maths for you." },
        { title: "Planning a trip or a dinner? ✈️", body: "Create a group and add expenses as you go — settling up later is one tap." },
        { title: "One expense, just 10 seconds ⚡", body: "{name}, open SplitPe and add today's spend. Your friends will thank you!" },
      ],
    },
  },
  winBack: {
    title: "Win-back",
    icon: Heart,
    what: () => "People who stop opening the app get each message once they've been away that many days. If they come back, the ladder starts over next time they go quiet.",
    fields: [],
    vars: "{name} first name",
    dayLabel: "Days without using the app",
    defaults: {
      enabled: false, hour: 18,
      messages: [
        { day: 7, title: "We miss you, {name} 👋", body: "Your friends are still splitting on SplitPe. Open the app — does anyone still owe you?" },
        { day: 30, title: "It's been a while 💙", body: "Planning a trip or a dinner? Split it the easy way on SplitPe." },
        { day: 60, title: "Still here when you need us", body: "Rent, trips, groceries — SplitPe keeps every shared expense fair. Come back anytime." },
      ],
    },
  },
  weeklySummary: {
    title: "Weekly summary",
    icon: TrendingUp,
    what: () => "Once a week, everyone who was part of an expense that week gets a recap of how many expenses and settle-ups they had — counts only, never amounts.",
    fields: [],
    vars: "{name} first name · {expenses} expenses this week · {settlements} settle-ups this week",
    defaults: {
      enabled: false, hour: 18, weekday: 0,
      messages: [
        { title: "Your week on SplitPe 📊", body: "{expenses} expenses and {settlements} settle-ups this week. Open the app to see where things stand." },
        { title: "Your weekly summary is ready ✨", body: "You were part of {expenses} expenses this week. Check your balances before the new week starts." },
      ],
    },
  },
};
const ORDER: Id[] = ["duesReminder", "welcomeSeries", "lowExpenseReminder", "winBack", "weeklySummary"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

type Preview = { uid: string; name: string; phone: string; detail: string; hasPush: boolean };
type RunResult = { checked?: number; due?: number; preview?: Preview[]; sent: number; pushed: number; pushFailed: number; receipts?: Receipts | null; sendErrors?: Record<string, number> };
const runAutomation = httpsCallable<{ id: Id; mode: "preview" | "test" | "now" }, RunResult>(functions, "adminRunAutomation");

type LogEntry = { id: string; action: string; detail: string; byPhone: string; at?: Timestamp };

// Mirror of LEGACY_TEXT on the server: copies of the first (Hinglish) defaults
// still saved in appConfig/automations show — and save — in English.
const LEGACY_TEXT: Record<string, string> = {
  "{name}, aaj ka kharcha add kiya? 📝": "{name}, did you add your expenses today? 📝",
  "Chai, cab ya dinner — jo bhi share kiya, SplitPe mein 10 second mein add karo.": "Tea, a cab or dinner — whatever you shared, add it to SplitPe in 10 seconds.",
  "Expense add karna mat bhoolna ⏰": "Remember to add your expenses ⏰",
  "Hisaab saaf, dosti pakki 🤝": "Clear accounts, strong friendships 🤝",
  "Trip ya dinner plan hai? ✈️": "Planning a trip or a dinner? ✈️",
  "Ek expense, bas 10 second ⚡": "One expense, just 10 seconds ⚡",
  "Hisaab clear, tension khatam!": "Clear accounts, zero stress!",
  "kisi ka hisaab baaki toh nahi?": "does anyone still owe you?",
  "{name}, hisaab baaki hai 💸": "{name}, you have pending dues 💸",
  "Weekly hisaab ready ✨": "Your weekly summary is ready ✨",
};
const englishOf = (text: string) => Object.entries(LEGACY_TEXT).reduce((t, [old, now]) => t.split(old).join(now), text);

const hourLabel = (h: number) => new Date(2000, 0, 1, h).toLocaleTimeString("en-IN", { hour: "numeric", hour12: true });

function merge(id: Id, stored: Partial<Config> | undefined): Config {
  const d = SPECS[id].defaults;
  const out: Config = { ...d };
  for (const key of Object.keys(d) as (keyof Config)[]) {
    if (key !== "messages" && stored?.[key] !== undefined && typeof stored[key] === typeof d[key]) (out as Record<string, unknown>)[key] = stored[key];
  }
  out.messages = (Array.isArray(stored?.messages) && stored.messages.length ? stored.messages : d.messages).map((m) => ({ ...m, title: englishOf(m.title), body: englishOf(m.body) }));
  return out;
}

/** One automation: switch, rules, messages, and preview / test / run now. */
function AutomationCard({ id, initial, onSaved }: { id: Id; initial: Config; onSaved: (c: Config) => void }) {
  const spec = SPECS[id];
  const Icon = spec.icon;
  const [cfg, setCfg] = useState(initial);
  const [saved, setSaved] = useState(JSON.stringify(initial));
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<"" | "preview" | "test" | "now">("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [preview, setPreview] = useState<RunResult | null>(null);
  const { isSuper } = useRole();

  const dirty = JSON.stringify(cfg) !== saved;
  const set = <K extends keyof Config>(key: K, value: Config[K]) => setCfg({ ...cfg, [key]: value });
  const setMessage = (i: number, m: Partial<Message>) => set("messages", cfg.messages.map((x, j) => (j === i ? { ...x, ...m } : x)));
  const valid = (m: Message) => m.title.trim() && m.body.trim() && (!spec.dayLabel || (typeof m.day === "number" && m.day >= 0));

  const save = async (next = cfg) => {
    const messages = next.messages.filter(valid).map((m) => ({ ...m, title: m.title.trim(), body: m.body.trim() }));
    if (!messages.length) {
      setError("Add at least one complete message.");
      return;
    }
    if (spec.dayLabel) messages.sort((a, b) => (a.day ?? 0) - (b.day ?? 0));
    const clean = { ...next, messages };
    setSaving(true);
    setError("");
    setNotice("");
    try {
      await setDoc(doc(db, "appConfig", "automations"), { [id]: clean }, { merge: true });
      setCfg(clean);
      setSaved(JSON.stringify(clean));
      onSaved(clean);
      logAdminAction("automation", `${spec.title} ${clean.enabled ? "on" : "off"} — ${hourLabel(clean.hour)}${id === "weeklySummary" ? ` on ${WEEKDAYS[clean.weekday ?? 0]}s` : ""}`, `${clean.messages.length} messages`);
      setNotice(clean.enabled ? `Saved. Runs daily at ${hourLabel(clean.hour)} IST${id === "weeklySummary" ? ` (${WEEKDAYS[clean.weekday ?? 0]}s only)` : ""}.` : "Saved. It's off.");
    } catch (err) {
      setError((err as Error).message || "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  const run = async (mode: "preview" | "test" | "now") => {
    if (dirty && mode !== "preview") {
      setError("Save your changes first — test and run use the saved settings.");
      return;
    }
    if (mode === "now" && !window.confirm(`Run “${spec.title}” now for everyone who's due? Same rules as the daily run — gaps, caps and the one-a-day limit still apply.`)) return;
    setBusy(mode);
    setError("");
    setNotice("");
    try {
      const { data } = await runAutomation({ id, mode });
      if (mode === "preview") setPreview(data);
      else if (mode === "test") {
        const line = `Test added to your in-app Notifications. Push: ${pushSummary(data.pushed, data.receipts, data.sendErrors)}`;
        if (data.receipts?.failed || data.pushFailed) setError(line);
        else setNotice(line);
      }
      else {
        setNotice(`Sent to ${data.sent} user${data.sent === 1 ? "" : "s"} · ${data.pushed} push${data.pushed === 1 ? "" : "es"} delivered.`);
        setPreview(null);
      }
    } catch (err) {
      setError((err as Error).message || "Something went wrong.");
    } finally {
      setBusy("");
    }
  };

  return (
    <section className="rounded-2xl bg-white shadow-soft">
      <div className="flex items-center gap-3 p-4 sm:p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-splitpe-50 text-splitpe-600"><Icon size={20} /></div>
        <button onClick={() => setOpen(!open)} className="min-w-0 flex-1 text-left">
          <h3 className="flex items-center gap-1.5 font-heading text-lg font-bold text-ink">
            {spec.title} <ChevronDown size={16} className={`text-ink-soft transition ${open ? "rotate-180" : ""}`} />
          </h3>
          <p className="text-sm text-ink-soft">
            {cfg.enabled ? `On · ${id === "weeklySummary" ? `${WEEKDAYS[cfg.weekday ?? 0]}s, ` : "daily, "}${hourLabel(cfg.hour)} IST` : "Off"} · {cfg.messages.length} message{cfg.messages.length === 1 ? "" : "s"}
          </p>
        </button>
        {isSuper ? (
          <label className="flex cursor-pointer items-center gap-2">
            <span className={`text-sm font-semibold ${cfg.enabled ? "text-emerald-700" : "text-ink-soft"}`}>{cfg.enabled ? "On" : "Off"}</span>
            <span className={`relative h-7 w-12 rounded-full transition ${cfg.enabled ? "bg-emerald-500" : "bg-slate-300"}`}>
              <input type="checkbox" className="sr-only" checked={cfg.enabled} onChange={(e) => save({ ...cfg, enabled: e.target.checked })} disabled={saving} />
              <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${cfg.enabled ? "left-5" : "left-0.5"}`} />
            </span>
          </label>
        ) : (
          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${cfg.enabled ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-ink-soft"}`}>{cfg.enabled ? "On" : "Off"}</span>
        )}
      </div>

      {(error || notice) && (
        <div className="px-5 pb-3">
          {error && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</p>}
          {notice && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{notice}</p>}
        </div>
      )}

      {open && (
        <div className="border-t border-slate-100 p-5">
          <p className="mb-4 rounded-xl bg-slate-50 px-3 py-2 text-sm text-ink-soft">{spec.what(cfg)}</p>

          <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-ink">Send at (IST)</span>
              <select value={cfg.hour} disabled={!isSuper} onChange={(e) => set("hour", Number(e.target.value))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-splitpe-600">
                {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{hourLabel(h)}</option>)}
              </select>
            </label>
            {id === "weeklySummary" && (
              <label className="block">
                <span className="mb-1 block text-sm font-medium text-ink">On</span>
                <select value={cfg.weekday} disabled={!isSuper} onChange={(e) => set("weekday", Number(e.target.value))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-splitpe-600">
                  {WEEKDAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
                </select>
              </label>
            )}
            {spec.fields.map((f) => (
              <label key={f.key} className="block">
                <span className="mb-1 block text-sm font-medium text-ink">{f.label}</span>
                <input
                  type="number"
                  min={f.min}
                  max={f.max}
                  disabled={!isSuper}
                  value={cfg[f.key] as number}
                  onChange={(e) => set(f.key, Math.min(f.max, Math.max(f.min, Number(e.target.value) || 0)) as never)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-splitpe-600"
                />
                <span className="mt-1 block text-xs text-ink-soft">{f.hint}</span>
              </label>
            ))}
          </div>

          <p className="mb-1 text-sm font-medium text-ink">Messages</p>
          <p className="mb-3 text-xs text-ink-soft">
            {spec.dayLabel ? "Each goes out once, on its day." : "Sent in turn — 1st message, then 2nd, … — so nobody sees the same text twice in a row."} Placeholders: {spec.vars}. Every message ends with “{TAGLINE}” on its own line.
          </p>
          <div className="space-y-3">
            {cfg.messages.map((m, i) => (
              <div key={i} className="flex gap-3 rounded-xl border border-slate-200 p-3">
                {spec.dayLabel ? (
                  <label className="w-20 shrink-0 text-center">
                    <span className="block text-[11px] leading-tight text-ink-soft">{spec.dayLabel}</span>
                    <input type="number" min={0} max={365} disabled={!isSuper} value={m.day ?? 0} onChange={(e) => setMessage(i, { day: Math.max(0, Number(e.target.value) || 0) })} className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1.5 text-center outline-none focus:border-splitpe-600" />
                  </label>
                ) : (
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-splitpe-50 text-sm font-bold text-splitpe-700">{i + 1}</span>
                )}
                <div className="min-w-0 flex-1 space-y-2">
                  <input value={m.title} disabled={!isSuper} maxLength={65} onChange={(e) => setMessage(i, { title: e.target.value })} placeholder="Title" className="w-full rounded-lg border border-slate-200 px-3 py-2 font-medium outline-none focus:border-splitpe-600" />
                  <textarea value={m.body} disabled={!isSuper} maxLength={240} rows={2} onChange={(e) => setMessage(i, { body: e.target.value })} placeholder="Message" className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-splitpe-600" />
                </div>
                {isSuper && (
                  <button onClick={() => set("messages", cfg.messages.filter((_, j) => j !== i))} disabled={cfg.messages.length <= 1} className="self-start rounded-lg p-2 text-ink-soft hover:bg-red-50 hover:text-red-600 disabled:opacity-30" aria-label="Remove message">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            {isSuper && cfg.messages.length < 10 && (
              <button
                onClick={() => set("messages", [...cfg.messages, spec.dayLabel ? { day: (cfg.messages.at(-1)?.day ?? 0) + 7, title: "", body: "" } : { title: "", body: "" }])}
                className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-2.5 text-sm font-medium text-ink-soft hover:border-splitpe-600 hover:text-splitpe-700"
              >
                <Plus size={16} /> Add message
              </button>
            )}
          </div>

          <div className="mt-5 grid gap-2 sm:flex sm:flex-wrap">
            {isSuper && (
              <button onClick={() => save()} disabled={!dirty || saving} className="flex items-center justify-center gap-2 rounded-xl bg-splitpe-600 px-4 py-2.5 font-semibold text-white disabled:opacity-50">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {dirty ? "Save changes" : "Saved"}
              </button>
            )}
            <button onClick={() => run("preview")} disabled={!!busy} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 font-medium text-ink hover:bg-slate-50 disabled:opacity-50">
              {busy === "preview" ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />} Who's due now?
            </button>
            {isSuper && (
              <>
                <button onClick={() => run("test")} disabled={!!busy} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 font-medium text-ink hover:bg-slate-50 disabled:opacity-50">
                  {busy === "test" ? <Loader2 size={16} className="animate-spin" /> : <FlaskConical size={16} />} Send test to me
                </button>
                <button onClick={() => run("now")} disabled={!!busy} className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 font-medium text-ink hover:bg-slate-50 disabled:opacity-50">
                  {busy === "now" ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />} Run now
                </button>
              </>
            )}
          </div>

          {preview && (
            <div className="mt-5 rounded-xl border border-slate-200 p-4">
              <p className="mb-2 text-sm text-ink-soft">
                <b className="text-ink">{preview.due}</b> of {preview.checked} accounts are due right now (after gaps, caps and the one-a-day limit). Nothing was sent. Names are masked.
              </p>
              {!!preview.preview?.length && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-ink-soft">
                      <tr><th className="py-2 pr-3">User</th><th className="py-2 pr-3">Mobile</th>{(id === "welcomeSeries" || id === "winBack") && <th className="py-2 pr-3">Why</th>}<th className="py-2">Push</th></tr>
                    </thead>
                    <tbody>
                      {preview.preview.map((p) => (
                        <tr key={p.uid} className="border-b border-slate-100 last:border-0">
                          <td className="py-2 pr-3 font-medium text-ink">{p.name || "No name"}</td>
                          <td className="py-2 pr-3 font-mono text-xs text-ink-soft">{p.phone}</td>
                          {(id === "welcomeSeries" || id === "winBack") && <td className="py-2 pr-3 text-ink-soft">{p.detail}</td>}
                          <td className="py-2">{p.hasPush ? "Yes" : <span className="text-ink-soft">In-app only</span>}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {(preview.due ?? 0) > preview.preview.length && <p className="mt-2 text-xs text-ink-soft">Showing first {preview.preview.length} of {preview.due}.</p>}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

/**
 * Server-run notifications (SplitPe repo: automationsTick, every 15 minutes;
 * each automation acts once a day in its own IST hour). Nobody gets more
 * than one automated notification a day — when two are due, the one higher
 * in this list wins.
 */
export default function AutomationsTab() {
  const [cfgs, setCfgs] = useState<Record<Id, Config> | null>(null);
  const [error, setError] = useState("");
  const [runs, setRuns] = useState<LogEntry[] | null>(null);

  useEffect(() => {
    getDoc(doc(db, "appConfig", "automations"))
      .then((snap) => {
        const stored = (snap.data() || {}) as Partial<Record<Id, Partial<Config>>>;
        setCfgs(Object.fromEntries(ORDER.map((id) => [id, merge(id, stored[id])])) as Record<Id, Config>);
      })
      .catch((err) => setError(err.message || "Could not load settings."));
  }, []);

  useEffect(
    () =>
      onSnapshot(
        query(collection(db, "adminLog"), orderBy("at", "desc"), limit(200)),
        (snap) => setRuns(snap.docs.filter((d) => d.data().kind === "automation").slice(0, 25).map((d) => ({ id: d.id, ...(d.data() as Omit<LogEntry, "id">) }))),
        () => setRuns([])
      ),
    []
  );

  return (
    <div>
      <h2 className="mb-1 font-heading text-2xl font-bold text-ink">Automations</h2>
      <p className="mb-2 text-sm text-ink-soft">Notifications the server sends on its own. Each runs once a day at its own time.</p>
      <p className="mb-6 rounded-xl bg-splitpe-50 px-3 py-2 text-sm text-splitpe-800">
        <b>One a day, max.</b> No one gets more than one automated notification per day. If two are due the same day, the one higher in this list wins. Blocked accounts are always skipped.
      </p>
      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {!cfgs ? (
        !error && <p className="text-ink-soft">Loading…</p>
      ) : (
        <div className="mb-8 space-y-3">
          {ORDER.map((id) => (
            <AutomationCard key={id} id={id} initial={cfgs[id]} onSaved={(c) => setCfgs({ ...cfgs, [id]: c })} />
          ))}
        </div>
      )}

      <section className="rounded-2xl bg-white p-5 shadow-soft">
        <h3 className="mb-3 font-heading text-lg font-bold text-ink">Recent runs</h3>
        {runs === null ? <p className="text-sm text-ink-soft">Loading…</p> : runs.length === 0 ? (
          <p className="text-sm text-ink-soft">No runs yet. Turn an automation on and its first run shows up here.</p>
        ) : (
          <ol className="space-y-1">
            {runs.map((r) => (
              <li key={r.id} className="flex items-start justify-between gap-3 rounded-xl px-2 py-2 hover:bg-slate-50">
                <div className="min-w-0">
                  <p className="font-medium text-ink">{r.action}</p>
                  {r.detail && <p className="text-sm text-ink-soft">{r.detail}</p>}
                </div>
                <div className="shrink-0 text-right text-xs text-slate-400">
                  <p>{r.at ? r.at.toDate().toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "just now"}</p>
                  <p>{r.byPhone}</p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
