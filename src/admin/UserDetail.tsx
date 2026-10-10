import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { collection, getCountFromServer, query, where } from "firebase/firestore";
import { Ban, BadgeCheck, CheckCircle2, Copy, Loader2, Phone, Trash2, X } from "lucide-react";
import { auth, db } from "./firebase";
import { ago, deleteUser, displayName, fmtDate, initials, setUserStatus } from "./users";
import type { Profile } from "./users";

type Activity = { groups: number; expenses: number; settlements: number };

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
  const [acting, setActing] = useState<"" | "block" | "unblock" | "delete">("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const n = async (col: string, field: string) =>
      (await getCountFromServer(query(collection(db, col), where(field, "array-contains", profile.id)))).data().count;
    Promise.all([n("groups", "memberIds"), n("expenses", "memberIds"), n("settlements", "participantIds")])
      .then(([groups, expenses, settlements]) => setActivity({ groups, expenses, settlements }))
      .catch(() => setActivity(null));
  }, [profile.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const isSelf = profile.id === auth.currentUser?.uid;
  const canAct = !isSelf && !profile.isAdmin;
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
          <Row label="Last opened the app">{ago(profile.lastActiveAt)}</Row>
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
                <button onClick={removeAccount} disabled={!!acting} className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-2.5 font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50">
                  {acting === "delete" ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />} Delete account
                </button>
              </div>
            </>
          ) : (
            <p className="text-sm text-ink-soft">{isSelf ? "This is your own account — actions are disabled." : "This is an admin account. Revoke admin rights first (setAdmin.js --revoke)."}</p>
          )}
        </div>
      </div>
    </div>
  );
}
