import { useEffect, useMemo, useState } from "react";
import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { ImagePlus, Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { db, storage } from "./firebase";

/**
 * banners/{id} — what the app shows as a one-time popup on open (each banner
 * once per device) while `active` and now is between startAt and endAt.
 * Images live in Storage at banners/<timestamp>-<name>.
 */
type Banner = {
  id: string;
  title: string;
  message: string;
  imageUrl: string | null;
  imagePath: string | null;
  ctaLabel: string;
  ctaTarget: "none" | "add_expense" | "url";
  ctaUrl: string;
  startAt: Timestamp;
  endAt: Timestamp;
  active: boolean;
};

type Draft = Omit<Banner, "id" | "startAt" | "endAt"> & { id?: string; startAt: string; endAt: string };

const MAX_IMAGE_BYTES = 2 * 1024 * 1024;

// <input type="datetime-local"> works in local time without a zone suffix.
const toLocalInput = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);

const emptyDraft = (): Draft => {
  const start = new Date();
  const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
  return {
    title: "",
    message: "",
    imageUrl: null,
    imagePath: null,
    ctaLabel: "",
    ctaTarget: "none",
    ctaUrl: "",
    startAt: toLocalInput(start),
    endAt: toLocalInput(end),
    active: true,
  };
};

const statusOf = (b: Banner) => {
  const now = Date.now();
  if (!b.active) return { label: "Off", cls: "bg-slate-100 text-slate-600" };
  if (now < b.startAt.toMillis()) return { label: "Scheduled", cls: "bg-amber-100 text-amber-800" };
  if (now > b.endAt.toMillis()) return { label: "Ended", cls: "bg-slate-100 text-slate-500" };
  return { label: "Live", cls: "bg-emerald-100 text-emerald-700" };
};

const fmt = (t: Timestamp) => t.toDate().toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

const inputClass = "w-full rounded-xl border border-slate-200 px-3 py-2 outline-none focus:border-splitpe-600";

