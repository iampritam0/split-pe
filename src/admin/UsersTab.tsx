import { useEffect, useMemo, useState } from "react";
import { Ban, BadgeCheck, Bell, CheckCircle2, ChevronLeft, ChevronRight, Download, Loader2, RefreshCw, Search, Trash2, X } from "lucide-react";
import { auth } from "./firebase";
import NotifyComposer from "./NotifyComposer";
import UserDetail from "./UserDetail";
import { useRole } from "./role";
import useUsers from "./useUsers";
import { ago, deleteUser, displayName, exportCsv, fmtDate, fmtDay, listUsers, setUserStatus } from "./users";
import type { UserRow } from "./users";

const DAY_MS = 24 * 60 * 60 * 1000;
const PAGE_SIZE = 25;

type FilterKey = "all" | "active" | "blocked" | "admins" | "new7d" | "seen7d" | "inactive30d";
const FILTERS: { key: FilterKey; label: string; test: (p: UserRow, now: number) => boolean }[] = [
  { key: "all", label: "All", test: () => true },
  { key: "active", label: "Active", test: (p) => !p.blocked },
  { key: "blocked", label: "Blocked", test: (p) => !!p.blocked },
  { key: "admins", label: "Admins", test: (p) => !!p.isAdmin },
  { key: "new7d", label: "New this week", test: (p, now) => !!p.createdAt && now - p.createdAt < 7 * DAY_MS },
  { key: "seen7d", label: "Active (7d)", test: (p, now) => !!p.lastSeen && now - p.lastSeen < 7 * DAY_MS },
  { key: "inactive30d", label: "Inactive 30d+", test: (p, now) => !p.lastSeen || now - p.lastSeen >= 30 * DAY_MS },
];

type SortKey = "newest" | "oldest" | "name" | "recent";
const SORTS: Record<SortKey, { label: string; cmp: (a: UserRow, b: UserRow) => number }> = {
  newest: { label: "Newest first", cmp: (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0) },
  oldest: { label: "Oldest first", cmp: (a, b) => (a.createdAt ?? 0) - (b.createdAt ?? 0) },
  name: { label: "Name A–Z", cmp: (a, b) => displayName(a).localeCompare(displayName(b), "en", { sensitivity: "base" }) },
  recent: { label: "Recently active", cmp: (a, b) => (b.lastSeen ?? 0) - (a.lastSeen ?? 0) },
};

/**
 * Every SplitPe account in one list — masked by the server, so names and
 * numbers show as "R**** S*****" / "••••••3210" until someone reveals one
 * account (logged). Search still matches full names and numbers: it runs
 * server-side (adminListUsers with a term) and returns matching IDs. Filter,
 * sort, export, and block / re-activate / delete one account or a selection.
 * No group, expense or balance is ever shown.
 */
