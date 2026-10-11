import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

// Admin-only Cloud Functions (SplitPe repo, functions/index.js). The account
// actions refuse to act on the caller's own account or on another admin.
export const setUserStatus = httpsCallable<{ uid: string; blocked: boolean; reason?: string }, { blocked: boolean }>(functions, "adminSetUserStatus");
export const deleteUser = httpsCallable<{ uid: string }, { deleted: boolean }>(functions, "adminDeleteUser");
export const userActivity = httpsCallable<void, { activity: Record<string, { signIn: number | null; refresh: number | null }> }>(functions, "adminUserActivity");
export const forceLogout = httpsCallable<{ uid: string }, { done: boolean }>(functions, "adminForceLogout");
export type NotifyAudience = { audience: "all" } | { audience: "uids"; uids: string[] };
export const sendNotification = httpsCallable<{ title: string; body: string } & NotifyAudience, { recipients: number; pushed: number; pushFailed: number }>(
  functions,
  "adminSendNotification"
);

/**
 * An account as the panel sees it — masked by the server (adminListUsers):
 * name like "R**** S*****", number like "••••••3210", no photo, and never
 * any group, expense or balance. Full details: revealUser, one at a time.
 */
export type UserRow = {
  id: string;
  name: string;
  phone: string;
  initials: string;
  createdAt: number | null;
  lastSeen: number | null;
  blocked: boolean;
  isAdmin: boolean;
  hasPush: boolean;
  /** adminNotes/{uid} — visible to the admin team only. */
  tags: string[];
  note: string;
};
export const listUsers = httpsCallable<{ term?: string; uids?: string[] }, { users: UserRow[] }>(functions, "adminListUsers");

/** Contact details from adminRevealUser — each reveal is logged with its reason. */
export type Revealed = {
  name: string;
  nickname: string;
  phone: string;
  avatarUrl: string | null;
  defaultCurrency: string;
  notificationsOn: number;
  notificationsTotal: number;
  lastSignIn: number | null;
  blockedReason: string | null;
  blockedAt: number | null;
};
export const revealUser = httpsCallable<{ uid: string; reason?: string }, Revealed>(functions, "adminRevealUser");

/** Suggested tags for adminNotes — any other text works too. */
export const TAG_PRESETS = ["VIP", "Complaint", "Beta tester", "Partner", "Watchlist", "Influencer"];

export const fmtDate = (ms?: number | null) =>
  ms ? new Date(ms).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "numeric", minute: "2-digit" }) : "—";

export const fmtDay = (ms?: number | null) =>
  ms ? new Date(ms).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";

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

export const displayName = (u: UserRow) => u.name || "No name";

/** Downloads the given rows as a CSV — masked, exactly as the list shows them. */
export const exportCsv = (rows: UserRow[]) => {
  const cell = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const iso = (ms: number | null) => (ms ? new Date(ms).toISOString() : "");
  const lines = [
    ["Name (masked)", "Phone (masked)", "Status", "Admin", "Joined", "Last active", "Push", "Tags", "Account ID"].map(cell).join(","),
    ...rows.map((u) =>
      [u.name, u.phone, u.blocked ? "Blocked" : "Active", u.isAdmin ? "Yes" : "No", iso(u.createdAt), iso(u.lastSeen), u.hasPush ? "Yes" : "No", u.tags.join("; "), u.id]
        .map(cell)
        .join(",")
    ),
  ];
  const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `splitpe-users-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
