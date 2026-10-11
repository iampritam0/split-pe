import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { collection, doc, getCountFromServer, getDocs, query, serverTimestamp, setDoc, where } from "firebase/firestore";
import type { Timestamp } from "firebase/firestore";
import { Ban, BadgeCheck, Bell, CheckCircle2, Copy, Loader2, LogOut, Phone, Save, Tag, Trash2, X } from "lucide-react";
import { auth, db } from "./firebase";
import NotifyComposer from "./NotifyComposer";
import { useRole } from "./role";
import { TAG_PRESETS, ago, deleteUser, displayName, fmtDate, fmtMs, forceLogout, initials, setUserStatus } from "./users";
import type { Profile } from "./users";

type Activity = { groups: number; expenses: number; settlements: number };
type GroupRow = { id: string; name?: string; emoji?: string; memberIds?: string[]; createdBy?: string; createdAt?: Timestamp; deletedAt?: Timestamp | null };

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2.5 last:border-0">
    <span className="text-sm text-ink-soft">{label}</span>
    <span className="text-right text-sm font-medium text-ink">{children}</span>
  </div>
);

/**
 * One account, opened from the Users list: basics plus how much they use the
 * app (counts only — never an expense, amount or balance), and the account
 * actions. `onChange` hands the updated profile back to the list (null once
 * deleted).
 */
