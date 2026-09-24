import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";

const navLinks = [
  {
    label: "Features",
    href: "/#features",
  },
  {
    label: "How It Works",
    href: "/#how-it-works",
  },
];

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const handleAnchorClick = () => {
    setMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    setMobileMenuOpen(false);

    if (location.pathname === "/") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-100 bg-white/95 backdrop-blur">
      <div className="container-page">
        <div className="flex h-16 items-center justify-between lg:h-20">
          <Link
            to="/"
            onClick={handleLogoClick}
            className="flex items-center gap-2"
            aria-label="SplitPe home"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-splitpe-600 text-lg font-black text-white shadow-sm">
              S
            </div>

            <span className="text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
              Split<span className="text-splitpe-600">Pe</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-slate-600 transition hover:text-splitpe-600"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <button
              type="button"
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Log In
            </button>

            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-splitpe-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-splitpe-700 focus:outline-none focus:ring-2 focus:ring-splitpe-500 focus:ring-offset-2"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((open) => !open)}
            className="rounded-lg p-2 text-slate-700 transition hover:bg-slate-100 lg:hidden"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-100 py-4 lg:hidden">
            <nav className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={handleAnchorClick}
                  className="rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-splitpe-600"
                >
                  {link.label}
                </a>
              ))}

              <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row">
                <button
                  type="button"
                  className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700"
                >
                  Log In
                </button>

                <button
                  type="button"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-splitpe-600 px-4 py-3 text-sm font-semibold text-white"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}