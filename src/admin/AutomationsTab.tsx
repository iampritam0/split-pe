import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { collection, doc, getDoc, limit, onSnapshot, orderBy, query, setDoc } from "firebase/firestore";
import type { Timestamp } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { Eye, FlaskConical, Loader2, Play, Plus, Save, Trash2, Zap } from "lucide-react";
import { db, functions } from "./firebase";
import { logAdminAction } from "./adminLog";

// Mirror of LOW_EXPENSE_DEFAULTS in the SplitPe repo (functions/index.js) —
// the server falls back to these for any field appConfig/automations doesn't set.
type Message = { title: string; body: string };
type LowExpense = {
  enabled: boolean;
  hour: number;
  maxExpenses: number;
  minAccountAgeDays: number;
  cooldownDays: number;
  maxReminders: number;
  messages: Message[];
};
const DEFAULTS: LowExpense = {
  enabled: false,
  hour: 19,
  maxExpenses: 2,
  minAccountAgeDays: 1,
  cooldownDays: 2,
  maxReminders: 5,
  messages: [
    { title: "{name}, aaj ka kharcha add kiya? 📝", body: "Chai, cab ya dinner — jo bhi share kiya, SplitPe mein 10 second mein add karo." },
    { title: "Expense add karna mat bhoolna ⏰", body: "Add your shared expenses now so nobody forgets who paid what." },
    { title: "Hisaab saaf, dosti pakki 🤝", body: "Add your next expense on SplitPe and let us do the maths for you." },
    { title: "Trip ya dinner plan hai? ✈️", body: "Create a group and add expenses as you go — settling up later is one tap." },
    { title: "Ek expense, bas 10 second ⚡", body: "{name}, open SplitPe and add today's spend. Your friends will thank you!" },
  ],
};

type Preview = { uid: string; name: string; phone: string; expenses: number; remindersSoFar: number; hasPush: boolean };
type RunResult = { checked?: number; lowExpense?: number; due?: number; preview?: Preview[]; sent: number; pushed: number; pushFailed: number };
const runAutomation = httpsCallable<{ mode: "preview" | "test" | "now" }, RunResult>(functions, "adminRunAutomation");

type LogEntry = { id: string; action: string; detail: string; byPhone: string; at?: Timestamp };

const hourLabel = (h: number) => new Date(2000, 0, 1, h).toLocaleTimeString("en-IN", { hour: "numeric", hour12: true });

const Num = ({ label, hint, value, min, max, onChange }: { label: string; hint: string; value: number; min: number; max: number; onChange: (n: number) => void }) => (
  <label className="block">
    <span className="mb-1 block text-sm font-medium text-ink">{label}</span>
    <input
      type="number"
      min={min}
      max={max}
      value={value}
      onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value) || 0)))}
      className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-splitpe-600"
    />
    <span className="mt-1 block text-xs text-ink-soft">{hint}</span>
  </label>
);

