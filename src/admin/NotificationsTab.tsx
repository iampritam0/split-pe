import { useEffect, useMemo, useRef, useState } from "react";
import { collection, getCountFromServer, limit, onSnapshot, orderBy, query, where } from "firebase/firestore";
import type { Timestamp } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { CalendarClock, Loader2, Megaphone, Pencil, Send, X } from "lucide-react";
import { db, functions } from "./firebase";
import NotifyComposer from "./NotifyComposer";
import { AUDIENCES, TEMPLATES } from "./notifyTemplates";
import type { AudienceKey, Template } from "./notifyTemplates";
import useUsers from "./useUsers";
import { TAGLINE, pushSummary, sendNotification } from "./users";
import type { NotifyAudience, Receipts, UserRow } from "./users";

const cancelScheduled = httpsCallable<{ id: string }, { cancelled: boolean }>(functions, "adminCancelScheduled");

type Campaign = { id: string; title: string; body: string; source: string; recipients: number; pushed: number; receipts?: Receipts; sendErrors?: Record<string, number>; byPhone?: string; sentAt?: Timestamp };
const SOURCE_LABEL: Record<string, string> = {
  manual: "Sent from panel",
  scheduled: "Scheduled",
  duesReminder: "Automation · Dues reminder",
  welcomeSeries: "Automation · Welcome series",
  lowExpenseReminder: "Automation · Expense reminder",
  winBack: "Automation · Win-back",
  weeklySummary: "Automation · Weekly summary",
};
type Segment = { list: UserRow[]; withPush: number };
type Scheduled = { id: string; title: string; body: string; audience: string; uids?: string[] | null; sendAt?: Timestamp; status: string; createdByPhone?: string };

const GROUPS = ["Everyone", "Active", "Not active", "Other"] as const;
const CATEGORIES = ["All", ...new Set(TEMPLATES.map((t) => t.category))];
const plural = (n: number) => `${n.toLocaleString("en-IN")} user${n === 1 ? "" : "s"}`;

const toTarget = (key: AudienceKey, seg: Segment): NotifyAudience | null =>
  !seg.list.length ? null : key === "all" ? { audience: "all" } : { audience: "uids", uids: seg.list.map((p) => p.id) };

