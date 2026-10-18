import { useEffect, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const FROM = {
  rise: { y: 56, opacity: 0, scale: 0.96 },
  tilt: { y: 80, opacity: 0, scale: 0.94, rotateX: 24, transformPerspective: 1000, transformOrigin: "50% 100%" },
  zoom: { y: 60, opacity: 0.2, scale: 0.86 },
};
type Kind = keyof typeof FROM;

/** Position in its row of a grid (0 for the first card on that line). */
const rowIndex = (el: HTMLElement) => {
  let i = 0;
  for (let s = el.previousElementSibling as HTMLElement | null; s && s.offsetTop === el.offsetTop; s = s.previousElementSibling as HTMLElement | null) i++;
  return i;
};

/**
 * Scroll-linked motion, opted into from the markup. Everything is scrubbed to
 * the scroll position, so scrolling back plays it in reverse:
 *   data-scrub="rise|tilt|zoom"  eases in as it comes up from the bottom of the screen
 *   data-scrub-children="rise"   the same for each direct child (long text pages)
 *   data-scrub="exit"            shrinks and fades as it leaves the top (heroes)
 *   data-parallax="0.3"          drifts against the scroll; bigger = more depth
 *   data-depth="0.5"             fixed backdrops: moves with overall page progress
 *   data-drift="-240"            slides sideways (px) while on screen
 * Halved on small screens, off for reduced motion. Re-runs when `key` changes.
 */
export default function useScrollFx(rootRef: RefObject<HTMLElement | null>, key?: unknown, enabled = true) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root || !enabled) return;

    const mm = gsap.matchMedia(root);
    mm.add({ motion: "(prefers-reduced-motion: no-preference)", compact: "(max-width: 900px)" }, (ctx) => {
      const { motion, compact } = ctx.conditions!;
      if (!motion) return;
      const k = compact ? 0.5 : 1;
      const all = (sel: string) => gsap.utils.toArray<HTMLElement>(sel, root);

      const scrubIn = (el: HTMLElement, kind: Kind) => {
        const lag = compact ? 0 : rowIndex(el) * 5; // cards later in a row trail a little
        gsap.from(el, {
          ...FROM[kind],
          ease: "none",
          scrollTrigger: { trigger: el, start: `top ${100 - lag}%`, end: `top ${72 - lag}%`, scrub: 0.6 },
        });
      };
      all("[data-scrub]").forEach((el) => {
        const kind = el.dataset.scrub!;
        if (kind in FROM) scrubIn(el, kind as Kind);
      });
      all("[data-scrub-children]").forEach((parent) =>
        [...parent.children].forEach((el) => scrubIn(el as HTMLElement, parent.dataset.scrubChildren as Kind)),
      );

      all('[data-scrub="exit"]').forEach((el) =>
        gsap.to(el, {
          y: 120 * k,
          scale: 0.94,
          opacity: 0.15,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top top", end: "bottom top", scrub: true },
        }),
      );

      all("[data-parallax]").forEach((el) => {
        const d = Number(el.dataset.parallax) * 160 * k;
        gsap.fromTo(el, { y: d }, { y: -d, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } });
      });

      all("[data-depth]").forEach((el) =>
        gsap.to(el, {
          y: -Number(el.dataset.depth) * 600 * k,
          ease: "none",
          scrollTrigger: { trigger: document.documentElement, start: "top top", end: "max", scrub: 0.8 },
        }),
      );

      all("[data-drift]").forEach((el) =>
        gsap.fromTo(el, { x: 0 }, {
          x: Number(el.dataset.drift) * k,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.6 },
        }),
      );

      // Pins elsewhere on the page shift what comes after them
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    });

    // Late images and fonts move things around
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    let live = true;
    document.fonts?.ready.then(() => live && refresh());

    return () => {
      live = false;
      window.removeEventListener("load", refresh);
      mm.revert();
    };
  }, [rootRef, key, enabled]);
}
