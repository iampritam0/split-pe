import { useEffect, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import type { Timestamp } from "firebase/firestore";
import { Construction, Image, Settings, UserCog } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { db } from "./firebase";
import type { LogKind } from "./adminLog";

type Entry = { id: string; kind: LogKind; action: string; detail: string; byPhone: string; at?: Timestamp };

const ICONS: Record<LogKind, { icon: LucideIcon; cls: string }> = {
  settings: { icon: Settings, cls: "bg-splitpe-50 text-splitpe-600" },
  banner: { icon: Image, cls: "bg-mint-50 text-mint-600" },
  maintenance: { icon: Construction, cls: "bg-amber-50 text-amber-600" },
  user: { icon: UserCog, cls: "bg-red-50 text-red-600" },
};

/** The last 50 admin-panel changes (adminLog), newest first, live. */
export default function ActivityTab() {
  const [entries, setEntries] = useState<Entry[] | null>(null);
  const [error, setError] = useState("");

  useEffect(
    () =>
      onSnapshot(
        query(collection(db, "adminLog"), orderBy("at", "desc"), limit(50)),
        (snap) => setEntries(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Entry, "id">) }))),
        (err) => setError(err.message)
      ),
    []
  );

  return (
    <div>
      <h2 className="mb-1 font-heading text-2xl font-bold text-ink">Activity Log</h2>
      <p className="mb-6 text-sm text-ink-soft">Every change made from this panel — who did it and when. Entries can't be edited or deleted.</p>
      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      {entries === null ? (
        <p className="text-ink-soft">Loading…</p>
      ) : entries.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center text-ink-soft shadow-soft">No changes yet. Saving settings or editing a banner will show up here.</div>
      ) : (
        <ol className="rounded-2xl bg-white p-2 shadow-soft">
          {entries.map((e) => {
            const { icon: Icon, cls } = ICONS[e.kind] || ICONS.settings;
            return (
              <li key={e.id} className="flex items-start gap-3 rounded-xl px-3 py-3 hover:bg-slate-50">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${cls}`}><Icon size={17} /></div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink">{e.action}</p>
                  {e.detail && <p className="truncate text-sm text-ink-soft">{e.detail}</p>}
                </div>
                <div className="shrink-0 text-right text-xs text-slate-400">
                  <p>{e.at ? e.at.toDate().toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" }) : "just now"}</p>
                  <p>{e.byPhone}</p>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