export default function BannersTab() {
  const [banners, setBanners] = useState<Banner[] | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(
    () =>
      onSnapshot(
        query(collection(db, "banners"), orderBy("startAt", "desc")),
        (snap) => setBanners(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Banner, "id">) }))),
        (err) => setError(err.message)
      ),
    []
  );

  const openEditor = (b?: Banner) => {
    setError("");
    setFile(null);
    setDraft(b ? { ...b, startAt: toLocalInput(b.startAt.toDate()), endAt: toLocalInput(b.endAt.toDate()) } : emptyDraft());
  };

  const pickFile = (f: File | undefined) => {
    if (!f) return;
    if (!f.type.startsWith("image/")) return setError("Pick an image file (PNG, JPG or WebP).");
    if (f.size > MAX_IMAGE_BYTES) return setError("Image must be under 2 MB.");
    setError("");
    setFile(f);
  };

  const save = async () => {
    if (!draft) return;
    const startAt = new Date(draft.startAt);
    const endAt = new Date(draft.endAt);
    if (!draft.title.trim()) return setError("Add a title.");
    if (!(endAt > startAt)) return setError("End must be after start.");
    if (draft.ctaTarget !== "none" && !draft.ctaLabel.trim()) return setError("Add the button text.");
    if (draft.ctaTarget === "url" && !/^https:\/\//.test(draft.ctaUrl.trim())) return setError("Button link must start with https://");

    setSaving(true);
    setError("");
    try {
      let { imageUrl, imagePath } = draft;
      if (file) {
        const path = `banners/${Date.now()}-${file.name.replace(/[^\w.-]/g, "_")}`;
        await uploadBytes(ref(storage, path), file, { contentType: file.type });
        imageUrl = await getDownloadURL(ref(storage, path));
        // Replacing an image — drop the old file so Storage doesn't pile up.
        if (imagePath) deleteObject(ref(storage, imagePath)).catch(() => {});
        imagePath = path;
      }
      const data = {
        title: draft.title.trim(),
        message: draft.message.trim(),
        imageUrl,
        imagePath,
        ctaLabel: draft.ctaTarget === "none" ? "" : draft.ctaLabel.trim(),
        ctaTarget: draft.ctaTarget,
        ctaUrl: draft.ctaTarget === "url" ? draft.ctaUrl.trim() : "",
        startAt: Timestamp.fromDate(startAt),
        endAt: Timestamp.fromDate(endAt),
        active: draft.active,
        updatedAt: serverTimestamp(),
      };
      if (draft.id) await updateDoc(doc(db, "banners", draft.id), data);
      else await addDoc(collection(db, "banners"), { ...data, createdAt: serverTimestamp() });
      setDraft(null);
    } catch (err) {
      setError(`Save failed: ${(err as Error).message}`);
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = (b: Banner) => updateDoc(doc(db, "banners", b.id), { active: !b.active, updatedAt: serverTimestamp() }).catch((err) => setError(err.message));

  const remove = async (b: Banner) => {
    if (!window.confirm(`Delete "${b.title}"? This can't be undone.`)) return;
    try {
      await deleteDoc(doc(db, "banners", b.id));
      if (b.imagePath) deleteObject(ref(storage, b.imagePath)).catch(() => {});
    } catch (err) {
      setError((err as Error).message);
    }
  };

  // One object URL per picked file, released when the file changes.
  const fileUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => () => { if (fileUrl) URL.revokeObjectURL(fileUrl); }, [fileUrl]);
  const preview = fileUrl || draft?.imageUrl;

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h2 className="mb-1 font-heading text-2xl font-bold text-ink">Banners</h2>
          <p className="text-sm text-ink-soft">Festival offers and announcements — shown once per device as a popup when the app opens.</p>
        </div>
        <button onClick={() => openEditor()} className="flex shrink-0 items-center gap-2 rounded-xl bg-splitpe-600 px-4 py-2.5 font-semibold text-white">
          <Plus size={18} /> New banner
        </button>
      </div>

      {error && !draft && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {banners === null ? (
        <p className="text-ink-soft">Loading…</p>
      ) : banners.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center text-ink-soft shadow-soft">No banners yet. Create one for the next festival 🎉</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {banners.map((b) => {
            const status = statusOf(b);
            return (
              <div key={b.id} className="overflow-hidden rounded-2xl bg-white shadow-soft">
                {b.imageUrl ? <img src={b.imageUrl} alt="" className="h-40 w-full object-cover" /> : <div className="h-40 bg-brand-gradient" />}
                <div className="p-4">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <h3 className="truncate font-heading text-lg font-bold text-ink">{b.title}</h3>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.cls}`}>{status.label}</span>
                  </div>
                  {b.message && <p className="mb-2 line-clamp-2 text-sm text-ink-soft">{b.message}</p>}
                  <p className="text-xs text-slate-400">{fmt(b.startAt)} → {fmt(b.endAt)}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <button onClick={() => toggleActive(b)} className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-ink">
                      {b.active ? "Turn off" : "Turn on"}
                    </button>
                    <button onClick={() => openEditor(b)} className="rounded-lg border border-slate-200 p-1.5 text-ink" aria-label="Edit"><Pencil size={16} /></button>
                    <button onClick={() => remove(b)} className="rounded-lg border border-red-200 p-1.5 text-red-600" aria-label="Delete"><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {draft && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4">
          <div className="my-8 w-full max-w-lg rounded-2xl bg-white p-6 shadow-card">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-xl font-bold text-ink">{draft.id ? "Edit banner" : "New banner"}</h3>
              <button onClick={() => setDraft(null)} aria-label="Close"><X size={20} /></button>
            </div>

            <label className="mb-4 flex h-40 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-slate-200 bg-slate-50">
              {preview ? <img src={preview} alt="" className="h-full w-full object-cover" /> : (
                <span className="flex flex-col items-center gap-1 text-sm text-ink-soft"><ImagePlus size={24} /> Banner image (optional, under 2 MB)</span>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => pickFile(e.target.files?.[0])} />
            </label>

            <div className="space-y-3">
              <input className={inputClass} placeholder="Title, e.g. Happy Diwali 🪔" maxLength={60} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
              <textarea className={inputClass} rows={2} placeholder="Message (optional)" maxLength={200} value={draft.message} onChange={(e) => setDraft({ ...draft, message: e.target.value })} />

              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm text-ink">Starts
                  <input type="datetime-local" className={inputClass} value={draft.startAt} onChange={(e) => setDraft({ ...draft, startAt: e.target.value })} />
                </label>
                <label className="text-sm text-ink">Ends
                  <input type="datetime-local" className={inputClass} value={draft.endAt} onChange={(e) => setDraft({ ...draft, endAt: e.target.value })} />
                </label>
              </div>

              <label className="block text-sm text-ink">Button
                <select className={inputClass} value={draft.ctaTarget} onChange={(e) => setDraft({ ...draft, ctaTarget: e.target.value as Draft["ctaTarget"] })}>
                  <option value="none">No button (just "Close")</option>
                  <option value="add_expense">Open Add Expense</option>
                  <option value="url">Open a link</option>
                </select>
              </label>
              {draft.ctaTarget !== "none" && (
                <input className={inputClass} placeholder="Button text, e.g. Add expense" maxLength={24} value={draft.ctaLabel} onChange={(e) => setDraft({ ...draft, ctaLabel: e.target.value })} />
              )}
              {draft.ctaTarget === "url" && (
                <input className={inputClass} placeholder="https://…" value={draft.ctaUrl} onChange={(e) => setDraft({ ...draft, ctaUrl: e.target.value })} />
              )}

              <label className="flex items-center gap-2 text-sm text-ink">
                <input type="checkbox" checked={draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} /> Active
              </label>
            </div>

            {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setDraft(null)} className="rounded-xl border border-slate-200 px-4 py-2 font-medium text-ink">Cancel</button>
              <button onClick={save} disabled={saving} className="flex items-center gap-2 rounded-xl bg-splitpe-600 px-5 py-2 font-semibold text-white disabled:opacity-50">
                {saving && <Loader2 size={16} className="animate-spin" />} {draft.id ? "Save" : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