export default function UsersTab() {
  const { users, setUsers, now, loading, error: loadError, reload } = useUsers();
  const [actionError, setError] = useState("");
  const error = loadError || actionError;
  const [notice, setNotice] = useState("");
  const [term, setTerm] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [sort, setSort] = useState<SortKey>("newest");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openId, setOpenId] = useState<string | null>(null);
  const [bulk, setBulk] = useState<{ label: string; done: number; total: number } | null>(null);
  const [notifying, setNotifying] = useState(false);
  const [tag, setTag] = useState("");
  const { isSuper, canSupport } = useRole();
  // IDs matching the search term — null while there's no term.
  const [matches, setMatches] = useState<Set<string> | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    const q = term.trim();
    if (!q) return undefined;
    const timer = setTimeout(() => {
      setSearching(true);
      listUsers({ term: q })
        .then(({ data }) => setMatches(new Set(data.users.map((u) => u.id))))
        .catch((err: Error) => setError(err.message || "Search failed."))
        .finally(() => setSearching(false));
    }, 350);
    return () => clearTimeout(timer);
  }, [term]);

  const load = () => {
    setError("");
    reload();
  };

  // Search / filter / sort changes start again from page 1.
  const changeTerm = (v: string) => { setTerm(v); setPage(0); if (!v.trim()) setMatches(null); };
  const changeFilter = (v: FilterKey) => { setFilter(v); setPage(0); };
  const changeSort = (v: SortKey) => { setSort(v); setPage(0); };
  const changeTag = (v: string) => { setTag(v); setPage(0); };
  const allTags = useMemo(() => [...new Set((users || []).flatMap((p) => p.tags || []))].sort(), [users]);

  const counts = useMemo(() => {
    const c = {} as Record<FilterKey, number>;
    for (const f of FILTERS) c[f.key] = users?.filter((p) => f.test(p, now)).length ?? 0;
    return c;
  }, [users, now]);

  const visible = useMemo(() => {
    if (!users) return [];
    const test = FILTERS.find((f) => f.key === filter)!.test;
    return users
      .filter((p) => test(p, now))
      .filter((p) => !tag || p.tags.includes(tag))
      .filter((p) => !matches || matches.has(p.id))
      .sort(SORTS[sort].cmp);
  }, [users, now, matches, filter, sort, tag]);

  const pages = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const pageRows = visible.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const myUid = auth.currentUser?.uid;
  // Viewers can't act, so they get no checkboxes at all.
  const actionable = (p: UserRow) => canSupport && p.id !== myUid && !p.isAdmin;

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

  const replace = (id: string, p: UserRow | null) => {
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
  const runBulk = async (label: string, targets: UserRow[], act: (p: UserRow) => Promise<UserRow | null>) => {
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
      return { ...p, blocked };
    });
  };

  const bulkDelete = () => {
    const targets = selectedUsers.filter(actionable);
    if (!targets.length) return;
    const typed = window.prompt(
      `Permanently delete ${targets.length} account${targets.length === 1 ? "" : "s"}?\n\n${targets.slice(0, 8).map((p) => `• ${displayName(p)} (${p.phone})`).join("\n")}${targets.length > 8 ? `\n…and ${targets.length - 8} more` : ""}\n\nTheir login, profile, friend links and photo are removed. Shared expenses stay for other members. This can't be undone.\n\nType DELETE to confirm:`
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
    // Room for the floating selection bar on phones.
    <div className={selected.size > 0 || bulk ? "pb-20 lg:pb-0" : ""}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="mb-1 font-heading text-2xl font-bold text-ink">Users</h2>
          <p className="text-sm text-ink-soft">
            {users ? `${users.length.toLocaleString("en-IN")} accounts.` : "Loading accounts…"} Names and numbers are masked — open an account to reveal one (logged). Groups and expenses are never shown.
          </p>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <button onClick={load} disabled={loading} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-ink hover:bg-slate-50 disabled:opacity-50 sm:flex-none">
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
          </button>
          <button onClick={() => exportCsv(visible)} disabled={!visible.length} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-ink hover:bg-slate-50 disabled:opacity-50 sm:flex-none">
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      <div className="mb-3 grid grid-cols-2 gap-2 sm:flex sm:flex-row">
        <div className="col-span-2 flex flex-1 items-center rounded-xl border border-slate-200 bg-white focus-within:border-splitpe-600">
          <Search size={16} className="ml-3 shrink-0 text-ink-soft" />
          <input
            className="w-full rounded-xl px-2 py-2.5 outline-none"
            placeholder="Search name, nickname, mobile, account ID or tag"
            value={term}
            onChange={(e) => changeTerm(e.target.value)}
            // No auto-focus on phones — it would pop the keyboard over the list.
            autoFocus={window.matchMedia("(min-width: 1024px)").matches}
          />
          {searching && <Loader2 size={15} className="mr-2 animate-spin text-ink-soft" />}
          {term && <button onClick={() => changeTerm("")} className="mr-2 p-1 text-ink-soft hover:text-ink" aria-label="Clear search"><X size={15} /></button>}
        </div>
        {allTags.length > 0 && (
          <select value={tag} onChange={(e) => changeTag(e.target.value)} className="min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink outline-none" aria-label="Filter by tag">
            <option value="">All tags</option>
            {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        )}
        <select value={sort} onChange={(e) => changeSort(e.target.value as SortKey)} aria-label="Sort" className={`${allTags.length ? "" : "col-span-2"} min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-ink outline-none`}>
          {(Object.keys(SORTS) as SortKey[]).map((k) => <option key={k} value={k}>{SORTS[k].label}</option>)}
        </select>
      </div>

      <div className="-mx-4 mb-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
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
        <div className="fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-30 flex flex-wrap items-center gap-2 rounded-2xl bg-ink px-4 py-2.5 text-sm text-white shadow-2xl lg:sticky lg:inset-x-auto lg:bottom-auto lg:top-4 lg:mb-3 lg:rounded-xl lg:shadow-soft">
          {bulk ? (
            <span className="flex items-center gap-2"><Loader2 size={15} className="animate-spin" /> {bulk.label === "Deleted" ? "Deleting" : "Updating"} {bulk.done}/{bulk.total}…</span>
          ) : (
            <>
              <span className="mr-auto font-medium">{selected.size} selected</span>
              {isSuper && <button onClick={() => setNotifying(true)} className="flex items-center gap-1.5 rounded-lg bg-splitpe-600 px-3 py-1.5 font-semibold"><Bell size={14} /> Notify</button>}
              <button onClick={() => bulkStatus(true)} className="flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 font-semibold"><Ban size={14} /> Block</button>
              <button onClick={() => bulkStatus(false)} className="flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 font-semibold"><CheckCircle2 size={14} /> Activate</button>
              {isSuper && <button onClick={bulkDelete} className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-1.5 font-semibold"><Trash2 size={14} /> Delete</button>}
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
          {/* Phones: one card per account instead of a table. */}
          <div className="md:hidden">
            {pageSelectable.length > 0 && (
              <label className="flex items-center gap-3 border-b border-slate-100 bg-slate-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-ink-soft">
                <input type="checkbox" checked={allPageSelected} onChange={togglePage} className="h-4 w-4 accent-splitpe-600" /> Select page
              </label>
            )}
            <ul>
              {pageRows.map((p) => (
                <li key={p.id} className="flex items-center gap-3 border-b border-slate-100 px-4 py-3 last:border-0 active:bg-slate-50">
                  {canSupport && (
                    <input
                      type="checkbox"
                      checked={selected.has(p.id)}
                      onChange={() => toggle(p.id)}
                      disabled={!actionable(p)}
                      aria-label={`Select ${displayName(p)}`}
                      className="h-4 w-4 shrink-0 accent-splitpe-600 disabled:opacity-30"
                    />
                  )}
                  <button onClick={() => setOpenId(p.id)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-splitpe-50 text-xs font-bold text-splitpe-700">{p.initials}</div>
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1 font-medium text-ink">
                        <span className="truncate">{displayName(p)}</span>
                        {p.isAdmin && <BadgeCheck size={14} className="shrink-0 text-splitpe-600" aria-label="Admin" />}
                        {p.id === myUid && <span className="shrink-0 text-xs font-normal text-ink-soft">(you)</span>}
                      </p>
                      <p className="truncate text-xs text-ink-soft"><span className="font-mono">{p.phone || "—"}</span> · active {ago(p.lastSeen).toLowerCase()}</p>
                      {!!p.tags.length && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {p.tags.map((t) => <span key={t} className="rounded-full bg-slate-100 px-1.5 py-px text-[11px] font-medium text-slate-600">{t}</span>)}
                        </div>
                      )}
                    </div>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${p.blocked ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}>
                      {p.blocked ? "Blocked" : "Active"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="hidden overflow-x-auto md:block">
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
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-splitpe-50 text-xs font-bold text-splitpe-700">{p.initials}</div>
                        <div className="min-w-0">
                          <p className="flex items-center gap-1 truncate font-medium text-ink">
                            {displayName(p)} {p.isAdmin && <BadgeCheck size={14} className="shrink-0 text-splitpe-600" aria-label="Admin" />}
                            {p.id === myUid && <span className="text-xs font-normal text-ink-soft">(you)</span>}
                          </p>
                          {!!p.tags.length && (
                            <div className="mt-0.5 flex flex-wrap gap-1">
                              {p.tags.map((t) => <span key={t} className="rounded-full bg-slate-100 px-1.5 py-px text-[11px] font-medium text-slate-600">{t}</span>)}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-3 font-mono text-xs text-ink">{p.phone || "—"}</td>
                    <td className="hidden whitespace-nowrap px-3 py-3 text-ink-soft md:table-cell">{fmtDay(p.createdAt)}</td>
                    <td className="hidden whitespace-nowrap px-3 py-3 text-ink-soft md:table-cell"><span title={fmtDate(p.lastSeen)}>{ago(p.lastSeen)}</span></td>
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
          <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-3 text-sm text-ink-soft">
            <span>
              {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, visible.length)} of {visible.length.toLocaleString("en-IN")}
            </span>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage((n) => n - 1)} disabled={page === 0} className="rounded-lg p-1.5 hover:bg-slate-100 disabled:opacity-40" aria-label="Previous page"><ChevronLeft size={16} /></button>
              <span className="whitespace-nowrap px-1">{page + 1} / {pages}</span>
              <button onClick={() => setPage((n) => n + 1)} disabled={page >= pages - 1} className="rounded-lg p-1.5 hover:bg-slate-100 disabled:opacity-40" aria-label="Next page"><ChevronRight size={16} /></button>
            </div>
          </div>
        </div>
      )}

      {notifying && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 sm:items-center sm:p-4" onClick={() => setNotifying(false)}>
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-3xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-2xl sm:max-h-full sm:rounded-2xl sm:p-6" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-heading text-lg font-bold text-ink">Notify {selectedUsers.length} selected</h3>
              <button onClick={() => setNotifying(false)} className="rounded-lg p-1.5 text-ink-soft hover:bg-slate-100" aria-label="Close"><X size={18} /></button>
            </div>
            <NotifyComposer
              target={selectedUsers.length ? { audience: "uids", uids: selectedUsers.map((p) => p.id) } : null}
              label={`${selectedUsers.length} user${selectedUsers.length === 1 ? "" : "s"}`}
            />
          </div>
        </div>
      )}

      {open && (
        <UserDetail
          key={open.id}
          user={open}
          onClose={() => setOpenId(null)}
          onChange={(p) => {
            if (!p) {
              setNotice(`Account ${displayName(open)} (${open.phone}) deleted.`);
              setOpenId(null);
            }
            replace(open.id, p);
          }}
        />
      )}
    </div>
  );
}
