import {
  Mail,
  ArrowUpRight,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-300">
      <div className="container-page">
        <div className="grid gap-12 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:py-16">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-splitpe-500 font-black text-white">
                S
              </div>

              <span className="text-xl font-extrabold text-white">
                Split<span className="text-splitpe-400">Pe</span>
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400">
              Split expenses, track shared spending, and settle up with less
              hassle. SplitPe makes managing money with friends simple.
            </p>

            <div className="mt-6 flex items-center gap-3">
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
                className="rounded-lg border border-slate-800 p-2.5 transition hover:border-slate-700 hover:bg-slate-900"
              >
                {/* <Twitter className="h-4 w-4" /> */}
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="rounded-lg border border-slate-800 p-2.5 transition hover:border-slate-700 hover:bg-slate-900"
              >
                {/* <Instagram className="h-4 w-4" /> */}
              </a>

              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="rounded-lg border border-slate-800 p-2.5 transition hover:border-slate-700 hover:bg-slate-900"
              >
                {/* <Linkedin className="h-4 w-4" /> */}
              </a>

              <a
                href="mailto:support@splitpe.com"
                aria-label="Email"
                className="rounded-lg border border-slate-800 p-2.5 transition hover:border-slate-700 hover:bg-slate-900"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Product</h3>

            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <a
                  href="/#features"
                  className="transition hover:text-white"
                >
                  Features
                </a>
              </li>

              <li>
                <a
                  href="/#how-it-works"
                  className="transition hover:text-white"
                >
                  How It Works
                </a>
              </li>

              <li>
                <a href="/#testimonials" className="transition hover:text-white">
                  Testimonials
                </a>
              </li>

              <li>
                <a href="/#download" className="transition hover:text-white">
                  Get Started
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Company</h3>

            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <a href="/#about" className="transition hover:text-white">
                  About SplitPe
                </a>
              </li>

              <li>
                <a
                  href="mailto:hello@splitpe.com"
                  className="transition hover:text-white"
                >
                  Contact
                </a>
              </li>

              <li>
                <a
                  href="mailto:careers@splitpe.com"
                  className="transition hover:text-white"
                >
                  Careers
                </a>
              </li>

              <li>
                <a
                  href="mailto:support@splitpe.com"
                  className="transition hover:text-white"
                >
                  Support
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Legal</h3>

            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link
                  to="/privacy-policy"
                  className="inline-flex items-center gap-1 transition hover:text-white"
                >
                  Privacy Policy
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </li>

              <li>
                <Link
                  to="/terms-and-conditions"
                  className="inline-flex items-center gap-1 transition hover:text-white"
                >
                  Terms & Conditions
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </li>

              <li>
                <Link
                  to="/delete-account"
                  className="inline-flex items-center gap-1 transition hover:text-white"
                >
                  Delete Account
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-800 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} SplitPe. All rights reserved.
          </p>

          <p>
            Built to make shared expenses simpler.
          </p>
        </div>
      </div>
    </footer>
  );
}