import { useEffect, useRef, useState } from "react";
import { collection, doc, limit, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import type { Timestamp } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
import { ArrowLeft, CheckCircle2, ExternalLink, Loader2, MessageSquare, RotateCcw, Send } from "lucide-react";
import { db, functions } from "./firebase";
import { useRole } from "./role";
import UserDetail from "./UserDetail";
import { ago, fmtDate, listUsers } from "./users";
import type { UserRow } from "./users";

const replyTicket = httpsCallable<{ ticketId: string; text?: string; status?: "answered" | "closed" | "open" }, { status: string }>(functions, "adminReplyTicket");

type Status = "open" | "answered" | "closed";
type Ticket = {
  id: string;
  uid: string;
  who: string;
  phoneMasked: string;
  category: string;
  subject: string;
  status: Status;
  appVersion?: string;
  platform?: string;
  unreadForSupport?: boolean;
  createdAt?: Timestamp;
  lastMessageAt?: Timestamp;
};
type Message = { id: string; from: "user" | "support"; text: string; at?: Timestamp };

const STATUS: Record<Status, { label: string; cls: string }> = {
  open: { label: "Needs reply", cls: "bg-amber-100 text-amber-800" },
  answered: { label: "Replied", cls: "bg-splitpe-50 text-splitpe-700" },
  closed: { label: "Closed", cls: "bg-slate-100 text-slate-600" },
};
const CATEGORY: Record<string, string> = {
  bug: "Something isn't working",
  balance: "Wrong balance / expense",
  account: "Account or login",
  report: "Report a user",
  feedback: "Idea or feedback",
};
const ms = (t?: Timestamp) => t?.toMillis() ?? null;

/** One conversation: messages, reply box, close / reopen. */
function Thread({ ticket, onBack }: { ticket: Ticket; onBack: () => void }) {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState<"" | "send" | "close" | "reopen" | "account">("");
  const [error, setError] = useState("");
  const [account, setAccount] = useState<UserRow | null>(null);
  const { canSupport } = useRole();
  const end = useRef<HTMLDivElement>(null);

  useEffect(
    () =>
      onSnapshot(
        query(collection(db, "supportTickets", ticket.id, "messages"), orderBy("at", "asc")),
        (snap) => setMessages(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Message, "id">) }))),
        (err) => setError(err.message)
      ),
    [ticket.id]
  );

  useEffect(() => {
    end.current?.scrollIntoView({ block: "end" });
  }, [messages]);

  // Opened → no longer unread for the team.
  useEffect(() => {
    if (canSupport && ticket.unreadForSupport) updateDoc(doc(db, "supportTickets", ticket.id), { unreadForSupport: false }).catch(() => {});
  }, [canSupport, ticket.id, ticket.unreadForSupport]);

  const act = async (kind: "send" | "close" | "reopen") => {
    setBusy(kind);
    setError("");
    try {
      await replyTicket({ ticketId: ticket.id, text: kind === "send" ? text.trim() : undefined, status: kind === "close" ? "closed" : kind === "reopen" ? "open" : "answered" });
      if (kind === "send") setText("");
    } catch (err) {
      setError((err as Error).message || "Something went wrong.");
    } finally {
      setBusy("");
    }
  };

  const openAccount = async () => {
    setBusy("account");
    try {
      const { data } = await listUsers({ uids: [ticket.uid] });
      if (data.users[0]) setAccount(data.users[0]);
      else setError("This account no longer exists.");
    } catch (err) {
      setError((err as Error).message || "Could not open the account.");
    } finally {
      setBusy("");
    }
  };

  return (
    <div>
      <button onClick={onBack} className="mb-4 flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-ink"><ArrowLeft size={16} /> All tickets</button>
      <div className="mb-4 rounded-2xl bg-white p-5 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="break-words font-heading text-xl font-bold text-ink">{ticket.subject}</h2>
            <p className="text-sm text-ink-soft">{CATEGORY[ticket.category] || ticket.category} · opened {fmtDate(ms(ticket.createdAt))}</p>
            <p className="mt-1 text-sm text-ink-soft">
              {ticket.who || "No name"} · <span className="font-mono text-xs">{ticket.phoneMasked}</span>
              {ticket.appVersion && <> · app {ticket.appVersion}</>}{ticket.platform && <> · {ticket.platform}</>}
            </p>
          </div>
          <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STATUS[ticket.status].cls}`}>{STATUS[ticket.status].label}</span>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={openAccount} disabled={!!busy} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-medium text-ink hover:bg-slate-50 disabled:opacity-50">
            {busy === "account" ? <Loader2 size={14} className="animate-spin" /> : <ExternalLink size={14} />} Open account
          </button>
          {canSupport && (ticket.status === "closed" ? (
            <button onClick={() => act("reopen")} disabled={!!busy} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-medium text-ink hover:bg-slate-50 disabled:opacity-50">
              {busy === "reopen" ? <Loader2 size={14} className="animate-spin" /> : <RotateCcw size={14} />} Reopen
            </button>
          ) : (
            <button onClick={() => act("close")} disabled={!!busy} className="flex items-center gap-1.5 rounded-xl border border-slate-200 px-3 py-1.5 text-sm font-medium text-ink hover:bg-slate-50 disabled:opacity-50">
              {busy === "close" ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Mark solved
            </button>
          ))}
        </div>
      </div>

      {error && <p className="mb-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">{error}</p>}

      <div className="mb-4 space-y-3 rounded-2xl bg-white p-3 shadow-soft sm:p-5">
        {messages === null ? <p className="text-sm text-ink-soft">Loading…</p> : messages.map((m) => (
          <div key={m.id} className={`flex ${m.from === "support" ? "justify-end" : ""}`}>
            <div className={`max-w-[88%] rounded-2xl sm:max-w-[80%] px-4 py-2.5 ${m.from === "support" ? "bg-splitpe-600 text-white" : "bg-slate-100 text-ink"}`}>
              <p className="whitespace-pre-wrap break-words text-sm">{m.text}</p>
              <p className={`mt-1 text-right text-[11px] ${m.from === "support" ? "text-white/70" : "text-ink-soft"}`}>{m.from === "support" ? "Team · " : ""}{fmtDate(ms(m.at))}</p>
            </div>
          </div>
        ))}
        <div ref={end} />
      </div>

      {canSupport && (
        <div className="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-20 rounded-2xl bg-white p-3 shadow-card ring-1 ring-slate-200 sm:p-4 lg:bottom-4">
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={2} maxLength={2000} placeholder="Write a reply — they'll get it as a notification." className="w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-splitpe-600" />
          <div className="mt-2 flex items-center justify-between gap-2">
            <p className="min-w-0 text-xs text-ink-soft">Never ask for OTPs, passwords or bank details.</p>
            <button onClick={() => act("send")} disabled={!text.trim() || !!busy} className="flex shrink-0 items-center gap-2 rounded-xl bg-splitpe-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
              {busy === "send" ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Send reply
            </button>
          </div>
        </div>
      )}

      {account && <UserDetail key={account.id} user={account} onClose={() => setAccount(null)} onChange={(u) => (u ? setAccount(u) : setAccount(null))} />}
    </div>
  );
}

/**
 * Support inbox — conversations started from the app's Help & Support →
 * Message support (SplitPe repo: supportCreateTicket). Requesters are
 * masked; "Open account" goes through the usual reveal flow.
 */
export default function SupportTab() {
  const [tickets, setTickets] = useState<Ticket[] | null>(null);
  const [filter, setFilter] = useState<Status>("open");
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(
    () =>
      onSnapshot(
        query(collection(db, "supportTickets"), orderBy("lastMessageAt", "desc"), limit(300)),
        (snap) => setTickets(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Ticket, "id">) }))),
        (err) => setError(err.message)
      ),
    []
  );

  const open = tickets?.find((t) => t.id === openId);
  if (open) return <Thread key={open.id} ticket={open} onBack={() => setOpenId(null)} />;

  const shown = (tickets || []).filter((t) => t.status === filter);
  const count = (s: Status) => tickets?.filter((t) => t.status === s).length ?? 0;

  return (
    <div>
      <h2 className="mb-1 font-heading text-2xl font-bold text-ink">Support</h2>
      <p className="mb-6 text-sm text-ink-soft">Messages from the app's Help &amp; Support (app 1.1.0 and later). People are masked — open an account to reveal it (logged).</p>
      {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

      <div className="-mx-4 mb-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {(Object.keys(STATUS) as Status[]).map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium ${filter === s ? "bg-splitpe-600 text-white" : "bg-white text-ink-soft shadow-soft hover:text-ink"}`}>
            {STATUS[s].label} <span className="opacity-70">{tickets ? count(s) : ""}</span>
          </button>
        ))}
      </div>

      {tickets === null ? (
        <p className="text-ink-soft">{error ? "" : "Loading…"}</p>
      ) : shown.length === 0 ? (
        <div className="rounded-2xl bg-white p-10 text-center text-ink-soft shadow-soft">{filter === "open" ? "No one is waiting for a reply. 🎉" : "Nothing here."}</div>
      ) : (
        <ul className="rounded-2xl bg-white p-2 shadow-soft">
          {shown.map((t) => (
            <li key={t.id}>
              <button onClick={() => setOpenId(t.id)} className="flex w-full items-start gap-3 rounded-xl px-3 py-3 text-left hover:bg-slate-50">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-splitpe-50 text-splitpe-600"><MessageSquare size={17} /></div>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 truncate font-medium text-ink">
                    {t.subject} {t.unreadForSupport && <span className="h-2 w-2 shrink-0 rounded-full bg-splitpe-600" aria-label="Unread" />}
                  </p>
                  <p className="truncate text-sm text-ink-soft">{CATEGORY[t.category] || t.category} · {t.who || "No name"} · <span className="font-mono text-xs">{t.phoneMasked}</span></p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">{ago(ms(t.lastMessageAt))}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
