import { useState } from "react";
import type { ReactNode } from "react";
import { collection, getCountFromServer, getDocs, limit, query, where } from "firebase/firestore";
import type { Timestamp } from "firebase/firestore";
import { BadgeCheck, Loader2, Search } from "lucide-react";
import { db } from "./firebase";

type Profile = {
  id: string;
  name?: string;
  nickname?: string | null;
  phone?: string;
  avatarUrl?: string | null;
  createdAt?: Timestamp;
  lastActiveAt?: Timestamp;
  defaultCurrency?: string;
  isAdmin?: boolean;
  notificationSettings?: Record<string, boolean>;
  personalGroups?: unknown[];
  customCategories?: string[];
  expoPushToken?: string | null;
};
type Activity = { groups: number; expenses: number; settlements: number };

const fmtDate = (t?: Timestamp) =>
  t ? t.toDate().toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : "—";

const ago = (t?: Timestamp) => {
  if (!t) return "Not reported yet";
  const mins = Math.round((Date.now() - t.toMillis()) / 60000);
  if (mins < 2) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} h ago`;
  return `${Math.round(hrs / 24)} days ago`;
};

const Row = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex items-start justify-between gap-4 border-b border-slate-100 py-2.5 last:border-0">
    <span className="text-sm text-ink-soft">{label}</span>
    <span className="text-right text-sm font-medium text-ink">{children}</span>
  </div>
);

/**
 * Support lookup — find an account by its mobile number to help someone who
 * writes in. Shows only account basics and how much they use the app
 * (counts), never any expense, amount or balance.
 */
export default function UsersTab() {
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [activity, setActivity] = useState<Activity | null>(null);

  const digits = phone.replace(/\D/g, "").slice(-10);

  const search = async () => {
    setBusy(true);
    setError("");
    setProfile(null);
    setActivity(null);
    try {
      const snap = await getDocs(query(collection(db, "users"), where("phone", "==", digits), limit(1)));
      if (snap.empty) {
        setError(`No SplitPe account for +91 ${digits}.`);
        return;
      }
      const found = { id: snap.docs[0].id, ...(snap.docs[0].data() as Omit<Profile, "id">) };
      setProfile(found);
      const n = async (col: string, field: string) =>
        (await getCountFromServer(query(collection(db, col), where(field, "array-contains", found.id)))).data().count;
      const [groups, expenses, settlements] = await Promise.all([
        n("groups", "memberIds"),
        n("expenses", "memberIds"),
        n("settlements", "participantIds"),
      ]);
      setActivity({ groups, expenses, settlements });
    } catch (err) {
      setError((err as Error).message || "Lookup failed.");
    } finally {
      setBusy(false);
    }
  };

  const notifOn = profile?.notificationSettings ? Object.values(profile.notificationSettings).filter(Boolean).length : null;
  const notifTotal = profile?.notificationSettings ? Object.keys(profile.notificationSettings).length : null;
  const initials = (profile?.nickname || profile?.name || "?").split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div>
      <h2 className="mb-1 font-heading text-2xl font-bold text-ink">Users</h2>
      <p className="mb-6 text-sm text-ink-soft">Look up an account by mobile number to help with a support request. Expenses and amounts are never shown.</p>

      <form className="mb-6 flex gap-2" onSubmit={(e) => { e.preventDefault(); if (digits.length === 10) search(); }}>
        <div className="flex flex-1 items-center rounded-xl border border-slate-200 bg-white focus-within:border-splitpe-600">
          <span className="pl-3 text-sm text-ink-soft">+91</span>
          <input className="w-full rounded-xl px-2 py-2.5 outline-none" inputMode="numeric" placeholder="10-digit mobile number" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </div>
        <button type="submit" disabled={digits.length !== 10 || busy} className="flex items-center gap-2 rounded-xl bg-splitpe-600 px-5 font-semibold text-white disabled:opacity-50">
          {busy ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />} Find
        </button>
      </form>

      {error && <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</p>}

      {profile && (
        <div className="grid gap-4 md:grid-cols-[1fr_1.2fr]">
          <div className="rounded-2xl bg-white p-6 text-center shadow-soft">
            {profile.avatarUrl
              ? <img src={profile.avatarUrl} alt="" className="mx-auto h-20 w-20 rounded-full object-cover" />
              : <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-splitpe-50 font-heading text-2xl font-bold text-splitpe-700">{initials}</div>}
            <p className="mt-3 flex items-center justify-center gap-1.5 font-heading text-xl font-bold text-ink">
              {profile.name || "No name"} {profile.isAdmin && <BadgeCheck size={18} className="text-splitpe-600" aria-label="Admin" />}
            </p>
            {profile.nickname && <p className="text-sm text-ink-soft">Shown to friends as “{profile.nickname}”</p>}
            <p className="mt-1 text-sm text-ink-soft">+91 {profile.phone}</p>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {[
                ["Groups", activity?.groups],
                ["Expenses", activity?.expenses],
                ["Settle-ups", activity?.settlements],
              ].map(([label, value]) => (
                <div key={label as string} className="rounded-xl bg-slate-50 py-3">
                  <p className="font-heading text-xl font-bold text-ink">{value ?? "…"}</p>
                  <p className="text-xs text-ink-soft">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-soft">
            <Row label="Joined">{fmtDate(profile.createdAt)}</Row>
            <Row label="Last opened the app">{ago(profile.lastActiveAt)}</Row>
            <Row label="Default currency">{profile.defaultCurrency || "INR"}</Row>
            <Row label="Push notifications">{profile.expoPushToken ? "Device registered" : "No device token"}</Row>
            <Row label="Notification toggles on">{notifOn === null ? "—" : `${notifOn} of ${notifTotal}`}</Row>
            <Row label="Personal groups">{profile.personalGroups?.length ?? 0}</Row>
            <Row label="Custom categories">{profile.customCategories?.length ?? 0}</Row>
            <Row label="Account ID"><code className="text-xs text-ink-soft">{profile.id}</code></Row>
          </div>
        </div>
      )}
    </div>
  );
}
