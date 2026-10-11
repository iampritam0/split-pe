import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { Ban, BadgeCheck, Bell, CheckCircle2, Copy, Eye, EyeOff, Loader2, LogOut, Phone, Save, ShieldAlert, Tag, Trash2, X } from "lucide-react";
import { auth, db } from "./firebase";
import NotifyComposer from "./NotifyComposer";
import { useRole } from "./role";
import { TAG_PRESETS, ago, deleteUser, displayName, fmtDate, forceLogout, revealUser, setUserStatus } from "./users";
import type { Revealed, UserRow } from "./users";

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2.5 last:border-0">
    <span className="text-sm text-ink-soft">{label}</span>
    <span className="text-right text-sm font-medium text-ink">{children}</span>
  </div>
);

/**
 * One account, masked by default: status, when they joined and last used
 * the app, the team's notes and the account actions. Name, number, photo
 * and settings appear only after "Show full details" (adminRevealUser —
 * asks why, and logs it). Groups, expenses and balances are never shown.
 * `onChange` hands the updated row back to the list (null once deleted).
 */
export default function UserDetail({ user, onClose, onChange }: {
  user: UserRow;
  onClose: () => void;
  onChange: (u: UserRow | null) => void;
}) {
  const [acting, setActing] = useState<"" | "block" | "unblock" | "delete" | "logout" | "reveal">("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [composing, setComposing] = useState(false);
  const [details, setDetails] = useState<Revealed | null>(null);
  const [tags, setTags] = useState<string[]>(user.tags);
  const [note, setNote] = useState(user.note);
  const [tagInput, setTagInput] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const { isSuper, canSupport } = useRole();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isSelf = user.id === auth.currentUser?.uid;
  const canAct = canSupport && !isSelf && !user.isAdmin;
  const who = `${displayName(user)} (${user.phone})`;
  const notesDirty = note !== user.note || tags.join("|") !== user.tags.join("|");

  const copy = (text: string, what: string) =>
    navigator.clipboard.writeText(text).then(() => setNotice(`${what} copied.`)).catch(() => {});

  const reveal = async () => {
    const reason = window.prompt("Why do you need this person's full details? (kept in the Activity Log)\n\ne.g. Support call about login");
    if (reason === null) return;
    if (!reason.trim()) {
      setError("Give a reason to view full details.");
      return;
    }
    setActing("reveal");
    setError("");
    try {
      const { data } = await revealUser({ uid: user.id, reason: reason.trim() });
      setDetails(data);
    } catch (err) {
      setError((err as Error).message || "Could not load details.");
    } finally {
      setActing("");
    }
  };

  const addTag = (t: string) => {
    const clean = t.trim().slice(0, 24);
    if (clean && !tags.includes(clean)) setTags([...tags, clean]);
    setTagInput("");
  };

  const saveNotes = async () => {
    setSavingNotes(true);
    setError("");
    try {
      await setDoc(doc(db, "adminNotes", user.id), { tags, note: note.trim(), updatedBy: auth.currentUser?.uid, updatedAt: serverTimestamp() });
      onChange({ ...user, tags, note: note.trim() });
      setNotice("Notes saved.");
    } catch (err) {
      setError((err as Error).message || "Could not save notes.");
    } finally {
      setSavingNotes(false);
    }
  };

  const changeStatus = async (blocked: boolean) => {
    let reason = "";
    if (blocked) {
      const answer = window.prompt(`Block ${who}? They will be signed out and can't log in until re-activated.\n\nReason (kept in the Activity Log, optional):`);
      if (answer === null) return;
      reason = answer;
    } else if (!window.confirm(`Re-activate ${who}? They'll be able to log in again.`)) {
      return;
    }
    setActing(blocked ? "block" : "unblock");
    setError("");
    setNotice("");
    try {
      await setUserStatus({ uid: user.id, blocked, reason });
      onChange({ ...user, blocked });
      setNotice(blocked ? "Account blocked. Any open session ends within the hour; logging in is refused." : "Account re-activated.");
    } catch (err) {
      setError((err as Error).message || "Could not change the account status.");
    } finally {
      setActing("");
    }
  };

  const signOutEverywhere = async () => {
    if (!window.confirm(`Sign ${who} out of every device? Their current session ends within the hour and they'll need a new OTP to log in.`)) return;
    setActing("logout");
    setError("");
    try {
      await forceLogout({ uid: user.id });
      setNotice("Signed out from all devices — takes effect within the hour.");
    } catch (err) {
      setError((err as Error).message || "Could not sign them out.");
    } finally {
      setActing("");
    }
  };

  const removeAccount = async () => {
    const typed = window.prompt(
      `Permanently delete ${who}?\n\nThis removes their login, profile, friend links and photo. Shared expenses stay for other members. This can't be undone.\n\nType DELETE to confirm:`
    );
    if (typed === null) return;
    if (typed.trim() !== "DELETE") {
      setError("Confirmation didn't match — nothing was deleted.");
      return;
    }
    setActing("delete");
    setError("");
    try {
      await deleteUser({ uid: user.id });
      onChange(null);
    } catch (err) {
      setError((err as Error).message || "Could not delete the account.");
      setActing("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40" onClick={onClose}>
      <div className="h-full w-full max-w-lg overflow-y-auto bg-slate-50 p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-lg font-bold text-ink">Account</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-soft hover:bg-slate-200" aria-label="Close"><X size={18} /></button>
        </div>

        {error && <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</p>}
        {notice && <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{notice}</p>}

        <div className="rounded-2xl bg-white p-6 text-center shadow-soft">
          {details?.avatarUrl
            ? <img src={details.avatarUrl} alt="" className="mx-auto h-20 w-20 rounded-full object-cover" />
            : <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-splitpe-50 font-heading text-2xl font-bold text-splitpe-700">{user.initials}</div>}
          <p className="mt-3 flex items-center justify-center gap-1.5 font-heading text-xl font-bold text-ink">
            {details ? details.name || "No name" : displayName(user)} {user.isAdmin && <BadgeCheck size={18} className="text-splitpe-600" aria-label="Admin" />}
          </p>
          {details?.nickname && <p className="text-sm text-ink-soft">Shown to friends as “{details.nickname}”</p>}
          <div className="mt-1 flex items-center justify-center gap-2 text-sm text-ink-soft">
            {details ? (
              <>
                +91 {details.phone}
                <button onClick={() => copy(`+91${details.phone}`, "Number")} className="hover:text-ink" aria-label="Copy number"><Copy size={14} /></button>
                <a href={`tel:+91${details.phone}`} className="hover:text-ink" aria-label="Call"><Phone size={14} /></a>
              </>
            ) : (
              <span className="font-mono text-xs">{user.phone}</span>
            )}
          </div>
          <span className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${user.blocked ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
            {user.blocked ? <Ban size={12} /> : <CheckCircle2 size={12} />} {user.blocked ? "Blocked" : "Active"}
          </span>
          <div className="mt-4">
            {details ? (
              <button onClick={() => setDetails(null)} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-medium text-ink-soft hover:bg-slate-50">
                <EyeOff size={14} /> Hide details
              </button>
            ) : (
              <button onClick={reveal} disabled={acting === "reveal"} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-medium text-ink hover:bg-slate-50 disabled:opacity-50">
                {acting === "reveal" ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />} Show full details
              </button>
            )}
            <p className="mt-2 flex items-center justify-center gap-1 text-xs text-ink-soft">
              <ShieldAlert size={12} /> {details ? "Viewing is recorded in the Activity Log." : "Masked for privacy. Viewing asks for a reason and is logged."}
            </p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-white p-6 shadow-soft">
          <Row label="Joined">{fmtDate(user.createdAt)}</Row>
          <Row label="Last active in the app">{user.lastSeen ? <>{ago(user.lastSeen)}<br /><span className="text-xs font-normal text-ink-soft">{fmtDate(user.lastSeen)}</span></> : "Never"}</Row>
          <Row label="Push notifications">{user.hasPush ? "Device registered" : "No device"}</Row>
          <Row label="App version">{user.appVersion || "Before 1.1.0"}</Row>
          {details && (
            <>
              <Row label="Last OTP login">{fmtDate(details.lastSignIn)}</Row>
              <Row label="Default currency">{details.defaultCurrency}</Row>
              <Row label="Notification toggles on">{details.notificationsTotal ? `${details.notificationsOn} of ${details.notificationsTotal}` : "—"}</Row>
              {user.blocked && <Row label="Blocked">{details.blockedAt ? fmtDate(details.blockedAt) : "Yes"}{details.blockedReason ? ` — ${details.blockedReason}` : ""}</Row>}
            </>
          )}
          <Row label="Account ID">
            <button onClick={() => copy(user.id, "Account ID")} className="inline-flex items-center gap-1 text-xs text-ink-soft hover:text-ink">
              <code>{user.id}</code> <Copy size={12} />
            </button>
          </Row>
        </div>

        <div className="mt-4 rounded-2xl bg-white p-6 shadow-soft">
          <h3 className="flex items-center gap-2 font-heading text-lg font-bold text-ink"><Tag size={17} /> Team notes</h3>
          <p className="mb-3 text-sm text-ink-soft">Only the admin team sees these — never the user.</p>
          <div className="mb-2 flex flex-wrap gap-1.5">
            {tags.map((t) => (
              <span key={t} className="flex items-center gap-1 rounded-full bg-splitpe-50 px-2.5 py-1 text-xs font-semibold text-splitpe-700">
                {t}
                {canSupport && <button onClick={() => setTags(tags.filter((x) => x !== t))} aria-label={`Remove ${t}`} className="hover:text-red-600"><X size={12} /></button>}
              </span>
            ))}
            {!tags.length && !canSupport && <span className="text-sm text-ink-soft">No tags.</span>}
          </div>
          {canSupport && (
            <>
              <div className="mb-3 flex flex-wrap gap-1.5">
                {TAG_PRESETS.filter((t) => !tags.includes(t)).map((t) => (
                  <button key={t} onClick={() => addTag(t)} className="rounded-full border border-dashed border-slate-300 px-2.5 py-1 text-xs text-ink-soft hover:border-splitpe-600 hover:text-splitpe-700">+ {t}</button>
                ))}
                <form onSubmit={(e) => { e.preventDefault(); addTag(tagInput); }} className="flex">
                  <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Custom tag" maxLength={24} className="w-28 rounded-full border border-slate-200 px-2.5 py-1 text-xs outline-none focus:border-splitpe-600" />
                </form>
              </div>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={1000} placeholder="e.g. Called on 12 Oct about a login issue — fixed." className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-splitpe-600" />
              <button onClick={saveNotes} disabled={!notesDirty || savingNotes} className="mt-2 flex items-center gap-2 rounded-xl bg-splitpe-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                {savingNotes ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save notes
              </button>
            </>
          )}
          {!canSupport && note && <p className="whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm text-ink">{note}</p>}
        </div>

        {isSuper && (
          <div className="mt-4 rounded-2xl bg-white p-6 shadow-soft">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="font-heading text-lg font-bold text-ink">Send notification</h3>
                <p className="text-sm text-ink-soft">{user.hasPush ? "Push + in-app Notifications." : "No device registered — in-app Notifications only."}</p>
              </div>
              {!composing && (
                <button onClick={() => setComposing(true)} disabled={user.blocked} className="flex shrink-0 items-center gap-2 rounded-xl bg-splitpe-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                  <Bell size={15} /> Write
                </button>
              )}
            </div>
            {composing && (
              <div className="mt-4">
                <NotifyComposer compact target={{ audience: "uids", uids: [user.id] }} label={displayName(user)} />
              </div>
            )}
          </div>
        )}

        <div className="mt-4 rounded-2xl border border-red-100 bg-white p-6 shadow-soft">
          <h3 className="font-heading text-lg font-bold text-ink">Account actions</h3>
          {canAct ? (
            <>
              <p className="mb-4 text-sm text-ink-soft">Every action is recorded in the Activity Log.</p>
              <div className="flex flex-wrap gap-2">
                {user.blocked ? (
                  <button onClick={() => changeStatus(false)} disabled={!!acting} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white disabled:opacity-50">
                    {acting === "unblock" ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />} Activate account
                  </button>
                ) : (
                  <button onClick={() => changeStatus(true)} disabled={!!acting} className="flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 font-semibold text-white disabled:opacity-50">
                    {acting === "block" ? <Loader2 size={16} className="animate-spin" /> : <Ban size={16} />} Block account
                  </button>
                )}
                <button onClick={signOutEverywhere} disabled={!!acting} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 font-semibold text-ink hover:bg-slate-50 disabled:opacity-50">
                  {acting === "logout" ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />} Sign out everywhere
                </button>
                {isSuper && (
                  <button onClick={removeAccount} disabled={!!acting} className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">
                    {acting === "delete" ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} Delete account
                  </button>
                )}
              </div>
            </>
          ) : (
            <p className="text-sm text-ink-soft">
              {!canSupport ? "Your role is read-only." : isSelf ? "This is your own account — actions are disabled." : "This is an admin account. Remove their admin rights on the Team tab first."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
