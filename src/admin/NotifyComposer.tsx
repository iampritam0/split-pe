import { useState } from "react";
import { httpsCallable } from "firebase/functions";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { Bell, CalendarClock, ImagePlus, Loader2, Send, X } from "lucide-react";
import logo from "../assets/logo-mark.png";
import { functions, storage } from "./firebase";
import { TAGLINE, pushSummary, sendNotification } from "./users";
import type { NotifyAudience } from "./users";

const scheduleNotification = httpsCallable<{ title: string; body: string; image?: string; sendAt: number; audience: string; uids?: string[] }, { id: string }>(
  functions,
  "adminScheduleNotification"
);

const MAX_TITLE = 65;
// datetime-local wants "YYYY-MM-DDTHH:mm" in local time.
const localInput = (ms: number) => {
  const d = new Date(ms - new Date().getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 16);
};
const MAX_BODY = 240;
// FCM drops notification images over 1 MB (storage.rules enforces it too).
const MAX_IMAGE_BYTES = 1024 * 1024;

/** Uploads to Storage notifications/ — the only place the server accepts images from. */
const uploadImage = async (file: File) => {
  const path = `notifications/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
  await uploadBytes(ref(storage, path), file, { contentType: file.type });
  return getDownloadURL(ref(storage, path));
};

/**
 * Title + message (+ optional image) form with a phone-style preview. Sends
 * through adminSendNotification: an in-app Notifications entry for every
 * recipient plus a push to each registered device. The image is the push's
 * big picture on Android; iOS shows it only once the app ships a
 * Notification Service Extension.
 */
export default function NotifyComposer({ target, label, onSent, compact = false, initialTitle = "", initialBody = "", scheduleAs }: {
  /** Who gets it; null disables sending (e.g. an empty audience). */
  target: NotifyAudience | null;
  /** "12 users" — shown on the button and in the confirm prompt. */
  label: string;
  onSent?: (summary: string) => void;
  /** Single column, for narrow containers like the account side panel. */
  compact?: boolean;
  /** Pre-filled text, e.g. from a template — remount (key) to apply a new one. */
  initialTitle?: string;
  initialBody?: string;
  /**
   * Enables "Schedule for later". A segment key is re-evaluated when it
   * sends (SplitPe repo: AUDIENCE_TESTS); "uids" sends to a fixed list.
   */
  scheduleAs?: { audience: string; uids?: string[] } | null;
}) {
  const [mode, setMode] = useState<"now" | "later">("now");
  const [when, setWhen] = useState(() => localInput(Date.now() + 60 * 60 * 1000));
  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  // The picked file plus an object URL for the previews (revoked on clear).
  const [image, setImageState] = useState<{ file: File; url: string } | null>(null);
  const setImage = (file: File | null) =>
    setImageState((prev) => {
      if (prev) URL.revokeObjectURL(prev.url);
      return file ? { file, url: URL.createObjectURL(file) } : null;
    });
  const imagePreview = image?.url || "";
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const ready = !!target && title.trim().length > 0 && body.trim().length > 0;

  const pickImage = (f: File | undefined) => {
    setError("");
    if (!f) return;
    if (!f.type.startsWith("image/")) return setError("Pick an image file.");
    if (f.size > MAX_IMAGE_BYTES) return setError("Image must be under 1 MB.");
    setImage(f);
  };

  const schedule = async () => {
    if (!scheduleAs || !title.trim() || !body.trim()) return;
    const sendAt = new Date(when).getTime();
    if (!Number.isFinite(sendAt) || sendAt < Date.now() + 2 * 60 * 1000) {
      setError("Pick a time at least a few minutes from now.");
      return;
    }
    const at = new Date(sendAt).toLocaleString("en-IN", { weekday: "short", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
    if (!window.confirm(`Schedule “${title.trim()}” for ${at} to ${label}?\n\nYou can cancel it until then.`)) return;
    setSending(true);
    setError("");
    setNotice("");
    try {
      const imageUrl = image ? await uploadImage(image.file) : undefined;
      await scheduleNotification({ title: title.trim(), body: body.trim(), image: imageUrl, sendAt, ...scheduleAs });
      const summary = `Scheduled for ${at}. It goes out within 15 minutes of that time.`;
      setNotice(summary);
      setTitle("");
      setBody("");
      setImage(null);
      onSent?.(summary);
    } catch (err) {
      setError((err as Error).message || "Could not schedule it.");
    } finally {
      setSending(false);
    }
  };

  const send = async () => {
    if (!target || !ready) return;
    if (!window.confirm(`Send “${title.trim()}” to ${label}?\n\nIt appears in their Notifications and as a push on phones that allow it. This can't be recalled.`)) return;
    setSending(true);
    setError("");
    setNotice("");
    try {
      const imageUrl = image ? await uploadImage(image.file) : undefined;
      const { data } = await sendNotification({ title: title.trim(), body: body.trim(), image: imageUrl, ...target });
      const summary = `Sent to ${data.recipients} user${data.recipients === 1 ? "" : "s"} (in-app). Push: ${pushSummary(data.pushed, data.receipts, data.sendErrors)}`;
      if (data.receipts?.failed || data.pushFailed) setError(summary);
      else setNotice(summary);
      setTitle("");
      setBody("");
      setImage(null);
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
        {imagePreview ? (
          <div className="relative">
            <img src={imagePreview} alt="" className="aspect-[2/1] w-full rounded-xl border border-slate-200 object-cover" />
            <button type="button" onClick={() => setImage(null)} className="absolute right-2 top-2 rounded-full bg-white/90 p-1 text-ink shadow" aria-label="Remove image"><X size={16} /></button>
          </div>
        ) : (
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 px-3 py-3 text-sm text-ink-soft hover:bg-slate-50">
            <ImagePlus size={18} /> Image (optional, under 1 MB, 2:1 works best)
            <input type="file" accept="image/*" className="hidden" onChange={(e) => { pickImage(e.target.files?.[0]); e.target.value = ""; }} />
          </label>
        )}
        {error && <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</p>}
        {notice && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{notice}</p>}
        {scheduleAs && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl bg-slate-100 p-1 text-sm">
              {(["now", "later"] as const).map((m) => (
                <button key={m} type="button" onClick={() => setMode(m)} className={`rounded-lg px-3 py-1.5 font-medium ${mode === m ? "bg-white text-ink shadow-sm" : "text-ink-soft"}`}>
                  {m === "now" ? "Send now" : "Schedule"}
                </button>
              ))}
            </div>
            {mode === "later" && (
              <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-splitpe-600" />
            )}
          </div>
        )}
        {scheduleAs && mode === "later" ? (
          <button onClick={schedule} disabled={!title.trim() || !body.trim() || sending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-splitpe-600 px-5 py-2.5 font-semibold text-white disabled:opacity-50 sm:w-auto">
            {sending ? <Loader2 size={16} className="animate-spin" /> : <CalendarClock size={16} />} Schedule for {label}
          </button>
        ) : (
          <button onClick={send} disabled={!ready || sending} className="flex w-full items-center justify-center gap-2 rounded-xl bg-splitpe-600 px-5 py-2.5 font-semibold text-white disabled:opacity-50 sm:w-auto">
            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />} Send to {label}
          </button>
        )}
      </div>

      <div className="rounded-2xl bg-slate-900 p-4">
        <p className="mb-3 flex items-center gap-1.5 text-xs font-medium text-slate-400"><Bell size={13} /> Preview</p>
        <div className="flex gap-3 rounded-2xl bg-white/95 p-3">
          <img src={logo} alt="" className="h-9 w-9 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1">
            <p className="flex justify-between gap-2 text-xs text-slate-500"><span>SplitPe</span><span>now</span></p>
            <p className="truncate text-sm font-semibold text-slate-900">{title || "Notification title"}</p>
            <p className="line-clamp-3 text-sm text-slate-700">{body || "Your message shows here."}</p>
            <p className="text-sm text-slate-500">{TAGLINE}</p>
            {imagePreview && <img src={imagePreview} alt="" className="mt-2 aspect-[2/1] w-full rounded-lg object-cover" />}
          </div>
        </div>
      </div>
    </div>
  );
}