export default function UserDetail({ profile, onClose, onChange }: {
  profile: Profile;
  onClose: () => void;
  onChange: (p: Profile | null) => void;
}) {
  const [activity, setActivity] = useState<Activity | null>(null);
  const [acting, setActing] = useState<"" | "block" | "unblock" | "delete" | "logout">("");
  const [groups, setGroups] = useState<GroupRow[] | null>(null);
  const [tags, setTags] = useState<string[]>(profile.tags || []);
  const [note, setNote] = useState(profile.note || "");
  const [tagInput, setTagInput] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  const { isSuper, canSupport } = useRole();
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [composing, setComposing] = useState(false);

  useEffect(() => {
    const n = async (col: string, field: string) =>
      (await getCountFromServer(query(collection(db, col), where(field, "array-contains", profile.id)))).data().count;
    Promise.all([n("groups", "memberIds"), n("expenses", "memberIds"), n("settlements", "participantIds")])
      .then(([groups, expenses, settlements]) => setActivity({ groups, expenses, settlements }))
      .catch(() => setActivity(null));
    // Which groups they're in — names and sizes only, never contents.
    getDocs(query(collection(db, "groups"), where("memberIds", "array-contains", profile.id)))
      .then((snap) => setGroups(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<GroupRow, "id">) }))
        .sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0))))
      .catch(() => setGroups([]));
  }, [profile.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isSelf = profile.id === auth.currentUser?.uid;
  const canAct = canSupport && !isSelf && !profile.isAdmin;
  const notesDirty = note !== (profile.note || "") || tags.join("|") !== (profile.tags || []).join("|");

  const addTag = (t: string) => {
    const clean = t.trim().slice(0, 24);
    if (clean && !tags.includes(clean)) setTags([...tags, clean]);
    setTagInput("");
  };

  const saveNotes = async () => {
    setSavingNotes(true);
    setError("");
    try {
      await setDoc(doc(db, "adminNotes", profile.id), { tags, note: note.trim(), updatedBy: auth.currentUser?.uid, updatedAt: serverTimestamp() });
      onChange({ ...profile, tags, note: note.trim() });
      setNotice("Notes saved.");
    } catch (err) {
      setError((err as Error).message || "Could not save notes.");
    } finally {
      setSavingNotes(false);
    }
  };

  const signOutEverywhere = async () => {
    if (!window.confirm(`Sign ${who} out of every device? Their current session ends within the hour and they'll need a new OTP to log in.`)) return;
    setActing("logout");
    setError("");
    try {
      await forceLogout({ uid: profile.id });
      setNotice("Signed out from all devices — takes effect within the hour.");
    } catch (err) {
      setError((err as Error).message || "Could not sign them out.");
    } finally {
      setActing("");
    }
  };
  const who = `${displayName(profile)} (+91 ${profile.phone})`;

  const copy = (text: string, what: string) =>
    navigator.clipboard.writeText(text).then(() => setNotice(`${what} copied.`)).catch(() => {});

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
      await setUserStatus({ uid: profile.id, blocked, reason });
      onChange({ ...profile, blocked, blockedReason: blocked ? reason || null : null, blockedAt: null });
      setNotice(blocked ? "Account blocked. Any open session ends within the hour; logging in is refused." : "Account re-activated.");
    } catch (err) {
      setError((err as Error).message || "Could not change the account status.");
    } finally {
      setActing("");
    }
  };

  const removeAccount = async () => {
    const typed = window.prompt(
      `Permanently delete ${who}?\n\nThis removes their login, profile, friend links and photo. Shared expenses stay for other members. This can't be undone.\n\nType the 10-digit number to confirm:`
    );
    if (typed === null) return;
    if (typed.replace(/\D/g, "").slice(-10) !== profile.phone) {
      setError("Number didn't match — nothing was deleted.");
      return;
    }
    setActing("delete");
    setError("");
    try {
      await deleteUser({ uid: profile.id });
      onChange(null);
    } catch (err) {
      setError((err as Error).message || "Could not delete the account.");
      setActing("");
    }
  };

  const notifOn = profile.notificationSettings ? Object.values(profile.notificationSettings).filter(Boolean).length : null;
  const notifTotal = profile.notificationSettings ? Object.keys(profile.notificationSettings).length : null;

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
          {profile.avatarUrl
            ? <img src={profile.avatarUrl} alt="" className="mx-auto h-20 w-20 rounded-full object-cover" />
            : <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-splitpe-50 font-heading text-2xl font-bold text-splitpe-700">{initials(profile)}</div>}
          <p className="mt-3 flex items-center justify-center gap-1.5 font-heading text-xl font-bold text-ink">
            {displayName(profile)} {profile.isAdmin && <BadgeCheck size={18} className="text-splitpe-600" aria-label="Admin" />}
          </p>
          {profile.nickname && profile.name && <p className="text-sm text-ink-soft">Shown to friends as “{profile.nickname}”</p>}
          <div className="mt-1 flex items-center justify-center gap-2 text-sm text-ink-soft">
            +91 {profile.phone}
            <button onClick={() => copy(`+91${profile.phone}`, "Number")} className="hover:text-ink" aria-label="Copy number"><Copy size={14} /></button>
            <a href={`tel:+91${profile.phone}`} className="hover:text-ink" aria-label="Call"><Phone size={14} /></a>
          </div>
          <span className={`mt-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${profile.blocked ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
            {profile.blocked ? <Ban size={12} /> : <CheckCircle2 size={12} />} {profile.blocked ? "Blocked" : "Active"}
          </span>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {([["Groups", activity?.groups], ["Expenses", activity?.expenses], ["Settle-ups", activity?.settlements]] as const).map(([label, value]) => (
              <div key={label} className="rounded-xl bg-slate-50 py-3">
                <p className="font-heading text-xl font-bold text-ink">{value ?? "…"}</p>
                <p className="text-xs text-ink-soft">{label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-white p-6 shadow-soft">
          <Row label="Joined">{fmtDate(profile.createdAt)}</Row>
          <Row label="Last active in the app">{profile.lastSeen ? <>{ago(profile.lastSeen)}<br /><span className="text-xs font-normal text-ink-soft">{fmtMs(profile.lastSeen)}</span></> : "Never"}</Row>
          <Row label="Last OTP login">{fmtMs(profile.lastSignIn)}</Row>
          <Row label="Default currency">{profile.defaultCurrency || "INR"}</Row>
          <Row label="Push notifications">{profile.expoPushToken ? "Device registered" : "No device token"}</Row>
          <Row label="Notification toggles on">{notifOn === null ? "—" : `${notifOn} of ${notifTotal}`}</Row>
          <Row label="Personal groups">{profile.personalGroups?.length ?? 0}</Row>
          <Row label="Custom categories">{profile.customCategories?.length ?? 0}</Row>
          <Row label="Account ID">
            <button onClick={() => copy(profile.id, "Account ID")} className="inline-flex items-center gap-1 text-xs text-ink-soft hover:text-ink">
              <code>{profile.id}</code> <Copy size={12} />
            </button>
          </Row>
          {profile.blocked && (
            <Row label="Blocked">{profile.blockedAt ? fmtDate(profile.blockedAt) : "Yes"}{profile.blockedReason ? ` — ${profile.blockedReason}` : ""}</Row>
          )}
        </div>

        <div className="mt-4 rounded-2xl bg-white p-6 shadow-soft">
          <h3 className="mb-3 font-heading text-lg font-bold text-ink">Groups <span className="text-sm font-normal text-ink-soft">{groups ? groups.length : ""}</span></h3>
          {groups === null ? <p className="text-sm text-ink-soft">Loading…</p> : groups.length === 0 ? (
            <p className="text-sm text-ink-soft">Not in any group.</p>
          ) : (
            <ul className="space-y-1.5">
              {groups.map((g) => (
                <li key={g.id} className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2">
                  <span className="text-lg">{g.emoji || "👥"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-ink">{g.name || "Untitled group"}</p>
                    <p className="text-xs text-ink-soft">{g.memberIds?.length ?? 0} members{g.createdBy === profile.id ? " · created by them" : ""}</p>
                  </div>
                  {g.deletedAt && <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">Deleted</span>}
                </li>
              ))}
            </ul>
          )}
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
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} maxLength={1000} placeholder="e.g. Called on 12 Oct about a wrong balance — fixed." className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-splitpe-600" />
              <button onClick={saveNotes} disabled={!notesDirty || savingNotes} className="mt-2 flex items-center gap-2 rounded-xl bg-splitpe-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                {savingNotes ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Save notes
              </button>
            </>
          )}
          {!canSupport && note && <p className="whitespace-pre-wrap rounded-xl bg-slate-50 p-3 text-sm text-ink">{note}</p>}
        </div>

        {isSuper && <div className="mt-4 rounded-2xl bg-white p-6 shadow-soft">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="font-heading text-lg font-bold text-ink">Send notification</h3>
              <p className="text-sm text-ink-soft">{profile.expoPushToken ? "Push + in-app Notifications." : "No device registered — in-app Notifications only."}</p>
            </div>
            {!composing && (
              <button onClick={() => setComposing(true)} disabled={!!profile.blocked} className="flex shrink-0 items-center gap-2 rounded-xl bg-splitpe-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
                <Bell size={15} /> Write
              </button>
            )}
          </div>
          {composing && (
            <div className="mt-4">
              <NotifyComposer compact target={{ audience: "uids", uids: [profile.id] }} label={displayName(profile)} />
            </div>
          )}
        </div>}

        <div className="mt-4 rounded-2xl border border-red-100 bg-white p-6 shadow-soft">
          <h3 className="font-heading text-lg font-bold text-ink">Account actions</h3>
          {canAct ? (
            <>
              <p className="mb-4 text-sm text-ink-soft">Every action is recorded in the Activity Log.</p>
              <div className="flex flex-wrap gap-2">
                {profile.blocked ? (
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
