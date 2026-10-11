import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

// Admin-only Cloud Functions (SplitPe repo, functions/index.js). The account
// actions refuse to act on the caller's own account or on another admin.
export const setUserStatus = httpsCallable<{ uid: string; blocked: boolean; reason?: string }, { blocked: boolean }>(functions, "adminSetUserStatus");
export const deleteUser = httpsCallable<{ uid: string }, { deleted: boolean }>(functions, "adminDeleteUser");
export const userActivity = httpsCallable<void, { activity: Record<string, { signIn: number | null; refresh: number | null }> }>(functions, "adminUserActivity");
export const forceLogout = httpsCallable<{ uid: string }, { done: boolean }>(functions, "adminForceLogout");
export type NotifyAudience = { audience: "all" } | { audience: "uids"; uids: string[] };
/** Expo push receipts — whether accepted pushes actually reached Google / Apple. */
export type Receipts = { delivered: number; failed: number; pending: number; errors: Record<string, number> };
export const sendNotification = httpsCallable<
  { title: string; body: string } & NotifyAudience,
  { recipients: number; pushed: number; pushFailed: number; receipts?: Receipts; sendErrors?: Record<string, number> }
>(
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
  /** Reported by app 1.1.0+ on open; empty for older builds. */
  appVersion: string;
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

// What each Expo push error means, and what to do about it.
const PUSH_ERRORS: Record<string, string> = {
  InvalidCredentials: "Android push key (FCM V1) isn't set up for this app on Expo, so no Android phone gets pushes. Fix: in the app folder run `eas credentials` → Android → production → Google Service Account Key for FCM V1 → upload the key from Firebase console (Project settings → Service accounts).",
  DeviceNotRegistered: "the app was uninstalled or reset on that phone — its push token has been removed.",
  MismatchSenderId: "the phone's push token belongs to a different Firebase project (usually an old test build).",
  MessageTooBig: "the message is too long.",
  MessageRateExceeded: "too many pushes to the same phone too quickly — try again later.",
};

/** One line on what happened to the pushes, in plain words. */
export const pushSummary = (pushed: number, receipts?: Receipts | null, sendErrors?: Record<string, number>) => {
  if (!pushed && !Object.keys(sendErrors || {}).length) return "No push sent (no registered device or notifications off) — it's in their in-app Notifications.";
  if (!receipts) return `${pushed} push${pushed === 1 ? "" : "es"} accepted by Expo.`;
  const parts = [`${receipts.delivered} delivered to phone${receipts.delivered === 1 ? "" : "s"}`];
  if (receipts.pending) parts.push(`${receipts.pending} still confirming`);
  if (receipts.failed) parts.push(`${receipts.failed} failed`);
  const errs = { ...(sendErrors || {}), ...receipts.errors };
  const why = Object.entries(errs).map(([code, n]) => `${n} × ${code}: ${PUSH_ERRORS[code] || "see Expo push error docs."}`);
  return `${parts.join(", ")}.${why.length ? ` ${why.join(" ")}` : ""}`;
};

/** Added on its own line under every notification the server sends (SplitPe repo: TAGLINE). */
export const TAGLINE = "SplitPe hisaab bhi dosti bhi";

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
