import type { Timestamp } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

// Admin-only Cloud Functions (SplitPe repo, functions/index.js). Both refuse
// to act on the caller's own account or on another admin.
export const setUserStatus = httpsCallable<{ uid: string; blocked: boolean; reason?: string }, { blocked: boolean }>(functions, "adminSetUserStatus");
export const deleteUser = httpsCallable<{ uid: string }, { deleted: boolean }>(functions, "adminDeleteUser");
export const userActivity = httpsCallable<void, { activity: Record<string, { signIn: number | null; refresh: number | null }> }>(functions, "adminUserActivity");
export type NotifyAudience = { audience: "all" } | { audience: "uids"; uids: string[] };
export const sendNotification = httpsCallable<{ title: string; body: string } & NotifyAudience, { recipients: number; pushed: number; pushFailed: number }>(
  functions,
  "adminSendNotification"
);

export type Profile = {
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
  blocked?: boolean;
  blockedAt?: Timestamp | null;
  blockedReason?: string | null;
  /** Merged in from Firebase Auth (adminUserActivity), in ms. */
  lastSignIn?: number | null;
  /**
   * Latest sign of use: the app's hourly token refresh, the last OTP login or
   * lastActiveAt — whichever is newest. Store builds before Oct 2026 never
   * write lastActiveAt, so Auth's times are what most accounts have.
   */
  lastSeen?: number | null;
};

export const fmtDate = (t?: Timestamp | null) =>
  t ? t.toDate().toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : "—";

export const fmtDay = (t?: Timestamp | null) =>
  t ? t.toDate().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

export const fmtMs = (ms?: number | null) =>
  ms ? new Date(ms).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : "—";

export const ago = (ms?: number | null) => {
  if (!ms) return "Never";
  const mins = Math.round((Date.now() - ms) / 60000);
  if (mins < 2) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} h ago`;
  const days = Math.round(hrs / 24);
  if (days < 60) return `${days} days ago`;
  return `${Math.round(days / 30)} months ago`;
};

export const displayName = (p: Profile) => p.name || p.nickname || "No name";

export const initials = (p: Profile) =>
  (p.nickname || p.name || "?").split(/\s+/).filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "?";

/** Downloads the given profiles as a CSV (basics only — no expenses or amounts). */
export const exportCsv = (rows: Profile[]) => {
  const cell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const iso = (t?: Timestamp | null) => (t ? t.toDate().toISOString() : "");
  const lines = [
    ["Name", "Nickname", "Phone", "Status", "Admin", "Joined", "Last active", "Currency", "Account ID"].map(cell).join(","),
    ...rows.map((p) =>
      [p.name, p.nickname, p.phone ? `+91 ${p.phone}` : "", p.blocked ? "Blocked" : "Active", p.isAdmin ? "Yes" : "No",
        iso(p.createdAt), p.lastSeen ? new Date(p.lastSeen).toISOString() : "", p.defaultCurrency || "INR", p.id].map(cell).join(",")
    ),
  ];
  const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `splitpe-users-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
