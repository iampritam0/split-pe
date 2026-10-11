import { createContext, useContext } from "react";

/**
 * Admin roles (custom claim `role`, SplitPe repo: adminSetRole). An admin
 * with no role claim counts as super. The UI only hides what a role can't
 * do — the real lock is the Cloud Functions and firestore.rules.
 */
export type Role = "super" | "support" | "viewer";

export const ROLE_INFO: Record<Role, { label: string; hint: string }> = {
  super: { label: "Super admin", hint: "Everything — settings, banners, notifications, deletes and the team." },
  support: { label: "Support", hint: "Users, block / re-activate, sign out, notes, restore groups, deletion requests. No deletes, sends or settings." },
  viewer: { label: "Viewer", hint: "Read-only: sees every tab it can open, changes nothing." },
};

export const roleFromClaims = (claims: Record<string, unknown>): Role =>
  claims.role === "support" || claims.role === "viewer" ? claims.role : "super";

export const RoleContext = createContext<Role>("viewer");

export function useRole() {
  const role = useContext(RoleContext);
  return {
    role,
    isSuper: role === "super",
    /** super or support — account support actions. */
    canSupport: role === "super" || role === "support",
  };
}
