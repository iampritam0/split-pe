import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

// Building blocks for the long-form pages (Privacy Policy, Delete Account):
// one readable column (~70 characters a line), one type scale and one
// rhythm between sections, with a sticky contents list on wide screens.

export type TocItem = { id: string; title: string };

const scrollToId = (id: string) => {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  history.replaceState(null, "", `#${id}`);
};

/** Highlights the section currently near the top of the screen. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const onScroll = () => {
      let current = ids[0];
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top < 160) current = id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [ids]);
  return active;
}

export function LegalShell({ toc, children }: { toc: TocItem[]; children: ReactNode }) {
  const active = useActiveSection(toc.map((t) => t.id));

  return (
    <article className="container-page max-w-6xl pb-16 sm:pb-24">
      <div className="lg:grid lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-12">
        <aside className="hidden lg:block">
          <nav className="sticky top-28" aria-label="On this page">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">On this page</p>
            <ul className="mt-4 space-y-1 border-l border-slate-200">
              {toc.map((t) => (
                <li key={t.id}>
                  <a
                    href={`#${t.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      scrollToId(t.id);
                    }}
                    className={`-ml-px block border-l-2 py-1.5 pl-4 text-sm leading-5 transition ${
                      active === t.id
                        ? "border-splitpe-600 font-semibold text-splitpe-700"
                        : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
                    }`}
                  >
                    {t.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        <div className="glass-card rise px-5 py-8 sm:px-10 sm:py-12" style={{ animationDelay: "0.3s" }}>
          <div className="mx-auto max-w-[42rem]" data-scrub-children="rise">{children}</div>
        </div>
      </div>
    </article>
  );
}

/** Opening paragraph, a step larger than body text. */
export function Lead({ children }: { children: ReactNode }) {
  return <p className="text-[1.0625rem] leading-8 text-slate-700 sm:text-lg">{children}</p>;
}

export function LegalSection({ id, n, title, children }: { id: string; n?: number; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-28 border-t border-slate-200/80 pt-10 mt-10">
      <h2 className="flex items-baseline gap-3 font-heading text-[1.375rem] font-bold leading-snug tracking-[-0.015em] text-slate-950 sm:text-2xl">
        {n !== undefined && <span className="text-base font-semibold tabular-nums text-splitpe-600">{String(n).padStart(2, "0")}</span>}
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-base leading-7 text-slate-600">{children}</div>
    </section>
  );
}

/** Bulleted list; an item can lead with a bold `title`. */
export function Bullets({ items }: { items: { title?: string; text: ReactNode }[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3">
          <span className="mt-[0.7rem] h-1.5 w-1.5 shrink-0 rounded-full bg-splitpe-500" />
          <span>
            {item.title && <strong className="font-semibold text-slate-900">{item.title} </strong>}
            {item.text}
          </span>
        </li>
      ))}
    </ul>
  );
}

const TONES = {
  mint: "border-mint-200 bg-mint-50/80 [&_svg]:text-mint-700",
  amber: "border-amber-200 bg-amber-50/80 [&_svg]:text-amber-600",
  brand: "border-splitpe-100 bg-splitpe-50/70 [&_svg]:text-splitpe-600",
};

export function Note({ tone, icon: Icon, title, children }: { tone: keyof typeof TONES; icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <div className={`flex gap-3.5 rounded-2xl border p-4 sm:p-5 ${TONES[tone]}`}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="text-[0.9375rem] leading-6 text-slate-700">
        <p className="font-semibold text-slate-900">{title}</p>
        <div className="mt-1">{children}</div>
      </div>
    </div>
  );
}

export const linkClass = "font-semibold text-splitpe-600 underline decoration-splitpe-200 underline-offset-2 hover:text-splitpe-700 hover:decoration-splitpe-500";
