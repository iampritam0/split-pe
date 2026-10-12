import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import type { Timestamp } from "firebase/firestore";
import { Download, Eye } from "lucide-react";
import { db } from "./firebase";
import { logAdminAction } from "./adminLog";
import { useRole } from "./role";
import { fmtDate } from "./users";

const masked = (phone: string) => `••••••${phone.slice(-4)}`;

type PreRegistration = { id: string; name: string; phone: string; alreadyUser?: boolean; createdAt?: Timestamp; updatedAt?: Timestamp };

/**
 * Pre-registrations from the website's /register page — name + an
 * OTP-verified mobile (SplitPe repo: preRegister). No app account is created
 * for these; `alreadyUser` flags numbers that were already on SplitPe.
 */
export default function PreRegistrationsTab() {
  const [rows, setRows] = useState<PreRegistration[] | null>(null);
  const [error, setError] = useState("");
  // Numbers stay masked until someone chooses to see them (logged).
  const [showAll, setShowAll] = useState(false);
  const { canSupport } = useRole();

  useEffect(
    () =>
      onSnapshot(
        query(collection(db, "preRegistrations"), orderBy("createdAt", "desc")),
        (snap) => setRows(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PreRegistration, "id">) }))),
        (err) => setError(err.message)
      ),
    []
  );

  const reveal = () => {
    setShowAll(true);
    logAdminAction("privacy", "Viewed pre-registration numbers", `${rows?.length ?? 0} entries`);
  };

  const exportCsv = () => {
    if (!rows) return;
    const cell = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const lines = [
      "Name,Mobile,Already a user,Registered on",
      ...rows.map((r) => [cell(r.name), `+91${r.phone}`, r.alreadyUser ? "yes" : "no", cell(r.createdAt?.toDate().toISOString() ?? "")].join(",")),
    ];
    const url = URL.createObjectURL(new Blob([lines.join("\n")], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `splitpe-pre-registrations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    logAdminAction("privacy", "Exported pre-registrations as CSV", `${rows.length} entries`);
  };

  const today = new Date().toDateString();
  const todayCount = rows?.filter((r) => r.createdAt?.toDate().toDateString() === today).length ?? 0;

  return (
    <div>
      <h2 className="mb-1 font-heading text-2xl font-bold text-ink">Pre-registrations</h2>
      <p className="mb-6 text-sm text-ink-soft">People who signed up on the website's Pre-register page with a verified mobile number.</p>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-4 shadow-soft">
          <p className="text-xs font-medium text-ink-soft">Total</p>
          <p className="font-heading text-3xl font-bold text-ink">{rows ? rows.length : "–"}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-soft">
          <p className="text-xs font-medium text-ink-soft">Today</p>
          <p className="font-heading text-3xl font-bold text-ink">{rows ? todayCount : "–"}</p>
        </div>
      </div>

      {canSupport && rows && rows.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {!showAll && (
            <button onClick={reveal} className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-ink hover:bg-slate-50"><Eye size={14} /> Show numbers</button>
          )}
          <button onClick={exportCsv} className="flex items-center gap-1.5 rounded-xl bg-splitpe-600 px-3 py-2 text-sm font-semibold text-white"><Download size={14} /> Export CSV</button>
        </div>
      )}

      {error && <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</p>}

      {rows === null ? (
        <p className="text-ink-soft">Loading…</p>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center text-ink-soft shadow-soft">No pre-registrations yet.</div>
      ) : (
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-soft">
          {rows.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 sm:px-5">
              <div>
                <p className="font-semibold text-ink">{r.name}</p>
                <p className="text-sm text-ink-soft">{showAll ? `+91 ${r.phone}` : <span className="font-mono">{masked(r.phone)}</span>}</p>
              </div>
              <div className="text-right">
                {r.alreadyUser && <span className="mb-1 inline-block rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">Already a user</span>}
                <p className="text-xs text-ink-soft">{fmtDate(r.createdAt?.toMillis())}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
