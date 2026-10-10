import { useState } from "react";
import { Bell, Loader2, Send } from "lucide-react";
import logo from "../assets/logo-mark.png";
import { sendNotification } from "./users";
import type { NotifyAudience } from "./users";

const MAX_TITLE = 65;
const MAX_BODY = 240;

/**
 * Title + message form with a phone-style preview. Sends through
 * adminSendNotification: an in-app Notifications entry for every recipient
 * plus a push to each registered device.
 */
export default function NotifyComposer({ target, label, onSent, compact = false }: {
  /** Who gets it; null disables sending (e.g. an empty audience). */
  target: NotifyAudience | null;
  /** "12 users" — shown on the button and in the confirm prompt. */
  label: string;
  onSent?: (summary: string) => void;
  /** Single column, for narrow containers like the account side panel. */
  compact?: boolean;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const ready = !!target && title.trim().length > 0 && body.trim().length > 0;

  const send = async () => {
    if (!target || !ready) return;
    if (!window.confirm(`Send “${title.trim()}” to ${label}?\n\nIt appears in their Notifications and as a push on phones that allow it. This can't be recalled.`)) return;
    setSending(true);
    setError("");
    setNotice("");
    try {
      const { data } = await sendNotification({ title: title.trim(), body: body.trim(), ...target });
      const summary = `Sent to ${data.recipients} user${data.recipients === 1 ? "" : "s"} — ${data.pushed} push${data.pushed === 1 ? "" : "es"} delivered${data.pushFailed ? `, ${data.pushFailed} failed (no longer installed or notifications off)` : ""}.`;
      setNotice(summary);
      setTitle("");
      setBody("");
      onSent?.(summary);
    } catch (err) {
      setError((err as Error).message || "Could not send the notification.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={`grid gap-4 ${compact ? "" : "md:grid-cols-[1.2fr_1fr]"}`}>
      <div className="space-y-3">
        <label className="block">
          <span className="mb-1 flex justify-between text-sm font-medium text-ink">Title <span className="font-normal text-ink-soft">{title.length}/{MAX_TITLE}</span></span>
          <input
            value={title}
            maxLength={MAX_TITLE}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. New: split by percentage 🎉"
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-splitpe-600"
          />
        </label>
        <label className="block">
          <span className="mb-1 flex justify-between text-sm font-medium text-ink">Message <span className="font-normal text-ink-soft">{body.length}/{MAX_BODY}</span></span>
          <textarea
            value={body}
            maxLength={MAX_BODY}
            rows={4}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What do you want to tell them?"
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 outline-none focus:border-splitpe-600"
          />
        </label>
        {error && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</p>}
        {notice && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{notice}</p>}
        <button onClick={send} disabled={!ready || sending} className="flex items-center gap-2 rounded-xl bg-splitpe-600 px-5 py-2.5 font-semibold text-white disabled:opacity-50">
          {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Send to {label}
        </button>
      </div>

      <div className="rounded-2xl bg-slate-900 p-4">
        <p className="mb-3 flex items-center gap-1.5 text-xs font-medium text-slate-400"><Bell size={13} /> Preview</p>
        <div className="flex gap-3 rounded-2xl bg-white/95 p-3">
          <img src={logo} alt="" className="h-9 w-9 shrink-0 rounded-lg" />
          <div className="min-w-0">
            <p className="flex justify-between gap-2 text-xs text-slate-500"><span>SplitPe</span><span>now</span></p>
            <p className="truncate text-sm font-semibold text-slate-900">{title || "Notification title"}</p>
            <p className="line-clamp-3 text-sm text-slate-700">{body || "Your message shows here."}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
