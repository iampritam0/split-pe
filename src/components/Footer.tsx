import { Link } from "react-router-dom";
import { ArrowUpRight, Mail } from "lucide-react";
import { PlayIcon, SiteLogo } from "./Navbar";
import { PLAY_STORE_URL, SUPPORT_EMAIL } from "../constants";

type FooterLink = { label: string; to: string } | { label: string; href: string };

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { label: "Features", to: "/#features" },
      { label: "How it works", to: "/#how-it-works" },
      { label: "Upcoming features", to: "/#upcoming" },
      { label: "FAQ", to: "/#faq" },
      { label: "Get the app", href: PLAY_STORE_URL },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", to: "/privacy-policy" },
      { label: "Terms & Conditions", to: "/terms-and-conditions" },
      { label: "Delete Account", to: "/delete-account" },
    ],
  },
  {
    title: "Contact",
    links: [{ label: SUPPORT_EMAIL, href: `mailto:${SUPPORT_EMAIL}` }],
  },
];

export default function Footer() {
  return (
    <footer className="px-4 pb-6 sm:px-[4%]">
      <div className="glass-card mx-auto max-w-[90rem] px-6 sm:px-10">
        <div className="grid gap-10 py-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:py-12">
          <div>
            <SiteLogo />
            <p className="mt-4 max-w-sm text-sm leading-7 text-slate-600">
              Split expenses, track shared spending and settle up over UPI —
              without the awkward reminders.
            </p>
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener"
              className="mt-5 inline-flex items-center gap-3 rounded-[14px] border border-zinc-700 bg-black px-5 py-2.5 text-white shadow-[0_14px_30px_rgba(0,0,0,0.2)] transition hover:-translate-y-0.5"
            >
              <PlayIcon className="h-7 w-7" />
              <span className="flex flex-col text-left leading-tight">
                <small className="text-[0.62rem] tracking-wider">GET IT ON</small>
                <b className="font-nav text-[1.2rem] font-bold">Google Play</b>
              </span>
            </a>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="font-heading text-sm font-extrabold uppercase tracking-[0.12em] text-[#0b1530]">
                {col.title}
              </h3>
              <ul className="mt-4 space-y-3 text-sm">
                {col.links.map((link) => (
                  <li key={link.label}>
                    {"to" in link ? (
                      <Link
                        to={link.to}
                        className="inline-flex items-center gap-1 font-medium text-slate-600 transition hover:text-splitpe-600"
                      >
                        {link.label}
                        <ArrowUpRight className="h-3.5 w-3.5 opacity-60" />
                      </Link>
                    ) : (
                      <a
                        href={link.href}
                        target={link.href.startsWith("http") ? "_blank" : undefined}
                        rel="noopener"
                        className="inline-flex items-center gap-1.5 font-medium text-slate-600 transition hover:text-splitpe-600"
                      >
                        {link.href.startsWith("mailto") && <Mail className="h-3.5 w-3.5" />}
                        {link.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-2 border-t border-slate-900/[0.06] py-5 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} SplitPe · Rao Technologies. All rights
            reserved.
          </p>
          <p className="font-hindi font-bold text-[#15803d]">हिसाब भी, दोस्ती भी</p>
        </div>
      </div>
    </footer>
  );
}
