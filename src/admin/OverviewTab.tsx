import { useEffect, useState } from "react";
import { Timestamp, collection, getCountFromServer, query, where } from "firebase/firestore";
import type { Query } from "firebase/firestore";
import { Activity, ArrowLeftRight, CalendarDays, Receipt, ReceiptText, UserPlus, Users, UsersRound } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { db } from "./firebase";
import { userActivity } from "./users";
import BarChart from "./BarChart";
import type { BarDatum } from "./BarChart";

const DAY_MS = 24 * 60 * 60 * 1000;
const CHART_DAYS = 14;

const startOfDay = (d: Date) => {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
};
const ts = (d: Date) => Timestamp.fromDate(d);
const count = async (q: Query) => (await getCountFromServer(q)).data().count;
const dayLabel = (d: Date) => d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });

type Counts = Record<
  "users" | "activeToday" | "active7d" | "new7d" | "groups" | "expenses" | "expensesToday" | "settle7d",
  number
>;

/** Per-day counts of docs created in `col` over the last CHART_DAYS days. */
const dailySeries = (col: string): Promise<BarDatum[]> => {
  const today = startOfDay(new Date());
  return Promise.all(
    Array.from({ length: CHART_DAYS }, async (_, i) => {
      const from = new Date(today.getTime() - (CHART_DAYS - 1 - i) * DAY_MS);
      const to = new Date(from.getTime() + DAY_MS);
      const value = await count(query(collection(db, col), where("createdAt", ">=", ts(from)), where("createdAt", "<", ts(to))));
      return { label: dayLabel(from), value };
    })
  );
};

/**
 * Headline numbers + two 14-day trends — server-side count queries only, so
 * no profile, expense or amount is ever downloaded here. "Active" comes from
 * Firebase Auth's last token refresh / sign-in (adminUserActivity), which
 * every app build reports; if that call fails it falls back to
 * users.lastActiveAt, which only builds from Oct 2026 on stamp.
 */
export default function OverviewTab() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [signups, setSignups] = useState<BarDatum[] | null>(null);
  const [expenseTrend, setExpenseTrend] = useState<BarDatum[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const today = startOfDay(new Date());
    const weekAgo = new Date(Date.now() - 7 * DAY_MS);
    const users = collection(db, "users");
    const expenses = collection(db, "expenses");
    Promise.all([
      count(query(users)),
      count(query(users, where("lastActiveAt", ">=", ts(today)))),
      count(query(users, where("lastActiveAt", ">=", ts(weekAgo)))),
      count(query(users, where("createdAt", ">=", ts(weekAgo)))),
      count(query(collection(db, "groups"))),
      count(query(expenses)),
      count(query(expenses, where("createdAt", ">=", ts(today)))),
      count(query(collection(db, "settlements"), where("createdAt", ">=", ts(weekAgo)))),
    ])
      .then(async ([users, activeToday, active7d, new7d, groups, expensesTotal, expensesToday, settle7d]) => {
        const fromAuth = await userActivity()
          .then(({ data }) => {
            const seen = Object.values(data.activity).map((a) => Math.max(a.refresh ?? 0, a.signIn ?? 0));
            return { activeToday: seen.filter((t) => t >= today.getTime()).length, active7d: seen.filter((t) => t >= weekAgo.getTime()).length };
          })
          .catch(() => null);
        setCounts({
          users,
          activeToday: Math.max(activeToday, fromAuth?.activeToday ?? 0),
          active7d: Math.max(active7d, fromAuth?.active7d ?? 0),
          new7d,
          groups,
          expenses: expensesTotal,
          expensesToday,
          settle7d,
        });
      })
      .catch((err) => setError(err.message || "Could not load numbers."));
    dailySeries("users").then(setSignups).catch(() => setSignups([]));
    dailySeries("expenses").then(setExpenseTrend).catch(() => setExpenseTrend([]));
  }, []);

  const cards: { label: string; value?: number; icon: LucideIcon; hint: string }[] = [
    { label: "Total users", value: counts?.users, icon: Users, hint: "All profiles" },
    { label: "Active today", value: counts?.activeToday, icon: Activity, hint: "Opened the app today" },
    { label: "Active (7 days)", value: counts?.active7d, icon: CalendarDays, hint: "Opened in the last week" },
    { label: "New (7 days)", value: counts?.new7d, icon: UserPlus, hint: "Signed up this week" },
    { label: "Groups", value: counts?.groups, icon: UsersRound, hint: "Including deleted" },
    { label: "Expenses", value: counts?.expenses, icon: Receipt, hint: "All time" },
    { label: "Expenses today", value: counts?.expensesToday, icon: ReceiptText, hint: "Added since midnight" },
    { label: "Settle-ups (7 days)", value: counts?.settle7d, icon: ArrowLeftRight, hint: "Payments recorded" },
  ];

  return (
    <div>
      <h2 className="mb-1 font-heading text-2xl font-bold text-ink">Overview</h2>
      <p className="mb-6 text-sm text-ink-soft">Live counts from Firestore.</p>
      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, hint }) => (
          <div key={label} className="rounded-2xl bg-white p-5 shadow-soft">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-splitpe-50 text-splitpe-600">
              <Icon size={20} />
            </div>
            <p className="text-sm text-ink-soft">{label}</p>
            <p className="font-heading text-3xl font-bold text-ink">{value?.toLocaleString("en-IN") ?? (error ? "—" : "…")}</p>
            <p className="mt-1 text-xs text-slate-400">{hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {[
          { title: "New users", sub: `Sign-ups per day · last ${CHART_DAYS} days`, data: signups, unit: "sign-ups" },
          { title: "Expenses added", sub: `Expenses per day · last ${CHART_DAYS} days`, data: expenseTrend, unit: "expenses" },
        ].map(({ title, sub, data, unit }) => (
          <div key={title} className="rounded-2xl bg-white p-5 shadow-soft">
            <div className="mb-4 flex items-baseline justify-between gap-2">
              <div>
                <h3 className="font-heading text-lg font-bold text-ink">{title}</h3>
                <p className="text-xs text-ink-soft">{sub}</p>
              </div>
              {data && data.length > 0 && (
                <p className="font-heading text-2xl font-bold text-ink">{data.reduce((s, d) => s + d.value, 0).toLocaleString("en-IN")}</p>
              )}
            </div>
            {data === null ? <p className="py-12 text-center text-sm text-ink-soft">Loading…</p>
              : data.length === 0 ? <p className="py-12 text-center text-sm text-ink-soft">Couldn't load this chart.</p>
              : <BarChart data={data} unit={unit} />}
          </div>
        ))}
      </div>
    </div>
  );
}
