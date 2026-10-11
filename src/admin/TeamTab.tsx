import { useEffect, useState } from "react";
import { httpsCallable } from "firebase/functions";
import { Loader2, ShieldCheck, UserPlus } from "lucide-react";
import { auth, functions } from "./firebase";
import { ROLE_INFO, useRole } from "./role";
import type { Role } from "./role";
import { ago } from "./users";

type Admin = { uid: string; phone: string; name?: string; role: Role; lastSeen: number | null };
const listAdmins = httpsCallable<void, { admins: Admin[] }>(functions, "adminListAdmins");
const setRole = httpsCallable<{ uid?: string; phone?: string; role: Role | null }, { role: Role | null }>(functions, "adminSetRole");

const ROLES = Object.keys(ROLE_INFO) as Role[];

/**
 * Who has admin access and with what role. Super admins add people by
 * mobile number (they need a SplitPe account), change roles and remove
 * access; every change goes through adminSetRole and the Activity Log.
 */
export default function TeamTab() {
  const [admins, setAdmins] = useState<Admin[] | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState("");
  const [phone, setPhone] = useState("");
  const [newRole, setNewRole] = useState<Role>("support");
  const { isSuper } = useRole();
  const me = auth.currentUser?.uid;

  const fetchAdmins = () =>
    listAdmins()
      .then(({ data }) => setAdmins(data.admins.sort((a, b) => ROLES.indexOf(a.role) - ROLES.indexOf(b.role) || (a.name || "").localeCompare(b.name || ""))))
      .catch((err: Error) => setError(err.message || "Could not load the team."));

  useEffect(() => {
    fetchAdmins();
  }, []);

  const change = async (target: { uid?: string; phone?: string; label: string }, role: Role | null) => {
    const question = role
      ? `Give ${target.label} the ${ROLE_INFO[role].label} role?\n\n${ROLE_INFO[role].hint}`
      : `Remove admin access from ${target.label}?`;
    if (!window.confirm(question)) return;
    setBusy(target.uid || "new");
    setError("");
    setNotice("");
    try {
      await setRole({ uid: target.uid, phone: target.phone, role });
      setNotice(`${role ? `${target.label} is now ${ROLE_INFO[role].label}` : `Removed ${target.label}'s admin access`} — applies when they next reload the panel (within the hour at most).`);
      if (!target.uid) setPhone("");
      await fetchAdmins();
    } catch (err) {
      setError((err as Error).message || "Could not change the role.");
    } finally {
      setBusy("");
    }
  };

  const digits = phone.replace(/\D/g, "").slice(-10);

  return (
    <div>
      <h2 className="mb-1 font-heading text-2xl font-bold text-ink">Team</h2>
      <p className="mb-6 text-sm text-ink-soft">Who can open this panel, and what they can do.</p>
      {error && <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</p>}
      {notice && <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{notice}</p>}

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        {ROLES.map((r) => (
          <div key={r} className="rounded-2xl bg-white p-4 shadow-soft">
            <p className="flex items-center gap-1.5 font-semibold text-ink"><ShieldCheck size={16} className="text-splitpe-600" /> {ROLE_INFO[r].label}</p>
            <p className="mt-1 text-xs text-ink-soft">{ROLE_INFO[r].hint}</p>
          </div>
        ))}
      </div>

      {isSuper && (
        <form
          className="mb-6 rounded-2xl bg-white p-5 shadow-soft"
          onSubmit={(e) => { e.preventDefault(); if (digits.length === 10) change({ phone: digits, label: `+91 ${digits}` }, newRole); }}
        >
          <h3 className="mb-1 font-heading text-lg font-bold text-ink">Add a team member</h3>
          <p className="mb-3 text-sm text-ink-soft">They need a SplitPe account on this number. They log in here with the same OTP.</p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="flex flex-1 items-center rounded-xl border border-slate-200 bg-white focus-within:border-splitpe-600">
              <span className="pl-3 text-sm text-ink-soft">+91</span>
              <input className="w-full rounded-xl px-2 py-2.5 outline-none" inputMode="numeric" placeholder="10-digit mobile number" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            <select value={newRole} onChange={(e) => setNewRole(e.target.value as Role)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink outline-none">
              {ROLES.map((r) => <option key={r} value={r}>{ROLE_INFO[r].label}</option>)}
            </select>
            <button type="submit" disabled={digits.length !== 10 || !!busy} className="flex items-center justify-center gap-2 rounded-xl bg-splitpe-600 px-5 py-2.5 font-semibold text-white disabled:opacity-50">
              {busy === "new" ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />} Add
            </button>
          </div>
        </form>
      )}

      {admins === null ? (
        <p className="text-ink-soft">{error ? "" : "Loading…"}</p>
      ) : (
        <ul className="rounded-2xl bg-white p-2 shadow-soft">
          {admins.map((a) => {
            const label = `${a.name || "No name"} (+91 ${a.phone})`;
            const self = a.uid === me;
            return (
              <li key={a.uid} className="flex flex-wrap items-center gap-3 rounded-xl px-3 py-3 hover:bg-slate-50">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink">{a.name || "No name"} {self && <span className="text-xs font-normal text-ink-soft">(you)</span>}</p>
                  <p className="text-sm text-ink-soft">+91 {a.phone} · active {ago(a.lastSeen).toLowerCase()}</p>
                </div>
                {isSuper && !self ? (
                  <div className="flex w-full items-center gap-2 sm:w-auto">
                    {busy === a.uid && <Loader2 size={16} className="animate-spin text-splitpe-600" />}
                    <select
                      value={a.role}
                      disabled={!!busy}
                      onChange={(e) => change({ uid: a.uid, label }, e.target.value as Role)}
                      className="flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-ink outline-none sm:flex-none"
                      aria-label={`Role for ${label}`}
                    >
                      {ROLES.map((r) => <option key={r} value={r}>{ROLE_INFO[r].label}</option>)}
                    </select>
                    <button onClick={() => change({ uid: a.uid, label }, null)} disabled={!!busy} className="rounded-lg border border-red-200 px-2.5 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50">Remove</button>
                  </div>
                ) : (
                  <span className="rounded-full bg-splitpe-50 px-2.5 py-1 text-xs font-semibold text-splitpe-700">{ROLE_INFO[a.role].label}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
