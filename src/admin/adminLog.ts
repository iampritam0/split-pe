import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "./firebase";

export type LogKind = "settings" | "banner" | "maintenance";

/**
 * Appends an entry to adminLog (append-only in firestore.rules) — shown on
 * the Activity Log tab so the team can see who changed what, and when.
 * Best-effort: a failed log write never blocks the change itself.
 */
export const logAdminAction = (kind: LogKind, action: string, detail = "") => {
  const user = auth.currentUser;
  if (!user) return;
  addDoc(collection(db, "adminLog"), {
    kind,
    action,
    detail,
    by: user.uid,
    byPhone: user.phoneNumber || "",
    at: serverTimestamp(),
  }).catch(() => {});
};
