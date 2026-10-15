import { useEffect, useState } from "react";
import { collection, doc, onSnapshot, orderBy, query, serverTimestamp, updateDoc } from "firebase/firestore";
import type { Timestamp } from "firebase/firestore";
import { AlertTriangle, Check, Eye, ExternalLink, Loader2, RotateCcw, X } from "lucide-react";
import { auth, db } from "./firebase";
import { logAdminAction } from "./adminLog";
import { useRole } from "./role";
import UserDetail from "./UserDetail";
import { fmtDate, listUsers } from "./users";
import type { UserRow } from "./users";

const masked = (phone: string) => `••••••${phone.slice(-4)}`;

type Status = "open" | "done" | "rejected";
type Request = { id: string; phone: string; reason?: string; uid?: string | null; verified?: boolean; source?: "app"; status: Status; createdAt?: Timestamp; handledAt?: Timestamp; note?: string };

const STATUS: Record<Status, { label: string; cls: string }> = {
  open: { label: "Open", cls: "bg-amber-100 text-amber-800" },
  done: { label: "Deleted", cls: "bg-emerald-100 text-emerald-700" },
  rejected: { label: "Rejected", cls: "bg-slate-100 text-slate-600" },
};

/**
 * Account deletion requests — from the app's Delete Account button
 * (requestMyAccountDeletion, `source: "app"`, made while signed in) and from
 * the website's form for people who can't open the app (requestAccountDeletion).
 * Users are told it happens within 24–48 hours; deleting the account from its
 * detail panel (adminDeleteUser) marks the request done.
 * The requester proves the number with an SMS OTP before the request is
 * recorded (`verified`). Older requests without it weren't verified — confirm
 * those with the owner (call / SMS the number) before deleting.
 */
