import { useEffect, useMemo, useState } from "react";
import { collection, getCountFromServer, getDocs, query, where } from "firebase/firestore";
import type { Timestamp } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { ChevronLeft, ChevronRight, Crown, Loader2, RefreshCw, RotateCcw, Search, X } from "lucide-react";
import { db, functions } from "./firebase";
import { useRole } from "./role";
import { fmtDate, fmtDay } from "./users";

const restoreGroup = httpsCallable<{ groupId: string }, { restored: boolean }>(functions, "adminRestoreGroup");

const DAY_MS = 24 * 60 * 60 * 1000;
const RECOVERY_DAYS = 15;
const PAGE_SIZE = 25;

type Group = {
  id: string;
  name?: string;
  emoji?: string;
  category?: string;
  memberIds?: string[];
  createdBy?: string;
  createdAt?: Timestamp;
  deletedAt?: Timestamp | null;
};
type Person = { name: string; phone: string };

type FilterKey = "all" | "active" | "restorable" | "expired";
const daysLeft = (g: Group, now: number) => (g.deletedAt ? Math.ceil(RECOVERY_DAYS - (now - g.deletedAt.toMillis()) / DAY_MS) : null);
const FILTERS: { key: FilterKey; label: string; test: (g: Group, now: number) => boolean }[] = [
  { key: "all", label: "All", test: () => true },
  { key: "active", label: "Active", test: (g) => !g.deletedAt },
  { key: "restorable", label: "Deleted · restorable", test: (g, now) => (daysLeft(g, now) ?? 0) > 0 },
  { key: "expired", label: "Deleted · past 15 days", test: (g, now) => !!g.deletedAt && (daysLeft(g, now) ?? 0) <= 0 },
];

type SortKey = "newest" | "members" | "name";
const SORTS: Record<SortKey, { label: string; cmp: (a: Group, b: Group) => number }> = {
  newest: { label: "Newest first", cmp: (a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0) },
  members: { label: "Most members", cmp: (a, b) => (b.memberIds?.length ?? 0) - (a.memberIds?.length ?? 0) },
  name: { label: "Name A–Z", cmp: (a, b) => (a.name || "").localeCompare(b.name || "", "en", { sensitivity: "base" }) },
};

