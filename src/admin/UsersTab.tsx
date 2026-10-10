import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { Ban, BadgeCheck, CheckCircle2, ChevronLeft, ChevronRight, Download, Loader2, RefreshCw, Search, Trash2, X } from "lucide-react";
import { auth, db } from "./firebase";
import UserDetail from "./UserDetail";
import { ago, deleteUser, displayName, exportCsv, fmtDay, initials, setUserStatus } from "./users";
import type { Profile } from "./users";

const DAY_MS = 24 * 60 * 60 * 1000;
const PAGE_SIZE = 25;

type FilterKey = "all" | "active" | "blocked" | "admins" | "new7d" | "seen7d" | "inactive30d";
const FILTERS: { key: FilterKey; label: string; test: (p: Profile, now: number) => boolean }[] = [
  { key: "all", label: "All", test: () => true },
  { key: "active", label: "Active", test: (p) => !p.blocked },
  { key: "blocked", label: "Blocked", test: (p) => !!p.blocked },
  { key: "admins", label: "Admins", test: (p) => !!p.isAdmin },
  { key: "new7d", label: "New this week", test: (p, now) => !!p.createdAt && now - p.createdAt.toMillis() < 7 * DAY_MS },
  { key: "seen7d", label: "Opened app (7d)", test: (p, now) => !!p.lastActiveAt && now - p.lastActiveAt.toMillis() < 7 * DAY_MS },
  { key: "inactive30d", label: "Inactive 30d+", test: (p, now) => !p.lastActiveAt || now - p.lastActiveAt.toMillis() >= 30 * DAY_MS },
];

type SortKey = "newest" | "oldest" | "name" | "recent";
const millis = (t?: { toMillis: () => number }) => t?.toMillis() ?? 0;
const SORTS: Record<SortKey, { label: string; cmp: (a: Profile, b: Profile) => number }> = {
  newest: { label: "Newest first", cmp: (a, b) => millis(b.createdAt) - millis(a.createdAt) },
  oldest: { label: "Oldest first", cmp: (a, b) => millis(a.createdAt) - millis(b.createdAt) },
  name: { label: "Name A–Z", cmp: (a, b) => displayName(a).localeCompare(displayName(b), "en", { sensitivity: "base" }) },
  recent: { label: "Recently active", cmp: (a, b) => millis(b.lastActiveAt) - millis(a.lastActiveAt) },
};

/**
 * Every SplitPe account in one list — search by name, nickname, mobile
 * number or account ID, filter, sort, export, and block / re-activate /
 * delete one account or a selection (server-side callables, each recorded in
 * the Activity Log). Profiles only: no expense, amount or balance is read.
 *
 * Firestore has no "contains" search, so the whole users collection is
 * loaded once (admins may list it — firestore.rules) and searched here.
 */
