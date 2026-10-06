import { useEffect, useState } from "react";
import { Timestamp, collection, getCountFromServer, query, where } from "firebase/firestore";
import { Activity, CalendarDays, UserPlus, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { db } from "./firebase";

type Counts = { total: number; activeToday: number; active7d: number; new7d: number };

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000);

/**
 * Headline user numbers — server-side count queries only, so no individual
 * profile is ever downloaded here. "Active" comes from users.lastActiveAt,
 * which the app stamps on open (builds from Oct 2026 on — older installs
 * don't report it until they update).
 */
export default function OverviewTab() {
  const [counts, setCounts] = useState<Counts | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const users = collection(db, "users");
    const count = async (q: ReturnType<typeof query>) => (await getCountFromServer(q)).data().count;
    Promise.all([
      count(query(users)),
      count(query(users, where("lastActiveAt", ">=", Timestamp.fromDate(startOfToday())))),
      count(query(users, where("lastActiveAt", ">=", Timestamp.fromDate(daysAgo(7))))),
      count(query(users, where("createdAt", ">=", Timestamp.fromDate(daysAgo(7))))),
    ])
      .then(([total, activeToday, active7d, new7d]) => setCounts({ total, activeToday, active7d, new7d }))
      .catch((err) => setError(err.message || "Could not load numbers."));
  }, []);

  const cards: { label: string; value?: number; icon: LucideIcon; hint: string }[] = [
    { label: "Total users", value: counts?.total, icon: Users, hint: "All profiles" },
    { label: "Active today", value: counts?.activeToday, icon: Activity, hint: "Opened the app today" },
    { label: "Active (7 days)", value: counts?.active7d, icon: CalendarDays, hint: "Opened in the last week" },
    { label: "New (7 days)", value: counts?.new7d, icon: UserPlus, hint: "Signed up this week" },
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
            <p className="font-heading text-3xl font-bold text-ink">{value ?? (error ? "—" : "…")}</p>
            <p className="mt-1 text-xs text-slate-400">{hint}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
