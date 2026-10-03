import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import logoMark from "../assets/logo-s.png";
import { PLAY_STORE_URL } from "../constants";

type NavItem =
  | { label: string; to: string; badge?: string; end?: boolean }
  | { label: string; href: string; badge?: string };

// Mirrors the header of the landing page (components/landing/LandingHeader).
// Legal pages (Privacy, Terms, Delete account) live in the footer.
const navItems: NavItem[] = [
  { label: "Home", to: "/", end: true },
  { label: "Features", to: "/#features" },
  { label: "How it works", to: "/#how-it-works" },
  { label: "Upcoming", to: "/#upcoming", badge: "NEW" },
  { label: "FAQ", to: "/#faq" },
  { label: "Support", href: "mailto:support@splitpe.app" },
];

function NewBadge({ text }: { text: string }) {
  return (
    <span className="ml-1.5 inline-block rounded-full bg-emerald-100 px-1.5 py-0.5 align-[2px] text-[0.58rem] font-extrabold tracking-wider text-emerald-700">
      {text}
    </span>
  );
}

function PlayIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#00c3ff" d="M3.6 2.1 13.3 12l-9.7 9.9c-.4-.3-.6-.8-.6-1.3V3.4c0-.5.2-1 .6-1.3Z" />
      <path fill="#00e676" d="M3.6 2.1c.5-.3 1.2-.3 1.8 0l11.2 6.5-3.3 3.4Z" />
      <path fill="#ff3a44" d="m3.6 21.9 9.7-9.9 3.3 3.4-11.2 6.5c-.6.3-1.3.3-1.8 0Z" />
      <path fill="#ffd500" d="m16.6 8.6 3.7 2.1c1 .6 1 2 0 2.6l-3.7 2.1-3.3-3.4Z" />
    </svg>
  );
}

export function SiteLogo() {
  return (
    <Link to="/" className="flex items-center gap-2 text-[#0b1530]" aria-label="SplitPe home">
      <img src={logoMark} alt="" className="h-auto w-[30px]" />
      <span className="flex flex-col leading-none">
        <b className="font-heading text-[1.55rem] font-black tracking-[-0.03em]">
          Split<span className="grad-text">Pe</span>
        </b>
        <small className="mt-px pl-6 font-hindi text-[0.68rem] font-bold">
          हिसाब भी, दोस्ती भी
        </small>
      </span>
    </Link>
  );
}

export { PlayIcon };

export default function Navbar() {
  // Every menu link closes the menu itself (onClick), so no route effect is needed.
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const pill =
    "rounded-full px-[1.05rem] py-2 font-nav text-[0.85rem] font-bold text-slate-600 transition hover:bg-gradient-to-br hover:from-splitpe-700 hover:to-mint-500 hover:text-white";
  const pillActive = "bg-gradient-to-br from-splitpe-700 via-splitpe-600 to-mint-500 text-white";

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-white/55 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[90rem] items-center justify-between gap-3 px-4 py-4 sm:px-[4%] lg:py-6">
        <SiteLogo />

        <nav className="hidden items-center gap-1 rounded-full border border-white/90 bg-white/50 p-1.5 shadow-[0_8px_32px_rgba(30,64,175,0.08)] backdrop-blur-xl lg:flex">
          {navItems.map((item) =>
            "to" in item ? (
              <NavLink
                key={item.label}
                to={item.to}
                end={"end" in item ? item.end : undefined}
                className={({ isActive }) =>
                  `${pill} ${isActive && !item.to.includes("#") ? pillActive : ""}`
                }
              >
                {item.label}
                {item.badge && <NewBadge text={item.badge} />}
              </NavLink>
            ) : (
              <a key={item.label} href={item.href} className={pill}>
                {item.label}
              </a>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2.5">
          <a
            href={PLAY_STORE_URL}
            target="_blank"
            rel="noopener"
            aria-label="Get SplitPe on Google Play"
            className="inline-flex items-center gap-2 rounded-xl border border-zinc-700 bg-black py-1.5 pl-2.5 pr-3.5 text-white shadow-[0_10px_22px_rgba(0,0,0,0.22)] transition hover:-translate-y-0.5 sm:gap-2.5 sm:pl-3 sm:pr-4"
          >
            <PlayIcon className="h-5 w-5 sm:h-6 sm:w-6" />
            <span className="flex flex-col text-left leading-tight">
              <small className="text-[0.48rem] tracking-wider sm:text-[0.52rem]">GET IT ON</small>
              <b className="font-nav text-[0.92rem] font-bold sm:text-[1.02rem]">Google Play</b>
            </span>
          </a>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-11 w-11 flex-col items-center justify-center gap-1 rounded-full border border-white bg-white/75 shadow-[0_6px_16px_rgba(30,64,175,0.1)] lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="site-mobile-menu"
          >
            <span className={`block h-0.5 w-[18px] rounded bg-[#0b1530] transition duration-300 ${open ? "translate-y-1.5 rotate-45" : ""}`} />
            <span className={`block h-0.5 w-[18px] rounded bg-[#0b1530] transition duration-200 ${open ? "opacity-0" : ""}`} />
            <span className={`block h-0.5 w-[18px] rounded bg-[#0b1530] transition duration-300 ${open ? "-translate-y-1.5 -rotate-45" : ""}`} />
          </button>
        </div>
      </div>

      {open && (
        <>
          <div
            className="fixed inset-0 top-0 z-40 bg-[#0b1530]/25 backdrop-blur-[3px] lg:hidden"
            onClick={() => setOpen(false)}
          />
          <div
            id="site-mobile-menu"
            className="rise absolute left-3 right-3 top-[80px] z-50 flex flex-col gap-2.5 rounded-[26px] border border-white bg-white/95 p-2.5 shadow-[0_30px_60px_-15px_rgba(30,64,175,0.35)] backdrop-blur-xl lg:hidden"
            style={{ animationDuration: "0.4s" }}
          >
            <nav className="flex flex-col">
              {navItems.map((item) => {
                const label = item.label === "Upcoming" ? "Upcoming Features" : item.label;
                const content = (
                  <>
                    <span className="flex items-center">
                      {label}
                      {item.badge && <NewBadge text={item.badge} />}
                    </span>
                    <ChevronRight className="h-[18px] w-[18px] opacity-60" />
                  </>
                );
                const row =
                  "flex items-center justify-between rounded-2xl px-4 py-[15px] font-nav text-[1.02rem] font-bold text-[#0b1530] transition hover:bg-[#eef4ff]";
                return "to" in item ? (
                  <NavLink
                    key={item.label}
                    to={item.to}
                    end={"end" in item ? item.end : undefined}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      `${row} ${isActive && !item.to.includes("#") ? "bg-gradient-to-br from-splitpe-700 via-splitpe-600 to-mint-500 !text-white" : ""}`
                    }
                  >
                    {content}
                  </NavLink>
                ) : (
                  <a key={item.label} href={item.href} className={row}>
                    {content}
                  </a>
                );
              })}
            </nav>
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener"
              className="mx-1.5 mb-1.5 flex items-center justify-center gap-3 rounded-[14px] border border-zinc-700 bg-black px-5 py-2.5 text-white"
            >
              <PlayIcon className="h-7 w-7" />
              <span className="flex flex-col text-left leading-tight">
                <small className="text-[0.62rem] tracking-wider">GET IT ON</small>
                <b className="font-nav text-[1.25rem] font-bold">Google Play</b>
              </span>
            </a>
          </div>
        </>
      )}
    </header>
  );
}