export default function UsersTab() {
  const [users, setUsers] = useState<Profile[] | null>(null);
  // When the list was fetched — the "this week" / "30 days" filters count from here.
  const [now, setNow] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [term, setTerm] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openId, setOpenId] = useState<string | null>(null);
  const [bulk, setBulk] = useState<{ label: string; done: number; total: number } | null>(null);

  const fetchUsers = () =>
    getDocs(collection(db, "users"))
      .then((snap) => {
        setUsers(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Profile, "id">) })));
        setNow(Date.now());
      })
      .catch((err: Error) => setError(err.message || "Could not load users."))
      .finally(() => setLoading(false));

  const load = () => {
    setLoading(true);
    setError("");
    fetchUsers();
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Search / filter / sort changes start again from page 1.
  const changeTerm = (v: string) => { setTerm(v); setPage(0); };
  const changeFilter = (v: FilterKey) => { setFilter(v); setPage(0); };
  const changeSort = (v: SortKey) => { setSort(v); setPage(0); };

  const counts = useMemo(() => {
    const c = {} as Record<FilterKey, number>;
    for (const f of FILTERS) c[f.key] = users?.filter((p) => f.test(p, now)).length ?? 0;
    return c;
  }, [users, now]);

  const visible = useMemo(() => {
    if (!users) return [];
    const words = term.toLowerCase().trim().split(/\s+/).filter(Boolean);
    const test = FILTERS.find((f) => f.key === filter)!.test;
    return users
      .filter((p) => test(p, now))
      .filter((p) => {
        if (!words.length) return true;
        const hay = `${p.name || ""} ${p.nickname || ""} ${p.phone || ""} 91${p.phone || ""} ${p.id}`.toLowerCase();
        // "+91 98765 43210" and "98765-43210" should match the stored 10 digits.
        return words.every((w) => hay.includes(w) || (/\d/.test(w) && !!p.phone?.includes(w.replace(/\D/g, "").slice(-10))));
      })
      .sort(SORTS[sort].cmp);
  }, [users, now, term, filter, sort]);

  const pages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const pageRows = visible.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const myUid = auth.currentUser?.uid;
  const actionable = (p: Profile) => p.id !== myUid && !p.isAdmin;

  const selectedUsers = (users || []).filter((p) => selected.has(p.id));
  const pageSelectable = pageRows.filter(actionable);
  const allPageSelected = pageSelectable.length > 0 && pageSelectable.every((p) => selected.has(p.id));

  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const togglePage = () =>
    setSelected((s) => {
      const next = new Set(s);
      pageSelectable.forEach((p) => (allPageSelected ? next.delete(p.id) : next.add(p.id)));
      return next;
    });

  const replace = (id: string, p: Profile | null) => {
    setUsers((list) => (list ? (p ? list.map((u) => (u.id === id ? p : u)) : list.filter((u) => u.id !== id)) : list));
    if (!p) {
      setSelected((s) => {
        const next = new Set(s);
        next.delete(id);
        return next;
      });
    }
  };

  /** Runs one callable per selected account, one after another, and reports how many went through. */
  const runBulk = async (label: string, targets: Profile[], act: (p: Profile) => Promise<Profile | null>) => {
    setError("");
    setNotice("");
    let ok = 0;
    const failed: string[] = [];
    setBulk({ label, done: 0, total: targets.length });
    for (const p of targets) {
      try {
        replace(p.id, await act(p));
        ok++;
      } catch (err) {
        failed.push(`${displayName(p)}: ${(err as Error).message}`);
      }
      setBulk({ label, done: ok + failed.length, total: targets.length });
    }
    setBulk(null);
    setSelected(new Set());
    if (ok) setNotice(`${label}: ${ok} account${ok === 1 ? "" : "s"} done.`);
    if (failed.length) setError(`${failed.length} failed — ${failed.slice(0, 3).join("; ")}${failed.length > 3 ? "…" : ""}`);
  };

  const bulkStatus = (blocked: boolean) => {
    const targets = selectedUsers.filter((p) => actionable(p) && !!p.blocked !== blocked);
    if (!targets.length) {
      setNotice(blocked ? "All selected accounts are already blocked." : "All selected accounts are already active.");
      return;
    }
    let reason = "";
    if (blocked) {
      const answer = window.prompt(`Block ${targets.length} account${targets.length === 1 ? "" : "s"}? They will be signed out and can't log in until re-activated.\n\nReason (kept in the Activity Log, optional):`);
      if (answer === null) return;
      reason = answer;
    } else if (!window.confirm(`Re-activate ${targets.length} account${targets.length === 1 ? "" : "s"}?`)) {
      return;
    }
    runBulk(blocked ? "Blocked" : "Re-activated", targets, async (p) => {
      await setUserStatus({ uid: p.id, blocked, reason });
      return { ...p, blocked, blockedReason: blocked ? reason || null : null, blockedAt: null };
    });
  };

  const bulkDelete = () => {
    const targets = selectedUsers.filter(actionable);
    if (!targets.length) return;
    const typed = window.prompt(
      `Permanently delete ${targets.length} account${targets.length === 1 ? "" : "s"}?\n\n${targets.slice(0, 8).map((p) => `• ${displayName(p)} (+91 ${p.phone})`).join("\n")}${targets.length > 8 ? `\n…and ${targets.length - 8} more` : ""}\n\nTheir login, profile, friend links and photo are removed. Shared expenses stay for other members. This can't be undone.\n\nType DELETE to confirm:`
    );
    if (typed === null) return;
    if (typed.trim() !== "DELETE") {
      setError("Confirmation didn't match — nothing was deleted.");
      return;
    }
    runBulk("Deleted", targets, async (p) => {
      await deleteUser({ uid: p.id });
      return null;
    });
  };

  const open = users?.find((p) => p.id === openId) || null;

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="mb-1 font-heading text-2xl font-bold text-ink">Users</h2>
          <p className="text-sm text-ink-soft">
            {users ? `${users.length.toLocaleString("en-IN")} accounts.` : "Loading accounts…"} Search by name, number or ID. Expenses and amounts are never shown.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={load} disabled={loading} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-ink hover:bg-slate-50 disabled:opacity-50">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button onClick={() => exportCsv(visible)} disabled={!visible.length} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-ink hover:bg-slate-50 disabled:opacity-50">
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      <div className="mb-3 flex flex-col gap-2 sm:flex-row">
        <div className="flex flex-1 items-center rounded-xl border border-slate-200 bg-white focus-within:border-splitpe-600">
          <Search size={16} className="ml-3 shrink-0 text-ink-soft" />
          <input
            className="w-full rounded-xl px-2 py-2.5 outline-none"
            placeholder="Search name, nickname, mobile number or account ID"
            value={term}
            onChange={(e) => changeTerm(e.target.value)}
            autoFocus
          />
          {term && <button onClick={() => changeTerm("")} className="mr-2 p-1 text-ink-soft hover:text-ink" aria-label="Clear search"><X size={15} /></button>}
        </div>
        <select value={sort} onChange={(e) => changeSort(e.target.value as SortKey)} className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink outline-none">
          {(Object.keys(SORTS) as SortKey[]).map((k) => <option key={k} value={k}>{SORTS[k].label}</option>)}
        </select>
      </div>

      <div className="mb-4 flex gap-1.5 overflow-x-auto pb-1">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => changeFilter(key)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium ${filter === key ? "bg-splitpe-600 text-white" : "bg-white text-ink-soft shadow-soft hover:text-ink"}`}
          >
            {label} <span className="opacity-70">{users ? counts[key] : ""}</span>
          </button>
        ))}
      </div>

      {error && <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</p>}
      {notice && <p className="mb-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{notice}</p>}

      {(selected.size > 0 || bulk) && (
        <div className="sticky top-24 z-30 mb-3 flex flex-wrap items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm text-white shadow-soft lg:top-4">
          {bulk ? (
            <span className="flex items-center gap-2"><Loader2 size={15} className="animate-spin" /> {bulk.label === "Deleted" ? "Deleting" : "Updating"} {bulk.done}/{bulk.total}…</span>
          ) : (
            <>
              <span className="mr-auto font-medium">{selected.size} selected</span>
              <button onClick={() => bulkStatus(true)} className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 font-semibold"><Ban size={14} /> Block</button>
              <button onClick={() => bulkStatus(false)} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold"><CheckCircle2 size={14} /> Activate</button>
              <button onClick={bulkDelete} className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 font-semibold"><Trash2 size={14} /> Delete</button>
              <button onClick={() => setSelected(new Set())} className="rounded-lg px-2 py-1.5 text-white/70 hover:text-white">Clear</button>
            </>
          )}
        </div>
      )}

      {users === null ? (
        <div className="flex justify-center rounded-2xl bg-white py-16 shadow-soft">
          {loading ? <Loader2 className="animate-spin text-splitpe-600" /> : <p className="text-ink-soft">Couldn't load users.</p>}
        </div>
      ) : visible.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center text-ink-soft shadow-soft">
          {term ? `No account matches “${term}”.` : "No accounts in this view."}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl bg-white shadow-soft">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-ink-soft">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input type="checkbox" checked={allPageSelected} onChange={togglePage} disabled={!pageSelectable.length} aria-label="Select page" className="accent-splitpe-600" />
                  </th>
                  <th className="px-2 py-3">User</th>
                  <th className="px-3 py-3">Mobile</th>
                  <th className="hidden px-3 py-3 md:table-cell">Joined</th>
                  <th className="hidden px-3 py-3 md:table-cell">Last active</th>
                  <th className="px-3 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {pageRows.map((p) => (
                  <tr key={p.id} onClick={() => setOpenId(p.id)} className="cursor-pointer border-b border-slate-100 last:border-0 hover:bg-slate-50">
                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selected.has(p.id)}
                        onChange={() => toggle(p.id)}
                        disabled={!actionable(p)}
                        title={actionable(p) ? "" : p.id === myUid ? "Your own account" : "Admin account"}
                        aria-label={`Select ${displayName(p)}`}
                        className="accent-splitpe-600"
                      />
                    </td>
                    <td className="px-2 py-3">
                      <div className="flex items-center gap-3">
                        {p.avatarUrl
                          ? <img src={p.avatarUrl} alt="" className="h-9 w-9 shrink-0 rounded-full object-cover" />
                          : <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-splitpe-50 text-xs font-bold text-splitpe-700">{initials(p)}</div>}
                        <div className="min-w-0">
                          <p className="flex items-center gap-1 truncate font-medium text-ink">
                            {displayName(p)} {p.isAdmin && <BadgeCheck size={14} className="shrink-0 text-splitpe-600" aria-label="Admin" />}
                            {p.id === myUid && <span className="text-xs font-normal text-ink-soft">(you)</span>}
                          </p>
                          {p.nickname && p.name && <p className="truncate text-xs text-ink-soft">“{p.nickname}”</p>}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 text-ink">+91 {p.phone || "—"}</td>
                    <td className="hidden whitespace-nowrap px-3 py-3 text-ink-soft md:table-cell">{fmtDay(p.createdAt)}</td>
                    <td className="hidden whitespace-nowrap px-3 py-3 text-ink-soft md:table-cell">{ago(p.lastActiveAt)}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${p.blocked ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                        {p.blocked ? "Blocked" : "Active"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-sm text-ink-soft">
            <span>
              {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, visible.length)} of {visible.length.toLocaleString("en-IN")}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((n) => n - 1)} disabled={page === 0} className="rounded-lg p-1.5 hover:bg-slate-100 disabled:opacity-40" aria-label="Previous page"><ChevronLeft size={16} /></button>
              <span className="px-1">Page {page + 1} / {pages}</span>
              <button onClick={() => setPage((n) => n + 1)} disabled={page >= pages - 1} className="rounded-lg p-1.5 hover:bg-slate-100 disabled:opacity-40" aria-label="Next page"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      )}

      {open && (
        <UserDetail
          key={open.id}
          profile={open}
          onClose={() => setOpenId(null)}
          onChange={(p) => {
            if (!p) {
              setNotice(`Account ${displayName(open)} (+91 ${open.phone}) deleted.`);
              setOpenId(null);
            }
            replace(open.id, p);
          }}
        />
      )}
    </div>
  );
}