/** One ready-made message: pick (or keep) its audience and send in one tap, or open it in the editor. */
function TemplateCard({ template, segments, ready, onEdit }: {
  template: Template;
  segments: Record<AudienceKey, Segment>;
  ready: boolean;
  onEdit: (t: Template, audience: AudienceKey) => void;
}) {
  const [audience, setAudience] = useState<AudienceKey>(template.audience);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const seg = segments[audience];
  const target = ready ? toTarget(audience, seg) : null;
  const audienceLabel = AUDIENCES.find((a) => a.key === audience)!.label;

  const send = async () => {
    if (!target) return;
    if (!window.confirm(`Send “${template.title}” to ${audienceLabel} (${plural(seg.list.length)})?\n\n${template.body}\n\nThis can't be recalled.`)) return;
    setSending(true);
    setResult(null);
    try {
      const { data } = await sendNotification({ title: template.title, body: template.body, ...target });
      setResult({ ok: !data.receipts?.failed && !data.pushFailed, text: `Sent to ${plural(data.recipients)}. Push: ${pushSummary(data.pushed, data.receipts, data.sendErrors)}` });
    } catch (err) {
      setResult({ ok: false, text: (err as Error).message || "Could not send." });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col rounded-2xl bg-white p-4 shadow-soft">
      <span className="mb-2 self-start rounded-full bg-splitpe-50 px-2 py-0.5 text-xs font-medium text-splitpe-700">{template.category}</span>
      <p className="font-semibold text-ink">{template.title}</p>
      <p className="mb-3 flex-1 text-sm text-ink-soft">{template.body}<span className="block text-slate-400">{TAGLINE}</span></p>
      <select
        value={audience}
        onChange={(e) => { setAudience(e.target.value as AudienceKey); setResult(null); }}
        className="mb-2 w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-ink outline-none"
        aria-label="Send to"
      >
        {AUDIENCES.map((a) => (
          <option key={a.key} value={a.key}>{a.label} ({ready ? segments[a.key].list.length : "…"})</option>
        ))}
      </select>
      {result && <p className={`mb-2 rounded-lg px-2 py-1.5 text-xs ${result.ok ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>{result.text}</p>}
      <div className="flex gap-2">
        <button onClick={send} disabled={!target || sending} className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-splitpe-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
          {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Send to {ready ? plural(seg.list.length) : "…"}
        </button>
        <button onClick={() => onEdit(template, audience)} className="rounded-lg border border-slate-200 px-3 py-2 text-ink-soft hover:bg-slate-50" aria-label="Edit before sending" title="Edit before sending">
          <Pencil size={14} />
        </button>
      </div>
    </div>
  );
}

/**
 * Announcements: one-tap templates and a custom message, each to an audience
 * picked by activity (active / not active in the last N days) or sign-up.
 * History is read from adminLog, where adminSendNotification records every send.
 */
export default function NotificationsTab() {
  const { users, now, error: loadError } = useUsers();
  const [audience, setAudience] = useState<AudienceKey>("all");
  const [category, setCategory] = useState("All");
  const [draft, setDraft] = useState<{ key: number; title: string; body: string }>({ key: 0, title: "", body: "" });
  const [history, setHistory] = useState<Campaign[] | null>(null);
  const [opens, setOpens] = useState<Record<string, number>>({});
  const composerRef = useRef<HTMLDivElement>(null);
  const [scheduled, setScheduled] = useState<Scheduled[] | null>(null);
  const [cancelling, setCancelling] = useState("");

  useEffect(
    () =>
      onSnapshot(
        query(collection(db, "scheduledNotifications"), where("status", "==", "scheduled")),
        (snap) => setScheduled(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Scheduled, "id">) })).sort((a, b) => (a.sendAt?.toMillis() ?? 0) - (b.sendAt?.toMillis() ?? 0))),
        () => setScheduled([])
      ),
    []
  );

  const cancel = async (c: Scheduled) => {
    if (!window.confirm(`Cancel “${c.title}”? It won't be sent.`)) return;
    setCancelling(c.id);
    try {
      await cancelScheduled({ id: c.id });
    } catch (err) {
      window.alert((err as Error).message || "Could not cancel it.");
    } finally {
      setCancelling("");
    }
  };

  useEffect(
    () =>
      onSnapshot(
        query(collection(db, "campaigns"), orderBy("sentAt", "desc"), limit(30)),
        (snap) => setHistory(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Campaign, "id">) }))),
        () => setHistory([])
      ),
    []
  );

  // Opens per campaign — counted server-side from notificationOpens (one per person).
  useEffect(() => {
    if (!history?.length) return;
    Promise.all(history.map(async (c) => [c.id, (await getCountFromServer(query(collection(db, "notificationOpens"), where("cid", "==", c.id)))).data().count] as const))
      .then((pairs) => setOpens(Object.fromEntries(pairs)))
      .catch(() => {});
  }, [history]);

  const segments = useMemo(() => {
    const out = {} as Record<AudienceKey, Segment>;
    for (const a of AUDIENCES) {
      const list = (users || []).filter((p) => !p.blocked && a.test(p, now));
      out[a.key] = { list, withPush: list.filter((p) => p.hasPush).length };
    }
    return out;
  }, [users, now]);

  const ready = !!users;
  const current = segments[audience];
  const editTemplate = (t: Template, a: AudienceKey) => {
    setAudience(a);
    setDraft((d) => ({ key: d.key + 1, title: t.title, body: t.body }));
    composerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const templates = TEMPLATES.filter((t) => category === "All" || t.category === category);

  return (
    <div>
      <h2 className="mb-1 font-heading text-2xl font-bold text-ink">Notifications</h2>
      <p className="mb-6 text-sm text-ink-soft">Send an announcement to SplitPe users. It lands in their in-app Notifications and as a push on phones with notifications allowed. Blocked accounts are always skipped.</p>
      {loadError && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{loadError}</p>}

      <h3 className="mb-1 font-heading text-lg font-bold text-ink">Quick send</h3>
      <p className="mb-3 text-sm text-ink-soft">Ready-made messages. Each suggests an audience — change it from the dropdown, then tap Send. ✏️ opens it in the editor below.</p>
      <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium ${category === c ? "bg-splitpe-600 text-white" : "bg-white text-ink-soft shadow-soft hover:text-ink"}`}
          >
            {c}
          </button>
        ))}
      </div>
      <div className="mb-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t) => <TemplateCard key={t.id} template={t} segments={segments} ready={ready} onEdit={editTemplate} />)}
      </div>

      <div ref={composerRef} className="scroll-mt-28">
        <h3 className="mb-1 font-heading text-lg font-bold text-ink">Custom message</h3>
        <p className="mb-3 text-sm text-ink-soft">Choose who gets it, then write your own.</p>
        <div className="mb-4 space-y-3">
          {GROUPS.map((g) => (
            <div key={g}>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-ink-soft">{g}</p>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {AUDIENCES.filter((a) => a.group === g).map(({ key, label, hint }) => (
                  <button
                    key={key}
                    onClick={() => setAudience(key)}
                    className={`rounded-2xl border-2 bg-white p-3 text-left shadow-soft ${audience === key ? "border-splitpe-600" : "border-transparent hover:border-slate-200"}`}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="font-medium text-ink">{label}</p>
                      <p className="font-heading text-xl font-bold text-ink">{ready ? segments[key].list.length.toLocaleString("en-IN") : "…"}</p>
                    </div>
                    <p className="text-xs text-ink-soft">{hint}</p>
                    {ready && <p className="mt-0.5 text-xs text-splitpe-700">{segments[key].withPush} with push on</p>}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-soft">
          <NotifyComposer
            key={draft.key}
            initialTitle={draft.title}
            initialBody={draft.body}
            target={ready ? toTarget(audience, current) : null}
            scheduleAs={{ audience }}
            label={`${AUDIENCES.find((a) => a.key === audience)!.label} (${plural(current.list.length)})`}
          />
        </div>
      </div>

      <h3 className="mb-3 mt-10 font-heading text-lg font-bold text-ink">Scheduled</h3>
      {scheduled === null ? (
        <p className="text-ink-soft">Loading…</p>
      ) : scheduled.length === 0 ? (
        <div className="rounded-2xl bg-white p-6 text-center text-sm text-ink-soft shadow-soft">Nothing scheduled. Pick “Schedule” in the custom message above to send later.</div>
      ) : (
        <ol className="rounded-2xl bg-white p-2 shadow-soft">
          {scheduled.map((c) => (
            <li key={c.id} className="flex items-start gap-3 rounded-xl px-3 py-3 hover:bg-slate-50">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-splitpe-50 text-splitpe-600"><CalendarClock size={17} /></div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink">{c.title}</p>
                <p className="text-sm text-ink-soft">{c.body}</p>
                <p className="mt-1 text-xs text-ink-soft">
                  {c.sendAt?.toDate().toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })} · to{" "}
                  {c.audience === "uids" ? `${c.uids?.length ?? 0} selected users` : AUDIENCES.find((a) => a.key === c.audience)?.label || c.audience}
                </p>
              </div>
              <button onClick={() => cancel(c)} disabled={cancelling === c.id} className="flex shrink-0 items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-ink-soft hover:bg-red-50 hover:text-red-600 disabled:opacity-50">
                {cancelling === c.id ? <Loader2 size={14} className="animate-spin" /> : <X size={14} />} Cancel
              </button>
            </li>
          ))}
        </ol>
      )}

      <h3 className="mb-1 mt-10 font-heading text-lg font-bold text-ink">Sent</h3>
      <p className="mb-3 text-sm text-ink-soft">Opened = tapped the push or the in-app notification (counted on app 1.1.0 and later). Older sends are in the Activity Log.</p>
      {history === null ? (
        <p className="text-ink-soft">Loading…</p>
      ) : history.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center text-ink-soft shadow-soft">Nothing sent yet.</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl bg-white shadow-soft">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-ink-soft">
              <tr><th className="px-4 py-3">Notification</th><th className="px-3 py-3 text-right">Sent to</th><th className="px-3 py-3 text-right">Pushes delivered</th><th className="px-3 py-3 text-right">Opened</th><th className="px-3 py-3">When</th></tr>
            </thead>
            <tbody>
              {history.map((c) => {
                const o = opens[c.id];
                return (
                  <tr key={c.id} className="border-b border-slate-100 last:border-0">
                    <td className="px-4 py-3">
                      <p className="flex items-center gap-2 font-medium text-ink"><Megaphone size={14} className="shrink-0 text-amber-600" /> {c.title}</p>
                      <p className="truncate text-xs text-ink-soft">{SOURCE_LABEL[c.source] || c.source} · {c.body}</p>
                    </td>
                    <td className="px-3 py-3 text-right text-ink">{c.recipients.toLocaleString("en-IN")}</td>
                    <td className="px-3 py-3 text-right text-ink" title={pushSummary(c.pushed, c.receipts, c.sendErrors)}>
                      {c.receipts ? (
                        <>
                          {c.receipts.delivered.toLocaleString("en-IN")} <span className="text-ink-soft">/ {c.pushed}</span>
                          {c.receipts.failed > 0 && <span className="block text-xs text-red-600">{c.receipts.failed} failed · {Object.keys(c.receipts.errors).join(", ")}</span>}
                          {c.receipts.pending > 0 && <span className="block text-xs text-ink-soft">{c.receipts.pending} confirming</span>}
                        </>
                      ) : <span className="text-ink-soft">{c.pushed} sent</span>}
                    </td>
                    <td className="px-3 py-3 text-right text-ink">{o === undefined ? "…" : <>{o.toLocaleString("en-IN")} <span className="text-ink-soft">({c.recipients ? Math.round((o / c.recipients) * 100) : 0}%)</span></>}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-xs text-ink-soft">{c.sentAt ? c.sentAt.toDate().toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "just now"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