export default function RequestsTab() {
  const [requests, setRequests] = useState<Request[] | null>(null);
  const [filter, setFilter] = useState<Status>("open");
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [account, setAccount] = useState<{ request: Request; user: UserRow } | null>(null);
  // Numbers stay masked until someone chooses to see one (logged).
  const [shown, setShown] = useState<Set<string>>(new Set());
  const { canSupport } = useRole();

  useEffect(
    () =>
      onSnapshot(
        query(collection(db, "deletionRequests"), orderBy("createdAt", "desc")),
        (snap) => setRequests(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Request, "id">) }))),
        (err) => setError(err.message)
      ),
    []
  );

  const setStatus = async (r: Request, status: Status, note = "") => {
    setBusyId(r.id);
    setError("");
    try {
      await updateDoc(doc(db, "deletionRequests", r.id), { status, note, handledBy: auth.currentUser?.uid, handledAt: serverTimestamp() });
      if (status !== "open") logAdminAction("request", `Deletion request for ${masked(r.phone)} marked ${STATUS[status].label.toLowerCase()}`, note);
    } catch (err) {
      setError((err as Error).message || "Could not update the request.");
    } finally {
      setBusyId("");
    }
  };

  const reject = (r: Request) => {
    const note = window.prompt(`Reject the deletion request for ${masked(r.phone)}?\n\nReason (kept with the request):`);
    if (note !== null) setStatus(r, "rejected", note);
  };

  const openAccount = async (r: Request) => {
    if (!r.uid) return;
    setBusyId(r.id);
    try {
      const { data } = await listUsers({ uids: [r.uid] });
      if (!data.users.length) {
        setError("That account no longer exists — it may already be deleted. Mark the request as done.");
        return;
      }
      setAccount({ request: r, user: data.users[0] });
    } catch (err) {
      setError((err as Error).message || "Could not open the account.");
    } finally {
      setBusyId("");
    }
  };

  const showNumber = (r: Request) => {
    setShown(new Set(shown).add(r.id));
    logAdminAction("privacy", `Viewed number on a deletion request (${masked(r.phone)})`, "To verify the requester");
  };

  const counts = (s: Status) => requests?.filter((r) => r.status === s).length ?? 0;
  const list = (requests || []).filter((r) => r.status === filter);

  return (
    <div>
      <h2 className="mb-1 font-heading text-2xl font-bold text-ink">Deletion requests</h2>
      <p className="mb-4 text-sm text-ink-soft">From the app's Delete Account button and the website's Delete Account page. Users are told it's done within 24–48 hours.</p>
      <div className="mb-6 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <AlertTriangle size={18} className="mt-0.5 shrink-0" />
        <p>Requests marked <b>From the app</b> were made by the signed-in owner. For website requests, anyone can type any number — <b>confirm it's really the owner</b> (call or message the number) before deleting.</p>
      </div>

      <div className="mb-4 flex gap-1.5">
        {(Object.keys(STATUS) as Status[]).map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`rounded-full px-3 py-1.5 text-sm font-medium ${filter === s ? "bg-splitpe-600 text-white" : "bg-white text-ink-soft shadow-soft hover:text-ink"}`}>
            {STATUS[s].label} <span className="opacity-70">{requests ? counts(s) : ""}</span>
          </button>
        ))}
      </div>

      {error && <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</p>}

      {requests === null ? (
        <p className="text-ink-soft">Loading…</p>
      ) : list.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center text-ink-soft shadow-soft">{filter === "open" ? "No open requests. 🎉" : "Nothing here yet."}</div>
      ) : (
        <ul className="space-y-3">
          {list.map((r) => (
            <li key={r.id} className="rounded-2xl bg-white p-4 shadow-soft sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="flex flex-wrap items-center gap-2 font-heading text-lg font-bold text-ink">
                    {shown.has(r.id) ? `+91 ${r.phone}` : <span className="font-mono text-base">{masked(r.phone)}</span>}
                    {!shown.has(r.id) && (
                      <button onClick={() => showNumber(r)} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2 py-0.5 text-xs font-medium text-ink-soft hover:bg-slate-50"><Eye size={12} /> Show number</button>
                    )}
                  </p>
                  <p className="text-xs text-ink-soft">
                    Requested {fmtDate(r.createdAt?.toMillis())} ·{" "}
                    {r.source === "app" ? <span className="font-semibold text-emerald-700">From the app (signed in)</span> : r.verified ? <span className="font-semibold text-emerald-700">OTP verified</span> : <span className="font-semibold text-amber-700">Not verified — confirm with the owner</span>}
                  </p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS[r.status].cls}`}>{STATUS[r.status].label}</span>
              </div>
              <p className="mt-3 rounded-xl bg-slate-50 px-3 py-2 text-sm text-ink">{r.reason || <span className="text-ink-soft">No reason given.</span>}</p>
              <p className="mt-2 text-sm text-ink-soft">{r.uid ? "✔ This number has a SplitPe account." : "✖ No SplitPe account with this number — nothing to delete."}</p>
              {r.status !== "open" && (r.note || r.handledAt) && <p className="mt-1 text-xs text-ink-soft">Handled {fmtDate(r.handledAt?.toMillis())}{r.note ? ` — ${r.note}` : ""}</p>}
              {canSupport && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {r.status === "open" ? (
                    <>
                      {r.uid && (
                        <button onClick={() => openAccount(r)} disabled={busyId === r.id} className="flex items-center gap-1.5 rounded-xl bg-splitpe-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">
                          {busyId === r.id ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />} Open account
                        </button>
                      )}
                      <button onClick={() => setStatus(r, "done")} disabled={busyId === r.id} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-ink hover:bg-slate-50 disabled:opacity-50"><Check size={14} /> Mark done</button>
                      <button onClick={() => reject(r)} disabled={busyId === r.id} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-ink hover:bg-slate-50 disabled:opacity-50"><X size={14} /> Reject</button>
                    </>
                  ) : (
                    <button onClick={() => setStatus(r, "open")} disabled={busyId === r.id} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-2 text-sm font-medium text-ink-soft hover:bg-slate-50 disabled:opacity-50"><RotateCcw size={14} /> Reopen</button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {account && (
        <UserDetail
          key={account.user.id}
          user={account.user}
          onClose={() => setAccount(null)}
          onChange={(p) => {
            if (p) setAccount({ ...account, user: p });
            else {
              // Deleted from the panel — close out the request too.
              setStatus(account.request, "done", "Account deleted from the admin panel");
              setAccount(null);
            }
          }}
        />
      )}
    </div>
  );
}
