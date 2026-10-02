import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, type LucideIcon } from "lucide-react";

interface PageHeroProps {
  icon: LucideIcon;
  /** Short Hindi line shown in the green pill, like the landing page. */
  tag: string;
  title: string;
  /** Last word(s) of the title, rendered with the animated brand gradient. */
  highlight: string;
  meta?: { label: string; value: ReactNode }[];
}

// Shared hero for the legal pages, styled like the landing page hero.
export default function PageHero({ icon: Icon, tag, title, highlight, meta }: PageHeroProps) {
  return (
    <section className="container-page pb-8 pt-6 sm:pt-10 lg:pt-12">
      <Link
        to="/"
        className="rise inline-flex items-center gap-2 rounded-full border border-white bg-white/70 px-4 py-2 text-sm font-semibold text-[#0b1530] shadow-[0_6px_18px_rgba(30,64,175,0.08)] transition hover:bg-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to SplitPe
      </Link>

      <div className="mt-8 flex flex-col items-start gap-5">
        <div className="rise flex flex-wrap items-center gap-3" style={{ animationDelay: "0.08s" }}>
          <span className="flex h-14 w-14 items-center justify-center rounded-[18px] bg-gradient-to-br from-splitpe-600 to-mint-500 text-white shadow-[0_14px_30px_-8px_rgba(37,99,235,0.55)]">
            <Icon className="h-7 w-7" />
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-100 px-4 pb-1 pt-1.5 font-hindi text-base font-bold text-emerald-700">
            <CheckCircle2 className="-mt-0.5 h-[18px] w-[18px]" />
            {tag}
          </span>
        </div>

        <h1
          className="rise font-heading text-[3.1rem] font-black leading-[0.92] tracking-[-0.045em] text-[#0b1530] sm:text-7xl lg:text-8xl"
          style={{ animationDelay: "0.16s" }}
        >
          {title} <span className="grad-text">{highlight}</span>
        </h1>

        {meta && (
          <div className="rise flex flex-wrap gap-2.5" style={{ animationDelay: "0.24s" }}>
            {meta.map((m) => (
              <span
                key={m.label}
                className="inline-flex items-center gap-1.5 rounded-full border border-white bg-white/70 px-4 py-2 text-sm text-slate-600 shadow-[0_6px_18px_rgba(30,64,175,0.06)]"
              >
                <strong className="font-semibold text-[#0b1530]">{m.label}:</strong>
                {m.value}
              </span>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
