import { useEffect, useState } from "react";
import { listUsers } from "./users";
import type { UserRow } from "./users";

/**
 * Every account, masked server-side (adminListUsers) — enough for the Users
 * list, filters and audience counts without the browser ever holding
 * anyone's real name or number.
 */
export default function useUsers() {
  const [users, setUsers] = useState<UserRow[] | null>(null);
  // When the list was fetched — "this week" / "30 days" filters count from here.
  const [now, setNow] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAll = () =>
    listUsers({})
      .then(({ data }) => {
        setUsers(data.users);
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
