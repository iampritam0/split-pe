import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { httpsCallable } from "firebase/functions";
import { Loader2, RefreshCw } from "lucide-react";
import { functions } from "./firebase";
import BarChart from "./BarChart";
import { ago } from "./users";

type Step = { step: string; count: number };
type Analytics = {
  computedAt: number;
  totals: { users: number; expenses: number; settlements: number; groups: number };
  active: { dau: number; wau: number; mau: number };
  history: { date: string; dau: number; wau: number; mau: number }[];
  series: Record<"signups" | "expenses" | "settlements" | "groups", { day: string; value: number }[]>;
  funnel: { all: Step[]; last30: Step[] };
  cohorts: { start: string; size: number; weeks: number[] }[];
  topCategories: { name: string; count: number }[];
  kinds: { group: number; friend: number; personal: number };
  heatmap: number[][];
  buckets: { label: string; count: number }[];
  versions?: { version: string; count: number }[];
  groups: { active: number; deleted: number; avgMembers: number; usedLast30: number };
};
const fetchAnalytics = httpsCallable<{ refresh?: boolean }, Analytics>(functions, "adminAnalytics");

const dayLabel = (day: string) => new Date(`${day}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const pct = (n: number, of: number) => (of ? Math.round((n / of) * 100) : 0);
const num = (n: number) => n.toLocaleString("en-IN");
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// One brand hue, light → dark, for magnitude (retention cells, heatmap).
const SHADES = ["bg-splitpe-50", "bg-splitpe-100", "bg-splitpe-200", "bg-splitpe-300", "bg-splitpe-400", "bg-splitpe-500", "bg-splitpe-600", "bg-splitpe-700"];
const shade = (ratio: number) => (ratio <= 0 ? "bg-slate-100" : SHADES[Math.min(SHADES.length - 1, Math.floor(ratio * SHADES.length))]);
const inkOn = (ratio: number) => (ratio >= 0.625 ? "text-white" : "text-ink");

const Card = ({ title, sub, children, right }: { title: string; sub?: string; children: ReactNode; right?: ReactNode }) => (
  <section className="rounded-2xl bg-white p-4 shadow-soft sm:p-5">
    <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <h3 className="font-heading text-lg font-bold text-ink">{title}</h3>
        {sub && <p className="text-xs text-ink-soft">{sub}</p>}
      </div>
      {right}
    </div>
    {children}
  </section>
);

const Tile = ({ label, value, hint }: { label: string; value: string; hint: string }) => (
  <div className="rounded-2xl bg-white p-4 shadow-soft sm:p-5">
    <p className="text-sm text-ink-soft">{label}</p>
    <p className="font-heading text-2xl sm:text-3xl font-bold text-ink">{value}</p>
    <p className="mt-1 text-xs text-slate-400">{hint}</p>
  </div>
);

/** Horizontal bars — label left, value right, one hue; hover darkens the bar. */
function HBars({ rows, unit }: { rows: { label: string; value: number; note?: string }[]; unit: string }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.label} className="group" title={`${r.label}: ${num(r.value)} ${unit}`}>
          <div className="mb-1 flex justify-between gap-2 text-sm">
            <span className="truncate text-ink">{r.label}</span>
            <span className="shrink-0 font-medium text-ink">{num(r.value)}{r.note && <span className="ml-1.5 font-normal text-ink-soft">{r.note}</span>}</span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-100">
            <div className="h-full rounded-full bg-splitpe-600 transition-colors group-hover:bg-splitpe-700" style={{ width: r.value ? `${Math.max(2, (r.value / max) * 100)}%` : 0 }} />
          </div>
        </li>
      ))}
    </ul>
  );
}

/**
 * Product analytics from adminAnalytics — counts only, never an amount or
 * anyone's expense. Cached server-side for 30 minutes; Refresh recomputes.
 */
export default function AnalyticsTab() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [funnelView, setFunnelView] = useState<"all" | "last30">("all");
  const [hoverCell, setHoverCell] = useState<{ d: number; h: number } | null>(null);

  const load = (refresh: boolean) =>
    fetchAnalytics({ refresh })
      .then(({ data }) => setData(data))
      .catch((err: Error) => setError(err.message || "Could not load analytics."))
      .finally(() => setLoading(false));

  useEffect(() => {
    load(false);
  }, []);

  const refresh = () => {
    setLoading(true);
    setError("");
    load(true);
  };

  if (!data) {
    return (
      <div>
        <h2 className="mb-1 font-heading text-2xl font-bold text-ink">Analytics</h2>
        {error ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : (
          <p className="mt-6 flex items-center gap-2 text-ink-soft"><Loader2 size={16} className="animate-spin" /> Crunching the numbers — can take a few seconds…</p>
        )}
      </div>
    );
  }

  const { active, totals } = data;
  const funnel = data.funnel[funnelView];
  const heatMax = Math.max(1, ...data.heatmap.flat());
  const kindsTotal = data.kinds.group + data.kinds.friend + data.kinds.personal;
  const toBars = (s: { day: string; value: number }[]) => s.map((d) => ({ label: dayLabel(d.day), value: d.value }));

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="mb-1 font-heading text-2xl font-bold text-ink">Analytics</h2>
          <p className="text-sm text-ink-soft">How SplitPe is used — counts only, no amounts. Updated {ago(data.computedAt).toLowerCase()}.</p>
        </div>
        <button onClick={refresh} disabled={loading} className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-ink hover:bg-slate-50 disabled:opacity-50">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>
      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <Tile label="Daily active" value={num(active.dau)} hint="Used the app today" />
        <Tile label="Weekly active" value={num(active.wau)} hint="Last 7 days" />
        <Tile label="Monthly active" value={num(active.mau)} hint={`Last 30 days · ${pct(active.mau, totals.users)}% of all users`} />
        <Tile label="Stickiness" value={`${pct(active.dau, active.mau)}%`} hint="Daily ÷ monthly active — 20%+ is healthy" />
      </div>

      <div className="mb-6">
        <Card title="Daily active users" sub="Recorded every night at 11:55 PM IST">
          {data.history.length < 2 ? (
            <p className="py-8 text-center text-sm text-ink-soft">Collecting — the first nightly snapshot is saved tonight, and this chart fills in day by day.</p>
          ) : (
            <BarChart data={data.history.map((h) => ({ label: dayLabel(h.date), value: h.dau }))} unit="active users" />
          )}
        </Card>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        {([
          ["New users", "signups", "sign-ups"],
          ["Expenses added", "expenses", "expenses"],
          ["Settle-ups", "settlements", "settle-ups"],
          ["Groups created", "groups", "groups"],
        ] as const).map(([title, key, unit]) => (
          <Card key={key} title={title} sub="Per day · last 30 days" right={<p className="font-heading text-2xl font-bold text-ink">{num(data.series[key].reduce((s, d) => s + d.value, 0))}</p>}>
            <BarChart data={toBars(data.series[key])} unit={unit} />
          </Card>
        ))}
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card
          title="Activation funnel"
          sub="Where people drop off between signing up and settling up"
          right={
            <select value={funnelView} onChange={(e) => setFunnelView(e.target.value as "all" | "last30")} className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-ink outline-none">
              <option value="all">All users</option>
              <option value="last30">Joined last 30 days</option>
            </select>
          }
        >
          <HBars
            unit="users"
            rows={funnel.map((s, i) => ({
              label: s.step,
              value: s.count,
              note: i === 0 ? "" : `${pct(s.count, funnel[0].count)}%`,
            }))}
          />
          {funnel[0].count > 0 && (() => {
            let worst = 1;
            for (let i = 2; i < funnel.length; i++) {
              const drop = (n: number) => funnel[n - 1].count - funnel[n].count;
              if (drop(i) > drop(worst)) worst = i;
            }
            return <p className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-sm text-ink-soft">Biggest drop: <b className="text-ink">{funnel[worst - 1].step} → {funnel[worst].step}</b> ({num(funnel[worst - 1].count - funnel[worst].count)} users).</p>;
          })()}
        </Card>

        <Card title="App versions" sub="What people active in the last 30 days are running — use it to time a force update">
          {data.versions?.length ? (
            <HBars unit="users" rows={data.versions.map((v) => ({ label: v.version, value: v.count, note: `${pct(v.count, active.mau)}%` }))} />
          ) : <p className="text-sm text-ink-soft">No data yet — refresh analytics.</p>}
        </Card>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card title="How much people use it" sub="Users by number of expenses they've added">
          <HBars unit="users" rows={data.buckets.map((b) => ({ label: `${b.label} expenses`, value: b.count, note: `${pct(b.count, totals.users)}%` }))} />
        </Card>
      </div>

      <div className="mb-6">
        <Card title="Weekly retention" sub="Of the people who joined each week, % who added an expense in week 0, 1, 2… after (weeks start Monday)">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] border-separate border-spacing-[2px] text-center text-xs">
              <thead>
                <tr className="text-ink-soft">
                  <th className="px-2 py-1 text-left font-medium">Joined week of</th>
                  <th className="px-2 py-1 font-medium">Users</th>
                  {data.cohorts[0]?.weeks.map((_, w) => <th key={w} className="px-2 py-1 font-medium">W{w}</th>)}
                </tr>
              </thead>
              <tbody>
                {data.cohorts.map((c) => (
                  <tr key={c.start}>
                    <td className="whitespace-nowrap px-2 py-1.5 text-left text-ink">{dayLabel(c.start)}</td>
                    <td className="px-2 py-1.5 font-medium text-ink">{c.size}</td>
                    {data.cohorts[0].weeks.map((_, w) => {
                      if (w >= c.weeks.length) return <td key={w} />;
                      const ratio = c.size ? c.weeks[w] / c.size : 0;
                      return (
                        <td key={w} title={`${c.weeks[w]} of ${c.size}`} className={`rounded-[4px] px-2 py-1.5 font-medium ${c.size ? `${shade(ratio)} ${inkOn(ratio)}` : "text-slate-300"}`}>
                          {c.size ? `${pct(c.weeks[w], c.size)}%` : "—"}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <div className="mb-6 grid gap-4 lg:grid-cols-2">
        <Card title="Top categories" sub="Expenses per category · all time">
          {data.topCategories.length ? <HBars unit="expenses" rows={data.topCategories.map((c) => ({ label: c.name, value: c.count, note: `${pct(c.count, totals.expenses)}%` }))} /> : <p className="text-sm text-ink-soft">No expenses yet.</p>}
        </Card>
        <div className="space-y-4">
          <Card title="What gets split" sub="Expenses by type · all time">
            <HBars unit="expenses" rows={[
              { label: "In a group", value: data.kinds.group, note: `${pct(data.kinds.group, kindsTotal)}%` },
              { label: "With one friend", value: data.kinds.friend, note: `${pct(data.kinds.friend, kindsTotal)}%` },
              { label: "Personal", value: data.kinds.personal, note: `${pct(data.kinds.personal, kindsTotal)}%` },
            ]} />
          </Card>
          <Card title="Groups">
            <div className="grid grid-cols-2 gap-3 text-center">
              {([
                ["Active", num(data.groups.active)],
                ["Used in last 30 days", num(data.groups.usedLast30)],
                ["Avg. members", String(data.groups.avgMembers)],
                ["Deleted", num(data.groups.deleted)],
              ] as const).map(([label, value]) => (
                <div key={label} className="rounded-xl bg-slate-50 py-3">
                  <p className="font-heading text-xl font-bold text-ink">{value}</p>
                  <p className="text-xs text-ink-soft">{label}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card
        title="When expenses get added"
        sub="By weekday and hour (IST) · last 90 days — darker = more"
        right={hoverCell ? <p className="text-sm text-ink"><b>{data.heatmap[hoverCell.d][hoverCell.h]}</b> expenses · {WEEKDAYS[hoverCell.d]} {hoverCell.h}:00–{hoverCell.h + 1}:00</p> : undefined}
      >
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            {data.heatmap.map((row, d) => (
              <div key={d} className="mb-[2px] flex items-center gap-[2px]">
                <span className="w-9 shrink-0 text-xs text-ink-soft">{WEEKDAYS[d]}</span>
                {row.map((v, h) => (
                  <div
                    key={h}
                    onMouseEnter={() => setHoverCell({ d, h })}
                    onClick={() => setHoverCell({ d, h })}
                    onMouseLeave={() => setHoverCell(null)}
                    title={`${WEEKDAYS[d]} ${h}:00 — ${v} expenses`}
                    className={`h-6 flex-1 rounded-[4px] ${shade(v / heatMax)} ${hoverCell?.d === d && hoverCell.h === h ? "ring-2 ring-ink" : ""}`}
                  />
                ))}
              </div>
            ))}
            <div className="ml-[38px] mt-1 flex justify-between text-[11px] text-slate-400">
              {[0, 6, 12, 18, 23].map((h) => <span key={h}>{h === 0 ? "12 AM" : h === 12 ? "12 PM" : h < 12 ? `${h} AM` : `${h - 12} PM`}</span>)}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
