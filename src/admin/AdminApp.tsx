import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import type { User } from "firebase/auth";
import { BarChart3, Bell, History, Image, Inbox, LayoutDashboard, LifeBuoy, Loader2, LogOut, Menu, MoreHorizontal, Settings, ShieldCheck, Users, X, Zap } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import logo from "../assets/logo-s.png";
import { auth } from "./firebase";
import LoginScreen from "./LoginScreen";
import OverviewTab from "./OverviewTab";
import SettingsTab from "./SettingsTab";
import BannersTab from "./BannersTab";
import UsersTab from "./UsersTab";
import ActivityTab from "./ActivityTab";
import NotificationsTab from "./NotificationsTab";
import AutomationsTab from "./AutomationsTab";
import AnalyticsTab from "./AnalyticsTab";
import RequestsTab from "./RequestsTab";
import TeamTab from "./TeamTab";
import SupportTab from "./SupportTab";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import { db } from "./firebase";
import { ROLE_INFO, RoleContext, roleFromClaims } from "./role";
import type { Role } from "./role";

type TabKey = "overview" | "analytics" | "users" | "support" | "requests" | "notifications" | "automations" | "settings" | "banners" | "team" | "activity";
// `superOnly` tabs change the live app (settings, sends) — hidden for support and viewer.
const TABS: { key: TabKey; label: string; short?: string; icon: LucideIcon; superOnly?: boolean }[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
  { key: "users", label: "Users", icon: Users },
  { key: "support", label: "Support", icon: LifeBuoy },
  { key: "requests", label: "Deletion requests", short: "Requests", icon: Inbox },
  { key: "notifications", label: "Notifications", icon: Bell, superOnly: true },
  { key: "automations", label: "Automations", icon: Zap, superOnly: true },
  { key: "settings", label: "App Settings", icon: Settings, superOnly: true },
  { key: "banners", label: "Banners", icon: Image, superOnly: true },
  { key: "team", label: "Team", icon: ShieldCheck },
  { key: "activity", label: "Activity Log", icon: History },
];
// Phone bottom bar; everything else sits behind "More".
const PRIMARY: TabKey[] = ["overview", "analytics", "users", "support"];

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
  const [role, setRole] = useState<Role>("viewer");
  const [unreadSupport, setUnreadSupport] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  // Badge on the Support tab: conversations waiting for the team.
  useEffect(() => {
    if (state !== "admin") return undefined;
    return onSnapshot(query(collection(db, "supportTickets"), where("unreadForSupport", "==", true)), (snap) => setUnreadSupport(snap.size), () => {});
  }, [state]);

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
          setRole(roleFromClaims(claims));
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

  const tabs = TABS.filter((t) => !t.superOnly || role === "super");
  const primary = tabs.filter((t) => PRIMARY.includes(t.key));
  const inMore = !PRIMARY.includes(tab);
  const go = (key: TabKey) => {
    setTab(key);
    setMenuOpen(false);
    window.scrollTo({ top: 0 });
  };
  const wide = tab === "users" || tab === "analytics";

  return (
    <RoleContext.Provider value={role}>
    <div className="min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-slate-200 bg-white p-5 lg:flex">
        <div className="mb-6 flex items-center gap-3">
          <img src={logo} alt="" className="h-10 w-10" />
          <div className="min-w-0">
            <p className="font-heading text-xl font-bold text-ink">SplitPe Admin</p>
            <p className="truncate text-sm text-ink-soft">{user?.phoneNumber} · {ROLE_INFO[role].label}</p>
          </div>
        </div>
        <nav className="-mx-1 flex-1 space-y-0.5 overflow-y-auto px-1">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left font-medium ${tab === key ? "bg-splitpe-50 text-splitpe-700" : "text-ink-soft hover:bg-slate-50"}`}
            >
              <Icon size={18} /> <span className="flex-1">{label}</span>
              {key === "support" && unreadSupport > 0 && <span className="rounded-full bg-splitpe-600 px-2 py-0.5 text-xs font-semibold text-white">{unreadSupport}</span>}
            </button>
          ))}
        </nav>
        <button onClick={() => signOut(auth)} className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2.5 font-medium text-ink-soft hover:bg-slate-50">
          <LogOut size={18} /> Sign out
        </button>
      </aside>

      {/* Phone/tablet: a slim top bar, a bottom tab bar and a "More" sheet instead of the sidebar. */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur lg:hidden">
        <div className="flex h-14 items-center gap-3 px-4">
          <img src={logo} alt="" className="h-8 w-8" />
          <div className="min-w-0 flex-1">
            <p className="truncate font-heading text-base font-bold leading-tight text-ink">SplitPe Admin</p>
            <p className="truncate text-xs text-ink-soft">{ROLE_INFO[role].label}</p>
          </div>
          <button onClick={() => setMenuOpen(true)} className="relative rounded-xl p-2 text-ink hover:bg-slate-100" aria-label="All sections">
            <Menu size={20} />
            {unreadSupport > 0 && tab !== "support" && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-splitpe-600" />}
          </button>
        </div>
      </header>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="mx-auto flex h-16 max-w-xl items-stretch">
          {primary.map(({ key, short, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => go(key)}
              className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${tab === key ? "text-splitpe-700" : "text-ink-soft"}`}
            >
              <span className={`flex h-7 w-12 items-center justify-center rounded-full ${tab === key ? "bg-splitpe-50" : ""}`}><Icon size={19} /></span>
              {short || label}
              {key === "support" && unreadSupport > 0 && (
                <span className="absolute left-1/2 top-1.5 ml-2 min-w-[18px] rounded-full bg-splitpe-600 px-1 text-center text-[10px] font-semibold leading-[18px] text-white">{unreadSupport}</span>
              )}
            </button>
          ))}
          <button
            onClick={() => setMenuOpen(true)}
            className={`flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${inMore ? "text-splitpe-700" : "text-ink-soft"}`}
          >
            <span className={`flex h-7 w-12 items-center justify-center rounded-full ${inMore ? "bg-splitpe-50" : ""}`}><MoreHorizontal size={19} /></span>
            More
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-50 flex items-end bg-slate-900/40 lg:hidden" onClick={() => setMenuOpen(false)}>
          <div
            className="max-h-[85vh] w-full overflow-y-auto rounded-t-3xl bg-white p-4 shadow-2xl"
            style={{ paddingBottom: "calc(1rem + env(safe-area-inset-bottom))" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-slate-200" />
            <div className="mb-4 flex items-center gap-3 px-1">
              <img src={logo} alt="" className="h-10 w-10" />
              <div className="min-w-0 flex-1">
                <p className="font-heading text-lg font-bold text-ink">SplitPe Admin</p>
                <p className="truncate text-sm text-ink-soft">{user?.phoneNumber} · {ROLE_INFO[role].label}</p>
              </div>
              <button onClick={() => setMenuOpen(false)} className="rounded-lg p-1.5 text-ink-soft hover:bg-slate-100" aria-label="Close"><X size={20} /></button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {tabs.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => go(key)}
                  className={`relative flex flex-col items-center gap-1.5 rounded-2xl px-2 py-3 text-center text-xs font-medium ${tab === key ? "bg-splitpe-50 text-splitpe-700" : "bg-slate-50 text-ink"}`}
                >
                  <Icon size={20} />
                  <span className="leading-tight">{label}</span>
                  {key === "support" && unreadSupport > 0 && <span className="absolute right-2 top-2 rounded-full bg-splitpe-600 px-1.5 text-[10px] font-semibold leading-4 text-white">{unreadSupport}</span>}
                </button>
              ))}
            </div>
            <button onClick={() => signOut(auth)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 py-3 font-medium text-ink-soft">
              <LogOut size={18} /> Sign out
            </button>
          </div>
        </div>
      )}

      <main className="px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-5 lg:ml-64 lg:px-10 lg:py-10">
        <div className={`mx-auto ${wide ? "max-w-6xl" : "max-w-4xl"}`}>
          {tab === "overview" && <OverviewTab />}
          {tab === "analytics" && <AnalyticsTab />}
          {tab === "users" && <UsersTab />}
          {tab === "support" && <SupportTab />}
          {tab === "requests" && <RequestsTab />}
          {tab === "team" && <TeamTab />}
          {tab === "activity" && <ActivityTab />}
          {role === "super" && tab === "settings" && <SettingsTab />}
          {role === "super" && tab === "banners" && <BannersTab />}
          {role === "super" && tab === "notifications" && <NotificationsTab />}
          {role === "super" && tab === "automations" && <AutomationsTab />}
        </div>
      </main>
    </div>
    </RoleContext.Provider>
  );
}