/** One group: members, how much it's used (counts only) and restore. */
function GroupDetail({ group, people, now, onClose, onRestored }: {
  group: Group;
  people: Record<string, Person>;
  now: number;
  onClose: () => void;
  onRestored: () => void;
}) {
  const [counts, setCounts] = useState<{ expenses: number; settlements: number } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { canSupport } = useRole();
  const left = daysLeft(group, now);

  useEffect(() => {
    const n = async (col: string) => (await getCountFromServer(query(collection(db, col), where("groupId", "==", group.id)))).data().count;
    Promise.all([n("expenses"), n("settlements")])
      .then(([expenses, settlements]) => setCounts({ expenses, settlements }))
      .catch(() => setCounts(null));
  }, [group.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const restore = async () => {
    if (!window.confirm(`Restore “${group.name}”? It comes back for all ${group.memberIds?.length ?? 0} members with everything in it.`)) return;
    setBusy(true);
    setError("");
    try {
      await restoreGroup({ groupId: group.id });
      onRestored();
    } catch (err) {
      setError((err as Error).message || "Could not restore the group.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40" onClick={onClose}>
      <div className="h-full w-full max-w-lg overflow-y-auto bg-slate-50 p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-heading text-lg font-bold text-ink">Group</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-soft hover:bg-slate-200" aria-label="Close"><X size={18} /></button>
        </div>
        {error && <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</p>}

        <div className="rounded-2xl bg-white p-6 text-center shadow-soft">
          <div className="text-4xl">{group.emoji || "👥"}</div>
          <p className="mt-2 font-heading text-xl font-bold text-ink">{group.name || "Untitled group"}</p>
          {group.category && <p className="text-sm text-ink-soft">{group.category}</p>}
          {group.deletedAt ? (
            <span className="mt-2 inline-block rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
              Deleted {fmtDay(group.deletedAt)}{(left ?? 0) > 0 ? ` · ${left} day${left === 1 ? "" : "s"} left to restore` : " · can't be restored"}
            </span>
          ) : (
            <span className="mt-2 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">Active</span>
          )}
          <div className="mt-5 grid grid-cols-3 gap-2">
            {([["Members", group.memberIds?.length ?? 0], ["Expenses", counts?.expenses], ["Settle-ups", counts?.settlements]] as const).map(([label, value]) => (
              <div key={label} className="rounded-xl bg-slate-50 py-3">
                <p className="font-heading text-xl font-bold text-ink">{value ?? "…"}</p>
                <p className="text-xs text-ink-soft">{label}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-ink-soft">Created {fmtDate(group.createdAt)} · amounts are never shown here</p>
        </div>

        <div className="mt-4 rounded-2xl bg-white p-6 shadow-soft">
          <h3 className="mb-3 font-heading text-lg font-bold text-ink">Members</h3>
          <ul className="space-y-1.5">
            {(group.memberIds || []).map((id) => {
              const p = people[id];
              return (
                <li key={id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-sm">
                  <span className="flex min-w-0 items-center gap-1.5 font-medium text-ink">
                    <span className="truncate">{p?.name || (p ? "No name" : "Not on SplitPe (added by name)")}</span>
                    {id === group.createdBy && <Crown size={14} className="shrink-0 text-amber-500" aria-label="Creator" />}
                  </span>
                  <span className="shrink-0 text-ink-soft">{p?.phone ? `+91 ${p.phone}` : ""}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {canSupport && (left ?? 0) > 0 && (
          <div className="mt-4 rounded-2xl bg-white p-6 shadow-soft">
            <h3 className="font-heading text-lg font-bold text-ink">Restore</h3>
            <p className="mb-3 text-sm text-ink-soft">For when the creator deleted it by mistake. Recorded in the Activity Log.</p>
            <button onClick={restore} disabled={busy} className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 font-semibold text-white disabled:opacity-50">
              {busy ? <Loader2 size={16} className="animate-spin" /> : <RotateCcw size={16} />} Restore group
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Every group — name, size, creator, status — searchable by group name or
 * a member's name / number. Contents (expenses, amounts) are never read;
 * the detail panel shows counts only.
 */
export default function GroupsTab() {
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [people, setPeople] = useState<Record<string, Person>>({});
  const [now, setNow] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [term, setTerm] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [page, setPage] = useState(0);
  const [openId, setOpenId] = useState<string | null>(null);

  const fetchAll = () =>
    Promise.all([getDocs(collection(db, "groups")), getDocs(collection(db, "users"))])
      .then(([g, u]) => {
        setGroups(g.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Group, "id">) })));
        setPeople(Object.fromEntries(u.docs.map((d) => [d.id, { name: d.get("name") || "", phone: d.get("phone") || "" }])));
        setNow(Date.now());
      })
      .catch((err: Error) => setError(err.message || "Could not load groups."))
      .finally(() => setLoading(false));

  useEffect(() => {
    fetchAll();
  }, []);

  const reload = () => {
    setLoading(true);
    setError("");
    fetchAll();
  };

  const counts = useMemo(() => {
    const c = {} as Record<FilterKey, number>;
    for (const f of FILTERS) c[f.key] = groups?.filter((g) => f.test(g, now)).length ?? 0;
    return c;
  }, [groups, now]);

  const visible = useMemo(() => {
    if (!groups) return [];
    const words = term.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const test = FILTERS.find((f) => f.key === filter)!.test;
    return groups
      .filter((g) => test(g, now))
      .filter((g) => {
        if (!words.length) return true;
        const members = (g.memberIds || []).map((id) => `${people[id]?.name || ""} ${people[id]?.phone || ""}`).join(" ");
        const hay = `${g.name || ""} ${g.category || ""} ${g.id} ${members}`.toLowerCase();
        return words.every((w) => hay.includes(w));
      })
      .sort(SORTS[sort].cmp);
  }, [groups, people, now, term, filter, sort]);

  const pages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const pageRows = visible.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const open = groups?.find((g) => g.id === openId) || null;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="mb-1 font-heading text-2xl font-bold text-ink">Groups</h2>
          <p className="text-sm text-ink-soft">{groups ? `${groups.length.toLocaleString("en-IN")} groups.` : "Loading groups…"} Search by group name or a member's name or number. Amounts are never shown.</p>
        </div>
        <button onClick={reload} disabled={loading} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-ink hover:bg-slate-50 disabled:opacity-50">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      <div className="mb-3 flex flex-col gap-2 sm:flex-row">
        <div className="flex flex-1 items-center rounded-xl border border-slate-200 bg-white focus-within:border-splitpe-600">
          <Search size={16} className="ml-3 shrink-0 text-ink-soft" />
          <input className="w-full rounded-xl px-2 py-2.5 outline-none" placeholder="Search group or member" value={term} onChange={(e) => { setTerm(e.target.value); setPage(0); }} />
          {term && <button onClick={() => { setTerm(""); setPage(0); }} className="mr-2 p-1 text-ink-soft hover:text-ink" aria-label="Clear search"><X size={15} /></button>}
        </div>
        <select value={sort} onChange={(e) => { setSort(e.target.value as SortKey); setPage(0); }} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink outline-none">
          {(Object.keys(SORTS) as SortKey[]).map((k) => <option key={k} value={k}>{SORTS[k].label}</option>)}
        </select>
      </div>

      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
        {FILTERS.map(({ key, label }) => (
          <button key={key} onClick={() => { setFilter(key); setPage(0); }} className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium ${filter === key ? "bg-splitpe-600 text-white" : "bg-white text-ink-soft shadow-soft hover:text-ink"}`}>
            {label} <span className="opacity-70">{groups ? counts[key] : ""}</span>
          </button>
        ))}
      </div>

      {error && <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</p>}
      {notice && <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{notice}</p>}

      {groups === null ? (
        <div className="flex justify-center rounded-2xl bg-white py-16 shadow-soft">{loading ? <Loader2 className="animate-spin text-splitpe-600" /> : <p className="text-ink-soft">Couldn't load groups.</p>}</div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center text-ink-soft shadow-soft">{term ? `No group matches “${term}”.` : "No groups in this view."}</div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-ink-soft">
                <tr>
                  <th className="px-4 py-3">Group</th>
                  <th className="px-3 py-3">Members</th>
                  <th className="hidden px-3 py-3 md:table-cell">Created by</th>
                  <th className="hidden px-3 py-3 md:table-cell">Created</th>
                  <th className="px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((g) => {
                  const left = daysLeft(g, now);
                  return (
                    <tr key={g.id} onClick={() => setOpenId(g.id)} className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg">{g.emoji || "👥"}</span>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-ink">{g.name || "Untitled group"}</p>
                            {g.category && <p className="truncate text-xs text-ink-soft">{g.category}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-ink">{g.memberIds?.length ?? 0}</td>
                      <td className="hidden whitespace-nowrap px-3 py-3 text-ink-soft md:table-cell">{(g.createdBy && people[g.createdBy]?.name) || "—"}</td>
                      <td className="hidden whitespace-nowrap px-3 py-3 text-ink-soft md:table-cell">{fmtDay(g.createdAt)}</td>
                      <td className="px-3 py-3">
                        {g.deletedAt ? (
                          <span className="whitespace-nowrap rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700">{(left ?? 0) > 0 ? `Deleted · ${left}d left` : "Deleted"}</span>
                        ) : (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700">Active</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-ink-soft">
            <span>{page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, visible.length)} of {visible.length.toLocaleString("en-IN")}</span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((n) => n - 1)} disabled={page === 0} className="rounded-lg p-1.5 hover:bg-slate-100 disabled:opacity-40" aria-label="Previous page"><ChevronLeft size={16} /></button>
              <span className="px-1">Page {page + 1} / {pages}</span>
              <button onClick={() => setPage((n) => n + 1)} disabled={page >= pages - 1} className="rounded-lg p-1.5 hover:bg-slate-100 disabled:opacity-40" aria-label="Next page"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      )}

      {open && (
        <GroupDetail
          key={open.id}
          group={open}
          people={people}
          now={now}
          onClose={() => setOpenId(null)}
          onRestored={() => {
            setGroups((list) => list?.map((g) => (g.id === open.id ? { ...g, deletedAt: null } : g)) ?? list);
            setNotice(`“${open.name}” restored.`);
            setOpenId(null);
          }}
        />
      )}
    </div>
  );
}
