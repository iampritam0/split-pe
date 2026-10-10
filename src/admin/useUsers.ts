import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "./firebase";
import { userActivity } from "./users";
import type { Profile } from "./users";

/**
 * Every profile (admins may list users — firestore.rules), with lastSeen /
 * lastSignIn merged in from Firebase Auth. If the activity call fails the
 * list still loads, falling back to users.lastActiveAt alone.
 */
type ActivityMap = Awaited<ReturnType<typeof userActivity>>["data"]["activity"];

const loadUsers = async (): Promise<Profile[]> => {
  const [snap, act] = await Promise.all([
    getDocs(collection(db, "users")),
    userActivity().then((r) => r.data.activity).catch((): ActivityMap => ({})),
  ]);
  return snap.docs.map((d) => {
    const p = { id: d.id, ...(d.data() as Omit<Profile, "id">) };
    const a = act[d.id];
    const lastSeen = Math.max(p.lastActiveAt?.toMillis() ?? 0, a?.refresh ?? 0, a?.signIn ?? 0) || null;
    return { ...p, lastSignIn: a?.signIn ?? null, lastSeen };
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
