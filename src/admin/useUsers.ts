import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { userActivity } from "./users";
import type { Profile } from "./users";

type ActivityMap = Awaited<ReturnType<typeof userActivity>>["data"]["activity"];
type Notes = Record<string, { tags?: string[]; note?: string }>;

/**
 * Every profile (admins may list users — firestore.rules), with lastSeen /
 * lastSignIn merged in from Firebase Auth and the team's tags / note from
 * adminNotes. If the activity or notes read fails the list still loads,
 * falling back to users.lastActiveAt and no tags.
 */
const loadUsers = async (): Promise<Profile[]> => {
  const [snap, act, notes] = await Promise.all([
    getDocs(collection(db, "users")),
    userActivity().then((r) => r.data.activity).catch((): ActivityMap => ({})),
    getDocs(collection(db, "adminNotes"))
      .then((s) => Object.fromEntries(s.docs.map((d) => [d.id, d.data() as Notes[string]])))
      .catch((): Notes => ({})),
  ]);
  return snap.docs.map((d) => {
    const p = { id: d.id, ...(d.data() as Omit<Profile, "id">) };
    const a = act[d.id];
    const lastSeen = Math.max(p.lastActiveAt?.toMillis() ?? 0, a?.refresh ?? 0, a?.signIn ?? 0) || null;
    return { ...p, lastSignIn: a?.signIn ?? null, lastSeen, tags: notes[d.id]?.tags || [], note: notes[d.id]?.note || "" };
  });
};

export default function useUsers() {
  const [users, setUsers] = useState<Profile[] | null>(null);
  // When the list was fetched — "this week" / "30 days" filters count from here.
  const [now, setNow] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAll = () =>
    loadUsers()
      .then((list) => {
        setUsers(list);
        setNow(Date.now());
      })
      .catch((err: Error) => setError(err.message || "Could not load users."))
      .finally(() => setLoading(false));

  useEffect(() => {
    fetchAll();
  }, []);

  const reload = () => {
    setLoading(true);
    setError("");
    fetchAll();
  };

  return { users, setUsers, now, loading, error, reload };
}
