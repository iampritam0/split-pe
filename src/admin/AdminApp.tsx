import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import type { User } from "firebase/auth";
import { History, Image, LayoutDashboard, Loader2, LogOut, Settings, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import logo from "../assets/logo-s.png";
import { auth } from "./firebase";
import LoginScreen from "./LoginScreen";
import OverviewTab from "./OverviewTab";
import SettingsTab from "./SettingsTab";
import BannersTab from "./BannersTab";
import UsersTab from "./UsersTab";
import ActivityTab from "./ActivityTab";

type TabKey = "overview" | "users" | "settings" | "banners" | "activity";
const TABS: { key: TabKey; label: string; icon: LucideIcon }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "users", label: "Users", icon: Users },
  { key: "settings", label: "App Settings", icon: Settings },
  { key: "banners", label: "Banners", icon: Image },
  { key: "activity", label: "Activity Log", icon: History },
];

/**
 * www.splitpe.xyz/admin — lazy-loaded so none of this (or the Firebase SDK)
 * ships with the public site. Only accounts whose ID token carries the
 * `admin` custom claim (SplitPe repo: functions/scripts/setAdmin.js) get
 * past the login; the real lock is firestore.rules / storage.rules, which
 * reject every admin write from anyone else regardless of this UI.
 */
export default function AdminApp() {
  const [user, setUser] = useState<User | null>(null);
  const [state, setState] = useState<"loading" | "signedOut" | "admin">("loading");
  const [notice, setNotice] = useState("");
  const [tab, setTab] = useState<TabKey>("overview");

  // Keep the admin area out of search results.
  useEffect(() => {
    const meta = document.createElement("meta");
    meta.name = "robots";
    meta.content = "noindex, nofollow";
    document.head.appendChild(meta);
    const prevTitle = document.title;
    document.title = "SplitPe Admin";
    return () => {
      meta.remove();
      document.title = prevTitle;
    };
  }, []);

  useEffect(
    () =>
      onAuthStateChanged(auth, async (u) => {
        if (!u) {
          setUser(null);
          setState("signedOut");
          return;
        }
        // Force-refresh so a claim granted since the last sign-in counts.
        const { claims } = await u.getIdTokenResult(true);
        if (claims.admin === true) {
          setUser(u);
          setState("admin");
        } else {
          setNotice("This number doesn't have admin access.");
          await signOut(auth);
        }
      }),
    []
  );

  if (state === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <Loader2 className="animate-spin text-splitpe-400" />
      </div>
    );
  }
  if (state === "signedOut") return <LoginScreen notice={notice} />;

  return (
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-slate-200 bg-white p-5 lg:flex">
        <div className="mb-8 flex items-center gap-3">
          <img src={logo} alt="" className="h-10 w-10" />
          <div className="min-w-0">
            <p className="font-heading text-xl font-bold text-ink">SplitPe Admin</p>
            <p className="truncate text-sm text-ink-soft">{user?.phoneNumber}</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-medium ${tab === key ? "bg-splitpe-50 text-splitpe-700" : "text-ink-soft hover:bg-slate-50"}`}
            >
              <Icon size={18} /> {label}
            </button>
          ))}
        </nav>
        <button onClick={() => signOut(auth)} className="flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium text-ink-soft hover:bg-slate-50">
          <LogOut size={18} /> Sign out
        </button>
      </aside>

      {/* Phone/tablet: tabs across the top instead of the sidebar. */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <img src={logo} alt="" className="h-8 w-8" />
            <p className="font-heading text-lg font-bold text-ink">SplitPe Admin</p>
          </div>
          <button onClick={() => signOut(auth)} className="text-ink-soft" aria-label="Sign out"><LogOut size={18} /></button>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-2 pb-2">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`shrink-0 rounded-full px-3 py-1.5 text-sm font-medium ${tab === key ? "bg-splitpe-600 text-white" : "text-ink-soft"}`}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main className="px-4 py-6 lg:ml-64 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-4xl">
          {tab === "overview" && <OverviewTab />}
          {tab === "settings" && <SettingsTab />}
          {tab === "banners" && <BannersTab />}
          {tab === "users" && <UsersTab />}
          {tab === "activity" && <ActivityTab />}
        </div>
      </main>
    </div>
  );
}
