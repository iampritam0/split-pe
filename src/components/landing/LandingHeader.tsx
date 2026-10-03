import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { SUPPORT_EMAIL } from "../../constants";
import { Logo, PlayBadge } from "./Brand";
import Icon from "./Icon";
import { NAV_LINKS } from "./data";

const LINKS = [{ label: "Home", href: "#top" }, ...NAV_LINKS];

// Highlights the nav item of the section currently in view.
function useActiveSection() {
  const [active, setActive] = useState("#top");
  useEffect(() => {
    const targets = LINKS.map((l) => document.querySelector(l.href)).filter(Boolean) as Element[];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActive(`#${e.target.id}`));
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, []);
  return active;
}

export default function LandingHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const active = useActiveSection();
  const menu = useRef<HTMLDivElement>(null);
  const scrim = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close on Escape, and when the window grows past the tablet breakpoint
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onResize = () => !matchMedia("(max-width: 900px)").matches && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !menu.current) return;
    gsap.fromTo(scrim.current, { opacity: 0 }, { opacity: 1, duration: 0.3 });
    gsap.fromTo(menu.current, { y: -14, scale: 0.96, opacity: 0 }, { y: 0, scale: 1, opacity: 1, duration: 0.45, ease: "power3.out" });
    gsap.fromTo(
      menu.current.querySelectorAll(".mm-link, .mm-play"),
      { x: 18, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.4, stagger: 0.05, delay: 0.08, ease: "power3.out" },
    );
  }, [open]);

  const close = () => setOpen(false);

  return (
    <>
      <header className={`header ${scrolled ? "scrolled" : ""}`}>
        <Logo />
        <nav className="nav glass">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className={`nav-item ${active === l.href ? "active" : ""}`}>
              {l.label}
              {"badge" in l && <span className="nav-new">{l.badge}</span>}
            </a>
          ))}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="nav-item">
            Support
          </a>
        </nav>
        <PlayBadge className="header-play" magnetic />
        <button
          className={`menu-btn ${open ? "open" : ""}`}
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </header>

      {open && (
        <>
          <div className="menu-scrim" ref={scrim} onClick={close} />
          <div className="mobile-menu" id="mobile-menu" ref={menu}>
            <nav>
              {LINKS.map((l) => (
                <a key={l.href} href={l.href} className="mm-link" onClick={close}>
                  <span>
                    {l.label === "Upcoming" ? "Upcoming Features" : l.label}
                    {"badge" in l && <span className="nav-new">{l.badge}</span>}
                  </span>
                  <Icon name="chev" />
                </a>
              ))}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="mm-link" onClick={close}>
                Support
                <Icon name="chev" />
              </a>
            </nav>
            <PlayBadge className="mm-play" />
          </div>
        </>
      )}
    </>
  );
}