const Card = ({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) => (
  <section className="mb-5 rounded-2xl bg-white p-5 shadow-soft">
    <h3 className="font-heading text-lg font-bold text-ink">{title}</h3>
    {hint && <p className="mb-4 text-sm text-ink-soft">{hint}</p>}
    {children}
  </section>
);

/**
 * Server-run notifications. For now one: the evening "add your expenses"
 * nudge to accounts with few expenses (SplitPe repo: lowExpenseReminder,
 * scheduled hourly, acting only at the configured IST hour). Settings are
 * appConfig/automations.lowExpenseReminder.
 */
export default function AutomationsTab() {
  const [cfg, setCfg] = useState<LowExpense | null>(null);
  const [saved, setSaved] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<"" | "preview" | "test" | "now">("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [preview, setPreview] = useState<RunResult | null>(null);
  const [runs, setRuns] = useState<LogEntry[] | null>(null);

  useEffect(() => {
    getDoc(doc(db, "appConfig", "automations"))
      .then((snap) => {
        const stored = (snap.data()?.lowExpenseReminder || {}) as Partial<LowExpense>;
        const merged = { ...DEFAULTS };
        for (const key of Object.keys(DEFAULTS) as (keyof LowExpense)[]) {
          if (stored[key] !== undefined && typeof stored[key] === typeof DEFAULTS[key]) (merged as Record<string, unknown>)[key] = stored[key];
        }
        if (!Array.isArray(merged.messages) || !merged.messages.length) merged.messages = DEFAULTS.messages;
        setCfg(merged);
        setSaved(JSON.stringify(merged));
      })
      .catch((err) => setError(err.message || "Could not load settings."));
  }, []);

  useEffect(
    () =>
      onSnapshot(
        query(collection(db, "adminLog"), orderBy("at", "desc"), limit(200)),
        (snap) => setRuns(snap.docs.filter((d) => d.data().kind === "automation").slice(0, 20).map((d) => ({ id: d.id, ...(d.data() as Omit<LogEntry, "id">) }))),
        () => setRuns([])
      ),
    []
  );

  if (!cfg) {
    return error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : <p className="text-ink-soft">Loading…</p>;
  }

  const dirty = JSON.stringify(cfg) !== saved;
  const set = <K extends keyof LowExpense>(key: K, value: LowExpense[K]) => setCfg({ ...cfg, [key]: value });
  const setMessage = (i: number, m: Partial<Message>) => set("messages", cfg.messages.map((x, j) => (j === i ? { ...x, ...m } : x)));
  const validMessages = cfg.messages.filter((m) => m.title.trim() && m.body.trim());

  const save = async (next = cfg) => {
    if (!next.messages.some((m) => m.title.trim() && m.body.trim())) {
      setError("Add at least one message with a title and text.");
      return;
    }
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const clean = { ...next, messages: next.messages.filter((m) => m.title.trim() && m.body.trim()).map((m) => ({ title: m.title.trim(), body: m.body.trim() })) };
      await setDoc(doc(db, "appConfig", "automations"), { lowExpenseReminder: clean }, { merge: true });
      setCfg(clean);
      setSaved(JSON.stringify(clean));
      logAdminAction("automation", `Expense reminder ${clean.enabled ? "on" : "off"} — ${hourLabel(clean.hour)}, ≤${clean.maxExpenses} expenses`, `every ${clean.cooldownDays} days, max ${clean.maxReminders} per user, ${clean.messages.length} messages`);
      setNotice(clean.enabled ? `Saved. Reminders go out daily at ${hourLabel(clean.hour)} IST.` : "Saved. The reminder is off.");
    } catch (err) {
      setError((err as Error).message || "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  const run = async (mode: "preview" | "test" | "now") => {
    if (mode === "now" && !window.confirm("Send the expense reminder to everyone who's due right now? Same rules as the daily run — cooldown and cap still apply.")) return;
    if (dirty && mode !== "preview") {
      setError("Save your changes first — test and run use the saved settings.");
      return;
    }
    setBusy(mode);
    setError("");
    setNotice("");
    try {
      const { data } = await runAutomation({ mode });
      if (mode === "preview") setPreview(data);
      else if (mode === "test") setNotice(data.pushed ? "Test sent to your phone and in-app Notifications." : "Test added to your in-app Notifications — no push (no device registered or notifications off).");
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
    <div>
      <h2 className="mb-1 font-heading text-2xl font-bold text-ink">Automations</h2>
      <p className="mb-6 text-sm text-ink-soft">Notifications the server sends on its own, on a schedule. Every run is recorded in the Activity Log.</p>
      {error && <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</p>}
      {notice && <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{notice}</p>}

      <section className="mb-5 rounded-2xl bg-white p-5 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-splitpe-50 text-splitpe-600"><Zap size={20} /></div>
            <div>
              <h3 className="font-heading text-lg font-bold text-ink">Evening expense reminder</h3>
              <p className="max-w-xl text-sm text-ink-soft">
                Every day at <b>{hourLabel(cfg.hour)} IST</b>, users who have added <b>{cfg.maxExpenses} or fewer expenses</b> get a nudge to add more — at most once every {cfg.cooldownDays} day{cfg.cooldownDays === 1 ? "" : "s"}, {cfg.maxReminders} times in total. Skips blocked accounts, accounts under {cfg.minAccountAgeDays} day{cfg.minAccountAgeDays === 1 ? "" : "s"} old and anyone who turned off “Daily reminder” in the app.
              </p>
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-3">
            <span className={`text-sm font-semibold ${cfg.enabled ? "text-emerald-700" : "text-ink-soft"}`}>{cfg.enabled ? "On" : "Off"}</span>
            <span className={`relative h-7 w-12 rounded-full transition ${cfg.enabled ? "bg-emerald-500" : "bg-slate-300"}`}>
              <input type="checkbox" className="sr-only" checked={cfg.enabled} onChange={(e) => save({ ...cfg, enabled: e.target.checked })} disabled={saving} />
              <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${cfg.enabled ? "left-5" : "left-0.5"}`} />
            </span>
          </label>
        </div>
      </section>

      <Card title="Rules" hint="Who gets it and how often. Keep the cooldown and cap — too many nudges make people turn notifications off.">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-ink">Send at (IST)</span>
            <select value={cfg.hour} onChange={(e) => set("hour", Number(e.target.value))} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-splitpe-600">
              {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{hourLabel(h)}</option>)}
            </select>
            <span className="mt-1 block text-xs text-ink-soft">6–8 PM works best: people are done with work and remember the day's spends.</span>
          </label>
          <Num label="Expenses added — at most" hint="Users with this many expenses or fewer are nudged." value={cfg.maxExpenses} min={0} max={50} onChange={(n) => set("maxExpenses", n)} />
          <Num label="Account age — at least (days)" hint="Gives new users a day to explore first." value={cfg.minAccountAgeDays} min={0} max={60} onChange={(n) => set("minAccountAgeDays", n)} />
          <Num label="Gap between nudges (days)" hint="Same user won't hear from us more often than this." value={cfg.cooldownDays} min={1} max={30} onChange={(n) => set("cooldownDays", n)} />
          <Num label="Max nudges per user" hint="After this, we stop for good." value={cfg.maxReminders} min={1} max={30} onChange={(n) => set("maxReminders", n)} />
        </div>
      </Card>

      <Card title="Messages" hint="Each user gets these in order — 1st nudge gets message 1, 2nd gets message 2, and so on, so nobody sees the same text twice in a row. {name} becomes their first name.">
        <div className="space-y-3">
          {cfg.messages.map((m, i) => (
            <div key={i} className="flex gap-3 rounded-xl border border-slate-200 p-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-splitpe-50 text-sm font-bold text-splitpe-700">{i + 1}</span>
              <div className="min-w-0 flex-1 space-y-2">
                <input value={m.title} maxLength={65} onChange={(e) => setMessage(i, { title: e.target.value })} placeholder="Title" className="w-full rounded-lg border border-slate-200 px-3 py-2 font-medium outline-none focus:border-splitpe-600" />
                <textarea value={m.body} maxLength={240} rows={2} onChange={(e) => setMessage(i, { body: e.target.value })} placeholder="Message" className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-splitpe-600" />
              </div>
              <button onClick={() => set("messages", cfg.messages.filter((_, j) => j !== i))} disabled={cfg.messages.length <= 1} className="self-start rounded-lg p-2 text-ink-soft hover:bg-red-50 hover:text-red-600 disabled:opacity-30" aria-label="Remove message">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {cfg.messages.length < 10 && (
            <button onClick={() => set("messages", [...cfg.messages, { title: "", body: "" }])} className="flex items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-2.5 text-sm font-medium text-ink-soft hover:border-splitpe-600 hover:text-splitpe-700">
              <Plus size={16} /> Add message
            </button>
          )}
        </div>
      </Card>

      <div className="sticky bottom-4 z-20 mb-8 flex flex-wrap gap-2 rounded-2xl bg-white p-3 shadow-soft">
        <button onClick={() => save()} disabled={!dirty || saving || !validMessages.length} className="flex items-center gap-2 rounded-xl bg-splitpe-600 px-4 py-2.5 font-semibold text-white disabled:opacity-50">
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} {dirty ? "Save changes" : "Saved"}
        </button>
        <button onClick={() => run("preview")} disabled={!!busy} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 font-medium text-ink hover:bg-slate-50 disabled:opacity-50">
          {busy === "preview" ? <Loader2 size={16} className="animate-spin" /> : <Eye size={16} />} Who gets it today?
        </button>
        <button onClick={() => run("test")} disabled={!!busy} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 font-medium text-ink hover:bg-slate-50 disabled:opacity-50">
          {busy === "test" ? <Loader2 size={16} className="animate-spin" /> : <FlaskConical size={16} />} Send test to me
        </button>
        <button onClick={() => run("now")} disabled={!!busy} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 font-medium text-ink hover:bg-slate-50 disabled:opacity-50">
          {busy === "now" ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />} Run now
        </button>
      </div>

      {preview && (
        <Card title="Who gets it today" hint={`Checked ${preview.checked} accounts · ${preview.lowExpense} have ≤${cfg.maxExpenses} expenses · ${preview.due} due now (the rest are on cooldown or reached the cap). Nothing was sent.`}>
          {!preview.preview?.length ? (
            <p className="text-sm text-ink-soft">No one is due right now.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 text-xs uppercase tracking-wide text-ink-soft">
                  <tr><th className="py-2 pr-3">User</th><th className="py-2 pr-3">Mobile</th><th className="py-2 pr-3">Expenses</th><th className="py-2 pr-3">Nudges so far</th><th className="py-2">Push</th></tr>
                </thead>
                <tbody>
                  {preview.preview.map((p) => (
                    <tr key={p.uid} className="border-b border-slate-100 last:border-0">
                      <td className="py-2 pr-3 font-medium text-ink">{p.name || "No name"}</td>
                      <td className="py-2 pr-3 text-ink-soft">+91 {p.phone}</td>
                      <td className="py-2 pr-3">{p.expenses}</td>
                      <td className="py-2 pr-3">{p.remindersSoFar} / {cfg.maxReminders}</td>
                      <td className="py-2">{p.hasPush ? "Yes" : <span className="text-ink-soft">In-app only</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(preview.due ?? 0) > preview.preview.length && <p className="mt-2 text-xs text-ink-soft">Showing first {preview.preview.length} of {preview.due}.</p>}
            </div>
          )}
        </Card>
      )}

      <Card title="Recent runs">
        {runs === null ? <p className="text-sm text-ink-soft">Loading…</p> : runs.length === 0 ? (
          <p className="text-sm text-ink-soft">No runs yet. Once it's on, the first one shows up here after {hourLabel(cfg.hour)}.</p>
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
      </Card>
    </div>
  );
}
