import { useEffect, useMemo, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import type { Timestamp } from "firebase/firestore";
import { Megaphone } from "lucide-react";
import { db } from "./firebase";
import NotifyComposer from "./NotifyComposer";
import useUsers from "./useUsers";
import type { NotifyAudience, Profile } from "./users";

const DAY_MS = 24 * 60 * 60 * 1000;

type AudienceKey = "all" | "seen7d" | "inactive30d" | "new7d";
const AUDIENCES: { key: AudienceKey; label: string; hint: string; test: (p: Profile, now: number) => boolean }[] = [
  { key: "all", label: "All users", hint: "Everyone who isn't blocked", test: () => true },
  { key: "seen7d", label: "Active this week", hint: "Used the app in the last 7 days", test: (p, now) => !!p.lastSeen && now - p.lastSeen < 7 * DAY_MS },
  { key: "inactive30d", label: "Inactive 30d+", hint: "Haven't opened the app in a month — win them back", test: (p, now) => !p.lastSeen || now - p.lastSeen >= 30 * DAY_MS },
  { key: "new7d", label: "New this week", hint: "Signed up in the last 7 days", test: (p, now) => !!p.createdAt && now - p.createdAt.toMillis() < 7 * DAY_MS },
];

type Sent = { id: string; action: string; detail: string; byPhone: string; at?: Timestamp };

/**
 * Announcements to a segment of users (in-app feed + push), and the history
 * of what's been sent — read from adminLog, where adminSendNotification
 * records every send.
 */
export default function NotificationsTab() {
  const { users, now, error: loadError } = useUsers();
  const [audience, setAudience] = useState<AudienceKey>("all");
  const [history, setHistory] = useState<Sent[] | null>(null);

  useEffect(
    () =>
      onSnapshot(
        query(collection(db, "adminLog"), orderBy("at", "desc"), limit(200)),
        (snap) =>
          setHistory(
            snap.docs
              .filter((d) => d.data().kind === "notification")
              .map((d) => ({ id: d.id, ...(d.data() as Omit<Sent, "id">) }))
          ),
        () => setHistory([])
      ),
    []
  );

  const segments = useMemo(() => {
    const out = {} as Record<AudienceKey, { list: Profile[]; withPush: number }>;
    for (const a of AUDIENCES) {
      const list = (users || []).filter((p) => !p.blocked && a.test(p, now));
      out[a.key] = { list, withPush: list.filter((p) => p.expoPushToken).length };
    }
    return out;
  }, [users, now]);

  const current = segments[audience];
  const target: NotifyAudience | null = !users || !current.list.length
    ? null
    : audience === "all" ? { audience: "all" } : { audience: "uids", uids: current.list.map((p) => p.id) };
  const count = current.list.length;

  return (
    <div>
      <h2 className="mb-1 font-heading text-2xl font-bold text-ink">Notifications</h2>
      <p className="mb-6 text-sm text-ink-soft">Send an announcement to SplitPe users. It lands in their in-app Notifications and as a push on phones with notifications allowed.</p>
      {loadError && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{loadError}</p>}

      <div className="mb-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {AUDIENCES.map(({ key, label, hint }) => (
          <button
            key={key}
            onClick={() => setAudience(key)}
            className={`rounded-2xl border-2 bg-white p-4 text-left shadow-soft ${audience === key ? "border-splitpe-600" : "border-transparent hover:border-slate-200"}`}
          >
            <p className="font-medium text-ink">{label}</p>
            <p className="font-heading text-2xl font-bold text-ink">{users ? segments[key].list.length.toLocaleString("en-IN") : "…"}</p>
            <p className="text-xs text-ink-soft">{hint}</p>
            {users && <p className="mt-1 text-xs text-splitpe-700">{segments[key].withPush} with push on</p>}
          </button>
        ))}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-soft">
        <NotifyComposer target={target} label={`${count.toLocaleString("en-IN")} user${count === 1 ? "" : "s"}`} />
      </div>

      <h3 className="mb-3 mt-8 font-heading text-lg font-bold text-ink">Sent</h3>
      {history === null ? (
        <p className="text-ink-soft">Loading…</p>
      ) : history.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center text-ink-soft shadow-soft">Nothing sent yet.</div>
      ) : (
        <ol className="rounded-2xl bg-white p-2 shadow-soft">
          {history.map((h) => (
            <li key={h.id} className="flex items-start gap-3 rounded-xl px-3 py-3 hover:bg-slate-50">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600"><Megaphone size={17} /></div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-ink">{h.action}</p>
                {h.detail && <p className="text-sm text-ink-soft">{h.detail}</p>}
              </div>
              <div className="shrink-0 text-right text-xs text-slate-400">
                <p>{h.at ? h.at.toDate().toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "just now"}</p>
                <p>{h.byPhone}</p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
